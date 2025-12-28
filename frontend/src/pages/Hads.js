import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import pinkIcon from "../assets/pinkicon.png";
import { Box, Typography, Tooltip } from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import "./Hads.css";

const INFO25_QUESTIONS = [
  "Did you receive clear information about your condition?",
  "Did you receive sufficient information about necessary examinations?",
  "Did you receive information about different possible treatments?",
  "Were you informed about potential side effects?",
  "Did you receive useful written information?",
  "Were the oral information you received sufficient?",
  "Were the explanations provided clear?",
  "Was the level of detail provided satisfactory?",
  "Were you informed about possible symptoms to watch for?",
  "Were you informed about the possible evolution of your condition?",
  "Were you informed about the results of your examinations?",
  "Did you understand the explanations regarding the results?",
  "Did the information meet your expectations?",
  "Were you informed about available support services?",
  "Were you informed about psychological aspects related to the condition?",
  "Did you receive information about your rights as a patient?",
  "Did you receive information on how to manage your treatment?",
  "Were you well informed about the long-term effects of treatment?",
  "Did the information reduce your concerns?",
  "Did the information improve your overall understanding?",
  "Are you satisfied with the general information received?",
  "Was the information adapted to your personal situation?",
  "Did you receive sufficient explanations during your medical visits?",
  "Would you like to receive more information?",
  "Do you think you received too much information?"
];

const RESPONSE_OPTIONS = [
  { value: 1, label: "Not at all" },
  { value: 2, label: "A little" },
  { value: 3, label: "A lot" },
  { value: 4, label: "Extremely" }
];

