# backend/modules/cancerDetectionImage/recommendations.py

import random

# Plusieurs recommandations pour les cas malins
MALIGNANT_RECOMMENDATIONS = [
    (
        "Revoir l'examen complet en prêtant attention aux zones présentant une masse ou un rehaussement focal. "
        "Comparer avec les comptes rendus antérieurs et envisager un avis radiologique complémentaire."
    ),
    (
        "Corréler l'image aux données cliniques disponibles, puis discuter la pertinence d'un prélèvement ciblé "
        "comme une biopsie afin de confirmer la nature tissulaire de la lésion."
    ),
    (
        "Analyser la zone suspecte sur l'ensemble des séquences IRM disponibles, notamment en T1/T2 et diffusion, "
        "et confronter avec l’histologie antérieure s'il en existe."
    ),
    (
        "Préconiser une prise en charge concertée en réunion pluridisciplinaire afin de confronter l’imagerie "
        "avec les indicateurs cliniques avant toute décision thérapeutique."
    )
]

# Plusieurs recommandations pour les cas bénins
BENIGN_RECOMMENDATIONS = [
    (
        "Examiner l’image globalement afin de confirmer l’absence de masse suspecte, et vérifier la stabilité "
        "par rapport aux examens antérieurs s’ils sont disponibles."
    ),
    (
        "S’assurer que l’aspect radiologique observé est cohérent avec l’évolution clinique et l’absence de symptôme associé."
    ),
    (
        "Comparer les zones observées avec celles d’éventuelles IRM antérieures afin de confirmer l’évolution non agressive."
    ),
    (
        "Si d’autres examens ont été réalisés (échographie, mammographie), vérifier l’homogénéité des conclusions "
        "pour conforter un caractère rassurant."
    )
]


def get_recommendation(label, prob=None):
    """
    Retourne une recommandation différente à chaque fois,
    adaptée au médecin selon le type de classification.
    prob est ignorée volontairement.
    """

    if label == 1:
        return random.choice(MALIGNANT_RECOMMENDATIONS)

    return random.choice(BENIGN_RECOMMENDATIONS)
