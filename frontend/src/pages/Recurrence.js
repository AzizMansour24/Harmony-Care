// src/pages/Recurrence.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import pinkIcon from "../assets/pinkicon.png";
import "./Recurrence.css";

const Recurrence = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [formData, setFormData] = useState({
    Age: "",
    "Race ": "",
    "Marital Status": "",
    "T Stage ": "",
    "N Stage": "",
    "6th Stage": "",
    Grade: "",
    "A Stage": "",
    "Tumor Size": "",
    "Estrogen Status": "",
    "Progesterone Status": "",
    "Regional Node Examined": "",
    "Reginol Node Positive": ""
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
    setError("");

    try {
      const response = await fetch("http://localhost:5000/predict-recurrence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        throw new Error("Server returned an error");
      }
      
      const data = await response.json();
      setResult(data.predictions[0]);
    } catch (error) {
      console.error(error);
      setError("Error connecting to backend. Please check if the server is running and try again.");
    } finally {
      setLoading(false);
    }
  };

  const hasRecurrence = result?.prediction === 1;
  const probability = result?.probability ? (result.probability * 100).toFixed(2) : 0;

  return (
    <div className="recurrence-page">
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

      <div className="recurrence-container">
        <div className="recurrence-header">
          <h1 className="recurrence-title">♻️ Recurrence Prediction</h1>
          <p className="recurrence-subtitle">
            Advanced predictive model to assess cancer recurrence risk based on clinical and pathological factors
          </p>
        </div>

        <div className="recurrence-form-card">
          {error && (
            <div className="recurrence-error">
              <strong>Error:</strong> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="recurrence-form">
            <div className="recurrence-form-row">
              <div className="recurrence-form-group">
                <label className="recurrence-label">Age</label>
                <input
                  type="number"
                  name="Age"
                  value={formData.Age}
                  onChange={handleChange}
                  className="recurrence-input"
                  required
                  min="0"
                />
              </div>

              <div className="recurrence-form-group">
                <label className="recurrence-label">Race</label>
                <select
                  name="Race "
                  value={formData["Race "]}
                  onChange={handleChange}
                  className="recurrence-select"
                  required
                >
                  <option value="">-- Select --</option>
                  <option value="Black">Black</option>
                  <option value="Other">Other (American Indian/AK Native, Asian/Pacific Islander)</option>
                  <option value="White">White</option>
                </select>
              </div>
            </div>

            <div className="recurrence-form-row">
              <div className="recurrence-form-group">
                <label className="recurrence-label">Marital Status</label>
                <select
                  name="Marital Status"
                  value={formData["Marital Status"]}
                  onChange={handleChange}
                  className="recurrence-select"
                  required
                >
                  <option value="">-- Select --</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Married">Married (including common law)</option>
                  <option value="Single">Single (never married)</option>
                  <option value="Widowed">Widowed</option>
                </select>
              </div>

              <div className="recurrence-form-group">
                <label className="recurrence-label">T Stage</label>
                <select
                  name="T Stage "
                  value={formData["T Stage "]}
                  onChange={handleChange}
                  className="recurrence-select"
                  required
                >
                  <option value="">-- Select --</option>
                  <option value="T1">T1</option>
                  <option value="T2">T2</option>
                  <option value="T3">T3</option>
                  <option value="T4">T4</option>
                </select>
              </div>
            </div>

            <div className="recurrence-form-row">
              <div className="recurrence-form-group">
                <label className="recurrence-label">N Stage</label>
                <select
                  name="N Stage"
                  value={formData["N Stage"]}
                  onChange={handleChange}
                  className="recurrence-select"
                  required
                >
                  <option value="">-- Select --</option>
                  <option value="N1">N1</option>
                  <option value="N2">N2</option>
                  <option value="N3">N3</option>
                </select>
              </div>

              <div className="recurrence-form-group">
                <label className="recurrence-label">6th Stage</label>
                <select
                  name="6th Stage"
                  value={formData["6th Stage"]}
                  onChange={handleChange}
                  className="recurrence-select"
                  required
                >
                  <option value="">-- Select --</option>
                  <option value="IIA">IIA</option>
                  <option value="IIB">IIB</option>
                  <option value="IIIA">IIIA</option>
                  <option value="IIIB">IIIB</option>
                  <option value="IIIC">IIIC</option>
                </select>
              </div>
            </div>

            <div className="recurrence-form-row">
              <div className="recurrence-form-group">
                <label className="recurrence-label">Grade</label>
                <select
                  name="Grade"
                  value={formData.Grade}
                  onChange={handleChange}
                  className="recurrence-select"
                  required
                >
                  <option value="">-- Select --</option>
                  <option value="Moderately differentiated; Grade II">Moderately differentiated; Grade II</option>
                  <option value="Poorly differentiated; Grade III">Poorly differentiated; Grade III</option>
                  <option value="Well differentiated; Grade I">Well differentiated; Grade I</option>
                </select>
              </div>

              <div className="recurrence-form-group">
                <label className="recurrence-label">A Stage</label>
                <select
                  name="A Stage"
                  value={formData["A Stage"]}
                  onChange={handleChange}
                  className="recurrence-select"
                  required
                >
                  <option value="">-- Select --</option>
                  <option value="Distant">Distant</option>
                  <option value="Regional">Regional</option>
                </select>
              </div>
            </div>

            <div className="recurrence-form-row">
              <div className="recurrence-form-group">
                <label className="recurrence-label">Tumor Size</label>
                <input
                  type="number"
                  name="Tumor Size"
                  value={formData["Tumor Size"]}
                  onChange={handleChange}
                  className="recurrence-input"
                  required
                  min="0"
                  step="0.1"
                />
              </div>

              <div className="recurrence-form-group">
                <label className="recurrence-label">Estrogen Status</label>
                <select
                  name="Estrogen Status"
                  value={formData["Estrogen Status"]}
                  onChange={handleChange}
                  className="recurrence-select"
                  required
                >
                  <option value="">-- Select --</option>
                  <option value="Negative">Negative</option>
                  <option value="Positive">Positive</option>
                </select>
              </div>
            </div>

            <div className="recurrence-form-row">
              <div className="recurrence-form-group">
                <label className="recurrence-label">Progesterone Status</label>
                <select
                  name="Progesterone Status"
                  value={formData["Progesterone Status"]}
                  onChange={handleChange}
                  className="recurrence-select"
                  required
                >
                  <option value="">-- Select --</option>
                  <option value="Negative">Negative</option>
                  <option value="Positive">Positive</option>
                </select>
              </div>

              <div className="recurrence-form-group">
                <label className="recurrence-label">Regional Node Examined</label>
                <input
                  type="number"
                  name="Regional Node Examined"
                  value={formData["Regional Node Examined"]}
                  onChange={handleChange}
                  className="recurrence-input"
                  required
                  min="0"
                />
              </div>
            </div>

            <div className="recurrence-form-row">
              <div className="recurrence-form-group">
                <label className="recurrence-label">Regional Node Positive</label>
                <input
                  type="number"
                  name="Reginol Node Positive"
                  value={formData["Reginol Node Positive"]}
                  onChange={handleChange}
                  className="recurrence-input"
                  required
                  min="0"
                />
              </div>
            </div>

            <button
              type="submit"
              className="recurrence-submit-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="recurrence-loading-spinner"></span>
                  Predicting...
                </>
              ) : (
                "Predict Recurrence"
              )}
            </button>
          </form>
        </div>

        {result && (
          <div className="recurrence-result-card">
            <div className="recurrence-result-header">
              <h3 className="recurrence-result-title">📊 Recurrence Prediction Results</h3>
            </div>
            <div className="recurrence-result-content">
              <div className="recurrence-result-main">
                <div className={`recurrence-risk-badge ${hasRecurrence ? "recurrence-risk-high" : "recurrence-risk-low"}`}>
                  <div className="recurrence-risk-icon">
                    {hasRecurrence ? "⚠️" : "✅"}
                  </div>
                  <div className="recurrence-risk-text">
                    <div className="recurrence-risk-label">Prediction</div>
                    <div className="recurrence-risk-value">
                      {hasRecurrence ? "Recurrence Detected" : "No Recurrence"}
                    </div>
                  </div>
                </div>

                <div className="recurrence-probability-section">
                  <div className="recurrence-probability-label">Recurrence Probability</div>
                  <div className={`recurrence-probability-value ${hasRecurrence ? "recurrence-prob-high" : "recurrence-prob-low"}`}>
                    {probability}%
                  </div>
                  <div className="recurrence-probability-bar-container">
                    <div
                      className={`recurrence-probability-bar ${hasRecurrence ? "recurrence-bar-high" : "recurrence-bar-low"}`}
                      style={{ width: `${probability}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="recurrence-explanation-section">
                <h4 className="recurrence-explanation-title">What This Means</h4>
                <p className="recurrence-explanation-text">
                  {hasRecurrence
                    ? `Based on the clinical and pathological factors provided, the model predicts a ${probability}% probability of cancer recurrence. This indicates a higher risk that requires close monitoring and follow-up care. Please discuss these results with your oncology team to develop an appropriate surveillance and treatment plan.`
                    : `Based on the clinical and pathological factors provided, the model predicts a ${probability}% probability of cancer recurrence. This indicates a lower risk, but regular follow-up appointments and monitoring are still important for your ongoing care. Continue with your scheduled check-ups as recommended by your healthcare team.`}
                </p>
              </div>

              <div className="recurrence-next-steps-section">
                <h4 className="recurrence-next-steps-title">Recommended Next Steps</h4>
                <ul className="recurrence-next-steps-list">
                  {hasRecurrence ? (
                    <>
                      <li className="recurrence-next-step-item">Schedule a consultation with your oncology team to review these results</li>
                      <li className="recurrence-next-step-item">Discuss enhanced surveillance and monitoring protocols</li>
                      <li className="recurrence-next-step-item">Consider additional diagnostic tests or imaging as recommended</li>
                      <li className="recurrence-next-step-item">Review and potentially adjust your treatment plan with your healthcare provider</li>
                    </>
                  ) : (
                    <>
                      <li className="recurrence-next-step-item">Continue with regular follow-up appointments as scheduled</li>
                      <li className="recurrence-next-step-item">Maintain your current surveillance and monitoring protocols</li>
                      <li className="recurrence-next-step-item">Keep all scheduled check-ups and imaging studies</li>
                      <li className="recurrence-next-step-item">Discuss any concerns or changes in your condition with your healthcare team</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Recurrence;
