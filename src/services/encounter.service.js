import pool from "../config/database.js";


export const createEncounter = async ({
  patient_uuid,
  date,
  facility_location,
  digitized_text,
  structured_data,
  original_image_url
}) => {
  const result = await pool.query(
    `INSERT INTO medical_encounters (
        patient_uuid,
        date,
        facility_location,
        digitized_text,
        structured_data,
        original_image_url
     )
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING encounter_id`,
    [
      patient_uuid,
      date,
      facility_location,
      digitized_text,
      structured_data,
      original_image_url
    ]
  );

  return result.rows[0];
};

export const getEncountersByPatient = async (patientUUID) => {
  const result = await pool.query(
    `SELECT
        encounter_id,
        date,
        facility_location,
        digitized_text,
        structured_data,
        original_image_url,
        created_at
     FROM medical_encounters
     WHERE patient_uuid = $1
     ORDER BY date DESC`,
    [patientUUID]
  );

  return result.rows;
};
