import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Plot from "react-plotly.js";
import pinkIcon from "../assets/pinkicon.png";
import { Box, Typography, Tooltip } from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import "./Agressivity.css";

function Agressivity() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    tumorSize: "",
    histologicGrade: "",
    lymphNodes: "",
    mutationCount: "",
    npi: "",
    cancerType: ""
  });
  const [cancerTypes, setCancerTypes] = useState([]);
  const [errors, setErrors] = useState({});
  const [formLoading, setFormLoading] = useState(true);

  // Results state
  const [patients, setPatients] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [clusterStats, setClusterStats] = useState([]);
  const [clusterCounts, setClusterCounts] = useState([]);
  const [topRisk, setTopRisk] = useState([]);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Field help text dictionary
  const fieldHelp = {
    "cancerType": "Select the type of cancer from the available options in the database.",
    "tumorSize": "Tumor size measured in millimeters. This is a key factor in determining aggressivity.",
    "histologicGrade": "Histologic grade (1-3) describes how abnormal the cancer cells look. Grade 1 is well-differentiated (less aggressive), Grade 3 is poorly differentiated (more aggressive).",
    "lymphNodes": "Number of positive lymph nodes examined. Higher numbers may indicate more advanced disease.",
    "mutationCount": "Total number of genetic mutations identified. Higher mutation counts can correlate with increased tumor aggressivity.",
    "npi": "Nottingham Prognostic Index (NPI) is calculated as: [0.2 × tumor size] + histologic grade + lymph node status. It helps predict prognosis."
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

  // Load cancer types on mount
  useEffect(() => {
    fetch("http://localhost:5000/cancer-types")
      .then(res => res.json())
      .then(data => {
        setCancerTypes(data);
        if (data.length > 0) setFormData(prev => ({ ...prev, cancerType: data[0] }));
        setFormLoading(false);
      })
      .catch(err => {
        console.error(err);
        setFormLoading(false);
      });
  }, []);

  const fields = [
    { key: "cancerType", label: "Cancer Type", type: "select" },
    { key: "tumorSize", label: "Tumor Size (mm)", type: "number", min: 0, max: 300, step: 0.1 },
    { key: "histologicGrade", label: "Histologic Grade", type: "number", min: 1, max: 3, step: 1 },
    { key: "lymphNodes", label: "Positive Lymph Nodes", type: "number", min: 0, max: 50, step: 1 },
    { key: "mutationCount", label: "Mutation Count", type: "number", min: 0, max: 1000, step: 1 },
    { key: "npi", label: "Nottingham Prognostic Index (NPI)", type: "number", min: 2, max: 8, step: 0.01 }
  ];

  const handleChange = (key, value) => {
    setFormData({ ...formData, [key]: value });
    if (errors[key]) setErrors({ ...errors, [key]: null });
  };

  const validateForm = () => {
    const newErrors = {};
    fields.forEach(field => {
      const value = formData[field.key];
      if (!value) newErrors[field.key] = "This field is required";
      else if (field.type === "number") {
        const numValue = parseFloat(value);
        if (numValue < field.min || numValue > field.max) {
          newErrors[field.key] = `Value must be between ${field.min} and ${field.max}`;
        }
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fetchAnalysisData = async () => {
    setAnalysisLoading(true);
    setShowResults(false);
    setPrediction(null);

    try {
      // Fetch all data in parallel
      const [patientsRes, statsRes, countsRes, topRes, predRes] = await Promise.all([
        fetch("http://localhost:5000/patients"),
        fetch("http://localhost:5000/cluster-stats"),
        fetch("http://localhost:5000/cluster-counts"),
        fetch("http://localhost:5000/top-risk?n=10"),
        fetch("http://localhost:5000/predictAgressivity", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            "Tumor Size": parseFloat(formData.tumorSize),
            "Neoplasm Histologic Grade": parseInt(formData.histologicGrade),
            "Lymph nodes examined positive": parseInt(formData.lymphNodes),
            "Mutation Count": parseInt(formData.mutationCount),
            "Nottingham prognostic index": parseFloat(formData.npi),
            "Cancer Type": formData.cancerType
          })
        })
      ]);

      setPatients(await patientsRes.json());
      setClusterStats(await statsRes.json());
      setClusterCounts(await countsRes.json());
      setTopRisk(await topRes.json());
      
      const predictionData = await predRes.json();
      if (predictionData.error) {
        alert(`Error: ${predictionData.error}`);
      } else {
        setPrediction(predictionData);
        setShowResults(true);
        // Scroll to results
        setTimeout(() => {
          document.getElementById("results-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }
    } catch (err) {
      console.error(err);
      alert("Error connecting to backend. Please check if the server is running.");
    } finally {
      setAnalysisLoading(false);
    }
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (validateForm()) {
      fetchAnalysisData();
    }
  };

  const handleNewAnalysis = () => {
    setShowResults(false);
    setPrediction(null);
    setFormData({
      tumorSize: "",
      histologicGrade: "",
      lymphNodes: "",
      mutationCount: "",
      npi: "",
      cancerType: cancerTypes[0] || ""
    });
    setErrors({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Prepare chart data
  const levelColors = { "Faible": "#4CAF50", "Moyenne": "#FF9800", "Forte": "#F44336" };
  const levelCounts = clusterStats.reduce((acc, stat) => { 
    acc[stat.level] = stat.count; 
    return acc; 
  }, {});
  const barData = [{
    x: Object.keys(levelCounts),
    y: Object.values(levelCounts),
    type: 'bar',
    marker: { color: Object.keys(levelCounts).map(l => levelColors[l]) },
    text: Object.values(levelCounts).map(v => v.toString()),
    textposition: 'auto'
  }];
  const radarCharts = clusterStats.map(stat => ({
    type: 'scatterpolar',
    r: [
      stat.avg_tumor_size/50,
      stat.avg_histologic_grade/3,
      stat.avg_lymph_nodes/10,
      stat.avg_mutation_count/100,
      stat.avg_npi/8,
      stat.avg_tumor_size/50
    ],
    theta: ['Tumor Size', 'Histologic Grade', 'Lymph Nodes +', 'Mutations', 'NPI', 'Tumor Size'],
    fill: 'toself',
    name: stat.level,
    line: { color: levelColors[stat.level] },
    fillcolor: levelColors[stat.level] + '40'
  }));

  if (formLoading) {
    return (
      <div className="agressivity-page">
        <div className="agressivity-loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="agressivity-page">
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

      <div className="agressivity-container">
        {/* Header */}
        <div className="agressivity-header">
          <h1 className="agressivity-title">🔥 Tumor Aggressivity Clustering</h1>
          <p className="agressivity-subtitle">
            Advanced clustering analysis to classify tumor aggressivity based on clinical and pathological factors
          </p>
        </div>

        {/* Form Card */}
        <div className="agressivity-form-card">
          <form onSubmit={handleSubmit} className="agressivity-form">
            <div className="agressivity-form-grid">
              {fields.map(field => (
                <div key={field.key} className="agressivity-form-group">
                  <FieldLabel label={field.label} fieldKey={field.key} />
                  
                  {field.type === "select" ? (
                    <select
                      id={field.key}
                      value={formData[field.key]}
                      onChange={e => handleChange(field.key, e.target.value)}
                      className={`agressivity-select ${errors[field.key] ? "error" : ""}`}
                    >
                      <option value="">-- Select --</option>
                      {cancerTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id={field.key}
                      type={field.type}
                      min={field.min}
                      max={field.max}
                      step={field.step}
                      value={formData[field.key]}
                      onChange={e => handleChange(field.key, e.target.value)}
                      className={`agressivity-input ${errors[field.key] ? "error" : ""}`}
                    />
                  )}

                  {errors[field.key] && (
                    <span className="agressivity-error">⚠️ {errors[field.key]}</span>
                  )}
                </div>
              ))}
            </div>

            <button
              type="submit"
              className="agressivity-submit-button"
              disabled={analysisLoading}
            >
              {analysisLoading ? (
                <>
                  <span className="agressivity-loading-spinner"></span>
                  Analyzing...
                </>
              ) : (
                "🔬 Analyze Patient"
              )}
            </button>
          </form>
        </div>

        {/* Results Section */}
        {showResults && (
          <div id="results-section" className="agressivity-results-section">
            {/* Prediction Result Card */}
            {prediction && !prediction.error && (
              <div className="agressivity-result-card">
                <div className="agressivity-result-header">
                  <h2 className="agressivity-result-title">🎯 Analysis Result</h2>
                </div>
                <div className="agressivity-result-content">
                  <div className="agressivity-result-grid">
                    <div className="agressivity-result-item">
                      <div className="agressivity-result-label">Aggressivity Level</div>
                      <div className={`agressivity-result-value agressivity-level-${prediction.aggressivity_level?.toLowerCase()}`}>
                        {prediction.aggressivity_level}
                      </div>
                    </div>
                    <div className="agressivity-result-item">
                      <div className="agressivity-result-label">Cluster</div>
                      <div className="agressivity-result-value">{prediction.cluster}</div>
                    </div>
                    <div className="agressivity-result-item">
                      <div className="agressivity-result-label">Confidence</div>
                      <div className="agressivity-result-value">
                        {(prediction.confidence * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Charts Section */}
            {clusterStats.length > 0 && (
              <>
                <div className="agressivity-chart-card">
                  <h3 className="agressivity-chart-title">Distribution of Patients by Aggressivity Level</h3>
                  <Plot
                    data={barData}
                    layout={{
                      xaxis: { title: 'Aggressivity Level' },
                      yaxis: { title: 'Number of Patients' },
                      height: 400,
                      font: { family: 'Inter, sans-serif' }
                    }}
                    style={{ width: '100%' }}
                  />
                </div>

                <div className="agressivity-chart-card">
                  <h3 className="agressivity-chart-title">Average Clinical Profiles</h3>
                  <Plot
                    data={radarCharts}
                    layout={{
                      polar: { radialaxis: { visible: true, range: [0, 1] } },
                      height: 500,
                      showlegend: true,
                      font: { family: 'Inter, sans-serif' }
                    }}
                    style={{ width: '100%' }}
                  />
                </div>
              </>
            )}

            {/* New Analysis Button */}
            <div className="agressivity-new-analysis">
              <button
                onClick={handleNewAnalysis}
                className="agressivity-new-button"
              >
                ← New Patient Analysis
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Agressivity;

