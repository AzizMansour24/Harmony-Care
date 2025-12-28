pour la creation d'envrionnement:
PS C:\Users\MSI\Desktop\4eme\ML\Projet\BCD_Project> cd C:\Users\MSI\Desktop\4eme\ML\Projet\BCD_Project
PS C:\Users\MSI\Desktop\4eme\ML\Projet\BCD_Project> python -m venv env
PS C:\Users\MSI\Desktop\4eme\ML\Projet\BCD_Project> .\env\Scripts\activate
(env) PS C:\Users\MSI\Desktop\4eme\ML\Projet\BCD_Project> pip install -r requirements.txt
(env) PS C:\Users\MSI\Desktop\4eme\ML\Projet\BCD_Project> pip install flask flask-cors

BCD_Project/
│
├── backend/                   # Flask backend
│   ├── app.py                 # Main Flask app
│   ├── requirements.txt       # Python dependencies
│   ├── modules/               # All model modules
│   │   └── cancerRisk/
│   │       ├── __init__.py
│   │       └── risk_model.py
│   ├── data/                  # Cleaned datasets
│   │   └── processed/
│   │       └── breast_cancer_risk_clean.csv
│   └── saved_models/          # Pickled/scaled models
│       ├── xgb_risk_model.pkl
│       └── scaler.pkl
│
├── frontend/                  # React frontend
│   ├── package.json
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── App.js
│       ├── components/
│       │   └── RiskForm.js   # Input form component
│       └── services/
│           └── api.js        # API calls to Flask backend
│
└── README.md

***************************************BackendEnv(flask)*****************************************************************
PS C:\Users\MSI\Desktop\4eme\ML\Projet\BCD_Project> cd C:\Users\MSI\Desktop\4eme\ML\Projet\BCD_Project\backend     
PS C:\Users\MSI\Desktop\4eme\ML\Projet\BCD_Project\backend> python -m venv env
PS C:\Users\MSI\Desktop\4eme\ML\Projet\BCD_Project\backend> env\Scripts\activate
pip install -r requirements.txt
(env) PS C:\Users\MSI\Desktop\4eme\ML\Projet\BCD_Project\backend> pip install flask flask-cors
*



***************************************FrontendEnv(react)*****************************************************************
(env) PS C:\Users\MSI\Desktop\4eme\ML\Projet\BCD_Project> cd C:\Users\MSI\Desktop\4eme\ML\Projet\BCD_Project
(env) PS C:\Users\MSI\Desktop\4eme\ML\Projet\BCD_Project> npx create-react-app frontend
cd frontend
npm install axios react-router-dom
npm install @mui/material
npm install @mui/icons-material
npm install @emotion/react @emotion/styled


src/config.js:
const API_URL = "http://127.0.0.1:5000";
export default API_URL;
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p