import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  Alert,
} from "@mui/material";

export default function CancerDetectionForm() {
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
    /*
    radius_mean: -0.1667991914138409,
    texture_mean: -1.1471622983665921,
    perimeter_mean: -0.18572798829602988,
    area_mean: -0.2519565013468342,
    smoothness_mean: 0.10174657061885452,
    compactness_mean: -0.4368502521374068,
    concavity_mean: -0.27820956972486494,
    concave_points_mean: -0.028609288968873544,
    symmetry_mean: 0.2679112313629853,
    fractal_dimension_mean: -0.7283096557696281,
    radius_se: -0.48822526081160134,
    texture_se: -0.7769989918796767,
    perimeter_se: -0.40001405246133187,
    area_se: -0.36912442265463125,
    smoothness_se: 0.4736929020884884,
    compactness_se: -0.607974169651995,
    concavity_se: -0.2660425468935511,
    concave_points_se: 0.2196096510653212,
    symmetry_se: -0.08987642423881465,
    fractal_dimension_se: -0.5654493937826179,
    radius_worst: -0.24004795791671962,
    texture_worst: -1.0450049562596568,
    perimeter_worst: -0.22521705837734612,
    area_worst: -0.2977607542804924,
    smoothness_worst: 0.5098730485525658,
    compactness_worst: -0.48960521233060117,
    concavity_worst: -0.15922252948644225,
    concave_points_worst: 0.21612292473163094,
    symmetry_worst: 0.1233465312199256,
    fractal_dimension_worst: -0.6292918944004077,
    */
  };

  const [formValues, setFormValues] = useState(initialValues);
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);

  const inputFields = Object.keys(initialValues);

  const handleChange = (field, value) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: Number(value),
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setPrediction(null);

    try {
      const response = await fetch("http://127.0.0.1:5000/detect-cancer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify([formValues]), // backend expects a list
      });

      if (!response.ok) throw new Error("Server returned an error.");

      const data = await response.json();
      console.log("Backend response:", data);

      if (!data.predictions || data.predictions.length === 0)
        throw new Error("Invalid response format.");

      const result = data.predictions[0];

      setPrediction({
        probability: result.probability,
        threshold: result.threshold_used,
        cancer: result.prediction === "Malignant",
      });
    } catch (err) {
      setError("Error contacting backend. Check if Flask is running.");
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <Box
      sx={{
        p: 4,
        display: "flex",
        justifyContent: "center",
        backgroundColor: "#f5f7fa",
        minHeight: "100vh",
      }}
    >
      <Paper
        elevation={4}
        sx={{ p: 4, width: "100%", maxWidth: 900, borderRadius: 4 }}
      >
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Breast Cancer Detection (SGD Model)
        </Typography>

        <Typography variant="body1" sx={{ mb: 3 }}>
          The form is prefilled with standardized patient values. Modify them to
          test predictions.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={2}>
          {inputFields.map((field) => (
            <Grid item xs={12} sm={6} key={field}>
              <TextField
                label={field.replace(/_/g, " ")}
                variant="outlined"
                fullWidth
                type="number"
                value={formValues[field]}
                onChange={(e) => handleChange(field, e.target.value)}
              />
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 4, textAlign: "center" }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleSubmit}
            disabled={loading}
            sx={{ borderRadius: 3, px: 4 }}
          >
            {loading ? <CircularProgress size={24} /> : "Predict"}
          </Button>
        </Box>

        {prediction && (
          <Box
            sx={{
              mt: 4,
              p: 3,
              background: "#eef6ff",
              borderRadius: 3,
            }}
          >
            <Typography variant="h5" fontWeight="bold">
              Prediction Results
            </Typography>

            <Typography variant="body1" sx={{ mt: 2 }}>
              <strong>Probability:</strong>{" "}
              {(prediction.probability * 100).toFixed(2)}%
            </Typography>

            <Typography variant="body1">
              <strong>Threshold:</strong> {prediction.threshold}
            </Typography>

            <Typography
              variant="h6"
              sx={{ mt: 2, color: prediction.cancer ? "red" : "green" }}
            >
              {prediction.cancer
                ? "⚠ The model predicts: CANCER"
                : "✔ The model predicts: NO CANCER"}
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