export default function HadsForm() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [form, setForm] = useState({
    gender: "",
    ageGroup: "",
    ecog: "",
    clinicalTrial: "",
    extent: "",
    treatment: "",
    info: {}
  });

  const [result, setResult] = useState(null);

  // Field help text dictionary
  const fieldHelp = {
    ecog: "ECOG Performance Status measures your ability to perform daily activities. 0 = Fully active, 1 = Restricted in strenuous activity, 2 = Ambulatory but unable to work, 3 = Limited self-care, 4 = Completely disabled.",
    clinicalTrial: "A clinical trial is a research study that tests new treatments or procedures. Participating in a clinical trial may affect your care and outcomes.",
    extent: "Extent of Disease indicates the stage of your breast cancer. Early breast cancer is localized, while advanced disease has spread to other parts of the body.",
    treatment: "Treatment type refers to when and how cancer treatment is given. Adjuvant is after surgery, Neoadjuvant is before surgery, and Palliative focuses on symptom management."
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

  const handleInfoChange = (index, value) => {
    setForm({
      ...form,
      info: { ...form.info, [`INFO25_${index + 1}`]: value }
    });
  };

  const handleSubmit = async () => {
    const payload = {
      "Gender (female -1; male-2)": parseInt(form.gender),
      "Age group [18-29 >1; 30-39 >2; 40-49 >3; 50-59 >4; 60-69 >5; 70-79 >6; 80-89 >7]": parseInt(form.ageGroup),
      "ECOG_PS": parseInt(form.ecog),
      "Clinical trial (1-yes; 2 -No)": parseInt(form.clinicalTrial),
      "Extent of Disease (1- early breast cancer; 2-advanced disease)": parseInt(form.extent),
      "Treatment (1- adjuvant/ 2- Neoadjuvant/ 3- Palliative; 31 First line; 32 Second line; 33 Third line)":
        parseInt(form.treatment),
      ...form.info,
      "INFO25_More topics": form.info["INFO25_24"] || 1,
      "INFO25_Less information": form.info["INFO25_25"] || 1
    };

    const res = await fetch("http://localhost:5000/predict_hads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    setResult({
      class: data.HADS_high_pred,
      proba: (data.probability_HADS_high * 100).toFixed(1)
    });
  };

  return (
    <div className="hads-page">
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

      <div className="hads-container">
        <div className="hads-header">
          <h1 className="hads-title">📝 HADS & INFO-25 Questionnaire</h1>
          <p className="hads-subtitle">
            Evaluate your mental wellbeing with our Hospital Anxiety and Depression Scale assessment tool
          </p>
        </div>

        <div className="hads-card">
          {/* CLINICAL SECTION */}
          <h2 className="hads-section-title">Clinical Information</h2>

          <div className="hads-form-group">
            <label className="hads-label">Gender</label>
            <select 
              className="hads-select"
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
            >
              <option value="">-- Select --</option>
              <option value="1">Female</option>
              <option value="2">Male</option>
            </select>
          </div>

          <div className="hads-form-group">
            <label className="hads-label">Age Group</label>
            <select 
              className="hads-select"
              value={form.ageGroup}
              onChange={(e) => setForm({ ...form, ageGroup: e.target.value })}
            >
              <option value="">-- Select --</option>
              <option value="1">18-29</option>
              <option value="2">30-39</option>
              <option value="3">40-49</option>
              <option value="4">50-59</option>
              <option value="5">60-69</option>
              <option value="6">70-79</option>
              <option value="7">80-89</option>
            </select>
          </div>

          <div className="hads-form-group">
            <div className="hads-label">
              <FieldLabel label="ECOG Performance Status" fieldKey="ecog" />
            </div>
            <select 
              className="hads-select"
              value={form.ecog}
              onChange={(e) => setForm({ ...form, ecog: e.target.value })}
            >
              <option value="">-- Select --</option>
              <option value="0">0 - Fully Active</option>
              <option value="1">1 - Restricted</option>
              <option value="2">2 - Ambulatory</option>
              <option value="3">3 - Limited self-care</option>
              <option value="4">4 - Completely disabled</option>
            </select>
          </div>

          <div className="hads-form-group">
            <div className="hads-label">
              <FieldLabel label="Clinical Trial" fieldKey="clinicalTrial" />
            </div>
            <select 
              className="hads-select"
              value={form.clinicalTrial}
              onChange={(e) => setForm({ ...form, clinicalTrial: e.target.value })}
            >
              <option value="1">Yes</option>
              <option value="2">No</option>
            </select>
          </div>

          <div className="hads-form-group">
            <div className="hads-label">
              <FieldLabel label="Extent of Disease" fieldKey="extent" />
            </div>
            <select 
              className="hads-select"
              value={form.extent}
              onChange={(e) => setForm({ ...form, extent: e.target.value })}
            >
              <option value="1">Early breast cancer</option>
              <option value="2">Advanced disease</option>
            </select>
          </div>

          <div className="hads-form-group">
            <div className="hads-label">
              <FieldLabel label="Treatment" fieldKey="treatment" />
            </div>
            <select 
              className="hads-select"
              value={form.treatment}
              onChange={(e) => setForm({ ...form, treatment: e.target.value })}
            >
              <option value="1">Adjuvant</option>
              <option value="2">Neoadjuvant</option>
              <option value="3">Palliative</option>
              <option value="31">First line</option>
              <option value="32">Second line</option>
              <option value="33">Third line</option>
            </select>
          </div>
        </div>

        <div className="hads-card">
          {/* SECTION INFO25 */}
          <h2 className="hads-section-title">Questionnaire INFO-25</h2>

          {INFO25_QUESTIONS.map((q, index) => (
            <div key={index} className="hads-question-container">
              <label className="hads-question-label">
                {index + 1}. {q}
              </label>
              <div className="hads-radio-group">
                {RESPONSE_OPTIONS.map((opt) => (
                  <label key={opt.value} className="hads-radio-option">
                    <input
                      type="radio"
                      className="hads-radio-input"
                      name={`info_${index}`}
                      value={opt.value}
                      onChange={() => handleInfoChange(index, opt.value)}
                    />
                    <span className="hads-radio-label">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          <button
            onClick={handleSubmit}
            className="hads-submit-button"
          >
            Submit
          </button>
        </div>

        {/* RESULT CARD */}
        {result && (
          <div className={`hads-result-card ${result.class === 1 ? 'high' : 'normal'}`}>
            <h3 className="hads-result-title">
              {result.class === 1 ? "⚠️ HIGH Anxiety/Depression Level" : "✅ NORMAL Anxiety/Depression Level"}
            </h3>

            <p className="hads-result-score">
              <strong>HADS Score (out of 100):</strong> {result.proba} / 100
            </p>

            <p className="hads-result-message">
              {result.class === 1
                ? "Psychological support is recommended."
                : "No significant signs of anxiety/depression detected."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
