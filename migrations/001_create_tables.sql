CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE patients (
    patient_uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    dob DATE,
    biometric_hash TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE medical_encounters (
    encounter_id BIGSERIAL PRIMARY KEY,
    patient_uuid UUID NOT NULL REFERENCES patients(patient_uuid),
    date DATE NOT NULL,
    facility_location TEXT,
    digitized_text TEXT,
    structured_data JSONB,
    original_image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);
