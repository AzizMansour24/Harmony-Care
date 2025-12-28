# Harmony-Care

Harmony Care is a medical AI platform delivering insightful, compassionate care through intelligent health analysis. It supports patients and clinicians with risk prediction, mental health assessment, cancer detection, and clinical decision tools — all in one unified interface.

## Project Structure

BCD_Project/
│
├── backend/                   # Flask backend
│   ├── app.py                 # Main Flask app
│   ├── requirements.txt       # Python dependencies
│   ├── modules/               # All model modules
│   │   ├── cancerRisk/        # Risk prediction model
│   │   ├── cancerDetection/   # Cancer detection model
│   │   ├── cancerDetectionImage/  # Image-based detection
│   │   ├── AgressivityClustering/ # Tumor aggressivity clustering
│   │   ├── recurrence/        # Recurrence prediction
│   │   ├── MenopauseRisk/     # Menopause risk assessment
│   │   └── Hads/              # HADS anxiety & depression assessment
│   ├── data/                  # Datasets
│   │   ├── raw/               # Raw datasets
│   │   ├── processed/         # Cleaned datasets
│   │   └── train/             # Training images (benign/malignant)
│   └── saved_models/          # Trained ML models
│
├── frontend/                  # React frontend
│   ├── package.json
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── App.js
│       ├── pages/             # All page components
│       └── config.js          # API configuration
│
└── README.md

## Setup Instructions

### Backend Environment Setup

```powershell
# Navigate to project directory
cd C:\Users\MSI\Desktop\4eme\ML\Projet\BCD_Project\backend

# Create virtual environment
python -m venv env

# Activate virtual environment
env\Scripts\activate

# Install dependencies
pip install -r requirements.txt
pip install flask flask-cors
```

### Frontend Environment Setup

```powershell
# Navigate to project directory
cd C:\Users\MSI\Desktop\4eme\ML\Projet\BCD_Project

# Install frontend dependencies
cd frontend
npm install axios react-router-dom
npm install @mui/material @mui/icons-material
npm install @emotion/react @emotion/styled
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Configuration

Update `frontend/src/config.js` with your backend API URL:
```javascript
const API_URL = "http://127.0.0.1:5000";
export default API_URL;
```

## Running the Application

### Start Backend Server
```powershell
cd backend
python app.py
```
Backend will run on `http://127.0.0.1:5000`

### Start Frontend Server
```powershell
cd frontend
npm start
```
Frontend will run on `http://localhost:3000`

## Features

- **Risk Prediction**: Breast cancer risk assessment using XGBoost
- **Cancer Detection**: Multiple detection models (SGD, image-based)
- **Tumor Aggressivity**: Clustering-based aggressivity analysis
- **Recurrence Prediction**: 5-year recurrence risk assessment
- **Menopause Risk**: Menopause-based risk classification
- **HADS Assessment**: Anxiety and depression scoring
- **Image Analysis**: Benign/malignant classification from medical images

## Technologies

- **Backend**: Flask, Python, scikit-learn, XGBoost, TensorFlow
- **Frontend**: React, Material-UI, React Router, Axios
- **ML Models**: XGBoost, SGD, Random Forest, Logistic Regression, K-Means Clustering
