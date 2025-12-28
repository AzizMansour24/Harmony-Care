# backend/modules/AgressivityClustering/clustering.py
"""
Aggressivity clustering module (production-ready).

Provides:
- AggressivityClusteringModel class with train/load/predict methods.
- Utility functions matching previous API: predict_aggressivity, get_all_patients, etc.

This implementation preserves the original behaviour:
 - when computing global statistics (counts, top patients, cluster stats) we
   re-run clustering per cancer-type (fit on available rows) — same logic as the
   initial script that produced the expected counts.
 - optionally artifacts (scaler + kmeans + label_map) can be saved for each cancer
   type under saved_models/aggressivity/<slug>/ to speed repeated predictions.
"""

import os
import joblib
import json
import logging
from typing import Dict, List, Any, Optional

import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans

# Configure logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# -------------------------
# Configuration / Defaults
# -------------------------
# Compute base path relative to this file so paths work whether you run from backend/ or project root
_BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
DEFAULT_DATA_PATH = os.path.join(_BASE_DIR, "data", "raw", "Breast Cancer METABRIC.csv")
DEFAULT_MODELS_DIR = os.path.join(_BASE_DIR, "saved_models", "aggressivity")

# Features used for clustering (must match METABRIC CSV column names)
COLS_FEATURES = [
    "Tumor Size",
    "Neoplasm Histologic Grade",
    "Lymph nodes examined positive",
    "Mutation Count",
    "Nottingham prognostic index"
]

COLS_BIOMARKERS = ["HER2 Status", "ER Status", "PR Status"]
COLS_INFO = ["Patient ID", "Cancer Type Detailed", "Age at Diagnosis"]


# -------------------------
# Utilities
# -------------------------
def slugify(s: str) -> str:
    """Simple slugifier for safe filenames."""
    return (
        s.lower()
        .replace(" ", "_")
        .replace("/", "_")
        .replace("\\", "_")
        .replace(":", "_")
        .replace(",", "")
    )


def ensure_dir(path: str):
    if not os.path.exists(path):
        os.makedirs(path, exist_ok=True)


