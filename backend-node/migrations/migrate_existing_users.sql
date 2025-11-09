-- Migration script to move existing users to centralized users table
-- Run this AFTER creating the users table

-- WARNING: This script should be run with caution
-- Make sure to backup your database before running this migration

BEGIN;

-- Migrate admin users
INSERT INTO users (id, email, password, role, is_active, email_verified, created_at, updated_at)
SELECT 
    id,
    email,
    password,
    'admin' as role,
    true as is_active,
    true as email_verified,
    created_at,
    COALESCE(created_at, CURRENT_TIMESTAMP) as updated_at
FROM admin_users
ON CONFLICT (email) DO NOTHING;

-- Update admin_users with user_id reference
UPDATE admin_users au
SET user_id = u.id
FROM users u
WHERE au.email = u.email AND u.role = 'admin';

-- Migrate doctors
INSERT INTO users (id, email, password, role, is_active, email_verified, created_at, updated_at)
SELECT 
    id,
    email,
    password,
    'doctor' as role,
    CASE WHEN status = 'approved' THEN true ELSE false END as is_active,
    CASE WHEN verification_status = 'verified' THEN true ELSE false END as email_verified,
    created_at,
    COALESCE(updated_at, created_at, CURRENT_TIMESTAMP) as updated_at
FROM doctors
ON CONFLICT (email) DO NOTHING;

-- Update doctors with user_id reference
UPDATE doctors d
SET user_id = u.id
FROM users u
WHERE d.email = u.email AND u.role = 'doctor';

-- Migrate patients (only those with passwords)
INSERT INTO users (id, email, password, role, is_active, email_verified, created_at, updated_at)
SELECT 
    id,
    email,
    password,
    'patient' as role,
    true as is_active,
    false as email_verified,
    created_at,
    COALESCE(updated_at, created_at, CURRENT_TIMESTAMP) as updated_at
FROM patients
WHERE password IS NOT NULL AND password != ''
ON CONFLICT (email) DO NOTHING;

-- Update patients with user_id reference
UPDATE patients p
SET user_id = u.id
FROM users u
WHERE p.email = u.email AND u.role = 'patient';

-- Verify migration
DO $$
DECLARE
    admin_count INTEGER;
    doctor_count INTEGER;
    patient_count INTEGER;
    total_users INTEGER;
BEGIN
    SELECT COUNT(*) INTO admin_count FROM users WHERE role = 'admin';
    SELECT COUNT(*) INTO doctor_count FROM users WHERE role = 'doctor';
    SELECT COUNT(*) INTO patient_count FROM users WHERE role = 'patient';
    SELECT COUNT(*) INTO total_users FROM users;
    
    RAISE NOTICE 'Migration Summary:';
    RAISE NOTICE '  Admins migrated: %', admin_count;
    RAISE NOTICE '  Doctors migrated: %', doctor_count;
    RAISE NOTICE '  Patients migrated: %', patient_count;
    RAISE NOTICE '  Total users: %', total_users;
END $$;

COMMIT;

-- After successful migration and testing, you can optionally remove
-- email and password columns from the profile tables:
-- ALTER TABLE admin_users DROP COLUMN email, DROP COLUMN password;
-- ALTER TABLE doctors DROP COLUMN email, DROP COLUMN password;
-- ALTER TABLE patients DROP COLUMN email, DROP COLUMN password;
