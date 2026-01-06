import { useState, useEffect } from "react";
import axios from "axios";
import ViewQRCode from "./ViewQRCode";
import EncounterDetailsModal from "./EncounterDetailsModal";

export default function PatientPortal({ onLogout }) {
    const [patientUUID, setPatientUUID] = useState("");
    const [patientData, setPatientData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [selectedEncounter, setSelectedEncounter] = useState(null);
    const [showMyQR, setShowMyQR] = useState(false);

    const fetchMyData = async (e) => {
        if (e) e.preventDefault();

        if (!patientUUID.trim()) {
            setError("Please enter your Patient UUID");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(
                `http://localhost:3000/portal/patient/my-data?patient_uuid=${patientUUID}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            setPatientData(res.data);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || err.response?.data?.message || "Failed to fetch data");
            setPatientData(null);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const viewEncounterDetails = (encounter) => {
        setSelectedEncounter(encounter);
    };

    const closeModal = () => {
        setSelectedEncounter(null);
    };

    return (
        <div style={styles.container}>
            {!patientData ? (
                <div style={styles.card}>
                    <h3 style={styles.title}>Access Your Medical Records</h3>
                    <p style={styles.subtitle}>
                        Enter your Patient UUID to view your medical history
                    </p>

                    <form onSubmit={fetchMyData} style={styles.form}>
                        <input
                            type="text"
                            placeholder="e.g., 439362cd-b473-4f57-85b9-394d7e404e00"
                            value={patientUUID}
                            onChange={(e) => setPatientUUID(e.target.value)}
                            style={styles.input}
                        />

                        <button type="submit" disabled={loading} style={styles.button}>
                            {loading ? "Loading..." : "View My Records"}
                        </button>

                        {error && <p style={styles.error}>{error}</p>}
                    </form>

                    <div style={styles.help}>
                        <strong>💡 Where to find your UUID:</strong>
                        <ul style={styles.helpList}>
                            <li>Check your QR code card</li>
                            <li>Ask the hospital reception</li>
                            <li>Check your registration email</li>
                        </ul>
                    </div>
                </div>
            ) : (
                <div>
                    {/* Patient Info Card */}
                    <div style={styles.card}>
                        <div style={styles.headerRow}>
                            <div>
                                <h3 style={styles.title}>My Medical Records</h3>
                                <p style={styles.patientName}>{patientData.patient.name}</p>
                            </div>
                            <div style={styles.buttonGroup}>
                                <button
                                    onClick={() => setShowMyQR(true)}
                                    style={styles.viewQRButton}
                                >
                                    🔍 View My QR
                                </button>
                                <button onClick={() => setPatientData(null)} style={styles.changeButton}>
                                    Change Patient
                                </button>
                            </div>
                        </div>

                        <div style={styles.infoGrid}>
                            <div style={styles.infoItem}>
                                <span style={styles.label}>Date of Birth:</span>
                                <span style={styles.value}>{formatDate(patientData.patient.dob)}</span>
                            </div>
                            <div style={styles.infoItem}>
                                <span style={styles.label}>Patient UUID:</span>
                                <code style={styles.uuid}>{patientData.patient.patient_uuid}</code>
                            </div>
                            <div style={styles.infoItem}>
                                <span style={styles.label}>Registered:</span>
                                <span style={styles.value}>
                                    {formatDate(patientData.patient.created_at)}
                                </span>
                            </div>
                            <div style={styles.infoItem}>
                                <span style={styles.label}>Total Encounters:</span>
                                <span style={styles.value}>{patientData.total_encounters}</span>
                            </div>
                        </div>
                    </div>

                    {/* Encounters List */}
                    <div style={styles.card}>
                        <h3 style={styles.title}>Medical History</h3>

                        {patientData.encounters.length === 0 ? (
                            <p style={styles.empty}>No medical encounters recorded yet</p>
                        ) : (
                            <div style={styles.encountersList}>
                                {patientData.encounters.map((enc) => (
                                    <div key={enc.encounter_id} style={styles.encounterCard}>
                                        <div style={styles.encounterHeader}>
                                            <div>
                                                <strong style={styles.encounterDate}>
                                                    {formatDate(enc.date)}
                                                </strong>
                                                <p style={styles.encounterLocation}>
                                                    {enc.facility_location || "Unknown Location"}
                                                </p>
                                            </div>
                                            <span style={styles.encounterId}>#{enc.encounter_id}</span>
                                        </div>

                                        <button
                                            onClick={() => viewEncounterDetails(enc)}
                                            style={styles.viewButton}
                                        >
                                            View Prescription
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Modal for encounter details */}
            {selectedEncounter && (
                <EncounterDetailsModal
                    encounter={{
                        ...selectedEncounter,
                        patient_name: patientData.patient.name,
                        patient_dob: patientData.patient.dob
                    }}
                    onClose={closeModal}
                    formatDate={formatDate}
                />
            )}

            {/* View My QR Code Modal */}
            {showMyQR && patientData && (
                <ViewQRCode
                    patientUUID={patientData.patient.patient_uuid}
                    patientName={patientData.patient.name}
                    onClose={() => setShowMyQR(false)}
                />
            )}
        </div>
    );
}

const styles = {
    container: {
        maxWidth: "800px",
        margin: "0 auto",
        padding: "1rem",
    },
    card: {
        background: "white",
        borderRadius: "12px",
        padding: "2rem",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        marginBottom: "1.5rem",
    },
    title: {
        marginTop: 0,
        marginBottom: "0.5rem",
        color: "#333",
    },
    subtitle: {
        color: "#666",
        marginBottom: "1.5rem",
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
    },
    input: {
        padding: "0.875rem",
        fontSize: "0.95rem",
        border: "2px solid #e0e0e0",
        borderRadius: "8px",
        outline: "none",
        fontFamily: "monospace",
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
    },
    error: {
        color: "#e74c3c",
        fontSize: "0.9rem",
        textAlign: "center",
        margin: "0",
    },
    help: {
        marginTop: "2rem",
        padding: "1rem",
        background: "#f8f9fa",
        borderRadius: "8px",
        fontSize: "0.9rem",
    },
    helpList: {
        marginTop: "0.5rem",
        paddingLeft: "1.5rem",
        color: "#555",
    },
    headerRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: "1.5rem",
        gap: "1rem",
        flexWrap: "wrap",
    },
    patientName: {
        fontSize: "1.25rem",
        fontWeight: "600",
        color: "#667eea",
        margin: "0.5rem 0 0 0",
    },
    buttonGroup: {
        display: "flex",
        gap: "0.5rem",
        flexWrap: "wrap",
    },
    viewQRButton: {
        padding: "0.5rem 1rem",
        fontSize: "0.9rem",
        fontWeight: "600",
        color: "white",
        background: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
    },
    changeButton: {
        padding: "0.5rem 1rem",
        fontSize: "0.9rem",
        background: "#f0f0f0",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
    },
    infoGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "1rem",
    },
    infoItem: {
        display: "flex",
        flexDirection: "column",
        gap: "0.25rem",
    },
    label: {
        fontSize: "0.85rem",
        color: "#888",
        fontWeight: "600",
    },
    value: {
        fontSize: "0.95rem",
        color: "#333",
    },
    uuid: {
        fontSize: "0.8rem",
        background: "#f8f9fa",
        padding: "0.5rem",
        borderRadius: "4px",
        wordBreak: "break-all",
    },
    encountersList: {
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
    },
    encounterCard: {
        border: "1px solid #e0e0e0",
        borderRadius: "8px",
        padding: "1rem",
    },
    encounterHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: "1rem",
    },
    encounterDate: {
        fontSize: "1rem",
        color: "#333",
    },
    encounterLocation: {
        fontSize: "0.85rem",
        color: "#666",
        margin: "0.25rem 0 0 0",
    },
    encounterId: {
        fontSize: "0.75rem",
        background: "#f0f0f0",
        padding: "0.25rem 0.5rem",
        borderRadius: "4px",
    },
    viewButton: {
        width: "100%",
        padding: "0.625rem",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        fontWeight: "600",
        fontSize: "0.9rem",
    },
    empty: {
        textAlign: "center",
        padding: "2rem",
        color: "#999",
    },
    modalOverlay: {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
    },
    modal: {
        background: "white",
        borderRadius: "12px",
        maxWidth: "600px",
        width: "90%",
        maxHeight: "80vh",
        overflow: "auto",
        boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
    },
    modalHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "1.5rem",
        borderBottom: "1px solid #e0e0e0",
    },
    closeButton: {
        background: "none",
        border: "none",
        fontSize: "1.5rem",
        cursor: "pointer",
        color: "#999",
    },
    modalBody: {
        padding: "1.5rem",
    },
    sectionTitle: {
        marginTop: "1.5rem",
        marginBottom: "0.5rem",
        color: "#333",
    },
    pre: {
        background: "#f8f9fa",
        padding: "1rem",
        borderRadius: "6px",
        overflow: "auto",
        fontSize: "0.85rem",
        maxHeight: "200px",
    },
};
