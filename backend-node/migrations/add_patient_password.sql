-- Add password column to patients table for authentication
-- This migration adds support for patient login functionality

ALTER TABLE patients ADD COLUMN IF NOT EXISTS password VARCHAR(255);

-- Add comment to explain the column
COMMENT ON COLUMN patients.password IS 'Hashed password for patient authentication (bcrypt)';

-- Note: Existing patients without passwords will have NULL values
-- They will need to set a password through password reset or re-registration
