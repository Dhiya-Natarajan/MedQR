import { useState } from "react";
import axios from "axios";

export default function UploadNote({ patientUUID, onBack }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("image", file); // MUST match multer field name

      const token = localStorage.getItem("token");
      if (!token) throw new Error("JWT token missing");

      const res = await axios.post(
        `http://localhost:3000/patients/${patientUUID}/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setResult(res.data);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.response?.data?.debug_info ||
        "Upload failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={onBack} style={styles.backButton}>
          ← Back
        </button>
        <div style={styles.patientInfo}>
          <strong>Patient UUID:</strong>
          <code style={styles.uuid}>{patientUUID}</code>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={styles.form}>
        <label style={styles.fileLabel}>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
            style={styles.fileInput}
          />
          <span style={styles.fileButton}>
            {file ? `Selected: ${file.name}` : "Choose Image"}
          </span>
        </label>

        <button disabled={loading || !file} style={styles.uploadButton}>
          {loading ? "Processing..." : "Upload & OCR"}
        </button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {result && (
        <div style={{ marginTop: "2rem" }}>
          <h4>OCR Text</h4>
          <pre>{result.digitized_text?.text}</pre>

          <h4>Structured Data</h4>
          <pre>{JSON.stringify(result.structured_data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: "1rem",
    maxWidth: "600px",
    margin: "0 auto",
  },
  header: {
    marginBottom: "1.5rem",
  },
  backButton: {
    padding: "0.5rem 1rem",
    fontSize: "0.9rem",
    background: "#f0f0f0",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    marginBottom: "1rem",
  },
  patientInfo: {
    padding: "1rem",
    background: "#f8f9fa",
    borderRadius: "8px",
    fontSize: "0.9rem",
  },
  uuid: {
    display: "block",
    marginTop: "0.5rem",
    padding: "0.5rem",
    background: "white",
    borderRadius: "4px",
    fontSize: "0.85rem",
    wordBreak: "break-all",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    background: "white",
    padding: "1.5rem",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  fileLabel: {
    cursor: "pointer",
  },
  fileInput: {
    display: "none",
  },
  fileButton: {
    display: "block",
    padding: "1rem",
    background: "#f0f0f0",
    border: "2px dashed #ccc",
    borderRadius: "8px",
    textAlign: "center",
    transition: "all 0.3s",
  },
  uploadButton: {
    padding: "1rem",
    fontSize: "1rem",
    fontWeight: "600",
    color: "white",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    opacity: 1,
  },
};
