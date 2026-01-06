import { useState, useEffect } from "react";
import axios from "axios";
import AddPatient from "./AddPatient";
import ViewQRCode from "./ViewQRCode";
import EncounterDetailsModal from "./EncounterDetailsModal";

export default function DoctorPortal({ onLogout }) {
    const [activeTab, setActiveTab] = useState("encounters");
    const [encounters, setEncounters] = useState([]);
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedEncounter, setSelectedEncounter] = useState(null);
    const [showAddPatient, setShowAddPatient] = useState(false);
    const [selectedPatientQR, setSelectedPatientQR] = useState(null);

    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        setError("");

        try {
            const token = localStorage.getItem("token");
            const headers = { Authorization: `Bearer ${token}` };

            if (activeTab === "encounters") {
                const res = await axios.get("http://localhost:3000/portal/doctor/encounters", { headers });
                setEncounters(res.data.encounters);
            } else {
                const res = await axios.get("http://localhost:3000/portal/doctor/patients", { headers });
                setPatients(res.data.patients);
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || "Failed to fetch data");
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

    const handlePatientCreated = (patientUUID) => {
        // Refresh patients list
        if (activeTab === "patients") {
            fetchData();
        }
        // Optionally show the QR code
        setSelectedPatientQR({ patient_uuid: patientUUID, name: "New Patient" });
    };

    const handleViewQR = (patient) => {
        setSelectedPatientQR({
            patient_uuid: patient.patient_uuid,
            name: patient.name
        });
    };

    const filteredPatients = patients.filter(patient =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.patient_uuid.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredEncounters = encounters.filter(enc =>
        enc.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enc.encounter_id.toString().includes(searchTerm)
    );

    return (
        <div style={styles.container}>
            <div style={styles.headerRow}>
                <div style={styles.tabs}>
                    <button
                        onClick={() => { setActiveTab("encounters"); setSearchTerm(""); }}
                        style={{
                            ...styles.tab,
                            ...(activeTab === "encounters" ? styles.activeTab : {}),
                        }}
                    >
                        📋 All Encounters ({encounters.length})
                    </button>
                    <button
                        onClick={() => { setActiveTab("patients"); setSearchTerm(""); }}
                        style={{
                            ...styles.tab,
                            ...(activeTab === "patients" ? styles.activeTab : {}),
                        }}
                    >
                        👥 All Patients ({patients.length})
                    </button>
                </div>

                <div style={styles.searchContainer}>
                    <input
                        type="text"
                        placeholder={activeTab === "patients" ? "Search patients..." : "Search encounters..."}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={styles.searchInput}
                    />
                </div>
            </div>

            {error && <div style={styles.error}>{error}</div>}

            {loading ? (
                <div style={styles.loading}>Loading...</div>
            ) : (
                <>
                    {activeTab === "encounters" && (
                        <div style={styles.content}>
                            <h3 style={styles.subtitle}>Recent Medical Encounters</h3>
                            {filteredEncounters.length === 0 ? (
                                <p style={styles.empty}>No encounters found matching your search</p>
                            ) : (
                                <div style={styles.grid}>
                                    {filteredEncounters.map((enc) => (
                                        <div key={enc.encounter_id} style={styles.card}>
                                            <div style={styles.cardHeader}>
                                                <strong>{enc.patient_name}</strong>
                                                <span style={styles.badge}>ID: {enc.encounter_id}</span>
                                            </div>
                                            <div style={styles.cardBody}>
                                                <p style={styles.info}>
                                                    <strong>Date:</strong> {formatDate(enc.date)}
                                                </p>
                                                <p style={styles.info}>
                                                    <strong>Location:</strong> {enc.facility_location || "N/A"}
                                                </p>
                                                <p style={styles.info}>
                                                    <strong>Patient DOB:</strong> {formatDate(enc.patient_dob)}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => viewEncounterDetails(enc)}
                                                style={styles.viewButton}
                                            >
                                                View Details
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "patients" && (
                        <div style={styles.content}>
                            <div style={styles.sectionHeader}>
                                <h3 style={styles.subtitle}>Registered Patients</h3>
                                <button
                                    type="button"
                                    onClick={() => setShowAddPatient(true)}
                                    style={styles.addPatientButton}
                                >
                                    ➕ Add New Patient
                                </button>
                            </div>
                            {filteredPatients.length === 0 ? (
                                <p style={styles.empty}>No patients found matching your search</p>
                            ) : (
                                <div style={styles.grid}>
                                    {filteredPatients.map((patient) => (
                                        <div key={patient.patient_uuid} style={styles.card}>
                                            <div style={styles.cardHeader}>
                                                <strong>{patient.name}</strong>
                                            </div>
                                            <div style={styles.cardBody}>
                                                <p style={styles.info}>
                                                    <strong>UUID:</strong>
                                                    <code style={styles.uuid}>{patient.patient_uuid}</code>
                                                </p>
                                                <p style={styles.info}>
                                                    <strong>DOB:</strong> {formatDate(patient.dob)}
                                                </p>
                                                <p style={styles.info}>
                                                    <strong>Registered:</strong> {formatDate(patient.created_at)}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => handleViewQR(patient)}
                                                style={styles.viewQRButton}
                                            >
                                                🔍 View QR Code
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}

            {/* Modal for encounter details */}
            {selectedEncounter && (
                <EncounterDetailsModal
                    encounter={selectedEncounter}
                    onClose={closeModal}
                    formatDate={formatDate}
                />
            )}

            {/* Add Patient Modal */}
            {showAddPatient && (
                <div style={styles.modalOverlay} onClick={() => setShowAddPatient(false)}>
                    <div onClick={(e) => e.stopPropagation()}>
                        <AddPatient
                            onPatientCreated={handlePatientCreated}
                            onCancel={() => setShowAddPatient(false)}
                        />
                    </div>
                </div>
            )}

            {/* View QR Code Modal */}
            {selectedPatientQR && (
                <ViewQRCode
                    patientUUID={selectedPatientQR.patient_uuid}
                    patientName={selectedPatientQR.name}
                    onClose={() => setSelectedPatientQR(null)}
                />
            )}
        </div>
    );
}




const styles = {
    container: {
        maxWidth: "1240px",
        margin: "0 auto",
        padding: "1rem",
    },
    headerRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "1.5rem",
        gap: "1rem",
        flexWrap: "wrap",
    },
    tabs: {
        display: "flex",
        gap: "0.5rem",
        background: "white",
        padding: "0.5rem",
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        flex: "1",
        minWidth: "300px",
    },
    searchContainer: {
        flex: "1",
        minWidth: "300px",
    },
    searchInput: {
        width: "100%",
        padding: "0.875rem 1rem",
        borderRadius: "12px",
        border: "1px solid #e0e0e0",
        fontSize: "1rem",
        outline: "none",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        transition: "border-color 0.3s",
    },
    tab: {
        flex: 1,
        padding: "0.875rem",
        fontSize: "0.95rem",
        fontWeight: "600",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        background: "transparent",
        transition: "all 0.3s",
    },
    activeTab: {
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
    },
    content: {
        background: "white",
        borderRadius: "12px",
        padding: "1.5rem",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    },
    subtitle: {
        marginTop: 0,
        marginBottom: "1.5rem",
        color: "#333",
    },
    sectionHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "1.5rem",
    },
    addPatientButton: {
        padding: "0.75rem 1.25rem",
        fontSize: "0.9rem",
        fontWeight: "600",
        color: "white",
        background: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        transition: "transform 0.2s",
    },
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
        gap: "1rem",
    },
    card: {
        border: "1px solid #e0e0e0",
        borderRadius: "12px",
        padding: "1rem",
        transition: "transform 0.2s, box-shadow 0.2s",
        background: "#fff",
        display: "flex",
        flexDirection: "column",
    },
    cardHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "0.75rem",
        paddingBottom: "0.75rem",
        borderBottom: "1px solid #f0f0f0",
    },
    badge: {
        fontSize: "0.75rem",
        background: "#f0f6ff",
        color: "#2563eb",
        padding: "0.25rem 0.5rem",
        borderRadius: "4px",
        fontWeight: "600",
    },
    cardBody: {
        marginBottom: "1rem",
        flex: 1,
    },
    info: {
        fontSize: "0.9rem",
        margin: "0.5rem 0",
        color: "#555",
    },
    uuid: {
        display: "block",
        fontSize: "0.75rem",
        background: "#f8f9fa",
        padding: "0.4rem",
        borderRadius: "4px",
        marginTop: "0.25rem",
        wordBreak: "break-all",
        color: "#666",
        border: "1px solid #edf2f7",
    },
    viewButton: {
        width: "100%",
        padding: "0.75rem",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontWeight: "600",
        fontSize: "0.9rem",
        transition: "opacity 0.2s",
    },
    viewQRButton: {
        width: "100%",
        padding: "0.75rem",
        background: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
        color: "white",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontWeight: "600",
        fontSize: "0.9rem",
        marginTop: "0.5rem",
    },
    loading: {
        textAlign: "center",
        padding: "3rem",
        fontSize: "1.1rem",
        color: "#666",
    },
    error: {
        background: "#fee2e2",
        color: "#991b1b",
        padding: "1rem",
        borderRadius: "12px",
        marginBottom: "1rem",
        border: "1px solid #fecaca",
    },
    empty: {
        textAlign: "center",
        padding: "3rem",
        color: "#94a3b8",
        fontSize: "1rem",
    },
    modalOverlay: {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
        padding: "20px",
    },
    largeModal: {
        background: "white",
        borderRadius: "16px",
        maxWidth: "1100px",
        width: "100%",
        maxHeight: "90vh",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        overflow: "hidden",
    },
    modalHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "1.25rem 1.5rem",
        borderBottom: "1px solid #e2e8f0",
        background: "#f8fafc",
    },
    closeButton: {
        background: "none",
        border: "none",
        fontSize: "1.5rem",
        cursor: "pointer",
        color: "#64748b",
        width: "32px",
        height: "32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "50%",
        transition: "background 0.2s",
    },
    modalBodyTwoCol: {
        padding: "1.5rem",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "1.5rem",
        overflowY: "auto",
        "@media (max-width: 800px)": {
            gridTemplateColumns: "1fr",
        }
    },
    modalCol: {
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
    },
    detailGroup: {
        background: "#f1f5f9",
        padding: "1rem",
        borderRadius: "8px",
        fontSize: "0.95rem",
    },
    sectionTitle: {
        marginTop: "1rem",
        marginBottom: "0.5rem",
        color: "#1e293b",
        fontSize: "1.1rem",
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
    },
    pre: {
        background: "#1e293b",
        color: "#e2e8f0",
        padding: "1rem",
        borderRadius: "8px",
        overflow: "auto",
        fontSize: "0.85rem",
        maxHeight: "250px",
        margin: 0,
    },
    imageContainer: {
        border: "2px solid #e2e8f0",
        borderRadius: "12px",
        overflow: "hidden",
        background: "#f8fafc",
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "400px",
    },
    fullImage: {
        maxWidth: "100%",
        height: "auto",
        display: "block",
    },
    imagePlaceholder: {
        color: "#94a3b8",
        fontSize: "1rem",
    },
    graphContainer: {
        background: "#fff",
        border: "1px solid #e2e8f0",
        padding: "1rem",
        borderRadius: "12px",
    },
    barChart: {
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
        marginTop: "0.5rem",
    },
    barRow: {
        display: "flex",
        alignItems: "center",
        gap: "1rem",
    },
    barLabel: {
        width: "120px",
        fontSize: "0.85rem",
        color: "#64748b",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
    },
    barWrapper: {
        flex: 1,
        background: "#f1f5f9",
        height: "24px",
        borderRadius: "12px",
        overflow: "hidden",
    },
    bar: {
        height: "100%",
        background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
        borderRadius: "12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        paddingRight: "8px",
        transition: "width 1s ease-out",
    },
    barValue: {
        color: "white",
        fontSize: "0.75rem",
        fontWeight: "bold",
    }
};
