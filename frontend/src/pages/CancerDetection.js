import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import pinkIcon from "../assets/pinkicon.png";
import {
  Box,
  TextField,
  Button,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Tabs,
  Tab,
} from "@mui/material";
import "./CancerDetection.css";

async function sendImageForPrediction(file) {
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch("http://localhost:5000/predict", {
    method: "POST",
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Server error");
  return data;
}

export default function CancerDetection() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  // Form-based detection state
  const initialValues = {
    radius_mean: 1.0970639814699839,
    texture_mean: -2.073335014697587,
    perimeter_mean: 1.2699336881399386,
    area_mean: 0.9843749048031144,
    smoothness_mean: 1.5684663292434209,
    compactness_mean: 3.2835146709868286,
    concavity_mean: 2.652873983743169,
    concave_points_mean: 2.5324752164032427,
    symmetry_mean: 2.2175150059646422,
    fractal_dimension_mean: 2.255746885296271,
    radius_se: 2.489733926737622,
    texture_se: -0.565265059068463,
    perimeter_se: 2.833030865855181,
    area_se: 2.4875775569611034,
    smoothness_se: -0.21400164666895338,
    compactness_se: 1.3168615683959486,
    concavity_se: 0.7240261580803589,
    concave_points_se: 0.6608199414286064,
    symmetry_se: 1.1487566671861764,
    fractal_dimension_se: 0.907083080997336,
    radius_worst: 1.8866896251792775,
    texture_worst: -1.3592934737640852,
    perimeter_worst: 2.303600623622561,
    area_worst: 2.0012374893299203,
    smoothness_worst: 1.3076862710715433,
    compactness_worst: 2.616665023512604,
    concavity_worst: 2.1095263465722556,
    concave_points_worst: 2.29607612756179,
    symmetry_worst: 2.750622244124958,
    fractal_dimension_worst: 1.937014612378176,
  };

  const [formValues, setFormValues] = useState(initialValues);
  const [formLoading, setFormLoading] = useState(false);
  const [formPrediction, setFormPrediction] = useState(null);
  const [formError, setFormError] = useState(null);

  // Image-based detection state
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageResult, setImageResult] = useState(null);
  const [imageError, setImageError] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const colors = {
    primary: "#DB2777",
    secondary: "#F48FB1",
    accent: "#AD1457",
    background: "#FFF7FB",
    surface: "#FFFFFF",
    success: "#2E7D32",
    lightPink: "#FCE4EC",
  };

  const inputFields = Object.keys(initialValues);

  const handleFormChange = (field, value) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: Number(value),
    }));
  };

  const handleFormSubmit = async () => {
    setFormLoading(true);
    setFormError(null);
    setFormPrediction(null);

    try {
      const response = await fetch("http://127.0.0.1:5000/detect-cancer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify([formValues]),
      });

      if (!response.ok) throw new Error("Server returned an error.");

      const data = await response.json();

      if (!data.predictions || data.predictions.length === 0)
        throw new Error("Invalid response format.");

      const result = data.predictions[0];

      setFormPrediction({
        probability: result.probability,
        threshold: result.threshold_used,
        cancer: result.prediction === "Malignant",
      });
    } catch (err) {
      setFormError("Error contacting backend. Check if Flask is running.");
      console.error(err);
    }

    setFormLoading(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0] || null;
    setSelectedFile(file);
    setImageError("");
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  const handleImageAnalyze = async (e) => {
    e.preventDefault();
    setImageError("");

    if (!selectedFile) {
      alert("Please select a breast MRI image.");
      return;
    }

    try {
      setImageLoading(true);
      const data = await sendImageForPrediction(selectedFile);

      if (data.label === "non_mri_breast") {
        setImageResult({
          type: "non_mri",
          recommendation: data.recommendation,
          warning: data.warning,
        });
      } else {
        const isMalignant = data.label === "malignant";
        setImageResult({
          type: "classification",
          isMalignant,
          label: isMalignant ? "Malignant (Suspicious)" : "Benign",
          recommendation: data.recommendation,
          warning: data.warning,
        });
      }
    } catch (err) {
      setImageError(err.message);
    } finally {
      setImageLoading(false);
    }
  };

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

      {/* Main Content */}
      <Box sx={{ maxWidth: "1400px", margin: "0 auto", padding: { xs: 2, md: 3 } }}>
        {/* Page Header */}
        <Box sx={{ marginBottom: 4, textAlign: "center" }}>
          <Typography
            variant="h4"
            fontWeight="900"
            sx={{
              color: colors.primary,
              marginBottom: 1.5,
              fontSize: { xs: "1.8rem", md: "2.5rem" },
            }}
          >
            🧬 Tumor Classification
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: "#666",
              fontWeight: 400,
              maxWidth: "800px",
              margin: "0 auto",
              lineHeight: 1.8,
              fontSize: "1rem",
            }}
          >
            Advanced AI-powered tools for breast cancer classification. Choose between clinical data analysis or medical image analysis to support your diagnostic decisions.
          </Typography>
        </Box>

        {/* Tab Selection */}
        <Card sx={{ borderRadius: 4, boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)", background: colors.surface, marginBottom: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{
              borderBottom: `2px solid ${colors.lightPink}`,
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 600,
                fontSize: "1rem",
                color: colors.primary,
                "&.Mui-selected": {
                  color: colors.primary,
                },
              },
              "& .MuiTabs-indicator": {
                backgroundColor: colors.primary,
                height: 3,
              },
            }}
          >
            <Tab label="📊 Clinical Data Analysis" />
            <Tab label="🖼️ Medical Image Analysis" />
          </Tabs>
        </Card>

        {/* Form-Based Detection Tab */}
        {activeTab === 0 && (
          <Card sx={{ borderRadius: 4, boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)", background: colors.surface }}>
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
                📊 Clinical Data Analysis
              </Typography>
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.95)", marginTop: 0.75, position: "relative", zIndex: 1 }}>
                Enter standardized patient values for tumor classification using clinical measurements
              </Typography>
            </Box>

            <CardContent sx={{ padding: { xs: 2, md: 3 } }}>
              {formError && (
                <Alert
                  severity="error"
                  sx={{
                    marginBottom: 3,
                    borderRadius: 2,
                    border: `1px solid ${colors.accent}40`,
                    backgroundColor: `${colors.lightPink}`,
                  }}
                >
                  {formError}
                </Alert>
              )}

              <Grid container spacing={2}>
                {inputFields.map((field) => (
                  <Grid item xs={12} sm={6} md={4} key={field}>
                    <TextField
                      label={field.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                      variant="outlined"
                      fullWidth
                      type="number"
                      value={formValues[field]}
                      onChange={(e) => handleFormChange(field, e.target.value)}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2.5,
                          backgroundColor: colors.lightPink,
                          transition: "all 0.3s ease",
                          "&:hover": {
                            backgroundColor: "rgba(252, 228, 236, 0.8)",
                            borderColor: colors.secondary,
                          },
                          "&.Mui-focused": {
                            backgroundColor: colors.surface,
                            borderColor: colors.primary,
                            boxShadow: `0 0 0 4px ${colors.primary}15`,
                          },
                        },
                      }}
                    />
                  </Grid>
                ))}
              </Grid>

              <Box sx={{ mt: 4, textAlign: "center" }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleFormSubmit}
                  disabled={formLoading}
                  sx={{
                    paddingX: 5,
                    paddingY: 1.4,
                    fontSize: "1rem",
                    fontWeight: "700",
                    borderRadius: 4,
                    background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                    boxShadow: `0 8px 24px ${colors.primary}40`,
                    transition: "all 0.3s ease",
                    textTransform: "none",
                    "&:hover": {
                      boxShadow: `0 12px 36px ${colors.primary}50`,
                      transform: "translateY(-3px)",
                    },
                  }}
                >
                  {formLoading ? (
                    <>
                      <CircularProgress size={24} sx={{ marginRight: 1, color: "white" }} />
                      Analyzing...
                    </>
                  ) : (
                    "Analyze Clinical Data"
                  )}
                </Button>
              </Box>

              {formPrediction && (
                <Card
                  sx={{
                    mt: 4,
                    borderRadius: 3,
                    background: formPrediction.cancer
                      ? "linear-gradient(to bottom, #FFEBEE, #FFFFFF)"
                      : "linear-gradient(to bottom, #E8F5E9, #FFFFFF)",
                    border: `2px solid ${formPrediction.cancer ? "#C62828" : colors.success}`,
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      background: `linear-gradient(135deg, ${formPrediction.cancer ? "#C62828" : colors.success} 0%, ${formPrediction.cancer ? "#C62828" : colors.success}dd 100%)`,
                      padding: 2,
                    }}
                  >
                    <Typography variant="h6" fontWeight="bold" sx={{ color: "white" }}>
                      📊 Analysis Results
                    </Typography>
                  </Box>
                  <CardContent sx={{ padding: 3 }}>
                    <Box sx={{ textAlign: "center", marginBottom: 2 }}>
                      <Typography
                        variant="h3"
                        fontWeight="900"
                        sx={{
                          color: formPrediction.cancer ? "#C62828" : colors.success,
                          marginBottom: 1,
                        }}
                      >
                        {formPrediction.cancer ? "⚠️ MALIGNANT" : "✅ BENIGN"}
                      </Typography>
                      <Typography variant="h6" sx={{ color: "#666", marginBottom: 2 }}>
                        Probability: {(formPrediction.probability * 100).toFixed(2)}%
                      </Typography>
                    </Box>
                    <Alert
                      severity={formPrediction.cancer ? "error" : "success"}
                      sx={{
                        borderRadius: 2,
                        marginTop: 2,
                      }}
                    >
                      {formPrediction.cancer
                        ? "The model predicts malignant tumor. Please consult with oncology specialists for further evaluation and treatment planning."
                        : "The model predicts benign tumor. Continue with standard monitoring protocols."}
                    </Alert>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        )}

        {/* Image-Based Detection Tab */}
        {activeTab === 1 && (
          <Card sx={{ borderRadius: 4, boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)", background: colors.surface }}>
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
                🖼️ Medical Image Analysis
              </Typography>
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.95)", marginTop: 0.75, position: "relative", zIndex: 1 }}>
                Upload a breast MRI image for AI-powered classification and diagnostic insights
              </Typography>
            </Box>

            <CardContent sx={{ padding: { xs: 2, md: 3 } }}>
              <form onSubmit={handleImageAnalyze}>
                <Box sx={{ marginBottom: 3 }}>
                  <label htmlFor="imgInput" style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500, color: "#333" }}>
                    Select Breast MRI Image:
                  </label>
                  <input
                    type="file"
                    id="imgInput"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "2px solid #E5E7EB",
                      borderRadius: "0.75rem",
                      fontSize: "1rem",
                      backgroundColor: colors.lightPink,
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                    }}
                  />
                </Box>

                {previewUrl && (
                  <Box
                    sx={{
                      marginBottom: 3,
                      padding: 2,
                      background: colors.lightPink,
                      borderRadius: 2,
                      textAlign: "center",
                    }}
                  >
                    <Typography variant="body2" sx={{ marginBottom: 1, fontWeight: 500, color: "#666" }}>
                      Image Preview:
                    </Typography>
                    <img
                      src={previewUrl}
                      alt="MRI preview"
                      style={{
                        maxWidth: "100%",
                        maxHeight: "400px",
                        borderRadius: "0.75rem",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                  </Box>
                )}

                {imageError && (
                  <Alert severity="error" sx={{ marginBottom: 3, borderRadius: 2 }}>
                    {imageError}
                  </Alert>
                )}

                <Box sx={{ textAlign: "center", marginTop: 3 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={imageLoading || !selectedFile}
                    sx={{
                      paddingX: 5,
                      paddingY: 1.4,
                      fontSize: "1rem",
                      fontWeight: "700",
                      borderRadius: 4,
                      background: selectedFile
                        ? `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`
                        : "#ccc",
                      boxShadow: selectedFile ? `0 8px 24px ${colors.primary}40` : "none",
                      transition: "all 0.3s ease",
                      textTransform: "none",
                      "&:hover": selectedFile
                        ? {
                            boxShadow: `0 12px 36px ${colors.primary}50`,
                            transform: "translateY(-3px)",
                          }
                        : {},
                    }}
                  >
                    {imageLoading ? (
                      <>
                        <CircularProgress size={24} sx={{ marginRight: 1, color: "white" }} />
                        Analyzing Image...
                      </>
                    ) : (
                      "Analyze Image"
                    )}
                  </Button>
                </Box>
              </form>

              {imageResult && (
                <Card
                  sx={{
                    mt: 4,
                    borderRadius: 3,
                    background: imageResult.type === "classification" && imageResult.isMalignant
                      ? "linear-gradient(to bottom, #FFEBEE, #FFFFFF)"
                      : imageResult.type === "classification"
                      ? "linear-gradient(to bottom, #E8F5E9, #FFFFFF)"
                      : "linear-gradient(to bottom, #FFF3E0, #FFFFFF)",
                    border: `2px solid ${
                      imageResult.type === "classification" && imageResult.isMalignant
                        ? "#C62828"
                        : imageResult.type === "classification"
                        ? colors.success
                        : "#F57C00"
                    }`,
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      background: `linear-gradient(135deg, ${
                        imageResult.type === "classification" && imageResult.isMalignant
                          ? "#C62828"
                          : imageResult.type === "classification"
                          ? colors.success
                          : "#F57C00"
                      } 0%, ${
                        imageResult.type === "classification" && imageResult.isMalignant
                          ? "#C62828"
                          : imageResult.type === "classification"
                          ? colors.success
                          : "#F57C00"
                      }dd 100%)`,
                      padding: 2,
                    }}
                  >
                    <Typography variant="h6" fontWeight="bold" sx={{ color: "white" }}>
                      🖼️ Image Analysis Results
                    </Typography>
                  </Box>
                  <CardContent sx={{ padding: 3 }}>
                    {imageResult.type === "non_mri" ? (
                      <>
                        <Alert severity="warning" sx={{ marginBottom: 2, borderRadius: 2 }}>
                          <Typography variant="body1" fontWeight="600" sx={{ marginBottom: 1 }}>
                            Image Classification: Not Recognized as Breast MRI
                          </Typography>
                          <Typography variant="body2">
                            This image was not recognized as a breast MRI by the model. Please verify the image type and try again.
                          </Typography>
                        </Alert>
                        <Box sx={{ marginTop: 2 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, marginBottom: 1, color: "#333" }}>
                            Information for Healthcare Provider:
                          </Typography>
                          <Typography variant="body2" sx={{ color: "#666", marginBottom: 2, lineHeight: 1.7 }}>
                            {imageResult.recommendation}
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, marginBottom: 1, color: "#333" }}>
                            Warning:
                          </Typography>
                          <Typography variant="body2" sx={{ color: "#666", lineHeight: 1.7 }}>
                            {imageResult.warning}
                          </Typography>
                        </Box>
                      </>
                    ) : (
                      <>
                        <Box sx={{ textAlign: "center", marginBottom: 3 }}>
                          <Typography
                            variant="h3"
                            fontWeight="900"
                            sx={{
                              color: imageResult.isMalignant ? "#C62828" : colors.success,
                              marginBottom: 1,
                            }}
                          >
                            {imageResult.isMalignant ? "⚠️ MALIGNANT" : "✅ BENIGN"}
                          </Typography>
                          <Typography variant="h6" sx={{ color: "#666" }}>
                            Classification: {imageResult.label}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            marginTop: 3,
                            padding: 3,
                            background: imageResult.isMalignant
                              ? "linear-gradient(135deg, #FFEBEE 0%, #FFFFFF 100%)"
                              : "linear-gradient(135deg, #E8F5E9 0%, #FFFFFF 100%)",
                            borderRadius: 3,
                            border: `2px solid ${imageResult.isMalignant ? "#C62828" : colors.success}40`,
                          }}
                        >
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 700,
                              marginBottom: 2,
                              color: imageResult.isMalignant ? "#C62828" : colors.success,
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            💡 Clinical Recommendation
                          </Typography>
                          <Typography
                            variant="body1"
                            sx={{
                              color: "#333",
                              lineHeight: 1.8,
                              fontSize: "1.05rem",
                              fontWeight: 500,
                            }}
                          >
                            {imageResult.recommendation}
                          </Typography>
                        </Box>
                      </>
                    )}
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  );
}

