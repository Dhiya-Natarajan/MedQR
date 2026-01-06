import { useState, useEffect } from "react";
import Login from "./components/Login";
import QRScanner from "./components/QRScanner";
import DoctorPortal from "./components/DoctorPortal";
import PatientPortal from "./components/PatientPortal";
import UploadNote from "./UploadNote";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [patientUUID, setPatientUUID] = useState(null);

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (token && role) {
      setIsAuthenticated(true);
      setUserRole(role);
    }
  }, []);

  const handleLoginSuccess = (role, token) => {
    setIsAuthenticated(true);
    setUserRole(role);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setIsAuthenticated(false);
    setUserRole(null);
    setPatientUUID(null);
  };

  const handleScanSuccess = (uuid) => {
    setPatientUUID(uuid);
  };

  const handleBackToScanner = () => {
    setPatientUUID(null);
  };

  // Not logged in - show login
  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Logged in as nurse
  if (userRole === "nurse") {
    // If no patient selected, show QR scanner
    if (!patientUUID) {
      return (
        <div style={styles.container}>
          <div style={styles.header}>
            <h2 style={styles.title}>QR Medical - Nurse Portal</h2>
            <button onClick={handleLogout} style={styles.logoutButton}>
              Logout
            </button>
          </div>
          <QRScanner onScanSuccess={handleScanSuccess} />
        </div>
      );
    }

    // Patient selected, show upload form
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.title}>Upload Prescription</h2>
          <button onClick={handleLogout} style={styles.logoutButton}>
            Logout
          </button>
        </div>
        <UploadNote patientUUID={patientUUID} onBack={handleBackToScanner} />
      </div>
    );
  }

  // Logged in as doctor
  if (userRole === "doctor") {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.title}>QR Medical - Doctor Portal</h2>
          <button onClick={handleLogout} style={styles.logoutButton}>
            Logout
          </button>
        </div>
        <DoctorPortal onLogout={handleLogout} />
      </div>
    );
  }

  // Logged in as patient
  if (userRole === "patient") {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.title}>QR Medical - Patient Portal</h2>
          <button onClick={handleLogout} style={styles.logoutButton}>
            Logout
          </button>
        </div>
        <PatientPortal onLogout={handleLogout} />
      </div>
    );
  }

  // Fallback (should not reach here)
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>QR Medical</h2>
        <button onClick={handleLogout} style={styles.logoutButton}>
          Logout
        </button>
      </div>
      <div style={styles.accessDenied}>
        <h3>Unknown Role</h3>
        <p>Please contact support.</p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    padding: "1rem",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    maxWidth: "600px",
    margin: "0 auto 1rem",
    padding: "1rem",
    background: "rgba(255,255,255,0.95)",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  title: {
    margin: 0,
    fontSize: "1.25rem",
    color: "#333",
  },
  logoutButton: {
    padding: "0.5rem 1rem",
    fontSize: "0.9rem",
    background: "#e74c3c",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
  },
  accessDenied: {
    maxWidth: "600px",
    margin: "2rem auto",
    padding: "2rem",
    background: "white",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    textAlign: "center",
  },
  note: {
    marginTop: "1rem",
    padding: "1rem",
    background: "#f8f9fa",
    borderRadius: "8px",
    fontSize: "0.9rem",
    color: "#666",
  },
};
