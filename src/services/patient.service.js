import pool from "../config/database.js";


export const createPatientService = async ({ name, dob, biometric_hash }) => {
  const result = await pool.query(
    `INSERT INTO patients (name, dob, biometric_hash)
     VALUES ($1, $2, $3)
     RETURNING patient_uuid`,
    [name, dob, biometric_hash]
  );

  return result.rows[0].patient_uuid;
};

export const patientExists = async (patientUUID) => {
  const result = await pool.query(
    "SELECT 1 FROM patients WHERE patient_uuid = $1",
    [patientUUID]
  );

  return result.rowCount > 0;
};

export const getPatientService = async (uuid) => {
  console.log("Password:", process.env.DB_PASSWORD);
  
  console.log("Fetching patient with UUID:", uuid);

  const result = await pool.query(
    `SELECT patient_uuid, name, dob
     FROM patients
     WHERE patient_uuid = $1`,
    [uuid]
  );

  console.log("Query result:", result.rows);

  return result.rows[0];
};

