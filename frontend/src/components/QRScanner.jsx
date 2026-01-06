import { useState, useRef, useEffect } from "react";
import { Html5Qrcode } from "html5-qrcode";

export default function QRScannerCamera({ onScanSuccess }) {
    const [manualUUID, setManualUUID] = useState("");
    const [error, setError] = useState("");
    const [scanning, setScanning] = useState(false);
    const [cameraError, setCameraError] = useState("");
    const scannerRef = useRef(null);
    const html5QrCodeRef = useRef(null);

    useEffect(() => {
        return () => {
            // Cleanup on unmount
            if (html5QrCodeRef.current) {
                html5QrCodeRef.current.stop().catch(err => console.error("Error stopping scanner:", err));
            }
        };
    }, []);

    const startScanning = async () => {
        setError("");
        setCameraError("");
        setScanning(true);

        try {
            const html5QrCode = new Html5Qrcode("qr-reader");
            html5QrCodeRef.current = html5QrCode;

            await html5QrCode.start(
                { facingMode: "environment" }, // Use back camera
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 }
                },
                (decodedText) => {
                    // QR Code successfully scanned
                    console.log("QR Code scanned:", decodedText);

                    // Validate UUID format
                    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

                    if (uuidRegex.test(decodedText)) {
                        stopScanning();
                        onScanSuccess(decodedText);
                    } else {
                        setError("Scanned code is not a valid patient UUID");
                    }
                },
                (errorMessage) => {
                    // Scanning errors (can be ignored, happens frequently)
                    // console.log("Scan error:", errorMessage);
                }
            );
        } catch (err) {
            console.error("Camera error:", err);
            setCameraError(
                "Unable to access camera. Please ensure you've granted camera permissions or use manual entry."
            );
            setScanning(false);
        }
    };

    const stopScanning = async () => {
        if (html5QrCodeRef.current) {
            try {
                await html5QrCodeRef.current.stop();
                html5QrCodeRef.current = null;
            } catch (err) {
                console.error("Error stopping scanner:", err);
            }
        }
        setScanning(false);
    };

    const handleManualSubmit = (e) => {
        e.preventDefault();
        setError("");

        // Basic UUID validation
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

        if (!uuidRegex.test(manualUUID)) {
            setError("Invalid UUID format");
            return;
        }

        onScanSuccess(manualUUID);
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h3 style={styles.title}>Scan Patient QR Code</h3>
                <p style={styles.subtitle}>
                    Use your camera to scan the patient's QR code or enter UUID manually
                </p>

                {/* Camera Scanner Section */}
                <div style={styles.scannerSection}>
                    {!scanning ? (
                        <div style={styles.scannerPlaceholder}>
                            <div style={styles.cameraIcon}>📷</div>
                            <button onClick={startScanning} style={styles.startScanButton}>
                                Start Camera Scanner
                            </button>
                            {cameraError && (
                                <p style={styles.cameraError}>{cameraError}</p>
                            )}
                        </div>
                    ) : (
                        <div style={styles.scannerActive}>
                            <div id="qr-reader" ref={scannerRef} style={styles.qrReader}></div>
                            <button onClick={stopScanning} style={styles.stopScanButton}>
                                Stop Scanner
                            </button>
                        </div>
                    )}
                </div>

                {error && <div style={styles.error}>{error}</div>}

                {/* Divider */}
                <div style={styles.divider}>
                    <span style={styles.dividerText}>OR</span>
                </div>

                {/* Manual Entry Section */}
                <form onSubmit={handleManualSubmit} style={styles.form}>
                    <label style={styles.label}>Enter Patient UUID Manually:</label>
                    <input
                        type="text"
                        placeholder="e.g., 439362cd-b473-4f57-85b9-394d7e404e00"
                        value={manualUUID}
                        onChange={(e) => setManualUUID(e.target.value)}
                        style={styles.input}
                        disabled={scanning}
                    />

                    <button
                        type="submit"
                        style={{
                            ...styles.button,
                            ...(scanning ? styles.buttonDisabled : {})
                        }}
                        disabled={scanning}
                    >
                        Continue with UUID
                    </button>
                </form>

                <div style={styles.note}>
                    <strong>💡 Tip:</strong> The QR code scanner works best in good lighting conditions.
                    Point your camera at the patient's QR code card.
                </div>
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
        padding: "1.5rem",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
    },
    title: {
        color: "#333",
        marginBottom: "0.5rem",
        fontSize: "1.5rem",
        textAlign: "center"
    },
    subtitle: {
        color: "#666",
        fontSize: "0.9rem",
        marginBottom: "1.5rem",
        textAlign: "center"
    },
    scannerSection: {
        marginBottom: "1.5rem"
    },
    scannerPlaceholder: {
        background: "#f8f9fa",
        borderRadius: "8px",
        padding: "2rem",
        textAlign: "center",
        border: "2px dashed #e0e0e0"
    },
    cameraIcon: {
        fontSize: "3rem",
        marginBottom: "1rem"
    },
    startScanButton: {
        padding: "0.875rem 1.5rem",
        fontSize: "1rem",
        fontWeight: "600",
        color: "white",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        transition: "transform 0.2s"
    },
    cameraError: {
        marginTop: "1rem",
        color: "#e74c3c",
        fontSize: "0.85rem",
        lineHeight: "1.4"
    },
    scannerActive: {
        display: "flex",
        flexDirection: "column",
        gap: "1rem"
    },
    qrReader: {
        borderRadius: "8px",
        overflow: "hidden",
        border: "2px solid #667eea"
    },
    stopScanButton: {
        padding: "0.75rem",
        fontSize: "0.95rem",
        fontWeight: "600",
        color: "#e74c3c",
        background: "white",
        border: "2px solid #e74c3c",
        borderRadius: "8px",
        cursor: "pointer"
    },
    divider: {
        position: "relative",
        textAlign: "center",
        margin: "1.5rem 0",
        borderTop: "1px solid #e0e0e0"
    },
    dividerText: {
        position: "relative",
        top: "-0.75rem",
        background: "white",
        padding: "0 1rem",
        color: "#999",
        fontSize: "0.85rem",
        fontWeight: "600"
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: "1rem"
    },
    label: {
        fontSize: "0.9rem",
        fontWeight: "600",
        color: "#555"
    },
    input: {
        padding: "0.875rem",
        fontSize: "0.95rem",
        border: "2px solid #e0e0e0",
        borderRadius: "8px",
        outline: "none",
        fontFamily: "monospace"
    },
    button: {
        padding: "0.875rem",
        fontSize: "1rem",
        fontWeight: "600",
        color: "white",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer"
    },
    buttonDisabled: {
        opacity: 0.5,
        cursor: "not-allowed"
    },
    error: {
        color: "#e74c3c",
        fontSize: "0.9rem",
        textAlign: "center",
        margin: "1rem 0",
        padding: "0.75rem",
        background: "#fee",
        borderRadius: "6px"
    },
    note: {
        marginTop: "1.5rem",
        padding: "1rem",
        background: "#e8f4f8",
        borderRadius: "8px",
        fontSize: "0.85rem",
        color: "#555",
        borderLeft: "4px solid #667eea"
    }
};
