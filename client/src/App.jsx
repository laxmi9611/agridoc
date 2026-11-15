import { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";

const API_URL = "http://localhost:5000/api/scans";

function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { 
    fetchHistory(); 
  }, []);

  const fetchHistory = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/history`);
      setHistory(data);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    }
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setResult(null); // Hide previous result when a new image is selected
    }
  };

  const handleAnalyze = async () => {
    if (!file) return toast.error("Please upload an image first!");
    
    setLoading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const { data } = await axios.post(`${API_URL}/analyze`, formData);
      setResult(data);
      toast.success("Analysis Complete!");
      fetchHistory(); // Refresh the recent scans list
      
      // FIX: Reset the file input and state so you can upload again immediately
      document.getElementById("fileInput").value = ""; 
      setFile(null);

    } catch (err) {
      toast.error("Error analyzing image. Is the AI server running?");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <nav className="nav">
        <h2>🌿 AgriDoc AI</h2>
      </nav>

      <div className="container">
        <h1 style={{ textAlign: "center", marginBottom: "1rem" }}>Crop Disease Detector</h1>
        <p style={{ textAlign: "center", color: "#666", marginBottom: "2rem" }}>
          Upload a photo of a leaf, and our AI will diagnose it instantly.
        </p>

        <div className="upload-box" onClick={() => document.getElementById("fileInput").click()}>
          {preview ? (
            <img src={preview} alt="Preview" style={{ height: "200px", borderRadius: "8px", objectFit: "cover" }} />
          ) : (
            <>
              <div style={{ fontSize: "4rem" }}>📸</div>
              <h3>Click to Upload Leaf Image</h3>
            </>
          )}
          <input id="fileInput" type="file" hidden accept="image/*" onChange={handleFileChange} />
        </div>

        <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
          <button className="btn" onClick={handleAnalyze} disabled={loading}>
            {loading ? "Analyzing with AI..." : "🔍 Analyze Disease"}
          </button>
        </div>

        {result && (
          <div className={`result-card ${result.status === "Diseased" ? "diseased" : ""}`}>
            <h2 style={{ color: result.status === "Diseased" ? "#ef4444" : "#16a34a" }}>
              {result.status === "Diseased" ? "⚠️ Disease Detected" : "✅ Plant is Healthy"}
            </h2>
            <h3 style={{ margin: "0.5rem 0" }}>Diagnosis: {result.disease}</h3>
            <p style={{ color: "#666", marginBottom: "1rem" }}>Confidence: {result.confidence}%</p>
            <div style={{ background: "#f8fafc", padding: "1rem", borderRadius: "8px" }}>
              <strong>Recommended Solution:</strong>
              <p style={{ marginTop: "0.5rem" }}>{result.solution}</p>
            </div>
          </div>
        )}

        <h2 style={{ marginTop: "3rem" }}>Recent Scans</h2>
        <div style={{ display: "grid", gap: "1rem", marginTop: "1rem" }}>
          {history.length === 0 ? (
            <p style={{ color: "#666" }}>No scans yet. Upload an image to get started!</p>
          ) : (
            history.map(scan => (
              <div key={scan._id} style={{ background: "white", padding: "1rem", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <strong>{scan.disease}</strong>
                  <div style={{ fontSize: "0.8rem", color: "#666" }}>{new Date(scan.createdAt).toLocaleString()}</div>
                </div>
                <div style={{ color: scan.status === "Healthy" ? "#16a34a" : "#ef4444", fontWeight: "bold" }}>
                  {scan.confidence}% Match
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <ToastContainer position="top-right" />
    </div>
  );
}

export default App;