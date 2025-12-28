import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import { useLocation, useNavigate } from "react-router-dom";

function ClustersDashboard() {
  const [patients, setPatients] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [clusterStats, setClusterStats] = useState([]);
  const [clusterCounts, setClusterCounts] = useState([]);
  const [topRisk, setTopRisk] = useState([]);
  const [loading, setLoading] = useState(true);

  const location = useLocation();
  const navigate = useNavigate();
  const patientData = location.state;

  useEffect(() => {
    if (!patientData) { navigate("/"); return; }

    const fetchData = async () => {
      try {
        const patientsRes = await fetch("http://localhost:5000/patients");
        setPatients(await patientsRes.json());
        const statsRes = await fetch("http://localhost:5000/cluster-stats");
        setClusterStats(await statsRes.json());
        const countsRes = await fetch("http://localhost:5000/cluster-counts");
        setClusterCounts(await countsRes.json());
        const topRes = await fetch("http://localhost:5000/top-risk?n=10");
        setTopRisk(await topRes.json());
        const predRes = await fetch("http://localhost:5000/predictAgressivity", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            "Tumor Size": parseFloat(patientData.tumorSize),
            "Neoplasm Histologic Grade": parseInt(patientData.histologicGrade),
            "Lymph nodes examined positive": parseInt(patientData.lymphNodes),
            "Mutation Count": parseInt(patientData.mutationCount),
            "Nottingham prognostic index": parseFloat(patientData.npi),
            "Cancer Type": patientData.cancerType
          })
        });
        setPrediction(await predRes.json());
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchData();
  }, [patientData, navigate]);

  if (loading) return <div style={{ textAlign: "center", marginTop: "50px", color: "#d81b60" }}>🔬 Analyse en cours...</div>;
  if (prediction?.error) return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <p style={{ color: "#F44336" }}>⚠️ {prediction.error}</p>
      <button onClick={() => navigate("/")} style={{ padding: "10px 15px", borderRadius: "8px", backgroundColor: "#d81b60", color: "#fff", border: "none", cursor: "pointer" }}>Retour au formulaire</button>
    </div>
  );

  const levelColors = { "Faible": "#4CAF50", "Moyenne": "#FF9800", "Forte": "#F44336" };
  const levelCounts = clusterStats.reduce((acc, stat) => { acc[stat.level] = stat.count; return acc; }, {});
  const barData = [{ x: Object.keys(levelCounts), y: Object.values(levelCounts), type: 'bar', marker: { color: Object.keys(levelCounts).map(l => levelColors[l]) }, text: Object.values(levelCounts).map(v => v.toString()), textposition: 'auto' }];
  const radarCharts = clusterStats.map(stat => ({
    type: 'scatterpolar',
    r: [stat.avg_tumor_size/50, stat.avg_histologic_grade/3, stat.avg_lymph_nodes/10, stat.avg_mutation_count/100, stat.avg_npi/8, stat.avg_tumor_size/50],
    theta: ['Taille tumeur','Grade histologique','Ganglions +','Mutations','NPI','Taille tumeur'],
    fill: 'toself',
    name: stat.level,
    line: { color: levelColors[stat.level] },
    fillcolor: levelColors[stat.level] + '40'
  }));

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
        <h1 style={{ color: "#d81b60" }}>📊 Analyse de Clustering - Cancer du Sein</h1>
        <button onClick={() => navigate("/")} style={{ backgroundColor: "#d81b60", color: "#fff", padding: "10px 15px", border: "none", borderRadius: "8px", cursor: "pointer" }}>← Nouveau Patient</button>
      </div>

      {prediction && (
        <div style={{ backgroundColor: "#fff0f6", padding: "20px", borderRadius: "12px", boxShadow: "0 6px 15px rgba(0,0,0,0.1)", marginBottom: "30px" }}>
          <h2>🎯 Résultat de l'Analyse</h2>
          <p><strong>Niveau :</strong> {prediction.aggressivity_level}</p>
          <p><strong>Cluster :</strong> {prediction.cluster}</p>
          <p><strong>Confiance :</strong> {(prediction.confidence*100).toFixed(1)}%</p>
        </div>
      )}

      <div style={{ marginBottom: "40px", padding: "15px", backgroundColor: "#fff", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
        <h3>Distribution des Patients par Niveau d'Agressivité</h3>
        <Plot data={barData} layout={{ xaxis: { title: 'Niveau' }, yaxis: { title: 'Nombre' }, height: 400 }} style={{ width: '100%' }} />
      </div>

      <div style={{ marginBottom: "40px", padding: "15px", backgroundColor: "#fff", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
        <h3>Profils Cliniques Moyens</h3>
        <Plot data={radarCharts} layout={{ polar: { radialaxis: { visible: true, range: [0,1] } }, height: 500, showlegend: true }} style={{ width: '100%' }} />
      </div>
    </div>
  );
}

export default ClustersDashboard;
