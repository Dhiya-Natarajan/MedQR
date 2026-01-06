import { useState } from "react";
import axios from "axios";

export default function Login({ onLoginSuccess }) {
    const [role, setRole] = useState("nurse"); // default nurse
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await axios.post("http://localhost:3000/auth/dev-login", {
                role,
            });

            const { token } = res.data;
            localStorage.setItem("token", token);
            localStorage.setItem("role", role);

            onLoginSuccess(role, token);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>QR Medical Login</h2>
                <form onSubmit={handleLogin} style={styles.form}>
                    <label style={styles.label}>
                        Select Role:
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            style={styles.select}
                        >
                            <option value="nurse">Nurse</option>
                            <option value="doctor">Doctor</option>
                            <option value="patient">Patient</option>
                        </select>
                    </label>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            ...styles.button,
                            opacity: loading ? 0.6 : 1,
                        }}
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>

                    {error && <p style={styles.error}>{error}</p>}
                </form>
            </div>
        </div>
    );
}

const styles = {
    container: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "1rem",
    },
    card: {
        background: "white",
        borderRadius: "12px",
        padding: "2rem",
        boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
        width: "100%",
        maxWidth: "400px",
    },
    title: {
        textAlign: "center",
        color: "#333",
        marginBottom: "1.5rem",
        fontSize: "1.5rem",
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
    },
    label: {
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        fontSize: "0.95rem",
        color: "#555",
        fontWeight: "500",
    },
    select: {
        padding: "0.75rem",
        fontSize: "1rem",
        border: "2px solid #e0e0e0",
        borderRadius: "8px",
        outline: "none",
        transition: "border-color 0.3s",
    },
    button: {
        padding: "0.875rem",
        fontSize: "1rem",
        fontWeight: "600",
        color: "white",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        transition: "transform 0.2s",
        marginTop: "0.5rem",
    },
    error: {
        color: "#e74c3c",
        fontSize: "0.9rem",
        textAlign: "center",
        margin: "0",
    },
};
