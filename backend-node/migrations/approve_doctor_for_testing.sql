-- Script to approve a doctor and activate their account for testing
-- Replace the email with the doctor you want to approve

-- Update the users table to activate the account
UPDATE users 
SET 
    is_active = true,
    email_verified = true,
    updated_at = CURRENT_TIMESTAMP
WHERE email = 'dr.sharma@healthtime.com';

-- Update the doctors table to approve the doctor
UPDATE doctors 
SET 
    status = 'approved',
    verification_status = 'verified',
    approved_at = CURRENT_TIMESTAMP,
    updated_at = CURRENT_TIMESTAMP
WHERE email = 'dr.sharma@healthtime.com';

-- Verify the changes
SELECT 
    u.id,
    u.email,
    u.role,
    u.is_active,
    u.email_verified,
    d.status as doctor_status,
    d.verification_status
FROM users u
LEFT JOIN doctors d ON u.id = d.user_id
WHERE u.email = 'dr.sharma@healthtime.com';
