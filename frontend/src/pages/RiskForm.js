// frontend/src/pages/RiskForm.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import pinkIcon from "../assets/pinkicon.png";
import "./RiskForm.css";

import {
  Box,
  Card,
  CardContent,
  TextField,
  MenuItem,
  Button,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Divider,
  Container,
  Paper,
  Chip,
  LinearProgress,
  Tooltip,
  IconButton,
} from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

export default function RiskForm() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [form, setForm] = useState({
    age: 35,
    residence_location: 0,
    alcohol_intake: 0,
    smoking_status: 0,
    family_history_of_breast_cancer: 0,
    number_of_children: 1,
    age_at_menarche: 13,
    menopausal_status: 0,
    hormone_replacement_therapy_use: 0,
    oral_contraceptive_use: 0,
    genetic_mutation: "NONE",
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

  const mutations = ["NONE", "BRCA1", "BRCA2", "OTHERS"];

  const updateField = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submitForm = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await axios.post("http://localhost:5000/predictRisk", form);
      setResult(res.data.predictions[0]);
    } catch (err) {
      setError("Error connecting to backend or invalid input. Please try again.");
    }

    setLoading(false);
  };

  // Medical color scheme - soft clinical pinks and neutrals (no red/yellow)
  const colors = {
    primary: "#D81B60", // Deep ribbon pink
    secondary: "#F48FB1", // Light pink
    accent: "#AD1457", // Darker accent pink
    background: "#FFF7FB", // Very soft pink background
    surface: "#FFFFFF", // White surface
    success: "#2E7D32", // Calm medical green
    lightPink: "#FCE4EC", // Very light pink
  };

  const getRiskColor = (score) => {
    if (score < 5) return colors.success;
    if (score < 20) return colors.secondary;
    return colors.accent;
  };

  const getRiskLevel = (score) => {
    if (score < 5) return "Low Risk";
    if (score < 20) return "Moderate Risk";
    return "High Risk";
  };

  // Field help text dictionary
  const fieldHelp = {
    age: "Your current age in years. Age is a significant risk factor for breast cancer, with risk increasing after 40.",
    residence_location: "Your place of residence. Geographic and environmental factors may influence cancer risk assessment.",
    alcohol_intake: "Regular alcohol consumption. Studies show moderate to high alcohol intake increases breast cancer risk.",
    smoking_status: "Current smoking status. Smoking is a modifiable risk factor affecting overall health and cancer risk.",
    family_history_of_breast_cancer: "CRITICAL: Family history of breast cancer in first-degree relatives (mother, sister, daughter) is a major risk factor.",
    number_of_children: "Total number of children. Pregnancy and childbearing history affects hormonal and breast cancer risk.",
    age_at_menarche: "Age when your first menstrual period occurred. Earlier menarche increases lifetime estrogen exposure.",
    menopausal_status: "Whether you have gone through menopause. Menopausal status affects hormonal profile and risk.",
    hormone_replacement_therapy_use: "Current or past use of hormone replacement therapy. HRT use can increase breast cancer risk.",
    oral_contraceptive_use: "Current or past use of birth control pills. Oral contraceptives may slightly increase risk.",
    genetic_mutation: "Known genetic mutations (BRCA1/BRCA2). These mutations significantly increase hereditary cancer risk.",
  };

  // Patient-friendly explanations for contributing factors
  const getFactorExplanation = (feature) => {
    const explanations = {
      "age": "Your age plays a significant role in breast cancer risk. As you get older, especially after 40, your risk naturally increases. This is because cells have more time to accumulate genetic changes.",
      "family_history_of_breast_cancer": "Having a close family member (mother, sister, or daughter) with breast cancer can indicate a genetic predisposition. This is one of the strongest risk factors and may suggest the need for genetic counseling.",
      "genetic_mutation": "Certain genetic mutations like BRCA1 and BRCA2 significantly increase your risk. If you have these mutations, you may benefit from more frequent screening and preventive measures.",
      "hormone_replacement_therapy_use": "Hormone replacement therapy (HRT) can increase breast cancer risk, especially with long-term use. The risk typically decreases after stopping HRT.",
      "menopausal_status": "Your menopausal status affects your hormonal profile. Post-menopausal women may have different risk patterns due to changes in hormone levels.",
      "age_at_menarche": "Starting your period at an earlier age means longer lifetime exposure to estrogen, which can slightly increase breast cancer risk.",
      "number_of_children": "Pregnancy and childbirth affect your hormonal balance. Having children, especially at a younger age, can provide some protective effect.",
      "oral_contraceptive_use": "Birth control pills may slightly increase risk, but the effect is usually small and decreases after stopping use.",
      "alcohol_intake": "Regular alcohol consumption increases breast cancer risk. The more you drink, the higher the risk. Limiting alcohol can help reduce this risk.",
      "smoking_status": "Smoking affects overall health and can contribute to cancer risk. Quitting smoking is one of the best things you can do for your health.",
      "residence_location": "Where you live can influence risk through environmental factors, access to healthcare, and lifestyle patterns."
    };
    
    // Try to match the feature name (case-insensitive, partial match)
    const lowerFeature = feature.toLowerCase();
    for (const [key, explanation] of Object.entries(explanations)) {
      if (lowerFeature.includes(key) || key.includes(lowerFeature)) {
        return explanation;
      }
    }
    
    // Default explanation
    return "This factor was identified by our AI model as having an important influence on your risk assessment. Your healthcare provider can help you understand how this relates to your personal health situation and what steps you can take.";
  };

  // Helper component for field label with tooltip
  const FieldLabel = ({ label, fieldKey }) => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
      <Typography sx={{ fontWeight: 500 }}>{label}</Typography>
      <Tooltip
        title={fieldHelp[fieldKey] || ""}
        arrow
        sx={{
          "& .MuiTooltip-tooltip": {
            backgroundColor: colors.primary,
            color: "white",
            borderRadius: "8px",
            fontSize: "0.85rem",
            padding: "12px 16px",
            lineHeight: 1.6,
            maxWidth: "300px",
          },
          "& .MuiTooltip-arrow": {
            color: colors.primary,
          },
        }}
      >
        <HelpOutlineIcon
          sx={{
            fontSize: "1.2rem",
            color: colors.primary,
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
    </Box>
  );

  return (
    <Box sx={{ minHeight: "100vh", background: colors.background, paddingTop: "6rem" }}>
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

      {/* ===================== MAIN CONTENT ===================== */}
      <Container maxWidth="xl" sx={{ paddingY: { xs: 2, md: 3 }, display: "flex", flexDirection: "column", alignItems: "center" }}>
        {/* Page Title (secondary page style) */}
        <Box sx={{ marginBottom: { xs: 2.5, md: 3 }, textAlign: "center", maxWidth: "800px", width: "100%" }}>
          <Typography
            variant="h5"
            fontWeight="900"
            sx={{
              color: colors.primary,
              marginBottom: 1.5,
              fontSize: { xs: "1.4rem", md: "1.8rem" },
            }}
          >
            Breast Cancer Risk Assessment
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: "#666",
              fontWeight: 400,
              margin: "0 auto",
              lineHeight: 1.8,
              fontSize: "0.95rem",
            }}
          >
            An evidence-based predictive tool that evaluates your breast cancer risk by analyzing multiple factors including age, family history, genetic mutations, lifestyle choices, and reproductive health. Complete the form below to receive your personalized risk assessment. This tool is for informational purposes only and should be discussed with a healthcare professional.
          </Typography>
        </Box>

        {/* Form and Result Side by Side */}
        <Grid container spacing={3} sx={{ maxWidth: "1400px", width: "100%", justifyContent: "center" }}>
          {/* Left Side - Form Card */}
          <Grid item xs={12} md={result ? 6 : 12} sx={{ display: "flex", justifyContent: "center" }}>
            <Card sx={{ 
              borderRadius: 4, 
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.04)", 
              background: colors.surface, 
              height: result ? "fit-content" : "auto", 
              width: "100%",
              transition: "all 0.3s ease",
              "&:hover": {
                boxShadow: "0 15px 40px rgba(0, 0, 0, 0.12), 0 6px 16px rgba(0, 0, 0, 0.06)",
                transform: "translateY(-2px)",
              }
            }}>
          <Box
            sx={{
              background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 70%)`,
              padding: { xs: 2.5, md: 3.5 },
              position: "relative",
              overflow: "hidden",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 100%)",
                pointerEvents: "none",
              }
            }}
          >
            <Typography variant="h6" fontWeight="bold" sx={{ color: "white", position: "relative", zIndex: 1 }}>
              📋 Patient Information
            </Typography>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.95)", marginTop: 0.75, position: "relative", zIndex: 1 }}>
              Please complete all fields for accurate assessment
            </Typography>
          </Box>

          <CardContent sx={{ padding: { xs: 2, md: 3 } }}>
            {error && (
              <Alert
                severity="info"
                sx={{
                  marginBottom: 3,
                  borderRadius: 2,
                  border: `1px solid ${colors.accent}40`,
                  backgroundColor: `${colors.lightPink}`,
                  color: "#333",
                  "& .MuiAlert-icon": {
                    color: colors.primary,
                  },
                }}
              >
                {error}
              </Alert>
            )}

            {/* Form Grid */}
            <Grid container spacing={{ xs: 1.5, md: 2.5 }}>
              {/* Age */}
              <Grid item xs={12} sm={6}>
                <Box sx={{ marginBottom: 1 }}>
                  <FieldLabel label="Age (years)" fieldKey="age" />
                </Box>
                <TextField
                  fullWidth
                  type="number"
                  name="age"
                  value={form.age}
                  onChange={updateField}
                  variant="outlined"
                  inputProps={{ min: 18, max: 100 }}
                   sx={{
                     "& .MuiOutlinedInput-root": {
                       borderRadius: 2.5,
                       backgroundColor: colors.lightPink,
                       transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                       border: `2px solid ${colors.lightPink}`,
                       "&:hover": {
                         backgroundColor: "rgba(252, 228, 236, 0.8)",
                         borderColor: colors.secondary,
                         transform: "translateY(-1px)",
                         boxShadow: `0 4px 8px ${colors.secondary}20`,
                       },
                       "&.Mui-focused": {
                         backgroundColor: colors.surface,
                         borderColor: colors.primary,
                         boxShadow: `0 0 0 4px ${colors.primary}15, 0 4px 12px ${colors.primary}20`,
                         transform: "translateY(-1px)",
                       },
                     },
                     "& .MuiOutlinedInput-input": {
                       padding: "14px 16px",
                       fontSize: "1rem",
                       fontWeight: 400,
                     },
                   }}
                />
              </Grid>

              {/* Residence */}
              <Grid item xs={12} sm={6}>
                <Box sx={{ marginBottom: 1 }}>
                  <FieldLabel label="Residence Location" fieldKey="residence_location" />
                </Box>
                <TextField
                  fullWidth
                  select
                  name="residence_location"
                  value={form.residence_location}
                  onChange={updateField}
                  variant="outlined"
                   sx={{
                     "& .MuiOutlinedInput-root": {
                       borderRadius: 2.5,
                       backgroundColor: colors.lightPink,
                       transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                       border: `2px solid ${colors.lightPink}`,
                       "&:hover": {
                         backgroundColor: "rgba(252, 228, 236, 0.8)",
                         borderColor: colors.secondary,
                         transform: "translateY(-1px)",
                         boxShadow: `0 4px 8px ${colors.secondary}20`,
                       },
                       "&.Mui-focused": {
                         backgroundColor: colors.surface,
                         borderColor: colors.primary,
                         boxShadow: `0 0 0 4px ${colors.primary}15, 0 4px 12px ${colors.primary}20`,
                         transform: "translateY(-1px)",
                       },
                     },
                     "& .MuiOutlinedInput-input": {
                       padding: "14px 16px",
                       fontSize: "1rem",
                       fontWeight: 400,
                     },
                   }}
                >
                  <MenuItem value={0}>Urban Area</MenuItem>
                  <MenuItem value={1}>Rural Area</MenuItem>
                </TextField>
              </Grid>

              {/* Alcohol Intake */}
              <Grid item xs={12} sm={6}>
                <Box sx={{ marginBottom: 1 }}>
                  <FieldLabel label="Alcohol Intake" fieldKey="alcohol_intake" />
                </Box>
                <TextField
                  fullWidth
                  select
                  name="alcohol_intake"
                  value={form.alcohol_intake}
                  onChange={updateField}
                  variant="outlined"
                   sx={{
                     "& .MuiOutlinedInput-root": {
                       borderRadius: 2.5,
                       backgroundColor: colors.lightPink,
                       transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                       border: `2px solid ${colors.lightPink}`,
                       "&:hover": {
                         backgroundColor: "rgba(252, 228, 236, 0.8)",
                         borderColor: colors.secondary,
                         transform: "translateY(-1px)",
                         boxShadow: `0 4px 8px ${colors.secondary}20`,
                       },
                       "&.Mui-focused": {
                         backgroundColor: colors.surface,
                         borderColor: colors.primary,
                         boxShadow: `0 0 0 4px ${colors.primary}15, 0 4px 12px ${colors.primary}20`,
                         transform: "translateY(-1px)",
                       },
                     },
                     "& .MuiOutlinedInput-input": {
                       padding: "14px 16px",
                       fontSize: "1rem",
                       fontWeight: 400,
                     },
                   }}
                >
                  <MenuItem value={0}>No</MenuItem>
                  <MenuItem value={1}>Yes</MenuItem>
                </TextField>
              </Grid>

              {/* Smoking */}
              <Grid item xs={12} sm={6}>
                <Box sx={{ marginBottom: 1 }}>
                  <FieldLabel label="Smoking Status" fieldKey="smoking_status" />
                </Box>
                <TextField
                  fullWidth
                  select
                  name="smoking_status"
                  value={form.smoking_status}
                  onChange={updateField}
                  variant="outlined"
                   sx={{
                     "& .MuiOutlinedInput-root": {
                       borderRadius: 2.5,
                       backgroundColor: colors.lightPink,
                       transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                       border: `2px solid ${colors.lightPink}`,
                       "&:hover": {
                         backgroundColor: "rgba(252, 228, 236, 0.8)",
                         borderColor: colors.secondary,
                         transform: "translateY(-1px)",
                         boxShadow: `0 4px 8px ${colors.secondary}20`,
                       },
                       "&.Mui-focused": {
                         backgroundColor: colors.surface,
                         borderColor: colors.primary,
                         boxShadow: `0 0 0 4px ${colors.primary}15, 0 4px 12px ${colors.primary}20`,
                         transform: "translateY(-1px)",
                       },
                     },
                     "& .MuiOutlinedInput-input": {
                       padding: "14px 16px",
                       fontSize: "1rem",
                       fontWeight: 400,
                     },
                   }}
                >
                  <MenuItem value={0}>Non-smoker</MenuItem>
                  <MenuItem value={1}>Smoker</MenuItem>
                </TextField>
              </Grid>

              {/* Family History */}
              <Grid item xs={12} sm={6}>
                <Box sx={{ marginBottom: 1 }}>
                  <FieldLabel label="Family History of Breast Cancer" fieldKey="family_history_of_breast_cancer" />
                </Box>
                <TextField
                  fullWidth
                  select
                  name="family_history_of_breast_cancer"
                  value={form.family_history_of_breast_cancer}
                  onChange={updateField}
                  variant="outlined"
                   sx={{
                     "& .MuiOutlinedInput-root": {
                       borderRadius: 2.5,
                       backgroundColor: colors.lightPink,
                       transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                       border: `2px solid ${colors.lightPink}`,
                       "&:hover": {
                         backgroundColor: "rgba(252, 228, 236, 0.8)",
                         borderColor: colors.secondary,
                         transform: "translateY(-1px)",
                         boxShadow: `0 4px 8px ${colors.secondary}20`,
                       },
                       "&.Mui-focused": {
                         backgroundColor: colors.surface,
                         borderColor: colors.primary,
                         boxShadow: `0 0 0 4px ${colors.primary}15, 0 4px 12px ${colors.primary}20`,
                         transform: "translateY(-1px)",
                       },
                     },
                     "& .MuiOutlinedInput-input": {
                       padding: "14px 16px",
                       fontSize: "1rem",
                       fontWeight: 400,
                     },
                   }}
                >
                  <MenuItem value={0}>No</MenuItem>
                  <MenuItem value={1}>Yes</MenuItem>
                </TextField>
              </Grid>

              {/* Children */}
              <Grid item xs={12} sm={6}>
                <Box sx={{ marginBottom: 1 }}>
                  <FieldLabel label="Number of Children" fieldKey="number_of_children" />
                </Box>
                <TextField
                  fullWidth
                  type="number"
                  name="number_of_children"
                  value={form.number_of_children}
                  onChange={updateField}
                  variant="outlined"
                  inputProps={{ min: 0, max: 20 }}
                   sx={{
                     "& .MuiOutlinedInput-root": {
                       borderRadius: 2.5,
                       backgroundColor: colors.lightPink,
                       transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                       border: `2px solid ${colors.lightPink}`,
                       "&:hover": {
                         backgroundColor: "rgba(252, 228, 236, 0.8)",
                         borderColor: colors.secondary,
                         transform: "translateY(-1px)",
                         boxShadow: `0 4px 8px ${colors.secondary}20`,
                       },
                       "&.Mui-focused": {
                         backgroundColor: colors.surface,
                         borderColor: colors.primary,
                         boxShadow: `0 0 0 4px ${colors.primary}15, 0 4px 12px ${colors.primary}20`,
                         transform: "translateY(-1px)",
                       },
                     },
                     "& .MuiOutlinedInput-input": {
                       padding: "14px 16px",
                       fontSize: "1rem",
                       fontWeight: 400,
                     },
                   }}
                />
              </Grid>

              {/* Menarche Age */}
              <Grid item xs={12} sm={6}>
                <Box sx={{ marginBottom: 1 }}>
                  <FieldLabel label="Age at Menarche" fieldKey="age_at_menarche" />
                </Box>
                <TextField
                  fullWidth
                  type="number"
                  name="age_at_menarche"
                  value={form.age_at_menarche}
                  onChange={updateField}
                  variant="outlined"
                  inputProps={{ min: 8, max: 20 }}
                   sx={{
                     "& .MuiOutlinedInput-root": {
                       borderRadius: 2.5,
                       backgroundColor: colors.lightPink,
                       transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                       border: `2px solid ${colors.lightPink}`,
                       "&:hover": {
                         backgroundColor: "rgba(252, 228, 236, 0.8)",
                         borderColor: colors.secondary,
                         transform: "translateY(-1px)",
                         boxShadow: `0 4px 8px ${colors.secondary}20`,
                       },
                       "&.Mui-focused": {
                         backgroundColor: colors.surface,
                         borderColor: colors.primary,
                         boxShadow: `0 0 0 4px ${colors.primary}15, 0 4px 12px ${colors.primary}20`,
                         transform: "translateY(-1px)",
                       },
                     },
                     "& .MuiOutlinedInput-input": {
                       padding: "14px 16px",
                       fontSize: "1rem",
                       fontWeight: 400,
                     },
                   }}
                />
              </Grid>

              {/* Menopause */}
              <Grid item xs={12} sm={6}>
                <Box sx={{ marginBottom: 1 }}>
                  <FieldLabel label="Menopausal Status" fieldKey="menopausal_status" />
                </Box>
                <TextField
                  fullWidth
                  select
                  name="menopausal_status"
                  value={form.menopausal_status}
                  onChange={updateField}
                  variant="outlined"
                   sx={{
                     "& .MuiOutlinedInput-root": {
                       borderRadius: 2.5,
                       backgroundColor: colors.lightPink,
                       transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                       border: `2px solid ${colors.lightPink}`,
                       "&:hover": {
                         backgroundColor: "rgba(252, 228, 236, 0.8)",
                         borderColor: colors.secondary,
                         transform: "translateY(-1px)",
                         boxShadow: `0 4px 8px ${colors.secondary}20`,
                       },
                       "&.Mui-focused": {
                         backgroundColor: colors.surface,
                         borderColor: colors.primary,
                         boxShadow: `0 0 0 4px ${colors.primary}15, 0 4px 12px ${colors.primary}20`,
                         transform: "translateY(-1px)",
                       },
                     },
                     "& .MuiOutlinedInput-input": {
                       padding: "14px 16px",
                       fontSize: "1rem",
                       fontWeight: 400,
                     },
                   }}
                >
                  <MenuItem value={0}>Pre-menopausal</MenuItem>
                  <MenuItem value={1}>Post-menopausal</MenuItem>
                </TextField>
              </Grid>

              {/* HRT Use */}
              <Grid item xs={12} sm={6}>
                <Box sx={{ marginBottom: 1 }}>
                  <FieldLabel label="Hormone Replacement Therapy" fieldKey="hormone_replacement_therapy_use" />
                </Box>
                <TextField
                  fullWidth
                  select
                  name="hormone_replacement_therapy_use"
                  value={form.hormone_replacement_therapy_use}
                  onChange={updateField}
                  variant="outlined"
                   sx={{
                     "& .MuiOutlinedInput-root": {
                       borderRadius: 2.5,
                       backgroundColor: colors.lightPink,
                       transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                       border: `2px solid ${colors.lightPink}`,
                       "&:hover": {
                         backgroundColor: "rgba(252, 228, 236, 0.8)",
                         borderColor: colors.secondary,
                         transform: "translateY(-1px)",
                         boxShadow: `0 4px 8px ${colors.secondary}20`,
                       },
                       "&.Mui-focused": {
                         backgroundColor: colors.surface,
                         borderColor: colors.primary,
                         boxShadow: `0 0 0 4px ${colors.primary}15, 0 4px 12px ${colors.primary}20`,
                         transform: "translateY(-1px)",
                       },
                     },
                     "& .MuiOutlinedInput-input": {
                       padding: "14px 16px",
                       fontSize: "1rem",
                       fontWeight: 400,
                     },
                   }}
                >
                  <MenuItem value={0}>No</MenuItem>
                  <MenuItem value={1}>Yes</MenuItem>
                </TextField>
              </Grid>

              {/* Oral Contraceptive Use */}
              <Grid item xs={12} sm={6}>
                <Box sx={{ marginBottom: 1 }}>
                  <FieldLabel label="Oral Contraceptive Use" fieldKey="oral_contraceptive_use" />
                </Box>
                <TextField
                  fullWidth
                  select
                  name="oral_contraceptive_use"
                  value={form.oral_contraceptive_use}
                  onChange={updateField}
                  variant="outlined"
                   sx={{
                     "& .MuiOutlinedInput-root": {
                       borderRadius: 2.5,
                       backgroundColor: colors.lightPink,
                       transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                       border: `2px solid ${colors.lightPink}`,
                       "&:hover": {
                         backgroundColor: "rgba(252, 228, 236, 0.8)",
                         borderColor: colors.secondary,
                         transform: "translateY(-1px)",
                         boxShadow: `0 4px 8px ${colors.secondary}20`,
                       },
                       "&.Mui-focused": {
                         backgroundColor: colors.surface,
                         borderColor: colors.primary,
                         boxShadow: `0 0 0 4px ${colors.primary}15, 0 4px 12px ${colors.primary}20`,
                         transform: "translateY(-1px)",
                       },
                     },
                     "& .MuiOutlinedInput-input": {
                       padding: "14px 16px",
                       fontSize: "1rem",
                       fontWeight: 400,
                     },
                   }}
                >
                  <MenuItem value={0}>No</MenuItem>
                  <MenuItem value={1}>Yes</MenuItem>
                </TextField>
              </Grid>

              {/* Genetic Mutation */}
              <Grid item xs={12}>
                <Box sx={{ marginBottom: 1 }}>
                  <FieldLabel label="Known Genetic Mutation" fieldKey="genetic_mutation" />
                </Box>
                <TextField
                  fullWidth
                  select
                  name="genetic_mutation"
                  value={form.genetic_mutation}
                  onChange={updateField}
                  variant="outlined"
                   sx={{
                     "& .MuiOutlinedInput-root": {
                       borderRadius: 2.5,
                       backgroundColor: colors.lightPink,
                       transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                       border: `2px solid ${colors.lightPink}`,
                       "&:hover": {
                         backgroundColor: "rgba(252, 228, 236, 0.8)",
                         borderColor: colors.secondary,
                         transform: "translateY(-1px)",
                         boxShadow: `0 4px 8px ${colors.secondary}20`,
                       },
                       "&.Mui-focused": {
                         backgroundColor: colors.surface,
                         borderColor: colors.primary,
                         boxShadow: `0 0 0 4px ${colors.primary}15, 0 4px 12px ${colors.primary}20`,
                         transform: "translateY(-1px)",
                       },
                     },
                     "& .MuiOutlinedInput-input": {
                       padding: "14px 16px",
                       fontSize: "1rem",
                       fontWeight: 400,
                     },
                   }}
                >
                  {mutations.map((m) => (
                    <MenuItem key={m} value={m}>
                      {m}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>

            {/* Submit Button */}
            <Box textAlign="center" mt={3}>
              <Button
                variant="contained"
                size="medium"
                onClick={submitForm}
                disabled={loading}
                 sx={{
                   paddingX: 5,
                   paddingY: 1.4,
                   fontSize: "1rem",
                   fontWeight: "700",
                   borderRadius: 4,
                   background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                   boxShadow: `0 8px 24px ${colors.primary}40, 0 4px 12px ${colors.primary}20`,
                   transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                   textTransform: "none",
                   letterSpacing: "0.02em",
                   "&:hover": {
                     boxShadow: `0 12px 36px ${colors.primary}50, 0 6px 16px ${colors.primary}30`,
                     transform: "translateY(-3px)",
                     background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                   },
                   "&:active": {
                     transform: "translateY(-1px)",
                   },
                 }}
              >
                {loading ? (
                  <>
                    <CircularProgress size={24} sx={{ marginRight: 1, color: "white" }} />
                    Analyzing...
                  </>
                ) : (
                  "Calculate Risk Assessment"
                )}
              </Button>
            </Box>
          </CardContent>
        </Card>
          </Grid>

          {/* Right Side - Result Section */}
          {result && (
            <Grid item xs={12} md={6} sx={{ display: "flex", justifyContent: "center" }}>
              <Card
                sx={{
                  borderRadius: 4,
                  boxShadow: `0 15px 40px ${getRiskColor(result.risk_score_percent)}40, 0 6px 16px ${getRiskColor(result.risk_score_percent)}20`,
                  background: colors.surface,
                  overflow: "hidden",
                  height: "fit-content",
                  position: "sticky",
                  top: "6rem",
                  width: "100%",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    boxShadow: `0 20px 50px ${getRiskColor(result.risk_score_percent)}50, 0 8px 20px ${getRiskColor(result.risk_score_percent)}30`,
                    transform: "translateY(-2px)",
                  }
                }}
              >
               <Box
                 sx={{
                   background: `linear-gradient(135deg, ${getRiskColor(result.risk_score_percent)} 0%, ${getRiskColor(
                     result.risk_score_percent
                   )}dd 100%)`,
                   padding: { xs: 2.5, md: 3.5 },
                   position: "relative",
                   overflow: "hidden",
                   "&::before": {
                     content: '""',
                     position: "absolute",
                     top: 0,
                     left: 0,
                     right: 0,
                     bottom: 0,
                     background: "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 100%)",
                     pointerEvents: "none",
                   }
                 }}
               >
                 <Typography variant="h6" fontWeight="bold" sx={{ color: "white", position: "relative", zIndex: 1 }}>
                   📊 Risk Assessment Summary
                 </Typography>
               </Box>

              <CardContent sx={{ padding: { xs: 2, md: 3 } }}>
                {/* Risk Score Display */}
                <Grid container spacing={{ xs: 3, md: 4 }} sx={{ marginBottom: 3, justifyContent: "center" }}>
                  <Grid item xs={12}>
                    <Box sx={{ textAlign: "center" }}>
                      <Typography variant="subtitle1" sx={{ color: "#666", marginBottom: 1 }}>
                        Hereditary Risk Score (estimate)
                      </Typography>
                      <Typography
                        variant="h3"
                        fontWeight="900"
                        sx={{
                          color: getRiskColor(result.risk_score_percent),
                          marginBottom: 1,
                        }}
                      >
                        {Number(result.risk_score_percent*0.7).toFixed(2)}%   
                      </Typography>
                      <Chip
                        label={getRiskLevel(result.risk_score_percent)}
                        sx={{
                          backgroundColor: getRiskColor(result.risk_score_percent),
                          color: "white",
                          fontWeight: "bold",
                          fontSize: "0.9rem",
                          paddingX: 1.5,
                          paddingY: 1,
                        }}
                      />
                      <Typography
                        variant="caption"
                        sx={{ display: "block", marginTop: 1.5, color: "#555", lineHeight: 1.6 }}
                      >
                        The percentage above represents the model&apos;s estimated likelihood of hereditary breast
                        cancer risk based on the information you provided.
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                {/* Top Contributing Factors */}
                <Box>
                  <Typography variant="h6" fontWeight="bold" sx={{ color: colors.primary, marginBottom: 2 }}>
                    Key Contributing Factors
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "#555", marginBottom: 2, lineHeight: 1.7 }}
                  >
                    The following factors were most influential in calculating your risk assessment, listed in order of impact. Understanding these factors can help you and your healthcare provider make informed decisions about your health.
                  </Typography>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                    {result.top_features.map((feature, idx) => (
                       <Paper
                         key={idx}
                         elevation={0}
                         sx={{
                           padding: 2.5,
                           background: "linear-gradient(to bottom, #f8fbff, #ffffff)",
                           border: `2px solid ${colors.secondary}30`,
                           borderRadius: 3,
                           display: "flex",
                           alignItems: "flex-start",
                           gap: 2,
                           transition: "all 0.3s ease",
                           "&:hover": {
                             borderColor: `${colors.secondary}60`,
                             boxShadow: `0 4px 12px ${colors.secondary}20`,
                             transform: "translateY(-2px)",
                           },
                         }}
                       >
                         <Box
                           sx={{
                             width: 36,
                             height: 36,
                             borderRadius: "50%",
                             background: `linear-gradient(135deg, ${colors.secondary} 0%, ${colors.primary} 100%)`,
                             color: "white",
                             display: "flex",
                             alignItems: "center",
                             justifyContent: "center",
                             fontWeight: "700",
                             fontSize: "1rem",
                             flexShrink: 0,
                             boxShadow: `0 4px 8px ${colors.secondary}30`,
                           }}
                         >
                           {idx + 1}
                         </Box>
                        <Box>
                          <Typography variant="body2" sx={{ color: "#333", fontWeight: 500, marginBottom: 0.5 }}>
                            {feature}
                          </Typography>
                          <Typography variant="body2" sx={{ color: "#666", lineHeight: 1.7, fontSize: "0.875rem" }}>
                            {getFactorExplanation(feature)}
                          </Typography>
                        </Box>
                      </Paper>
                    ))}
                  </Box>
                </Box>
              </CardContent>
            </Card>
            </Grid>
          )}

        </Grid>

      </Container>
    </Box>
  );
}
