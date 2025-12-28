# backend/modules/cancerDetectionImage/image_filter.py

import numpy as np

"""
Petit filtre heuristique pour vérifier si l'image ressemble
à une IRM de sein telle que vue dans le dataset d'entraînement.

Les seuils sont à ajuster en fonction de tes données réelles.
"""

def is_breast_mri(features):
    """
    features : peut être un array 1D ou 2D venant de extract_features

    On le ramène toujours en 1D :
        f[0] = mean
        f[1] = std

    Retourne True si ça ressemble à une IRM de sein,
    False sinon.
    """

    # Convertir en numpy et aplatir en 1D
    f = np.asarray(features).ravel()

    # Sécurité : vérifier qu'on a au moins 2 features
    if f.shape[0] < 2:
        return False

    mean_val = float(f[0])
    std_val = float(f[1])

    # Seuils à ajuster selon tes vraies données IRM
    MEAN_MIN, MEAN_MAX = 0.05, 0.8   # intensité moyenne acceptable
    STD_MIN, STD_MAX   = 0.01, 0.5   # contraste global acceptable

    if not (MEAN_MIN <= mean_val <= MEAN_MAX):
        return False

    if not (STD_MIN <= std_val <= STD_MAX):
        return False

    return True