# -------------------------
# Main class
# -------------------------
class AggressivityClusteringModel:
    """
    Encapsulates KMeans clustering per cancer type for aggressivity stratification.

    Usage:
        model = AggressivityClusteringModel(data_path="...", models_dir="...", auto_train=False)
        model.train_all()  # to build and save models (optional)
        model.predict_aggressivity(patient_dict, cancer_type="...")

    Notes:
    - For global statistics and listing patients we run (or load) per-type clustering so
      the resulting counts match the behaviour of the original script (no side-effects).
    """

    def __init__(
        self,
        data_path: str = DEFAULT_DATA_PATH,
        models_dir: str = DEFAULT_MODELS_DIR,
        auto_train: bool = False,
    ):
        self.data_path = data_path
        self.models_dir = models_dir
        ensure_dir(self.models_dir)

        # internal storage
        self.df: Optional[pd.DataFrame] = None  # raw dataframe
        self.df_cancer: Optional[pd.DataFrame] = None  # filtered dataframe with cancer patients
        self._available_types: List[str] = []

        # caches for loaded models per type
        # each entry: { 'scaler': scaler, 'kmeans': kmeans, 'label_map': {...} }
        self.model_store: Dict[str, Dict[str, Any]] = {}

        # load data (but DO NOT train unless requested)
        self._load_data()

        if auto_train:
            logger.info("auto_train=True -> training all models now (this may take time).")
            self.train_all()

    # -------------------------
    # Data loading / preprocessing
    # -------------------------
    def _load_data(self):
        """Load METABRIC CSV and prepare df_cancer."""
        if not os.path.exists(self.data_path):
            raise FileNotFoundError(f"METABRIC data not found at: {self.data_path}")

        self.df = pd.read_csv(self.data_path)
        # Minimal validation
        missing = [c for c in COLS_FEATURES + COLS_INFO if c not in self.df.columns]
        if missing:
            raise ValueError(f"Missing required columns in METABRIC CSV: {missing}")

        # Keep only rows that indicate a cancer type
        self.df_cancer = self.df[self.df["Cancer Type Detailed"].notna()].copy()
        self._available_types = sorted(self.df_cancer["Cancer Type Detailed"].dropna().unique().tolist())
        logger.info(f"Loaded data: {len(self.df)} rows, cancer patients: {len(self.df_cancer)}")
        logger.info(f"Available cancer types: {len(self._available_types)}")

    # -------------------------
    # Model artifact paths
    # -------------------------
    def _model_paths_for_type(self, cancer_type: str) -> Dict[str, str]:
        slug = slugify(cancer_type)
        base = os.path.join(self.models_dir, slug)
        ensure_dir(base)
        return {
            "dir": base,
            "scaler": os.path.join(base, "scaler.pkl"),
            "kmeans": os.path.join(base, "kmeans.pkl"),
            "label_map": os.path.join(base, "label_map.json"),
        }

    # -------------------------
    # Train / save / load per type
    # -------------------------
    def train_type(self, cancer_type: str, n_clusters: int = 3, force: bool = False) -> None:
        """
        Train scaler + kmeans for a single cancer_type and save artifacts.
        If force=False and artifacts exist, will skip training and load artifacts.
        """
        paths = self._model_paths_for_type(cancer_type)
        if (not force) and os.path.exists(paths["scaler"]) and os.path.exists(paths["kmeans"]) and os.path.exists(paths["label_map"]):
            logger.info(f"Artifacts exist for '{cancer_type}', loading instead of retraining.")
            self._load_model_for_type(cancer_type)
            return

        # subset data
        subset = self.df_cancer[self.df_cancer["Cancer Type Detailed"] == cancer_type][COLS_FEATURES].dropna()
        if len(subset) < n_clusters:
            raise ValueError(f"Not enough samples to cluster for cancer_type={cancer_type} (found {len(subset)} rows)")

        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(subset)

        kmeans = KMeans(n_clusters=n_clusters, random_state=42)
        clusters = kmeans.fit_predict(X_scaled)

        # name clusters by increasing mean of NPI (Nottingham prognostic index)
        tmp = subset.copy()
        tmp["cluster"] = clusters
        cluster_means = tmp.groupby("cluster")["Nottingham prognostic index"].mean()
        sorted_clusters = cluster_means.sort_values().index.tolist()
        # mapping cluster_index -> label ("Faible","Moyenne","Forte")
        labels_order = ["Faible", "Moyenne", "Forte"]
        label_map = {int(sorted_clusters[i]): labels_order[i] for i in range(len(sorted_clusters))}

        # Save artifacts
        joblib.dump(scaler, paths["scaler"])
        joblib.dump(kmeans, paths["kmeans"])
        with open(paths["label_map"], "w", encoding="utf-8") as f:
            json.dump(label_map, f, ensure_ascii=False)

        # cache loaded model
        self.model_store[cancer_type] = {"scaler": scaler, "kmeans": kmeans, "label_map": label_map}
        logger.info(f"Trained and saved artifacts for '{cancer_type}' at {paths['dir']}")

    def _load_model_for_type(self, cancer_type: str):
        """Load scaler/kmeans/label_map for a cancer_type into memory."""
        paths = self._model_paths_for_type(cancer_type)
        if not (os.path.exists(paths["scaler"]) and os.path.exists(paths["kmeans"]) and os.path.exists(paths["label_map"])):
            raise FileNotFoundError(f"No saved artifacts for cancer_type='{cancer_type}' in {paths['dir']}")

        scaler = joblib.load(paths["scaler"])
        kmeans = joblib.load(paths["kmeans"])
        with open(paths["label_map"], "r", encoding="utf-8") as f:
            label_map = json.load(f)

        # ensure keys are ints
        label_map = {int(k): v for k, v in label_map.items()}

        self.model_store[cancer_type] = {"scaler": scaler, "kmeans": kmeans, "label_map": label_map}
        logger.info(f"Loaded artifacts for '{cancer_type}' from {paths['dir']}")

    def train_all(self, cancer_types: Optional[List[str]] = None, n_clusters: int = 3, force: bool = False):
        """Train models for all cancer types (or provided list)."""
        if cancer_types is None:
            cancer_types = self._available_types
        for ct in cancer_types:
            try:
                self.train_type(ct, n_clusters=n_clusters, force=force)
            except Exception as e:
                logger.warning(f"Skipping training for '{ct}': {e}")

    def load_all(self):
        """Attempt to load artifacts for all available cancer types (no training)."""
        for ct in self._available_types:
            try:
                self._load_model_for_type(ct)
            except FileNotFoundError:
                logger.info(f"No saved model for '{ct}' — skip.")

    # -------------------------
    # Helper: assign clusters ON-THE-FLY (mirrors original script logic)
    # -------------------------
    def _assign_clusters_temp(self) -> pd.DataFrame:
        """
        Produce a copy of df_cancer with 'Aggressivity Cluster' and 'Aggressivity Level'
        assigned using per-type KMeans trained on the available subset.
        This mirrors the original (non-persistent) behaviour so statistics/counts match.
        """
        dfc = self.df_cancer.copy()
        dfc["Aggressivity Cluster"] = np.nan
        dfc["Aggressivity Level"] = np.nan

        for cancer_type in dfc["Cancer Type Detailed"].unique():
            subset_idx = dfc[dfc["Cancer Type Detailed"] == cancer_type].index
            subset = dfc.loc[subset_idx, COLS_FEATURES].dropna()
            if len(subset) < 3:
                continue

            scaler = StandardScaler()
            X_scaled_sub = scaler.fit_transform(subset)

            kmeans = KMeans(n_clusters=3, random_state=42)
            clusters = kmeans.fit_predict(X_scaled_sub)

            # Name clusters by increasing mean of NPI
            tmp = subset.copy()
            tmp["cluster"] = clusters
            cluster_means = tmp.groupby("cluster")["Nottingham prognostic index"].mean()
            sorted_clusters = cluster_means.sort_values().index.tolist()
            labels_order = ["Faible", "Moyenne", "Forte"]
            label_map = {int(sorted_clusters[i]): labels_order[i] for i in range(len(sorted_clusters))}

            # Assign on original dfc
            dfc.loc[subset.index, "Aggressivity Cluster"] = clusters
            dfc.loc[subset.index, "Aggressivity Level"] = [label_map[c] for c in clusters]

        return dfc

    # -------------------------
    # Prediction
    # -------------------------
    def predict_aggressivity(self, data: Dict[str, Any], cancer_type: str) -> Dict[str, Any]:
        """
        Predicts aggressivity level for a single patient dict.
        Expects data to contain the keys in COLS_FEATURES.
        Returns a dict: { 'aggressivity_level', 'cluster', 'confidence', 'cancer_type' }
        """
        # prepare model for cancer_type
        if cancer_type not in self.model_store:
            # try to load, otherwise train (and save artifacts)
            try:
                self._load_model_for_type(cancer_type)
            except FileNotFoundError:
                logger.info(f"No model for '{cancer_type}' in store — training on the fly.")
                self.train_type(cancer_type)

        store = self.model_store[cancer_type]
        scaler: StandardScaler = store["scaler"]
        kmeans: KMeans = store["kmeans"]
        label_map: Dict[int, str] = store["label_map"]

        # Build X_new preserving features order
        try:
            X_new = np.array([[float(data[col]) for col in COLS_FEATURES]])
        except KeyError as e:
            raise KeyError(f"Missing required feature for prediction: {e}")

        X_new_scaled = scaler.transform(X_new)

        cluster_idx = int(kmeans.predict(X_new_scaled)[0])
        aggressivity_level = label_map.get(cluster_idx, "Unknown")

        # confidence: based on distance to assigned cluster vs total distances
        distances = kmeans.transform(X_new_scaled)[0]  # distances to each cluster center
        if distances.sum() == 0:
            confidence = 1.0
        else:
            # smaller distance -> higher confidence
            confidence = 1.0 - (distances[cluster_idx] / distances.sum())

        return {
            "aggressivity_level": aggressivity_level,
            "cluster": cluster_idx,
            "confidence": float(np.clip(confidence, 0.0, 1.0)),
            "cancer_type": cancer_type,
        }

    # -------------------------
    # Utility readers (for API)
    # -------------------------
    def get_all_patients(self) -> List[Dict[str, Any]]:
        """
        Return list of patients (with clusters) from df_cancer using per-type clustering
        (mirrors the original script results).
        """
        dfc = self._assign_clusters_temp()
        results = []
        for idx, row in dfc[dfc["Aggressivity Level"].notna()].iterrows():
            results.append({
                "Patient ID": str(row["Patient ID"]),
                "Cancer Type Detailed": row["Cancer Type Detailed"],
                "Aggressivity Level": row["Aggressivity Level"],
                "Aggressivity Cluster": int(row["Aggressivity Cluster"]) if pd.notna(row["Aggressivity Cluster"]) else None,
                "Tumor Size": float(row["Tumor Size"]) if pd.notna(row["Tumor Size"]) else None,
                "Nottingham prognostic index": float(row["Nottingham prognostic index"]) if pd.notna(row["Nottingham prognostic index"]) else None,
                "Lymph nodes examined positive": int(row["Lymph nodes examined positive"]) if pd.notna(row["Lymph nodes examined positive"]) else None,
                "Age at Diagnosis": int(row["Age at Diagnosis"]) if pd.notna(row["Age at Diagnosis"]) else None
            })
        return results

    def get_top_risk_patients(self, n: int = 10) -> List[Dict[str, Any]]:
        """Return top-n patients labeled 'Forte' sorted by NPI desc."""
        dfc = self._assign_clusters_temp()
        top_patients = dfc[dfc["Aggressivity Level"] == "Forte"]
        top_patients = top_patients.sort_values(by="Nottingham prognostic index", ascending=False).head(n)

        result = []
        for idx, row in top_patients.iterrows():
            result.append({
                "Patient ID": str(row["Patient ID"]),
                "Cancer Type Detailed": row["Cancer Type Detailed"],
                "Age at Diagnosis": int(row["Age at Diagnosis"]) if pd.notna(row["Age at Diagnosis"]) else None,
                "Tumor Size": float(row["Tumor Size"]) if pd.notna(row["Tumor Size"]) else None,
                "Neoplasm Histologic Grade": int(row["Neoplasm Histologic Grade"]) if pd.notna(row["Neoplasm Histologic Grade"]) else None,
                "Lymph nodes examined positive": int(row["Lymph nodes examined positive"]) if pd.notna(row["Lymph nodes examined positive"]) else None,
                "Mutation Count": int(row["Mutation Count"]) if pd.notna(row["Mutation Count"]) else None,
                "Nottingham prognostic index": float(row["Nottingham prognostic index"]) if pd.notna(row["Nottingham prognostic index"]) else None,
                "HER2 Status": row["HER2 Status"] if "HER2 Status" in row and pd.notna(row["HER2 Status"]) else None,
                "ER Status": row["ER Status"] if "ER Status" in row and pd.notna(row["ER Status"]) else None,
                "PR Status": row["PR Status"] if "PR Status" in row and pd.notna(row["PR Status"]) else None,
                "Aggressivity Level": row["Aggressivity Level"]
            })
        return result

    def get_cluster_stats_by_level(self) -> List[Dict[str, Any]]:
        """Return aggregated stats (mean) for features by level using the assigned clusters (on-the-fly)."""
        dfc = self._assign_clusters_temp()
        stats = []
        for level in ["Faible", "Moyenne", "Forte"]:
            subset = dfc[dfc["Aggressivity Level"] == level]
            if subset.empty:
                continue
            stats.append({
                "level": level,
                "count": int(len(subset)),
                "avg_tumor_size": float(subset["Tumor Size"].mean()),
                "avg_histologic_grade": float(subset["Neoplasm Histologic Grade"].mean()) if "Neoplasm Histologic Grade" in subset else None,
                "avg_lymph_nodes": float(subset["Lymph nodes examined positive"].mean()) if "Lymph nodes examined positive" in subset else None,
                "avg_mutation_count": float(subset["Mutation Count"].mean()) if "Mutation Count" in subset else None,
                "avg_npi": float(subset["Nottingham prognostic index"].mean()) if "Nottingham prognostic index" in subset else None
            })
        return stats

    def get_cluster_counts_by_cancer_type(self) -> List[Dict[str, Any]]:
        """Return counts per cancer type and aggressivity level (computed on-the-fly)."""
        dfc = self._assign_clusters_temp()
        grouped = dfc.groupby(["Cancer Type Detailed", "Aggressivity Level"]).size().reset_index(name="Count")
        result = []
        for _, row in grouped.iterrows():
            result.append({
                "cancer_type": row["Cancer Type Detailed"],
                "aggressivity_level": row["Aggressivity Level"],
                "count": int(row["Count"])
            })
        return result

    def get_available_cancer_types(self) -> List[str]:
        return self._available_types.copy()


# -------------------------
# Module-level convenience instance + wrapper functions
# -------------------------
# Create a single shared instance (do NOT auto-train by default)
_model_instance: Optional[AggressivityClusteringModel] = None


def get_model_instance(auto_train: bool = False) -> AggressivityClusteringModel:
    global _model_instance
    if _model_instance is None:
        _model_instance = AggressivityClusteringModel(auto_train=auto_train)
    return _model_instance


# Backward-compatible wrapper functions (used by existing app.py)
def predict_aggressivity(data: Dict[str, Any], cancer_type: str = "Breast Invasive Ductal Carcinoma"):
    return get_model_instance().predict_aggressivity(data, cancer_type)


def get_all_patients():
    return get_model_instance().get_all_patients()


def get_top_risk_patients(n: int = 10):
    return get_model_instance().get_top_risk_patients(n)


def get_cluster_stats_by_level():
    return get_model_instance().get_cluster_stats_by_level()


def get_cluster_counts_by_cancer_type():
    return get_model_instance().get_cluster_counts_by_cancer_type()


def get_available_cancer_types():
    return get_model_instance().get_available_cancer_types()
