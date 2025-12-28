# 🏥 Harmony-Care

<div align="center">

**A comprehensive medical AI platform delivering insightful, compassionate care through intelligent health analysis**

[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-19.2-blue.svg)](https://reactjs.org/)
[![Flask](https://img.shields.io/badge/Flask-2.0-green.svg)](https://flask.palletsprojects.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[Features](#-features) • [Installation](#-installation) • [Usage](#-usage) • [API Documentation](#-api-documentation) • [Contributing](#-contributing)

</div>

---

## 📋 Table of Contents

- [About](#-about)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 About

**Harmony-Care** is an advanced medical AI platform designed to support both patients and clinicians with comprehensive health analysis tools. The platform integrates multiple machine learning models to provide:

- **Risk Assessment**: Early detection and risk prediction for breast cancer
- **Mental Health Support**: HADS (Hospital Anxiety and Depression Scale) assessment
- **Clinical Decision Support**: Multiple AI-powered tools for informed medical decisions
- **Image Analysis**: Medical image classification for benign/malignant detection
- **Predictive Analytics**: Recurrence prediction and tumor aggressivity analysis

> ⚠️ **Important Disclaimer**: This platform is designed for educational and research purposes. It should never be used as a substitute for professional medical advice, diagnosis, or treatment.

---

## ✨ Features

### 🔬 Core Capabilities

| Feature | Description | Model |
|---------|-------------|-------|
| 🎯 **Risk Prediction** | Breast cancer risk assessment with feature importance analysis | XGBoost Classifier |
| 🔍 **Cancer Detection** | Multi-model cancer detection using clinical features | SGD Classifier |
| 🖼️ **Image Analysis** | Benign/malignant classification from medical images | Random Forest |
| 📊 **Tumor Aggressivity** | Clustering-based analysis of tumor aggressivity levels | K-Means Clustering |
| 🔄 **Recurrence Prediction** | 5-year recurrence risk assessment | Logistic Regression |
| 🌡️ **Menopause Risk** | Menopause-based risk classification | Custom ML Model |
| 🧠 **HADS Assessment** | Anxiety and depression scoring for mental health evaluation | Trained Classifier |

### 🎨 User Interface

- **Modern React Frontend** with Material-UI components
- **Responsive Design** for desktop and mobile devices
- **Interactive Visualizations** using Plotly.js
- **Real-time Predictions** with instant feedback
- **Intuitive Navigation** with React Router

---

## 🛠️ Tech Stack

### Backend
- **Framework**: Flask (Python)
- **ML Libraries**: scikit-learn, XGBoost, TensorFlow
- **Data Processing**: pandas, numpy
- **Model Management**: joblib
- **Data Balancing**: imbalanced-learn (SMOTE)

### Frontend
- **Framework**: React 19.2
- **UI Library**: Material-UI (MUI)
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Visualization**: Plotly.js, React-Plotly
- **Styling**: Tailwind CSS, Emotion

### Machine Learning Models
- **XGBoost**: Risk prediction and classification
- **SGD Classifier**: Cancer detection
- **Random Forest**: Image-based classification
- **Logistic Regression**: Recurrence prediction
- **K-Means Clustering**: Tumor aggressivity analysis

---

## 📁 Project Structure

```
Harmony-Care/
│
├── backend/                          # Flask backend application
│   ├── app.py                        # Main Flask application
│   ├── requirements.txt              # Python dependencies
│   │
│   ├── modules/                      # ML model modules
│   │   ├── cancerRisk/               # Risk prediction model
│   │   │   ├── __init__.py
│   │   │   └── risk_model.py
│   │   ├── cancerDetection/          # Cancer detection model
│   │   ├── cancerDetectionImage/     # Image-based detection
│   │   ├── AgressivityClustering/    # Tumor aggressivity analysis
│   │   ├── recurrence/               # Recurrence prediction
│   │   ├── MenopauseRisk/            # Menopause risk assessment
│   │   └── Hads/                     # HADS mental health assessment
│   │
│   ├── data/                         # Datasets
│   │   ├── raw/                      # Raw datasets
│   │   ├── processed/                # Cleaned and processed datasets
│   │   └── train/                    # Training images
│   │       ├── benign/               # Benign tumor images
│   │       └── malignant/            # Malignant tumor images
│   │
│   └── saved_models/                 # Trained ML models
│       ├── xgb_risk_model.pkl
│       ├── cancer_sgd_model.pkl
│       ├── rf_model.joblib
│       └── aggressivity/             # Aggressivity clustering models
│
├── frontend/                         # React frontend application
│   ├── public/                       # Static files
│   │   ├── index.html
│   │   └── favicon.ico
│   │
│   └── src/
│       ├── App.js                    # Main React component
│       ├── config.js                 # API configuration
│       ├── pages/                    # Page components
│       │   ├── HomePage.js
│       │   ├── RiskForm.js
│       │   ├── CancerDetection.js
│       │   ├── CancerDetectionImage.js
│       │   ├── Agressivity.js
│       │   ├── Recurrence.js
│       │   ├── MenopauseRisk.js
│       │   ├── Hads.js
│       │   └── Contact.js
│       └── assets/                   # Images and static assets
│
└── README.md                         # This file
```

---

## 🚀 Installation

### Prerequisites

- **Python** 3.8 or higher
- **Node.js** 14.x or higher
- **npm** or **yarn** package manager
- **Git** for cloning the repository

### Step 1: Clone the Repository

```bash
git clone https://github.com/AzizMansour24/Harmony-Care.git
cd Harmony-Care
```

### Step 2: Backend Setup

#### Windows

```powershell
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv env

# Activate virtual environment
.\env\Scripts\activate

# Install dependencies
pip install -r requirements.txt
pip install flask flask-cors
```

#### Linux/macOS

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python3 -m venv env

# Activate virtual environment
source env/bin/activate

# Install dependencies
pip install -r requirements.txt
pip install flask flask-cors
```

### Step 3: Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Install additional packages
npm install axios react-router-dom
npm install @mui/material @mui/icons-material
npm install @emotion/react @emotion/styled
npm install react-plotly.js plotly.js

# Install Tailwind CSS (optional)
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Step 4: Configuration

Update the API URL in `frontend/src/config.js`:

```javascript
const API_URL = "http://127.0.0.1:5000";  // Backend URL
export default API_URL;
```

---

## 💻 Usage

### Starting the Backend Server

```bash
# Activate virtual environment (if not already activated)
cd backend
source env/bin/activate  # Linux/macOS
# OR
.\env\Scripts\activate   # Windows

# Run Flask server
python app.py
```

The backend server will start on `http://127.0.0.1:5000`

### Starting the Frontend Server

```bash
# Navigate to frontend directory
cd frontend

# Start React development server
npm start
```

The frontend will be available at `http://localhost:3000`

### Accessing the Application

1. Open your browser and navigate to `http://localhost:3000`
2. The application will automatically connect to the backend API
3. Use the navigation menu to access different features:
   - **Home**: Overview and navigation
   - **Risk Assessment**: Breast cancer risk prediction
   - **Cancer Detection**: Clinical feature-based detection
   - **Image Analysis**: Upload medical images for classification
   - **Aggressivity Analysis**: Tumor aggressivity clustering
   - **Recurrence Prediction**: 5-year recurrence risk
   - **Menopause Risk**: Menopause-based risk assessment
   - **HADS Assessment**: Mental health evaluation

---

## 📡 API Documentation

### Base URL
```
http://127.0.0.1:5000
```

### Endpoints

#### Health Check
```http
GET /health
```
**Response:**
```json
{
  "status": "OK",
  "message": "Backend is running"
}
```

#### Risk Prediction
```http
POST /predictRisk
```
**Request Body:**
```json
{
  "age": 45,
  "bmi": 25.5,
  "family_history": "yes",
  ...
}
```
**Response:**
```json
{
  "predictions": [{
    "patient_index": 0,
    "risk_score_percent": 23.45,
    "top_features": ["feature1", "feature2", ...]
  }]
}
```

#### Cancer Detection
```http
POST /detect-cancer
```
**Request Body:**
```json
{
  "radius_mean": 17.99,
  "texture_mean": 10.38,
  "perimeter_mean": 122.8,
  ...
}
```
**Response:**
```json
{
  "predictions": [{
    "patient_index": 0,
    "raw_score": 0.85,
    "probability": 0.85,
    "threshold_used": 0.5,
    "prediction": "Malignant"
  }]
}
```

#### Image-Based Detection
```http
POST /predict
Content-Type: multipart/form-data
```
**Request:** Form data with `image` file
**Response:**
```json
{
  "label": "malignant",
  "probability": 0.92,
  "recommendation": "Consult with a healthcare professional...",
  "warning": "This system is for educational purposes only..."
}
```

#### Aggressivity Prediction
```http
POST /predictAgressivity
```
**Request Body:**
```json
{
  "Cancer Type": "breast",
  "age": 50,
  ...
}
```

#### Recurrence Prediction
```http
POST /predict-recurrence
```

#### Menopause Risk Assessment
```http
POST /predict-menopause-risk
```

#### HADS Assessment
```http
POST /predict_hads
```

---

## 📸 Screenshots

> 📝 **Note**: Add screenshots of your application here to showcase the UI and features.

<!--
### Home Page
![Home Page](screenshots/home.png)

### Risk Assessment
![Risk Assessment](screenshots/risk-assessment.png)

### Cancer Detection
![Cancer Detection](screenshots/cancer-detection.png)
-->

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit your changes** (`git commit -m 'Add some AmazingFeature'`)
4. **Push to the branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**

### Development Guidelines

- Follow PEP 8 style guide for Python code
- Use ESLint and Prettier for JavaScript/React code
- Write clear commit messages
- Add comments and documentation for complex logic
- Test your changes before submitting

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## ⚠️ Disclaimer

**This software is provided for educational and research purposes only. It is not intended to be used as a medical device or for clinical decision-making. Always consult with qualified healthcare professionals for medical advice, diagnosis, and treatment.**

The authors and contributors are not responsible for any consequences arising from the use of this software.

---

## 👥 Authors

- **Aziz Mansour** - [@AzizMansour24](https://github.com/AzizMansour24)

---

## 🙏 Acknowledgments

- Medical datasets used for training and validation
- Open-source ML libraries and frameworks
- React and Flask communities
- All contributors and testers

---

<div align="center">

**Made with ❤️ for better healthcare**

⭐ Star this repo if you find it helpful!

</div>
