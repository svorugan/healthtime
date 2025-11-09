-- Migration: Add Doctor-Surgery Junction Table
-- This migration creates a many-to-many relationship between doctors and surgeries

-- Step 1: Create doctor_surgeries junction table
CREATE TABLE IF NOT EXISTS doctor_surgeries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    surgery_id UUID NOT NULL REFERENCES surgeries(id) ON DELETE CASCADE,
    experience_years INTEGER DEFAULT 0,
    procedures_completed INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(doctor_id, surgery_id)
);

-- Step 2: Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_doctor_surgeries_doctor_id ON doctor_surgeries(doctor_id);
CREATE INDEX IF NOT EXISTS idx_doctor_surgeries_surgery_id ON doctor_surgeries(surgery_id);
CREATE INDEX IF NOT EXISTS idx_doctor_surgeries_is_primary ON doctor_surgeries(is_primary) WHERE is_primary = TRUE;

-- Step 3: Add comment for documentation
COMMENT ON TABLE doctor_surgeries IS 'Junction table linking doctors to the surgery types they can perform';

