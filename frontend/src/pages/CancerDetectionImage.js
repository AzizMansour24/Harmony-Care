// src/pages/CancerDetectionImage.js
import { useState } from "react";
import "./CancerDetectionImage.css"; // optional, can copy styles from previous App.css

async function sendImageForPrediction(file) {
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch("http://localhost:5000/predict", {
    method: "POST",
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Erreur côté serveur");
  return data;
}

const CancerDetectionImage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0] || null;
    setSelectedFile(file);
    setError("");
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  const addMessage = (from, text) => {
    setMessages((prev) => [...prev, { from, text }]);
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setError("");

    if (!selectedFile) {
      alert("Merci de sélectionner une image IRM du sein.");
      return;
    }

    try {
      setLoading(true);

      addMessage(
        "user",
        `J'envoie une IRM du sein pour analyse : "${selectedFile.name}".`
      );

      const data = await sendImageForPrediction(selectedFile);

      let botText;
      if (data.label === "non_mri_breast") {
        botText =
          `Classe prédite : Image non reconnue comme IRM du sein pour ce modèle.\n\n` +
          `Information pour le médecin : ${data.recommendation}\n\n` +
          `Avertissement : ${data.warning}`;
      } else {
        const isMalignant = data.label === "malignant";
        const classe = isMalignant ? "Maligne (suspecte)" : "Bénigne";

        botText =
          `Classe prédite : ${classe}\n\n` +
          `Recommandation pour le médecin : ${data.recommendation}\n\n` +
          `Avertissement : ${data.warning}`;
      }

      addMessage("bot", botText);
    } catch (err) {
      setError(err.message);
      addMessage("bot", "Erreur : " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="app-shell">
        <div className="inner">
          <header className="header">
            <div className="logo-circle">B</div>
            <div>
              <h1>Chatbot IRM sein (prototype)</h1>
              <p className="subtitle">
                Outil expérimental d’aide à la réflexion,{" "}
                <strong>non destiné au diagnostic réel</strong>.
              </p>
            </div>
          </header>

          <div className="layout">
            {/* Chat column */}
            <div className="chat-panel">
              <div className="chat-box">
                {messages.length === 0 ? (
                  <div className="chat-empty">
                    Le chatbot affichera ici les échanges à propos des IRM analysées.
                  </div>
                ) : (
                  messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={
                        "chat-message " +
                        (msg.from === "user" ? "chat-user" : "chat-bot")
                      }
                    >
                      <div className="chat-label">
                        {msg.from === "user" ? "Vous" : "Chatbot IRM"}
                      </div>
                      <div className="chat-bubble">
                        {msg.text.split("\n").map((line, i) => (
                          <p key={i}>{line}</p>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Upload + preview column */}
            <div className="side-panel">
              <form className="section" onSubmit={handleAnalyze}>
                <label htmlFor="imgInput">Sélectionner une image IRM :</label>
                <input
                  type="file"
                  id="imgInput"
                  accept="image/*"
                  onChange={handleFileChange}
                />

                {previewUrl && (
                  <div className="preview-block">
                    <p className="preview-title">Prévisualisation :</p>
                    <img
                      src={previewUrl}
                      alt="IRM preview"
                      className="preview-img"
                    />
                  </div>
                )}

                <div className="warning-banner">
                  Ce prototype illustre une classification bénin/malin pour des
                  IRM du sein et génère une recommandation textuelle destinée au
                  médecin.
                </div>

                <button
                  type="submit"
                  id="analyzeBtn"
                  disabled={loading}
                  className="analyze-btn"
                >
                  {loading ? "Analyse en cours..." : "Analyser l'image"}
                </button>

                {error && (
                  <p className="error-text">
                    <strong>Erreur :</strong> {error}
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CancerDetectionImage;
