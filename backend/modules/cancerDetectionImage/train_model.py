import os
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix
import joblib

# 1) Charger le dataset
df = pd.read_csv("C:/Users/MSI/Desktop/4eme/ML/Projet/BCD_Project/backend/modules/cancerDetectionImage/dataset_extracted_images.csv")

print("=== Aperçu du dataset ===")
print(df.head())

print("\n=== Répartition des labels (0=benign, 1=malignant) ===")
print(df["label"].value_counts())

# 2) Séparer X / y
X = df[[
    "radius_mean",
    "area_mean",
    "perimeter_mean",
    "concavity_mean",
    "fractal_dimension_mean"
]]
y = df["label"]

# 3) Split train / test avec stratification
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.25, random_state=42, stratify=y
)

# 4) Modèle RandomForest
model = RandomForestClassifier(
    n_estimators=300,
    max_depth=10,
    random_state=42,
    class_weight="balanced"
)

model.fit(X_train, y_train)

# 5) Évaluation
y_pred = model.predict(X_test)
print("\n=== Classification report ===")
print(classification_report(y_test, y_pred))

print("\n=== Matrice de confusion (lignes = vrai, colonnes = prédit) ===")
print(confusion_matrix(y_test, y_pred))

# 6) Création du dossier saved_models si nécessaire
models_dir = os.path.join(os.path.dirname(__file__), "../../saved_models")
os.makedirs(models_dir, exist_ok=True)

# 7) Sauvegarde du modèle
model_path = os.path.join(models_dir, "rf_model.joblib")
joblib.dump(model, model_path)
print(f"\nModèle entraîné et sauvegardé : {model_path}")
