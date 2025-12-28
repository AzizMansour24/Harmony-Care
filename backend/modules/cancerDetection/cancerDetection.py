import pandas as pd
import numpy as np
import joblib
import os

from sklearn.linear_model import SGDRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import StratifiedKFold, RandomizedSearchCV
from sklearn.metrics import mean_squared_error, accuracy_score, confusion_matrix

class CancerDetectionModel:

    def __init__(self):
        """Try loading existing model, otherwise train a new one."""

        self.model_path = "saved_models/cancer_sgd_model.pkl"
        self.scaler_path = "saved_models/cancer_sgd_scaler.pkl"
        self.columns_path = "saved_models/cancer_sgd_columns.pkl"
        self.threshold_path = "saved_models/cancer_sgd_threshold.pkl"

        if (
            os.path.exists(self.model_path)
            and os.path.exists(self.scaler_path)
            and os.path.exists(self.columns_path)
            and os.path.exists(self.threshold_path)
        ):
            self.model = joblib.load(self.model_path)
            self.scaler = joblib.load(self.scaler_path)
            self.columns = joblib.load(self.columns_path)
            self.threshold = joblib.load(self.threshold_path)
        else:
            self.model, self.scaler, self.columns, self.threshold = self.train_and_save_model()

    # -----------------------------------------------------------------------------------
    # TRAINING PIPELINE
    # -----------------------------------------------------------------------------------
    def train_and_save_model(self):

        print("⚠ No saved model found — Training new Cancer Detection Model...")

        # Load processed clean data
        df = pd.read_csv("data/processed/data_clean.csv")

        # Target
        X = df.drop("diagnosis", axis=1)
        y = df["diagnosis"]

        # Standardize numeric features
        cols_to_scale = [
            'radius_mean', 'texture_mean', 'perimeter_mean', 'area_mean', 'smoothness_mean',
            'compactness_mean', 'concavity_mean', 'concave points_mean', 'symmetry_mean',
            'fractal_dimension_mean', 'radius_se', 'texture_se', 'perimeter_se', 'area_se',
            'smoothness_se', 'compactness_se', 'concavity_se', 'concave points_se', 'symmetry_se',
            'fractal_dimension_se', 'radius_worst', 'texture_worst', 'perimeter_worst',
            'area_worst', 'smoothness_worst', 'compactness_worst', 'concavity_worst',
            'concave points_worst', 'symmetry_worst', 'fractal_dimension_worst'
        ]

        scaler = StandardScaler()
        X_scaled = X.copy()
        X_scaled[cols_to_scale] = scaler.fit_transform(X[cols_to_scale])

        # Stratified split for CV inside RandomSearch
        skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

        sgd = SGDRegressor(random_state=42)

        # Hyperparameter search
        param_distributions = {
            'learning_rate': ['constant', 'invscaling', 'adaptive'],
            'eta0': [0.001, 0.01, 0.1],
            'max_iter': [1000, 2000, 3000],
            'penalty': [None, 'l2', 'l1', 'elasticnet']
        }

        random_search = RandomizedSearchCV(
            estimator=sgd,
            param_distributions=param_distributions,
            n_iter=20,
            scoring="neg_mean_squared_error",
            cv=skf,
            n_jobs=-1,
            verbose=1,
            random_state=42
        )

        random_search.fit(X_scaled, y)

        best_params = random_search.best_params_
        print("✔ Best Parameters:", best_params)

        # Train final model
        best_model = SGDRegressor(random_state=42, **best_params)
        best_model.fit(X_scaled, y)

        # --- Optimal threshold selection ---
        scores = best_model.predict(X_scaled)
        thresholds = np.linspace(0, 1, 101)

        best_t = 0.5
        best_fpfn = float("inf")

        for t in thresholds:
            preds = (scores >= t).astype(int)
            tn, fp, fn, tp = confusion_matrix(y, preds).ravel()
            fpfn = fp + fn
            if fpfn < best_fpfn:
                best_fpfn = fpfn
                best_t = t

        print("✔ Optimal Threshold:", best_t)

        # Save files
        joblib.dump(best_model, self.model_path)
        joblib.dump(scaler, self.scaler_path)
        joblib.dump(list(X.columns), self.columns_path)
        joblib.dump(best_t, self.threshold_path)

        return best_model, scaler, list(X.columns), best_t

    # -----------------------------------------------------------------------------------
    # PREDICTION
    # -----------------------------------------------------------------------------------
    def predict(self, input_dict):
        """
        input_dict = {
            "radius_mean": ...,
            "texture_mean": ...,
            ...
        }
        """

        df = pd.DataFrame([input_dict])

        # Ensure all columns exist
        for col in self.columns:
            if col not in df:
                df[col] = 0

        # Reorder
        df = df[self.columns]

        # Apply scaler
        cols_to_scale = [
            'radius_mean', 'texture_mean', 'perimeter_mean', 'area_mean', 'smoothness_mean',
            'compactness_mean', 'concavity_mean', 'concave points_mean', 'symmetry_mean',
            'fractal_dimension_mean', 'radius_se', 'texture_se', 'perimeter_se', 'area_se',
            'smoothness_se', 'compactness_se', 'concavity_se', 'concave points_se', 'symmetry_se',
            'fractal_dimension_se', 'radius_worst', 'texture_worst', 'perimeter_worst',
            'area_worst', 'smoothness_worst', 'compactness_worst', 'concavity_worst',
            'concave points_worst', 'symmetry_worst', 'fractal_dimension_worst'
        ]

        df_scaled = df.copy()
        df_scaled[cols_to_scale] = self.scaler.transform(df[cols_to_scale])

        # Prediction
        score = float(self.model.predict(df_scaled)[0])
        binary = int(score >= self.threshold)

        return {
            "raw_score": score,
            "probability": min(max(score, 0), 1),   # clamp between 0–1
            "threshold_used": self.threshold,
            "prediction": "Malignant" if binary == 1 else "Benign"
        }
