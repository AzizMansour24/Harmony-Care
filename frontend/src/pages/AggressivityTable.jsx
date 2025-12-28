import React, { useEffect, useState } from "react";

function AggressivityTable() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/patients") // ton endpoint Flask pour récupérer les clusters
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => console.error("Erreur fetching clusters:", err));
  }, []);

  if (!data.length) return <p>Chargement des clusters...</p>;

  return (
    <table border="1" cellPadding="5" style={{ borderCollapse: "collapse", width: "100%" }}>
      <thead>
        <tr>
          <th>Patient ID</th>
          <th>Cancer Type</th>
          <th>Age</th>
          <th>Tumor Size</th>
          <th>Grade</th>
          <th>Lymph nodes +</th>
          <th>Mutation Count</th>
          <th>NPI</th>
          <th>Aggressivity Level</th>
        </tr>
      </thead>
      <tbody>
        {data.map((patient, idx) => (
          <tr key={idx}>
            <td>{patient["Patient ID"]}</td>
            <td>{patient["Cancer Type Detailed"]}</td>
            <td>{patient["Age at Diagnosis"]}</td>
            <td>{patient["Tumor Size"]}</td>
            <td>{patient["Neoplasm Histologic Grade"]}</td>
            <td>{patient["Lymph nodes examined positive"]}</td>
            <td>{patient["Mutation Count"]}</td>
            <td>{patient["Nottingham prognostic index"]}</td>
            <td>{patient["Aggressivity Level"]}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default AggressivityTable;
