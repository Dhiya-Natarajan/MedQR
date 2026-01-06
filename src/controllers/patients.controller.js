import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import path from "path";
import multer from "multer";
import QRCode from "qrcode";
import pool from "../config/database.js";

import { encrypt } from "../utils/encryption.js";
import { createPatientService, getPatientService } from "../services/patient.service.js";
import { extractWithRegex } from "../services/regexExtractor.js";



// ---------- MULTER ----------
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only images are allowed"));
    }
    cb(null, true);
  }
}).single("image");

// ---------- CONTROLLER ----------
export const uploadHandwrittenNote = async (req, res) => {
  const { uuid } = req.params;
  const file = req.file;

  console.log("CONTROLLER DEBUG: Upload request received for UUID:", uuid);
  console.log("CONTROLLER DEBUG: req.user is:", req.user);

  if (!req.user || !req.user.role) {
    console.log("CONTROLLER DEBUG: Missing user or role in request");
    return res.status(401).json({ message: "Invalid token payload" });
  }

  // Only nurses can upload prescriptions
  if (req.user.role.toLowerCase() !== "nurse") {
    return res.status(403).json({
      message: "Access denied. Only nurses can upload prescriptions.",
      your_role: req.user.role
    });
  }

  if (!file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  try {
    console.log("Sending file to local Python OCR service...");

    const formData = new FormData();
    formData.append("file", file.buffer, {
      filename: file.originalname,
      contentType: file.mimetype
    });

    const ocrResponse = await axios.post(
      "http://127.0.0.1:5000/ocr",
      formData,
      { headers: formData.getHeaders() }
    );

    const { combined_text } = ocrResponse.data;

    const structuredData = combined_text
      ? await extractWithRegex(combined_text)
      : {};

    const digitizedTextObject = { text: combined_text };
    const encryptedText = encrypt(JSON.stringify(digitizedTextObject));

    const uploadsDir = path.join("uploads", "handwritten");
    fs.mkdirSync(uploadsDir, { recursive: true });

    const filename = `${Date.now()}-${uuid}.png`;
    const filepath = path.join(uploadsDir, filename);
    fs.writeFileSync(filepath, file.buffer);

    const result = await pool.query(
      `INSERT INTO medical_encounters
       (patient_uuid, date, facility_location, digitized_text, structured_data, original_image_url)
       VALUES ($1::uuid, NOW(), $2, $3::jsonb, $4::jsonb, $5)
       RETURNING encounter_id`,
      [
        uuid,
        "Clinic A",
        encryptedText,
        JSON.stringify(structuredData),
        filepath
      ]
    );

    res.json({
      message: "Handwritten note uploaded and digitized successfully",
      encounter_id: result.rows[0].encounter_id,
      digitized_text: digitizedTextObject,
      structured_data: structuredData
    });

  } catch (error) {
    console.error("UPLOAD ERROR:", error.response?.data || error.message);
    res.status(500).json({
      error: "Failed to process handwritten note",
      details: error.response?.data || error.message
    });
  }
};



export const createPatient = async (req, res) => {
  const { name, dob, biometric_hash } = req.body;

  try {
    const patientUUID = await createPatientService({
      name,
      dob,
      biometric_hash
    });

    const qrDir = path.join("uploads", "qr");
    fs.mkdirSync(qrDir, { recursive: true });

    const qrPath = path.join(qrDir, `${patientUUID}.png`);

    await QRCode.toFile(qrPath, patientUUID);

    res.status(201).json({
      patient_uuid: patientUUID,
      message: "Patient created. QR stored securely."
    });

    // QR contains ONLY the UUID
    // const qrCode = await QRCode.toDataURL(patientUUID);

    // res.status(201).json({
    //   patient_uuid: patientUUID,
    //   qr_code: qrCode
    // });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getPatient = async (req, res) => {
  const { uuid } = req.params;

  try {
    const patient = await getPatientService(uuid);

    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }

    res.json(patient);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

