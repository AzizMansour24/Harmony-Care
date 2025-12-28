import pandas as pd
import numpy as np
import joblib
import os

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier


# =====================================================
# Paths
# =====================================================

DATA_PATH = "data/raw/Excel_Data_1.csv"
MODEL_PATH = "saved_models/hads_model.joblib"
FEATURES_PATH = "saved_models/hads_feature_cols.joblib"


# =====================================================
# 1) TRAINING FUNCTION
# =====================================================

def train_and_get_model():
    """
    Charge les données, préprocess, entraîne un modèle HADS et sauvegarde les fichiers.
    """
    print("📥 Loading dataset...")
    df = pd.read_csv(DATA_PATH, sep=";")

    # ----------------------------
    # Build HADS target
    # ----------------------------
    hads_cols = [f"HADS_{i}" for i in range(1, 15)]
    df["HADS_total"] = df[hads_cols].sum(axis=1)
    df["HADS_high"] = (df["HADS_total"] >= 11).astype(int)

    # ----------------------------
    # Features selection
    # ----------------------------
    clinical_cols = [
        'Gender (female -1; male-2)',
        'Age group [18-29 >1; 30-39 >2; 40-49 >3; 50-59 >4; 60-69 >5; 70-79 >6; 80-89 >7]',
        'ECOG_PS',
        'Clinical trial (1-yes; 2 -No)',
        'Extent of Disease (1- early breast cancer; 2-advanced disease)',
        'Treatment (1- adjuvant/ 2- Neoadjuvant/ 3- Palliative; 31 First line; 32 Second line; 33 Third line)'
    ]

    info_cols = [c for c in df.columns if c.startswith("INFO25_")]

    feature_cols = clinical_cols + info_cols

    X = df[feature_cols].copy()
    y = df["HADS_high"].copy()

    # ----------------------------
    # Train / Test split
    # ----------------------------
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # ----------------------------
    # Train model
    # ----------------------------
    model = RandomForestClassifier(
        n_estimators=200,
        random_state=42,
        class_weight="balanced"
    )

    print("⚙️ Training model...")
    model.fit(X_train, y_train)

    print("✅ Model trained. Train accuracy:", model.score(X_train, y_train))

    # ----------------------------
    # Save model & features
    # ----------------------------
    os.makedirs("saved_models", exist_ok=True)

    joblib.dump(model, MODEL_PATH)
    joblib.dump(feature_cols, FEATURES_PATH)

    print("💾 Model saved to:", MODEL_PATH)
    print("💾 Features saved to:", FEATURES_PATH)

    return model, feature_cols



# =====================================================
# 2) PREDICTION FUNCTION (used by API)
# =====================================================

def load_model_and_predict(input_json):
    """
    Charge le modèle + colonnes et effectue la prédiction HADS.
    """
    if not os.path.exists(MODEL_PATH):
        print("⚠️ Model not found. Training...")
        train_and_get_model()

    model = joblib.load(MODEL_PATH)
    feature_cols = joblib.load(FEATURES_PATH)

    # Build input row
    row = []
    for col in feature_cols:
        if col not in input_json:
            raise ValueError(f"Missing key in JSON: {col}")
        row.append(input_json[col])

    X_input = pd.DataFrame([row], columns=feature_cols)

    # Prediction
    proba = model.predict_proba(X_input)[0, 1]
    pred_class = int(model.predict(X_input)[0])

    return {
        "HADS_high_pred": pred_class,
        "probability_HADS_high": float(proba)
    }
