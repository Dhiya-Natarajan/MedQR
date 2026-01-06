import { useState } from "react";
import axios from "axios";


export default function ViewQRCode({ patientUUID, patientName, onClose }) {
    const [imageError, setImageError] = useState(false);
    const qrUrl = `http://localhost:3000/qr/${patientUUID}`;

    const handleDownload = async () => {
    try {
        const response = await axios.get(qrUrl, {
            responseType: "blob"
        });

        const blobUrl = window.URL.createObjectURL(response.data);
        const link = document.createElement("a");

        link.href = blobUrl;
        link.download = `patient-qr-${patientUUID}.png`;
        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
        console.error("QR download failed", err);
    }
};


const handlePrint = () => {
    const printWindow = window.open("", "_blank");

    printWindow.document.write(`
        <html>
            <head>
                <title>Print QR</title>
                <style>
                    body {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        margin: 0;
                    }
                    img {
                        width: 300px;
                    }
                </style>
            </head>
            <body>
                <img src="${qrUrl}" onload="window.print(); window.close();" />
            </body>
        </html>
    `);

    printWindow.document.close();
};


    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div style={styles.header}>
                    <h3 style={styles.title}>Patient QR Code</h3>
                    <button onClick={onClose} style={styles.closeButton}>
                        ✕
                    </button>
                </div>

                <div style={styles.body}>
                    {patientName && (
                        <p style={styles.patientName}>
                            <strong>Patient:</strong> {patientName}
                        </p>
                    )}

                    <div style={styles.qrContainer}>
                        {!imageError ? (
                            <img
                                src={qrUrl}
                                alt="Patient QR Code"
                                style={styles.qrImage}
                                onError={() => setImageError(true)}
                            />
                        ) : (
                            <div style={styles.errorBox}>
                                <p style={styles.errorText}>QR Code not available</p>
                                <p style={styles.errorHint}>
                                    The QR code may not have been generated yet
                                </p>
                            </div>
                        )}
                    </div>

                    <div style={styles.uuidBox}>
                        <label style={styles.label}>Patient UUID:</label>
                        <code style={styles.uuid}>{patientUUID}</code>
                    </div>

                    <div style={styles.instructions}>
                        <strong>📱 How to use:</strong>
                        <ul style={styles.instructionsList}>
                            <li>Scan this QR code with any QR scanner</li>
                            <li>The QR code contains the patient's unique ID</li>
                            <li>Use it to quickly access patient records</li>
                        </ul>
                    </div>

                    <div style={styles.buttonGroup}>
                        <button onClick={handleDownload} style={styles.downloadButton}>
                            📥 Download QR
                        </button>
                        <button onClick={handlePrint} style={styles.printButton}>
                            🖨️ Print QR
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

const styles = {
    overlay: {
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
        padding: "1rem"
    },
    modal: {
        background: "white",
        borderRadius: "12px",
        maxWidth: "500px",
        width: "100%",
        maxHeight: "90vh",
        overflow: "auto",
        boxShadow: "0 10px 40px rgba(0,0,0,0.3)"
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "1.5rem",
        borderBottom: "1px solid #e0e0e0"
    },
    title: {
        margin: 0,
        color: "#333",
        fontSize: "1.25rem"
    },
    closeButton: {
        background: "none",
        border: "none",
        fontSize: "1.5rem",
        cursor: "pointer",
        color: "#999",
        padding: "0"
    },
    body: {
        padding: "1.5rem"
    },
    patientName: {
        fontSize: "1rem",
        color: "#555",
        marginBottom: "1.5rem",
        textAlign: "center"
    },
    qrContainer: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "1.5rem",
        background: "#f8f9fa",
        borderRadius: "8px",
        marginBottom: "1.5rem",
        minHeight: "250px"
    },
    qrImage: {
        maxWidth: "200px",
        width: "100%",
        border: "2px solid #e0e0e0",
        borderRadius: "8px",
        padding: "1rem",
        background: "white"
    },
    errorBox: {
        textAlign: "center",
        padding: "2rem"
    },
    errorText: {
        color: "#e74c3c",
        fontWeight: "600",
        marginBottom: "0.5rem"
    },
    errorHint: {
        color: "#999",
        fontSize: "0.9rem"
    },
    uuidBox: {
        background: "#f8f9fa",
        padding: "1rem",
        borderRadius: "8px",
        marginBottom: "1.5rem"
    },
    label: {
        fontSize: "0.85rem",
        fontWeight: "600",
        color: "#555",
        display: "block",
        marginBottom: "0.5rem"
    },
    uuid: {
        display: "block",
        fontSize: "0.8rem",
        background: "white",
        padding: "0.75rem",
        borderRadius: "6px",
        wordBreak: "break-all",
        border: "1px solid #e0e0e0",
        fontFamily: "monospace"
    },
    instructions: {
        background: "#e8f4f8",
        padding: "1rem",
        borderRadius: "8px",
        marginBottom: "1.5rem",
        borderLeft: "4px solid #667eea"
    },
    instructionsList: {
        marginTop: "0.5rem",
        paddingLeft: "1.5rem",
        color: "#555",
        fontSize: "0.9rem"
    },
    buttonGroup: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "1rem"
    },
    downloadButton: {
        padding: "0.875rem",
        fontSize: "0.95rem",
        fontWeight: "600",
        color: "white",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer"
    },
    printButton: {
        padding: "0.875rem",
        fontSize: "0.95rem",
        fontWeight: "600",
        color: "#667eea",
        background: "white",
        border: "2px solid #667eea",
        borderRadius: "8px",
        cursor: "pointer"
    }
};
