UPDATE users 
SET 
    is_active = true,
    email_verified = true,
    updated_at = CURRENT_TIMESTAMP
WHERE email = 'dr.sharma@healthtime.com';

UPDATE doctors 
SET 
    status = 'approved',
    verification_status = 'verified',
    approved_at = CURRENT_TIMESTAMP,
    updated_at = CURRENT_TIMESTAMP
WHERE user_id = 'e58956a0-0e7d-4bbf-809e-b0bac2d71495';

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

commit;