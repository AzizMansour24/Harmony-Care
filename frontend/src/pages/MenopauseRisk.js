// src/pages/MenopauseRisk.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import pinkIcon from "../assets/pinkicon.png";
import { Box, Typography, Tooltip } from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import "./MenopauseRisk.css";

const MenopauseRisk = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [formData, setFormData] = useState({
    "Age at Diagnosis": "",
    "Chemotherapy": "",
    "Hormone Therapy": "",
    "Radio Therapy": "",
    "Inferred Menopausal State": "pre", // fixed value
    "ER Status": "",
    "PR Status": "",
    "HER2 Status": "",
    "Neoplasm Histologic Grade": "",
    "Tumor Stage": "",
    "Tumor Size": "",
    "Lymph nodes examined positive": "",
    "Nottingham prognostic index": ""
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Field help text dictionary
  const fieldHelp = {
    "ER Status": "ER (Estrogen Receptor) Status indicates whether your cancer cells have receptors for estrogen. Positive means the cancer may respond to hormone-blocking treatments.",
    "PR Status": "PR (Progesterone Receptor) Status indicates whether your cancer cells have receptors for progesterone. Positive means the cancer may respond to hormone-blocking treatments.",
    "HER2 Status": "HER2 (Human Epidermal Growth Factor Receptor 2) Status indicates whether your cancer cells produce too much HER2 protein. This helps determine if targeted therapy might be effective.",
    "Neoplasm Histologic Grade": "This grade (1-3) describes how abnormal the cancer cells look under a microscope. Grade 1 is less aggressive, Grade 3 is more aggressive.",
    "Tumor Stage": "Tumor stage (often written as T1, T2, T3, or T4) describes the size of the tumor and whether it has spread to nearby tissue. Your doctor can provide your specific stage.",
    "Nottingham prognostic index": "This is a scoring system that combines tumor size, grade, and lymph node status to help predict prognosis. Higher scores may indicate a higher risk of recurrence."
  };

  // Helper component for field label with tooltip
  const FieldLabel = ({ label, fieldKey }) => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
      <span style={{ fontWeight: 500 }}>{label}</span>
      {fieldHelp[fieldKey] && (
        <Tooltip
          title={fieldHelp[fieldKey]}
          arrow
          sx={{
            "& .MuiTooltip-tooltip": {
              backgroundColor: "#DB2777",
              color: "white",
              borderRadius: "8px",
              fontSize: "0.85rem",
              padding: "12px 16px",
              lineHeight: 1.6,
              maxWidth: "300px",
            },
            "& .MuiTooltip-arrow": {
              color: "#DB2777",
            },
          }}
        >
          <HelpOutlineIcon
            sx={{
              fontSize: "1.2rem",
              color: "#DB2777",
              cursor: "help",
              opacity: 0.7,
              transition: "all 0.3s ease",
              "&:hover": {
                opacity: 1,
                transform: "scale(1.1)",
              },
            }}
          />
        </Tooltip>
      )}
    </Box>
  );

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("http://localhost:5000/predict-menopause-risk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      setResult(data.predictions[0]);
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la prédiction");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="menopause-page">
      {/* Navigation Bar */}
      <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
        <div className="nav-container">
          <div className="nav-logo" onClick={() => navigate("/home")} style={{ cursor: "pointer" }}>
            <img src={pinkIcon} alt="HarmonyCare" className="logo-icon" />
            <span className="logo-text">HarmonyCare</span>
          </div>
          <div className="nav-links">
            <a href="/home" className="nav-link" onClick={(e) => { e.preventDefault(); navigate("/home"); }}>For Patients</a>
            <a href="/home" className="nav-link" onClick={(e) => { e.preventDefault(); navigate("/home"); }}>For Professionals</a>
            <a href="/contact" className="nav-link" onClick={(e) => { e.preventDefault(); navigate("/contact"); }}>Contact</a>
            <button className="nav-cta" onClick={() => navigate("/home")}>
              Get Started
            </button>
          </div>
        </div>
      </nav>

      <div className="menopause-container">
        <div className="menopause-header">
          <h1 className="menopause-title">🌸 Menopause Risk Prediction</h1>
          <p className="menopause-subtitle">
            Understand your menopause journey with personalized risk assessment and guidance
          </p>
        </div>

        <div className="menopause-form-card">
          <form onSubmit={handleSubmit} className="menopause-form">
            {/* Age */}
            <div className="menopause-form-group">
              <label className="menopause-label">Age at Diagnosis</label>
              <input
                type="number"
                className="menopause-input"
                name="Age at Diagnosis"
                value={formData["Age at Diagnosis"]}
                onChange={handleChange}
                required
              />
            </div>

            {/* Chemotherapy */}
            <div className="menopause-form-group">
              <label className="menopause-label">Chemotherapy</label>
              <select 
                className="menopause-select"
                name="Chemotherapy" 
                value={formData["Chemotherapy"]} 
                onChange={handleChange} 
                required
              >
                <option value="">-- Select --</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            {/* Hormone Therapy */}
            <div className="menopause-form-group">
              <label className="menopause-label">Hormone Therapy</label>
              <select 
                className="menopause-select"
                name="Hormone Therapy" 
                value={formData["Hormone Therapy"]} 
                onChange={handleChange} 
                required
              >
                <option value="">-- Select --</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            {/* Radio Therapy */}
            <div className="menopause-form-group">
              <label className="menopause-label">Radio Therapy</label>
              <select 
                className="menopause-select"
                name="Radio Therapy" 
                value={formData["Radio Therapy"]} 
                onChange={handleChange} 
                required
              >
                <option value="">-- Select --</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            {/* Inferred Menopausal State */}
            <div className="menopause-form-group">
              <label className="menopause-label">Inferred Menopausal State</label>
              <input
                type="text"
                className="menopause-input"
                value="pre"
                disabled
              />
            </div>

            {/* ER Status */}
            <div className="menopause-form-group">
              <div className="menopause-label">
                <FieldLabel label="ER Status" fieldKey="ER Status" />
              </div>
              <select 
                className="menopause-select"
                name="ER Status" 
                value={formData["ER Status"]} 
                onChange={handleChange} 
                required
              >
                <option value="">-- Select --</option>
                <option value="Positive">Positive</option>
                <option value="Negative">Negative</option>
              </select>
            </div>

            {/* PR Status */}
            <div className="menopause-form-group">
              <div className="menopause-label">
                <FieldLabel label="PR Status" fieldKey="PR Status" />
              </div>
              <select 
                className="menopause-select"
                name="PR Status" 
                value={formData["PR Status"]} 
                onChange={handleChange} 
                required
              >
                <option value="">-- Select --</option>
                <option value="Positive">Positive</option>
                <option value="Negative">Negative</option>
              </select>
            </div>

            {/* HER2 Status */}
            <div className="menopause-form-group">
              <div className="menopause-label">
                <FieldLabel label="HER2 Status" fieldKey="HER2 Status" />
              </div>
              <select 
                className="menopause-select"
                name="HER2 Status" 
                value={formData["HER2 Status"]} 
                onChange={handleChange} 
                required
              >
                <option value="">-- Select --</option>
                <option value="Positive">Positive</option>
                <option value="Negative">Negative</option>
              </select>
            </div>

            {/* Neoplasm Histologic Grade */}
            <div className="menopause-form-group">
              <div className="menopause-label">
                <FieldLabel label="Neoplasm Histologic Grade" fieldKey="Neoplasm Histologic Grade" />
              </div>
              <input
                type="number"
                className="menopause-input"
                name="Neoplasm Histologic Grade"
                value={formData["Neoplasm Histologic Grade"]}
                onChange={handleChange}
                required
              />
            </div>

            {/* Tumor Stage */}
            <div className="menopause-form-group">
              <div className="menopause-label">
                <FieldLabel label="Tumor Stage" fieldKey="Tumor Stage" />
              </div>
              <input
                type="text"
                className="menopause-input"
                name="Tumor Stage"
                value={formData["Tumor Stage"]}
                onChange={handleChange}
                required
              />
            </div>

            {/* Tumor Size */}
            <div className="menopause-form-group">
              <label className="menopause-label">Tumor Size</label>
              <input
                type="number"
                className="menopause-input"
                name="Tumor Size"
                value={formData["Tumor Size"]}
                onChange={handleChange}
                required
              />
            </div>

            {/* Lymph nodes examined positive */}
            <div className="menopause-form-group">
              <label className="menopause-label">Lymph nodes examined positive</label>
              <input
                type="number"
                className="menopause-input"
                name="Lymph nodes examined positive"
                value={formData["Lymph nodes examined positive"]}
                onChange={handleChange}
                required
              />
            </div>

            {/* Nottingham prognostic index */}
            <div className="menopause-form-group">
              <div className="menopause-label">
                <FieldLabel label="Nottingham prognostic index" fieldKey="Nottingham prognostic index" />
              </div>
              <input
                type="number"
                className="menopause-input"
                name="Nottingham prognostic index"
                value={formData["Nottingham prognostic index"]}
                onChange={handleChange}
                required
              />
            </div>

            <button 
              type="submit" 
              className="menopause-submit-button" 
              disabled={loading}
            >
              {loading ? "Predicting..." : "Predict Risk"}
            </button>
          </form>
        </div>

        {result && (
          <div className="menopause-result-card">
            <div className="menopause-result-header">
              <h3 className="menopause-result-title">Your Menopause Risk Assessment</h3>
              <p className="menopause-result-subtitle">Based on your provided information</p>
            </div>
            
            <div className="menopause-risk-display">
              <div className="menopause-risk-main">
                <p className="menopause-risk-label">Risk Level</p>
                <div className={`menopause-risk-badge-large ${
                  result.prediction === 0 ? 'low' : 
                  result.prediction === 1 ? 'moderate' : 'high'
                }`}>
                  {result.prediction === 0 ? "Low Risk" : result.prediction === 1 ? "Moderate Risk" : "High Risk"}
                </div>
                <p className="menopause-risk-explanation">
                  {result.prediction === 0 
                    ? "Based on the information you provided, your risk of experiencing menopause-related complications appears to be relatively low. However, it's important to continue regular check-ups with your healthcare provider." 
                    : result.prediction === 1 
                    ? "Your assessment indicates a moderate risk level. This means you may benefit from closer monitoring and discussing preventive strategies with your healthcare provider." 
                    : "Your assessment shows a higher risk level. We strongly recommend discussing these results with your healthcare provider to develop an appropriate monitoring and management plan."}
                </p>
              </div>

              <div className="menopause-probabilities-section">
                <h4 className="menopause-probabilities-title">Detailed Probability Breakdown</h4>
                <p className="menopause-probabilities-description">
                  The model calculated the following probabilities for each risk category:
                </p>
                <div className="menopause-probabilities-list">
                  <div className="menopause-probability-item">
                    <div className="menopause-probability-bar-container">
                      <div 
                        className="menopause-probability-bar low" 
                        style={{ width: `${result.probabilities[0] * 100}%` }}
                      ></div>
                    </div>
                    <div className="menopause-probability-info">
                      <span className="menopause-probability-label">Low Risk</span>
                      <span className="menopause-probability-value">{(result.probabilities[0] * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="menopause-probability-item">
                    <div className="menopause-probability-bar-container">
                      <div 
                        className="menopause-probability-bar moderate" 
                        style={{ width: `${result.probabilities[1] * 100}%` }}
                      ></div>
                    </div>
                    <div className="menopause-probability-info">
                      <span className="menopause-probability-label">Moderate Risk</span>
                      <span className="menopause-probability-value">{(result.probabilities[1] * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="menopause-probability-item">
                    <div className="menopause-probability-bar-container">
                      <div 
                        className="menopause-probability-bar high" 
                        style={{ width: `${result.probabilities[2] * 100}%` }}
                      ></div>
                    </div>
                    <div className="menopause-probability-info">
                      <span className="menopause-probability-label">High Risk</span>
                      <span className="menopause-probability-value">{(result.probabilities[2] * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="menopause-next-steps">
                <h4 className="menopause-next-steps-title">What Should You Do Next?</h4>
                <ul className="menopause-next-steps-list">
                  <li>Share these results with your healthcare provider during your next appointment</li>
                  <li>Discuss any concerns or questions you may have about your risk assessment</li>
                  <li>Follow your healthcare provider's recommendations for monitoring and follow-up care</li>
                  <li>Remember that this assessment is a tool to guide discussions with your doctor, not a definitive diagnosis</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenopauseRisk;
