import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function PatientForm() {
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
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/cancer-types")
      .then(res => res.json())
      .then(data => {
        setCancerTypes(data);
        if (data.length > 0) setFormData(prev => ({ ...prev, cancerType: data[0] }));
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const fields = [
    { key: "cancerType", label: "Type de cancer", type: "select" },
    { key: "tumorSize", label: "Taille de la tumeur (mm)", type: "number", min: 0, max: 300, step: 0.1, info: "Mesure en millimètres" },
    { key: "histologicGrade", label: "Grade histologique", type: "number", min: 1, max: 3, step: 1, info: "1 = bien différencié, 3 = peu différencié" },
    { key: "lymphNodes", label: "Ganglions lymphatiques positifs", type: "number", min: 0, max: 50, step: 1, info: "Nombre de ganglions atteints" },
    { key: "mutationCount", label: "Nombre de mutations", type: "number", min: 0, max: 1000, step: 1, info: "Mutations génétiques identifiées" },
    { key: "npi", label: "Index pronostique de Nottingham (NPI)", type: "number", min: 2, max: 8, step: 0.01, info: "NPI = [0.2 × taille] + grade + statut ganglionnaire" }
  ];

  const handleChange = (key, value) => {
    setFormData({ ...formData, [key]: value });
    if (errors[key]) setErrors({ ...errors, [key]: null });
  };

  const validateForm = () => {
    const newErrors = {};
    fields.forEach(field => {
      const value = formData[field.key];
      if (!value) newErrors[field.key] = "Ce champ est requis";
      else if (field.type === "number") {
        const numValue = parseFloat(value);
        if (numValue < field.min || numValue > field.max) newErrors[field.key] = `Valeur entre ${field.min} et ${field.max}`;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (validateForm()) navigate("/result", { state: formData });
  };

  if (loading) return <div style={{ textAlign: "center", marginTop: "50px", color: "#d81b60" }}>Chargement...</div>;

  return (
    <div style={{ backgroundColor: "#fff0f6", padding: "30px", borderRadius: "15px", boxShadow: "0 6px 15px rgba(0,0,0,0.1)", maxWidth: "500px", margin: "50px auto", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ color: "#d81b60", textAlign: "center", marginBottom: "15px" }}>🎗️ Évaluation d'Agressivité du Cancer du Sein</h1>
      <p style={{ textAlign: "center", marginBottom: "25px", color: "#a61d5d" }}>Veuillez renseigner les informations cliniques du patient pour déterminer le niveau d'agressivité</p>

      <form onSubmit={handleSubmit}>
        {fields.map(field => (
          <div key={field.key} style={{ marginBottom: "20px" }}>
            <label htmlFor={field.key} style={{ display: "block", marginBottom: "5px", fontWeight: "bold", color: "#d81b60" }}>
              {field.label} {field.info && <span style={{ fontWeight: "normal", fontSize: "0.9em", color: "#a61d5d" }}>ℹ️ {field.info}</span>}
            </label>

            {field.type === "select" ? (
              <select
                id={field.key}
                value={formData[field.key]}
                onChange={e => handleChange(field.key, e.target.value)}
                style={{ padding: "10px", width: "100%", borderRadius: "8px", border: errors[field.key] ? "2px solid #F44336" : "1px solid #d81b60" }}
              >
                <option value="">-- Sélectionnez --</option>
                {cancerTypes.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            ) : (
              <input
                id={field.key}
                type={field.type}
                min={field.min}
                max={field.max}
                step={field.step}
                placeholder={field.placeholder}
                value={formData[field.key]}
                onChange={e => handleChange(field.key, e.target.value)}
                style={{ padding: "10px", width: "100%", borderRadius: "8px", border: errors[field.key] ? "2px solid #F44336" : "1px solid #d81b60" }}
              />
            )}

            {errors[field.key] && <span style={{ color: "#F44336", fontSize: "0.85em" }}>⚠️ {errors[field.key]}</span>}
          </div>
        ))}

        <button type="submit" style={{ backgroundColor: "#d81b60", color: "#fff", padding: "12px", border: "none", borderRadius: "10px", cursor: "pointer", width: "100%", fontWeight: "bold" }}>
          🔬 Analyser le Patient
        </button>
      </form>
    </div>
  );
}

export default PatientForm;
