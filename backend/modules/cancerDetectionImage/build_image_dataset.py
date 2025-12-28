# backend/build_image_dataset.py

import os
import io
import pandas as pd
from feature_extraction import extract_features

BASE_DIR = r"C:\Users\MSI\Desktop\4eme\ML\Projet\BCD_Project\backend\data\train"
CSV_OUT = r"C:\Users\MSI\Desktop\4eme\ML\Projet\BCD_Project\backend\modules\cancerDetectionImage\dataset_extracted_images.csv"

LABEL_MAP = {
    "benign": 0,
    "malignant": 1
}

def main():
    rows = []

    for folder_name, label in LABEL_MAP.items():
        folder_path = os.path.join(BASE_DIR, folder_name)

        print(f"\n→ Lecture dossier : {folder_path}")

        if not os.path.exists(folder_path):
            print(f"⚠️ Dossier introuvable : {folder_path}")
            continue

        for filename in os.listdir(folder_path):
            file_path = os.path.join(folder_path, filename)

            if not filename.lower().endswith((".png", ".jpg", ".jpeg")):
                continue

            with open(file_path, "rb") as f:
                img_bytes = io.BytesIO(f.read())

            features = extract_features(img_bytes)

            rows.append({
                "filepath": file_path,
                "filename": filename,
                "label": label,
                "radius_mean": features[0],
                "area_mean": features[1],
                "perimeter_mean": features[2],
                "concavity_mean": features[3],
                "fractal_dimension_mean": features[4]
            })

            print(f"   ✔ {filename} → OK")

    df = pd.DataFrame(rows)
    df.to_csv(CSV_OUT, index=False, mode="w")


    print("\n=== Dataset généré ===")
    print(CSV_OUT)


if __name__ == "__main__":
    main()
