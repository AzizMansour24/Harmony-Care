# backend/modules/RecurrencePrediction/recurrence.py

import os
import joblib
import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from imblearn.over_sampling import SMOTE
from imblearn.pipeline import Pipeline

# -------------------------
# Config paths
# -------------------------
RAW_DATA_PATH = os.path.join("data", "raw", "SEER Breast Cancer Dataset.csv")
MODEL_PATH = os.path.join("saved_models", "recurrence_model.pkl")

# -------------------------
# Main class
# -------------------------
class RecurrenceModel:
    """
    Logistic Regression + SMOTE for 5-year breast cancer recurrence.
    Handles preprocessing, training, saving, loading, and prediction.
    """

    def __init__(self, data_path: str = RAW_DATA_PATH, model_path: str = MODEL_PATH, auto_train: bool = True):
        self.data_path = data_path
        self.model_path = model_path

        # Artifacts
        self.features: List[str] = []
        self.numerical_cols: List[str] = []
        self.categorical_cols: List[str] = []
        self.imputer_num: Optional[SimpleImputer] = None
        self.imputer_cat: Optional[SimpleImputer] = None
        self.label_encoders: Dict[str, LabelEncoder] = {}
        self.scaler: Optional[StandardScaler] = None
        self.model: Optional[Pipeline] = None
        self.seuil_optimal: float = 0.6  # threshold for positive prediction

        # Load existing model if available
        if os.path.exists(self.model_path):
            self._load_model()
        elif auto_train:
            self._train_and_save()

    # -------------------------
    # Data Loading
    # -------------------------
    def _load_data(self) -> pd.DataFrame:
        if not os.path.exists(self.data_path):
            raise FileNotFoundError(f"SEER dataset not found at: {self.data_path}")
        df = pd.read_csv(self.data_path)
        df.columns = df.columns.str.strip()  # remove trailing spaces
        df = df.dropna(axis=1, how='all')    # drop empty columns
        return df

    # -------------------------
    # Training & Artifacts
    # -------------------------
    def _train_and_save(self):
        df = self._load_data()

        # Create target: 5-year recurrence
        df['Recurrence_5Y'] = ((df['Survival Months'] <= 60) & (df['Status'] == 'Dead')).astype(int)

        # Features
        self.features = [
            'Age',
            'Race',
            'Marital Status',
            'T Stage',
            'N Stage',
            '6th Stage',
            'Grade',
            'A Stage',
            'Tumor Size',
            'Estrogen Status',
            'Progesterone Status',
            'Regional Node Examined',
            'Reginol Node Positive'
        ]

        X = df[self.features].copy()
        y = df['Recurrence_5Y'].copy()

        # Identify numerical and categorical columns
        self.numerical_cols = X.select_dtypes(include=[np.number]).columns.tolist()
        self.categorical_cols = X.select_dtypes(include=['object']).columns.tolist()

        # Imputation
        self.imputer_num = SimpleImputer(strategy='median')
        X[self.numerical_cols] = self.imputer_num.fit_transform(X[self.numerical_cols])

        self.imputer_cat = SimpleImputer(strategy='most_frequent')
        X[self.categorical_cols] = self.imputer_cat.fit_transform(X[self.categorical_cols])

        # Label Encoding
        self.label_encoders = {}
        for col in self.categorical_cols:
            le = LabelEncoder()
            X[col] = le.fit_transform(X[col].astype(str))
            self.label_encoders[col] = le

        # Split train/test
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )

        # Standardization
        self.scaler = StandardScaler()
        X_train_scaled = pd.DataFrame(self.scaler.fit_transform(X_train), columns=X_train.columns, index=X_train.index)
        X_test_scaled = pd.DataFrame(self.scaler.transform(X_test), columns=X_test.columns, index=X_test.index)

        # Logistic Regression + SMOTE
        self.model = Pipeline([
            ('smote', SMOTE(random_state=42, k_neighbors=5)),
            ('clf', LogisticRegression(max_iter=2000, random_state=42,
                                        class_weight='balanced', C=0.1, solver='liblinear'))
        ])
        self.model.fit(X_train_scaled, y_train)

        # Save artifacts
        artifacts = {
            'features': self.features,
            'numerical_cols': self.numerical_cols,
            'categorical_cols': self.categorical_cols,
            'imputer_num': self.imputer_num,
            'imputer_cat': self.imputer_cat,
            'label_encoders': self.label_encoders,
            'scaler': self.scaler,
            'model': self.model,
            'seuil_optimal': self.seuil_optimal
        }
        os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
        joblib.dump(artifacts, self.model_path)

    def _load_model(self):
        artifacts = joblib.load(self.model_path)
        self.features = artifacts['features']
        self.numerical_cols = artifacts['numerical_cols']
        self.categorical_cols = artifacts['categorical_cols']
        self.imputer_num = artifacts['imputer_num']
        self.imputer_cat = artifacts['imputer_cat']
        self.label_encoders = artifacts['label_encoders']
        self.scaler = artifacts['scaler']
        self.model = artifacts['model']
        self.seuil_optimal = artifacts['seuil_optimal']

    # -------------------------
    # Input Transformation
    # -------------------------
    def transform_input(self, df_input: pd.DataFrame) -> np.ndarray:
        X = df_input.copy()

        # Impute
        X[self.numerical_cols] = self.imputer_num.transform(X[self.numerical_cols].fillna(0))
        X[self.categorical_cols] = self.imputer_cat.transform(X[self.categorical_cols].fillna('Unknown'))

        # Encode categorical with unknown handling
        for col in self.categorical_cols:
            le = self.label_encoders[col]
            X[col] = X[col].astype(str).apply(lambda x: x if x in le.classes_ else 'Unknown')
            if 'Unknown' not in le.classes_:
                le.classes_ = np.append(le.classes_, 'Unknown')
            X[col] = le.transform(X[col])

        # Standardize
        X_scaled = self.scaler.transform(X)
        return X_scaled

    # -------------------------
    # Prediction
    # -------------------------
    def predict(self, patient: Dict[str, Any]) -> Dict[str, Any]:
        if self.model is None:
            raise ValueError("Model not trained or loaded.")

        # Build DataFrame
        X_new = pd.DataFrame([patient], columns=self.features)

        # Transform input
        X_new_scaled = self.transform_input(X_new)

        # Prediction
        proba = self.model.predict_proba(X_new_scaled)[:, 1][0]
        prediction = int(proba >= self.seuil_optimal)

        return {
            'prediction': prediction,
            'probability': float(proba),
            'threshold': self.seuil_optimal
        }

# -------------------------
# Singleton & Wrapper
# -------------------------
_model_instance: Optional[RecurrenceModel] = None

def get_model_instance(auto_train: bool = True) -> RecurrenceModel:
    global _model_instance
    if _model_instance is None:
        _model_instance = RecurrenceModel(auto_train=auto_train)
    return _model_instance

def predict_recurrence(patient: Dict[str, Any]) -> Dict[str, Any]:
    return get_model_instance().predict(patient)
