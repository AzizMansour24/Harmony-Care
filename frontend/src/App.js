// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Pages existantes
import CancerDetectionForm from "./pages/CancerDetectionForm";
import RiskForm from "./pages/RiskForm";
import Recurrence from "./pages/Recurrence";

// Tumor Aggressivity Clustering
import Agressivity from "./pages/Agressivity";

// Détection par image
import CancerDetectionImage from "./pages/CancerDetectionImage";

// Unified Cancer Detection
import CancerDetection from "./pages/CancerDetection";

// Menopause Risk Page
import MenopauseRisk from "./pages/MenopauseRisk";

// ✅ Nouveau : HADS Form
import HadsForm from "./pages/Hads";

import HomePage from "./pages/HomePage";
import Contact from "./pages/Contact";  

function App() {
  return (
    <Router>
      <div style={{ fontFamily: "Arial, sans-serif", backgroundColor: "#fafafa", minHeight: "100vh" }}>

        {/* ------------------ ROUTING ------------------ */}
        <Routes>
          {/* Home Page */}
          <Route path="/" element={<HomePage />} />

          {/* Modules existants */}
          <Route path="/risk" element={<RiskForm />} />
          <Route path="/detect" element={<CancerDetectionForm />} />

          {/* Unified Cancer Detection */}
          <Route path="/cancer-detection" element={<CancerDetection />} />

          {/* Recurrence */}
          <Route path="/recurrence" element={<Recurrence />} />

          {/* Menopause Risk */}
          <Route path="/menopause" element={<MenopauseRisk />} />

          {/* Aggressivity */}
          <Route path="/aggressivity" element={<Agressivity />} />

          {/* Détection image */}
          <Route path="/detect-image" element={<CancerDetectionImage />} />

          {/* ✅ Nouveau endpoint HADS */}
          <Route path="/hads" element={<HadsForm />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/contact" element={<Contact />} />

        </Routes>

      </div>
    </Router>
  );
}

/* ------------------ Styles PRO ------------------ */
const btnStyle = {
  display: "inline-block",
  padding: "12px 18px",
  backgroundColor: "#d81b60",
  color: "#fff",
  borderRadius: "10px",
  textDecoration: "none",
  fontWeight: "bold",
  transition: "0.2s",
};

export default App;
