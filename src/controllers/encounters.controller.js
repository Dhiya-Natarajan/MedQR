import fs from "fs";
import path from "path";
import pool from "../config/database.js";
import { getEncountersByPatient, createEncounter } from "../services/encounter.service.js";
import { patientExists } from "../services/patient.service.js";
import { encrypt } from "../utils/encryption.js";
import { decrypt } from "../utils/encryption.js";


export const createPatientEncounter = async (req, res) => {
  const { uuid } = req.params;
  const {
    date,
    facility_location,
    digitized_text,
    structured_data,
    original_image_url
  } = req.body;

  // Basic validation
  if (!date || !structured_data) {
    return res.status(400).json({
      error: "date and structured_data are required"
    });
  }

  try {

    //  STEP 1: Validate patient exists
    const exists = await patientExists(uuid);

    if (!exists) {
      return res.status(404).json({
        error: "Patient not found"
      });
    }

    // STEP 2: Encrypt sensitive fields
    const encryptedText = digitized_text
      ? encrypt(JSON.stringify(digitized_text))
      : null;

    // STEP 3: Create encounter in DB
    const encounter = await createEncounter({
      patient_uuid: uuid,
      date,
      facility_location,
      digitized_text: encryptedText, // encrypted JSON
      structured_data,
      original_image_url
    });

    res.status(201).json({
      message: "Medical encounter created",
      encounter_id: encounter.encounter_id
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const getPatientEncounters = async (req, res) => {
  const { uuid } = req.params;

  try {
    const encounters = await getEncountersByPatient(uuid);

    // Decrypt sensitive fields before sending
    const decryptedEncounters = encounters.map(e => {
      if (e.digitized_text) {
        e.digitized_text = JSON.parse(decrypt(e.digitized_text));
      }
      return e;
    });

    res.json({
      patient_uuid: uuid,
      encounters: decryptedEncounters
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getEncounterImage = async (req, res) => {
  const { encounter_id } = req.params;

  try {
    // Fetch the file path from the database
    const result = await pool.query(
      "SELECT original_image_url FROM medical_encounters WHERE encounter_id = $1",
      [encounter_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Encounter not found" });
    }

    const imagePath = result.rows[0].original_image_url;

    // Check if file exists on disk
    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({ error: "Image file not found on server" });
    }

    // Send the file
    res.sendFile(path.resolve(imagePath));
  } catch (err) {
    console.error("Error fetching encounter image:", err);
    res.status(500).json({ error: "Failed to fetch image" });
  }
};