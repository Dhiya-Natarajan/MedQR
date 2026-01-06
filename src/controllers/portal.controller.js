import pool from "../config/database.js";
import { decrypt } from "../utils/encryption.js";

// Get all patients (for doctors)
export const getAllPatients = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT patient_uuid, name, dob, created_at 
       FROM patients 
       ORDER BY created_at DESC`
        );

        res.json({
            patients: result.rows,
            total: result.rowCount
        });
    } catch (err) {
        console.error("Error fetching patients:", err);
        res.status(500).json({ error: err.message });
    }
};

// Get all encounters across all patients (for doctors)
export const getAllEncounters = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT 
        e.encounter_id,
        e.patient_uuid,
        e.date,
        e.facility_location,
        e.digitized_text,
        e.structured_data,
        e.original_image_url,
        e.created_at,
        p.name as patient_name,
        p.dob as patient_dob
       FROM medical_encounters e
       JOIN patients p ON e.patient_uuid = p.patient_uuid
       ORDER BY e.created_at DESC
       LIMIT 100`
        );

        // Decrypt sensitive fields
        const decryptedEncounters = result.rows.map(e => {
            if (e.digitized_text) {
                try {
                    e.digitized_text = JSON.parse(decrypt(e.digitized_text));
                } catch (err) {
                    console.error("Decryption error:", err);
                    e.digitized_text = null;
                }
            }
            return e;
        });

        res.json({
            encounters: decryptedEncounters,
            total: result.rowCount
        });
    } catch (err) {
        console.error("Error fetching encounters:", err);
        res.status(500).json({ error: err.message });
    }
};

// Get patient's own data (for patients)
export const getMyData = async (req, res) => {
    try {
        // For now, we'll use a query parameter for patient_uuid
        // In production, this would come from the JWT token
        const { patient_uuid } = req.query;

        if (!patient_uuid) {
            return res.status(400).json({
                error: "patient_uuid is required",
                message: "Please provide your patient UUID"
            });
        }

        // Get patient info
        const patientResult = await pool.query(
            `SELECT patient_uuid, name, dob, created_at 
       FROM patients 
       WHERE patient_uuid = $1`,
            [patient_uuid]
        );

        if (patientResult.rowCount === 0) {
            return res.status(404).json({ error: "Patient not found" });
        }

        // Get patient's encounters
        const encountersResult = await pool.query(
            `SELECT 
        encounter_id,
        patient_uuid,
        date,
        facility_location,
        digitized_text,
        structured_data,
        original_image_url,
        created_at
       FROM medical_encounters
       WHERE patient_uuid = $1
       ORDER BY created_at DESC`,
            [patient_uuid]
        );

        // Decrypt sensitive fields

        // Map loops through each encounter which is saved in e
        const decryptedEncounters = encountersResult.rows.map(e => {
            if (e.digitized_text) {
                try {
                    e.digitized_text = JSON.parse(decrypt(e.digitized_text));
                } catch (err) {
                    console.error("Decryption error:", err);
                    e.digitized_text = null;
                }
            }
            return e;
        });

        res.json({
            patient: patientResult.rows[0],
            encounters: decryptedEncounters,
            total_encounters: encountersResult.rowCount
        });
    } catch (err) {
        console.error("Error fetching patient data:", err);
        res.status(500).json({ error: err.message });
    }
};
