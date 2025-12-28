# modules/MenopauseRisk/MenopauseRisk.py
import pandas as pd
from pathlib import Path
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
import joblib

# Paths
ROOT = Path(__file__).parent.parent.parent
DATA_PATH = ROOT / "data" / "raw" / "Breast Cancer METABRIC.csv"
SAVE_DIR = ROOT / "saved_models"
SAVE_DIR.mkdir(parents=True, exist_ok=True)
MODEL_PATH = SAVE_DIR / "menopause_risk_model.joblib"

def create_risk_label(row: pd.Series) -> int:
    """Return risk label: 0 = faible, 1 = modéré, 2 = élevé."""
    meno = str(row.get("Inferred Menopausal State", "")).strip().lower()
    if "post" in meno:
        return 0
    age = row.get("Age at Diagnosis")
    chemo = str(row.get("Chemotherapy", "")).strip().lower() == "yes"
    hormone = str(row.get("Hormone Therapy", "")).strip().lower() == "yes"

    risk = 0
    try:
        age = float(age)
    except:
        age = None

    if age is not None and chemo:
        if age < 40:
            risk = 2
        elif 40 <= age <= 45:
            risk = 1
    if hormone:
        risk = min(2, risk + 1)

    return int(risk)

def train_and_get_model(auto_train=True):
    """Train RandomForest on METABRIC dataset and return pipeline."""
    df = pd.read_csv(DATA_PATH)
    df["risk_label"] = df.apply(create_risk_label, axis=1)

    cat_cols = [
        "Chemotherapy", "Hormone Therapy", "Radio Therapy",
        "Inferred Menopausal State", "ER Status", "PR Status", "HER2 Status",
        "Neoplasm Histologic Grade", "Tumor Stage"
    ]
    num_cols = [
        "Age at Diagnosis", "Tumor Size", "Lymph nodes examined positive",
        "Nottingham prognostic index"
    ]

    X = df[cat_cols + num_cols]
    y = df["risk_label"]

    # Preprocessing pipelines
    cat_transformer = Pipeline([
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("onehot", OneHotEncoder(handle_unknown="ignore"))
    ])
    num_transformer = Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler())
    ])
    preprocessor = ColumnTransformer([
        ("cat", cat_transformer, cat_cols),
        ("num", num_transformer, num_cols)
    ])

    # RandomForest classifier
    clf = RandomForestClassifier(n_estimators=300, class_weight="balanced", random_state=42)
    pipe = Pipeline([("preprocessor", preprocessor), ("classifier", clf)])

    if auto_train:
        pipe.fit(X, y)
        joblib.dump(pipe, MODEL_PATH)

    return pipe

def predict_menopause_risk(patient_data: dict):
    """Predict risk for a single patient dictionary."""
    if not MODEL_PATH.exists():
        model = train_and_get_model(auto_train=True)
    else:
        model = joblib.load(MODEL_PATH)

    # Convert single patient to DataFrame
    df = pd.DataFrame([patient_data])
    prediction = model.predict(df)[0]
    proba = model.predict_proba(df)[0]

    # Return dictionary with prediction + probabilities
    return {
        "prediction": int(prediction),
        "probabilities": proba.tolist()
    }
