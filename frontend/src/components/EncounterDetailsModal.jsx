import { useState, useEffect } from "react";
import axios from "axios";

export default function EncounterDetailsModal({ encounter, onClose, formatDate }) {
    const [imageUrl, setImageUrl] = useState(null);
    const [imageLoading, setImageLoading] = useState(true);

    useEffect(() => {
        const fetchImage = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get(`http://localhost:3000/patients/${encounter.encounter_id}/image`, {
                    headers: { Authorization: `Bearer ${token}` },
                    responseType: 'blob'
                });
                const url = URL.createObjectURL(res.data);
                setImageUrl(url);
            } catch (err) {
                console.error("Failed to load encounter image", err);
            } finally {
                setImageLoading(false);
            }
        };

        fetchImage();

        return () => {
            if (imageUrl) URL.revokeObjectURL(imageUrl);
        };
    }, [encounter.encounter_id]);

    const renderDataGraph = () => {
        if (!encounter.structured_data) return null;

        // Collect numerical values for a simple bar graph
        const numericalValues = Object.entries(encounter.structured_data)
            .filter(([key, value]) => typeof value === 'number' || (!isNaN(parseFloat(value)) && isFinite(value)))
            .map(([key, value]) => ({
                label: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                value: parseFloat(value)
            }));

        if (numericalValues.length === 0) return null;

        const maxVal = Math.max(...numericalValues.map(v => v.value), 1);

        return (
            <div style={styles.graphContainer}>
                <h4 style={styles.sectionTitle}>📈 Data Insights</h4>
                <div style={styles.barChart}>
                    {numericalValues.map((item, idx) => (
                        <div key={idx} style={styles.barRow}>
                            <div style={styles.barLabel}>{item.label}</div>
                            <div style={styles.barWrapper}>
                                <div
                                    style={{
                                        ...styles.bar,
                                        width: `${(item.value / maxVal) * 100}%`
                                    }}
                                >
                                    <span style={styles.barValue}>{item.value}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 800;

    return (
        <div style={styles.modalOverlay} onClick={onClose}>
            <div style={styles.largeModal} onClick={(e) => e.stopPropagation()}>
                <div style={styles.modalHeader}>
                    <h3>Encounter Details {encounter.patient_name ? `- ${encounter.patient_name}` : ""}</h3>
                    <button onClick={onClose} style={styles.closeButton}>
                        ✕
                    </button>
                </div>
                <div style={{
                    ...styles.modalBodyTwoCol,
                    gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr"
                }}>
                    <div style={styles.modalCol}>
                        <div style={styles.detailGroup}>
                            <p><strong>Date:</strong> {formatDate(encounter.date)}</p>
                            <p><strong>Location:</strong> {encounter.facility_location || "N/A"}</p>
                            {encounter.patient_dob && <p><strong>Patient DOB:</strong> {formatDate(encounter.patient_dob)}</p>}
                        </div>

                        {renderDataGraph()}

                        <h4 style={styles.sectionTitle}>📄 Extracted Raw Data (JSON)</h4>
                        <pre style={styles.pre}>
                            {JSON.stringify(encounter.structured_data, null, 2)}
                        </pre>

                        <h4 style={styles.sectionTitle}>🔤 OCR Text:</h4>
                        <pre style={styles.pre}>
                            {encounter.digitized_text?.text || "No text available"}
                        </pre>
                    </div>

                    <div style={styles.modalCol}>
                        <h4 style={styles.sectionTitle}>📸 Original Document Image</h4>
                        <div style={styles.imageContainer}>
                            {imageLoading ? (
                                <div style={styles.imagePlaceholder}>Loading image...</div>
                            ) : imageUrl ? (
                                <img src={imageUrl} alt="Encounter Document" style={styles.fullImage} />
                            ) : (
                                <div style={styles.imagePlaceholder}>Image not available</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const styles = {
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
        // Simple responsive support
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
