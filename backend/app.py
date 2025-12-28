# backend/app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import joblib
import os
import io
import numpy as np

# Import existing Breast Cancer Risk model
from modules.cancerRisk.risk_model import RiskModel

# Import new Cancer Detection Model
from modules.cancerDetection.cancerDetection import CancerDetectionModel

from modules.AgressivityClustering.clustering import AggressivityClusteringModel

# Import Recurrence Prediction model
from modules.recurrence.recurrence import get_model_instance as get_recurrence_model, predict_recurrence

# Menopause Risk prediction endpoint
from modules.MenopauseRisk.MenopauseRisk import predict_menopause_risk, train_and_get_model

#prediction par image
from modules.cancerDetectionImage.feature_extraction import extract_features
from modules.cancerDetectionImage.recommendations import get_recommendation  

# -------------------------------
# 1) Initialize Flask app
# -------------------------------
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes


# -------------------------------
# 2) Load Models
# -------------------------------
risk_model = RiskModel()                      # old model (risk assessment)
detection_model = CancerDetectionModel()      # new SGD regression model
# Initialize recurrence model
recurrence_model = get_recurrence_model(auto_train=True)
# Initialize the clustering engine
aggressivity_model = AggressivityClusteringModel()
# Initialize model once at startup
menopause_model = train_and_get_model(auto_train=True)
# model de prediction par image
models_dir = os.path.join(os.path.dirname(__file__), "saved_models")
model_path = os.path.join(models_dir, "rf_model.joblib")
model = joblib.load(model_path)
print("Modèle chargé :", model)

# -------------------------------
# 3) Health check endpoint
# -------------------------------
@app.route("/health", methods=["GET"])
def health_check():
    return jsonify({"status": "OK", "message": "Backend is running"}), 200


