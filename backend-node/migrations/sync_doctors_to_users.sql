-- Migration: Sync existing doctors from doctors table to users table
-- This migration creates user entries for doctors that don't have them yet

-- Insert doctors into users table if they don't already exist
INSERT INTO users (id, email, password, role, is_active, email_verified, created_at, updated_at)
SELECT 
    d.id,
    d.email,
    d.password,
    'doctor' as role,
    CASE 
        WHEN d.status = 'approved' THEN true 
        ELSE false 
    END as is_active,
    CASE 
        WHEN d.status = 'approved' THEN true 
        ELSE false 
    END as email_verified,
    d.created_at,
    d.updated_at
FROM doctors d
WHERE NOT EXISTS (
    SELECT 1 FROM users u WHERE u.email = d.email
)
ON CONFLICT (email) DO NOTHING;

-- Update doctors table to link to users table
UPDATE doctors d
SET user_id = u.id
FROM users u
WHERE d.email = u.email 
AND d.user_id IS NULL;

-- Verify the sync
SELECT 
    COUNT(*) as total_doctors,
    COUNT(user_id) as doctors_with_user_id,
    COUNT(*) - COUNT(user_id) as doctors_without_user_id
FROM doctors;
