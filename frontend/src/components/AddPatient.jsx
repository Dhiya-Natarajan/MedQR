import { useState } from "react";
import axios from "axios";

export default function AddPatient({ onPatientCreated, onCancel }) {
    const [formData, setFormData] = useState({
        name: "",
        dob: "",
        biometric_hash: ""
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(null);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess(null);
        setLoading(true);

        try {
            const token = localStorage.getItem("token");
            const response = await axios.post(
                "http://localhost:3000/patients",
                formData,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            setSuccess({
                patient_uuid: response.data.patient_uuid,
                message: response.data.message
            });

            // Reset form
            setFormData({ name: "", dob: "", biometric_hash: "" });

            // Notify parent component
            if (onPatientCreated) {
                onPatientCreated(response.data.patient_uuid);
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || "Failed to create patient");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.header}>
                    <h3 style={styles.title}>Register New Patient</h3>
                    {onCancel && (
                        <button onClick={onCancel} style={styles.cancelButton}>
                            ✕
                        </button>
                    )}
                </div>

                {error && <div style={styles.error}>{error}</div>}

                {success ? (
                    <div style={styles.successCard}>
                        <div style={styles.successIcon}>✓</div>
                        <h4 style={styles.successTitle}>Patient Created Successfully!</h4>
                        <p style={styles.successMessage}>{success.message}</p>

                        <div style={styles.uuidContainer}>
                            <label style={styles.label}>Patient UUID:</label>
                            <code style={styles.uuid}>{success.patient_uuid}</code>
                        </div>

                        <div style={styles.qrSection}>
                            <p style={styles.qrLabel}>QR Code:</p>
                            <img
                                src={`http://localhost:3000/qr/${success.patient_uuid}`}
                                alt="Patient QR Code"
                                style={styles.qrImage}
                                onError={(e) => {
                                    e.target.style.display = "none";
                                    e.target.nextSibling.style.display = "block";
                                }}
                            />
                            <div style={{ ...styles.qrError, display: "none" }}>
                                QR code will be available shortly
                            </div>
                        </div>

                        <div style={styles.instructions}>
                            <strong>📋 Next Steps:</strong>
                            <ul style={styles.instructionsList}>
                                <li>Print or download the QR code</li>
                                <li>Give it to the patient</li>
                                <li>Patient can use this to access their records</li>
                            </ul>
                        </div>

                        <div style={styles.buttonGroup}>
                            <button
                                onClick={() => setSuccess(null)}
                                style={styles.addAnotherButton}
                            >
                                Add Another Patient
                            </button>
                            {onCancel && (
                                <button onClick={onCancel} style={styles.doneButton}>
                                    Done
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} style={styles.form}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Full Name *</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                placeholder="John Doe"
                                style={styles.input}
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Date of Birth *</label>
                            <input
                                type="date"
                                name="dob"
                                value={formData.dob}
                                onChange={handleChange}
                                required
                                style={styles.input}
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Biometric Hash (Optional)</label>
                            <input
                                type="text"
                                name="biometric_hash"
                                value={formData.biometric_hash}
                                onChange={handleChange}
                                placeholder="Leave empty if not available"
                                style={styles.input}
                            />
                            <small style={styles.hint}>
                                For enhanced security, can be added later
                            </small>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                ...styles.submitButton,
                                ...(loading ? styles.submitButtonDisabled : {})
                            }}
                        >
                            {loading ? "Creating Patient..." : "Create Patient & Generate QR"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}

const styles = {
    container: {
        padding: "1rem",
        maxWidth: "600px",
        margin: "0 auto"
    },
    card: {
        background: "white",
        borderRadius: "12px",
        padding: "2rem",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "1.5rem"
    },
    title: {
        margin: 0,
        color: "#333",
        fontSize: "1.5rem"
    },
    cancelButton: {
        background: "none",
        border: "none",
        fontSize: "1.5rem",
        cursor: "pointer",
        color: "#999",
        padding: "0.25rem"
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem"
    },
    formGroup: {
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem"
    },
    label: {
        fontSize: "0.9rem",
        fontWeight: "600",
        color: "#555"
    },
    input: {
        padding: "0.875rem",
        fontSize: "1rem",
        border: "2px solid #e0e0e0",
        borderRadius: "8px",
        outline: "none",
        transition: "border-color 0.3s"
    },
    hint: {
        fontSize: "0.8rem",
        color: "#888",
        fontStyle: "italic"
    },
    submitButton: {
        padding: "1rem",
        fontSize: "1rem",
        fontWeight: "600",
        color: "white",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        transition: "transform 0.2s",
        marginTop: "1rem"
    },
    submitButtonDisabled: {
        opacity: 0.6,
        cursor: "not-allowed"
    },
    error: {
        background: "#fee",
        color: "#c33",
        padding: "1rem",
        borderRadius: "8px",
        marginBottom: "1rem",
        fontSize: "0.9rem"
    },
    successCard: {
        textAlign: "center"
    },
    successIcon: {
        width: "60px",
        height: "60px",
        borderRadius: "50%",
        background: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
        color: "white",
        fontSize: "2rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto 1rem"
    },
    successTitle: {
        color: "#333",
        marginBottom: "0.5rem"
    },
    successMessage: {
        color: "#666",
        marginBottom: "1.5rem"
    },
    uuidContainer: {
        background: "#f8f9fa",
        padding: "1rem",
        borderRadius: "8px",
        marginBottom: "1.5rem",
        textAlign: "left"
    },
    uuid: {
        display: "block",
        fontSize: "0.85rem",
        background: "white",
        padding: "0.75rem",
        borderRadius: "6px",
        marginTop: "0.5rem",
        wordBreak: "break-all",
        border: "1px solid #e0e0e0"
    },
    qrSection: {
        background: "#f8f9fa",
        padding: "1.5rem",
        borderRadius: "8px",
        marginBottom: "1.5rem"
    },
    qrLabel: {
        fontWeight: "600",
        marginBottom: "1rem",
        color: "#555"
    },
    qrImage: {
        maxWidth: "200px",
        border: "2px solid #e0e0e0",
        borderRadius: "8px",
        padding: "1rem",
        background: "white"
    },
    qrError: {
        color: "#e74c3c",
        fontSize: "0.9rem",
        padding: "1rem"
    },
    instructions: {
        background: "#e8f4f8",
        padding: "1rem",
        borderRadius: "8px",
        marginBottom: "1.5rem",
        textAlign: "left",
        borderLeft: "4px solid #667eea"
    },
    instructionsList: {
        marginTop: "0.5rem",
        paddingLeft: "1.5rem",
        color: "#555"
    },
    buttonGroup: {
        display: "flex",
        gap: "1rem",
        justifyContent: "center"
    },
    addAnotherButton: {
        padding: "0.875rem 1.5rem",
        fontSize: "0.95rem",
        fontWeight: "600",
        color: "#667eea",
        background: "white",
        border: "2px solid #667eea",
        borderRadius: "8px",
        cursor: "pointer"
    },
    doneButton: {
        padding: "0.875rem 1.5rem",
        fontSize: "0.95rem",
        fontWeight: "600",
        color: "white",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer"
    }
};