# -------------------------------
# 4) RiskModel prediction endpoint
# -------------------------------
@app.route("/predictRisk", methods=["POST"])
def predictrisk():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No input data provided"}), 400

        # Ensure data is list-like
        if isinstance(data, dict):
            data = [data]

        input_df = pd.DataFrame(data)

        results = []
        for i in range(len(input_df)):
            patient_df = input_df.iloc[[i]]
            risk_score, top_features = risk_model.predict_patient(patient_df)

            results.append({
                "patient_index": i,
                "risk_score_percent": float(round(risk_score, 2)),
                "top_features": top_features
            })

        return jsonify({"predictions": results}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# -------------------------------
# 5) Cancer Detection (SGD Regression Model)
# -------------------------------
@app.route("/detect-cancer", methods=["POST"])
def detect_cancer():
    """
    Expects JSON with the raw (not standardized) features:
    {
        "radius_mean": 17.99,
        "texture_mean": 10.38,
        "perimeter_mean": 122.8,
        "area_mean": 1001.0,
        ...
    }
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No input data provided"}), 400

        # Convert to DataFrame
        if isinstance(data, dict):
            data = [data]

        df = pd.DataFrame(data)

        # Run model prediction
        predictions = []
        for i in range(len(df)):
            patient = df.iloc[i].to_dict()
            result = detection_model.predict(patient)

            predictions.append({
                "patient_index": i,
                "raw_score": result["raw_score"],
                "probability": result["probability"],
                "threshold_used": result["threshold_used"],
                "prediction": result["prediction"]
            })

        return jsonify({"predictions": predictions}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500



# -------------------------------
# 6) Agressivity prediction endpoint
# -------------------------------

# ----------------------------------------
# /predict  → Predict aggressivity
# ----------------------------------------
@app.route("/predictAgressivity", methods=["POST"])
def predict_aggressivity_route():
    """Prédit l'agressivité d'un nouveau patient"""
    try:
        data = request.get_json(force=True)
        cancer_type = data.get("Cancer Type", None)

        result = aggressivity_model.predict_aggressivity(data, cancer_type)
        return jsonify(result)

    except Exception as e:
        return jsonify({"error": str(e)}), 400


# ----------------------------------------
# /patients  → Return all patients
# ----------------------------------------
@app.route("/patients", methods=["GET"])
def patients():
    """Retourne tous les patients avec leurs clusters"""
    try:
        result = aggressivity_model.get_all_patients()
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ----------------------------------------
# /top-risk  → Top N high-risk patients
# ----------------------------------------
@app.route("/top-risk", methods=["GET"])
def top_risk():
    """Retourne les top 10 patients à risque élevé"""
    try:
        n = request.args.get('n', default=10, type=int)
        result = aggressivity_model.get_top_risk_patients(n)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ----------------------------------------
# /cluster-stats  → Stats per aggressivity level
# ----------------------------------------
@app.route("/cluster-stats", methods=["GET"])
def cluster_stats():
    """Retourne les statistiques par niveau d'agressivité"""
    try:
        result = aggressivity_model.get_cluster_stats_by_level()
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ----------------------------------------
# /cluster-counts  → Counts by cancer type
# ----------------------------------------
@app.route("/cluster-counts", methods=["GET"])
def cluster_counts():
    """Retourne le nombre de patients par type de cancer et niveau"""
    try:
        result = aggressivity_model.get_cluster_counts_by_cancer_type()
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ----------------------------------------
# /cancer-types  → Available cancer types
# ----------------------------------------
@app.route("/cancer-types", methods=["GET"])
def cancer_types():
    """Retourne les types de cancer disponibles"""
    try:
        result = aggressivity_model.get_available_cancer_types()
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# -------------------------------
# 7) /predict-recurrence  → Predict 5-year recurrence
# -------------------------------
@app.route("/predict-recurrence", methods=["POST"])
def predict_recurrence_route():
    """
    Prédit la récidive à 5 ans pour un patient.
    Expects JSON with patient features matching SEER model features.
    """
    try:
        data = request.get_json(force=True)
        if not data:
            return jsonify({"error": "No input data provided"}), 400

        # Convert to list if single dict
        if isinstance(data, dict):
            data = [data]

        predictions = []
        for i, patient in enumerate(data):
            result = predict_recurrence(patient)
            predictions.append({
                "patient_index": i,
                "prediction": result["prediction"],
                "probability": result["probability"],
                "threshold_used": result["threshold"]
            })

        return jsonify({"predictions": predictions}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
#-------------------------------
# 8) /predict-menopause-risk  → Predict Menopause Risk
@app.route("/predict-menopause-risk", methods=["POST"])
def predict_menopause_risk_route():
    """
    Predict menopause-based risk: 0 = faible, 1 = modéré, 2 = élevé.
    Expects JSON with patient features from METABRIC dataset.
    """
    try:
        data = request.get_json(force=True)
        if not data:
            return jsonify({"error": "No input data provided"}), 400

        # Convert single dict to list
        if isinstance(data, dict):
            data = [data]

        predictions = []
        for i, patient in enumerate(data):
            result = predict_menopause_risk(patient)
            predictions.append({
                "patient_index": i,
                "prediction": result["prediction"],
                "probabilities": result["probabilities"]
            })

        return jsonify({"predictions": predictions}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

#-------------------------------
# 9) /predict-image  → Predict cancer from image features
@app.route("/predict", methods=["POST"])
def predict():
    # 1) Vérifier qu'un fichier a bien été envoyé
    if "image" not in request.files:
        return jsonify({"error": "Aucune image reçue."}), 400

    file = request.files["image"]
    if file.filename == "":
        return jsonify({"error": "Nom de fichier vide."}), 400

    try:
        # 2) Lire l'image en mémoire
        img_bytes = io.BytesIO(file.read())

        # 3) Extraire les mêmes features que pour le dataset
        feats = extract_features(img_bytes)  # doit retourner 5 valeurs
        feats = np.asarray(feats, dtype="float32").reshape(1, -1)

        # 4) Prédiction
        proba = model.predict_proba(feats)[0]          # tableau [p0, p1]
        label_int = int(np.argmax(proba))              # 0 ou 1
        prob_label = float(proba[label_int])           # proba de la classe choisie

        label_str = "malignant" if label_int == 1 else "benign"

        # Log console pour debug
        print(
            f"DEBUG /predict : {file.filename} -> label={label_int}, proba={proba}",
            flush=True
        )

        # 5) Recommandation spécifique (label, prob)
        rec_text = get_recommendation(label_int, prob_label)

        # 6) Réponse JSON
        return jsonify({
            "label": label_str,
            "probability": prob_label,
            "recommendation": rec_text,
            "warning": (
                "Attention : ce système est purement pédagogique et ne doit "
                "jamais être utilisé pour un diagnostic ou une décision "
                "thérapeutique réelle."
            ),
        }), 200

    except Exception as e:
        # En cas d'erreur dans extract_features ou le modèle
        print("ERREUR /predict :", e, flush=True)
        return jsonify({"error": str(e)}), 500

# --------------------------------
# HADS Anxiety & Depression Score Prediction
# ==========================================
from modules.Hads.hads import load_model_and_predict

@app.route("/predict_hads", methods=["POST"])
def predict_hads():
    try:
        data = request.get_json()
        result = load_model_and_predict(data)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# -------------------------------
#  Run server
# -------------------------------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
