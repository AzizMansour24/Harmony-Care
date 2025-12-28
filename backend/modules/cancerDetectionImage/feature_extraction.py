# backend/cancerDetectionImage/feature_extraction.py

import io
import os
import numpy as np
import pandas as pd
from PIL import Image
import cv2  # pip install opencv-python


def _load_image_from_bytes(img_bytes, size=(256, 256)):
    """
    Ouvre l'image depuis un flux binaire et la convertit en niveau de gris
    normalisé entre 0 et 1.
    """
    img = Image.open(img_bytes).convert("L")  # niveaux de gris
    if size is not None:
        img = img.resize(size)
    arr = np.array(img).astype("float32") / 255.0
    return arr


def _extract_shape_features(gray):
    """
    À partir d'une image en niveaux de gris (0–1), on binarise et on
    récupère le plus grand contour pour approximer la "tumeur".

    On calcule ensuite :
    - area_mean  ~ aire du contour
    - perimeter_mean ~ périmètre du contour
    - radius_mean ~ rayon équivalent (sqrt(area/pi))
    - concavity_mean ~ (aire enveloppe convexe - aire) / aire enveloppe
    """
    img = (gray * 255).astype("uint8")

    # Filtre + seuillage d'Otsu
    blur = cv2.GaussianBlur(img, (5, 5), 0)
    _, thresh = cv2.threshold(
        blur, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU
    )

    # On suppose tumeur claire sur fond sombre; si inverse, on corrige
    if np.mean(thresh == 255) > 0.5:
        thresh = cv2.bitwise_not(thresh)

    contours, _ = cv2.findContours(
        thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
    )

    if not contours:
        # Aucun contour détecté → tout à zéro
        return 0.0, 0.0, 0.0, 0.0

    # On prend le plus grand contour
    cnt = max(contours, key=cv2.contourArea)

    area = float(cv2.contourArea(cnt))          # aire
    perimeter = float(cv2.arcLength(cnt, True)) # périmètre
    radius = np.sqrt(area / np.pi) if area > 0 else 0.0

    # Concavité : différence entre l'enveloppe convexe et le contour
    hull = cv2.convexHull(cnt)
    hull_area = float(cv2.contourArea(hull))
    concavity = (hull_area - area) / hull_area if hull_area > 0 else 0.0

    return radius, area, perimeter, concavity


def _boxcount(Z, k):
    """
    Utilitaire pour la dimension fractale (méthode box-counting).
    """
    S = np.add.reduceat(
        np.add.reduceat(Z, np.arange(0, Z.shape[0], k), axis=0),
        np.arange(0, Z.shape[1], k),
        axis=1,
    )
    # On compte les cases non vides
    return np.count_nonzero(S)


def _fractal_dimension(gray):
    """
    Approximation très simplifiée de fractal_dimension_mean via box-counting.
    C'est purement pédagogique, pas une mesure clinique.
    """
    # Binarisation simple
    Z = gray > 0.5
    Z = Z.astype(bool)

    p = min(Z.shape)
    if p < 4:
        return 0.0

    # Tailles de boîte : 2^n, 2^(n-1), ..., 4
    n = int(np.log2(p))
    sizes = 2 ** np.arange(n, 1, -1)

    counts = []
    for size in sizes:
        c = _boxcount(Z, size)
        counts.append(c)

    counts = np.array(counts, dtype="float32")
    nonzero = counts > 0
    if nonzero.sum() < 2:
        return 0.0

    sizes = sizes[nonzero]
    counts = counts[nonzero]

    # Régression linéaire log-log
    coeffs = np.polyfit(np.log(1.0 / sizes), np.log(counts), 1)
    fd = float(coeffs[0])
    return fd


def extract_features(img_bytes, save_to_csv=False,
                     csv_path="image_features_from_images.csv",
                     filename=None):
    """
    Fonction principale utilisée par app.py

    - img_bytes : BytesIO de l'image
    - save_to_csv : si True, ajoute une ligne dans un CSV
    - csv_path : chemin du CSV à créer / compléter
    - filename : nom de l'image (pour la colonne 'filename')

    Retour :
      np.array([radius_mean,
                area_mean,
                perimeter_mean,
                concavity_mean,
                fractal_dimension_mean])
    """

    # 1) Charger l'image en niveaux de gris
    gray = _load_image_from_bytes(img_bytes)

    # 2) Extraire les features géométriques
    radius_mean, area_mean, perimeter_mean, concavity_mean = _extract_shape_features(gray)

    # 3) Dimension fractale approximative
    fractal_dimension_mean = _fractal_dimension(gray)

    features_dict = {
        "filename": filename or "in_memory",
        "radius_mean": radius_mean,
        "area_mean": area_mean,
        "perimeter_mean": perimeter_mean,
        "concavity_mean": concavity_mean,
        "fractal_dimension_mean": fractal_dimension_mean,
    }

    # 4) Sauvegarde éventuelle dans un CSV (nouveau dataset)
    if save_to_csv:
        df_row = pd.DataFrame([features_dict])
        if os.path.exists(csv_path):
            df_row.to_csv(csv_path, mode="a", header=False, index=False)
        else:
            df_row.to_csv(csv_path, index=False)

    # 5) Retourne uniquement les valeurs numériques pour le modèle
    return np.array(
        [
            features_dict["radius_mean"],
            features_dict["area_mean"],
            features_dict["perimeter_mean"],
            features_dict["concavity_mean"],
            features_dict["fractal_dimension_mean"],
        ],
        dtype="float32",
    )
