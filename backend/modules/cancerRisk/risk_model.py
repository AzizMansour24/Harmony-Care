# modules/cancerRisk/risk_model.py
import os
import pandas as pd
import numpy as np
from xgboost import XGBClassifier
from sklearn.preprocessing import StandardScaler
from imblearn.over_sampling import SMOTE
import joblib

class RiskModel:
    def __init__(self):
        # Chemins relatifs pour les modèles et colonnes
        self.models_dir = os.path.join(os.path.dirname(__file__), "../../saved_models")
        os.makedirs(self.models_dir, exist_ok=True)
        
        self.model_path = os.path.join(self.models_dir, "xgb_risk_model.pkl")
        self.scaler_path = os.path.join(self.models_dir, "scaler.pkl")
        self.columns_path = os.path.join(self.models_dir, "train_columns.pkl")

        # Charger le modèle pré-entraîné si existant
        if os.path.exists(self.model_path) and os.path.exists(self.scaler_path) and os.path.exists(self.columns_path):
            self.model = joblib.load(self.model_path)
            self.scaler = joblib.load(self.scaler_path)
            self.train_columns = joblib.load(self.columns_path)
        else:
            self.model, self.scaler, self.train_columns = self.train_model()
            joblib.dump(self.model, self.model_path)
            joblib.dump(self.scaler, self.scaler_path)
            joblib.dump(self.train_columns, self.columns_path)

    def train_model(self):
        # Charger la base nettoyée (backend/data/processed)
        data_path = os.path.join(os.path.dirname(__file__), "../../data/processed/breast_cancer_risk_clean.csv")
        bo1_clean = pd.read_csv(data_path)

        X = bo1_clean.drop("diagnosis_status", axis=1)
        y = bo1_clean["diagnosis_status"]

        # Encodage catégoriel
        X = pd.get_dummies(X, drop_first=True)
        train_columns = X.columns.tolist()  # sauvegarde des colonnes

        # Standardisation
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)

        # SMOTE
        smote = SMOTE(random_state=42)
        X_res, y_res = smote.fit_resample(X_scaled, y)

        # Calcul scale_pos_weight
        neg, pos = np.bincount(y_res)
        scale_pos_weight = neg / pos

        model = XGBClassifier(
            n_estimators=300,
            max_depth=5,
            learning_rate=0.1,
            objective='binary:logistic',
            scale_pos_weight=scale_pos_weight,
            random_state=42
        )
        model.fit(X_res, y_res)

        return model, scaler, train_columns

    def predict_patient(self, df):
        # Encode genetic mutation values to numeric before one-hot encoding
        genetic_mutation_mapping = {
            "NONE": 0,
            "BRCA1": 1,
            "BRCA2": 2,
            "OTHERS": 3,
            "OTHER": 3,
        }
        
        if "genetic_mutation" in df.columns:
            df = df.copy()
            df["genetic_mutation"] = df["genetic_mutation"].map(genetic_mutation_mapping)
        
        # Encoder les colonnes catégorielles
        df_enc = pd.get_dummies(df, drop_first=True)

        # Ajouter les colonnes manquantes
        for col in self.train_columns:
            if col not in df_enc.columns:
                df_enc[col] = 0

        # Réordonner les colonnes
        df_enc = df_enc[self.train_columns]

        # Standardisation
        df_scaled = self.scaler.transform(df_enc)

        # Prédiction
        risk_score = self.model.predict_proba(df_scaled)[:, 1][0] * 100

        # Top features
        importances = pd.Series(self.model.feature_importances_, index=self.train_columns)
        top_features = importances.sort_values(ascending=False).head(5).index.tolist()

        return risk_score, top_features
