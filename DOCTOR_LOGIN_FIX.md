# Doctor Login Issue - Fix Guide

## Problem Summary

**Issue**: Unable to login with doctor credentials `dr.sharma@healthtime.com` / `doctor123`

**Error**: `{"detail": "Invalid credentials", "message": "Email or password is incorrect"}`

**Root Cause**: The doctor account exists in both `users` and `doctors` tables, but the account is **inactive** (`is_active = false`) because it's pending admin approval.

## Why This Happens

When doctors register using `/api/auth/register/doctor`, the system:
1. Creates an entry in the `users` table with `is_active: false`
2. Creates an entry in the `doctors` table with `status: 'pending'`
3. Requires admin approval before the account can be used

The login endpoint `/api/auth/login` only returns active users:
```javascript
const user = await User.findActiveByEmail(email);
```

## Solutions

### Option 1: Use Admin API to Approve Doctor (Recommended)

**Step 1**: First, login as an admin to get an access token:
```bash
POST /api/auth/login
{
  "email": "admin@healthtime.com",
  "password": "admin123"
}
```

**Step 2**: Use the admin token to approve the doctor:
```bash
PATCH /api/admin/doctors/e58956a0-0e7d-4bbf-809e-b0bac2d71495/approve
Authorization: Bearer <admin_token>
```

This will now:
- Set `doctors.status = 'approved'`
- Set `doctors.verification_status = 'verified'`
- Set `users.is_active = true`
- Set `users.email_verified = true`

### Option 2: Run SQL Script Directly

Execute the SQL script I created:

```bash
psql -U postgres -d healthtime -f backend-node/migrations/approve_doctor_for_testing.sql
```

Or run this SQL directly in your database:

```sql
-- Activate user account
UPDATE users 
SET 
    is_active = true,
    email_verified = true,
    updated_at = CURRENT_TIMESTAMP
WHERE email = 'dr.sharma@healthtime.com';

-- Approve doctor
UPDATE doctors 
SET 
    status = 'approved',
    verification_status = 'verified',
    approved_at = CURRENT_TIMESTAMP,
    updated_at = CURRENT_TIMESTAMP
WHERE email = 'dr.sharma@healthtime.com';
```

### Option 3: Create Admin Account First (If No Admin Exists)

If you don't have an admin account, register one:

```bash
POST /api/auth/register/admin
{
  "email": "admin@healthtime.com",
  "password": "admin123",
  "full_name": "System Admin"
}
```

Admin accounts are automatically activated upon creation.

## After Approval

Once the doctor is approved, you can login successfully:

```bash
POST /api/auth/login
{
  "email": "dr.sharma@healthtime.com",
  "password": "doctor123"
}
```

Expected response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user_role": "doctor",
  "user_id": "e58956a0-0e7d-4bbf-809e-b0bac2d71495",
  "email": "dr.sharma@healthtime.com"
}
```

## Code Changes Made

I've fixed the admin approval endpoint in `backend-node/src/routes/admin.js` to properly activate the user account when approving a doctor. Previously, it only updated the `doctors` table but forgot to activate the account in the `users` table.

## Files Created

1. **`migrations/approve_doctor_for_testing.sql`** - SQL script to manually approve a doctor
2. **`migrations/sync_doctors_to_users.sql`** - SQL script to sync legacy doctors (if needed)
3. **`DOCTOR_LOGIN_FIX.md`** - This documentation

## Verification Query

To check the status of any doctor account:

```sql
SELECT 
    u.id,
    u.email,
    u.role,
    u.is_active,
    u.email_verified,
    d.status as doctor_status,
    d.verification_status,
    d.full_name
FROM users u
LEFT JOIN doctors d ON u.id = d.user_id
WHERE u.email = 'dr.sharma@healthtime.com';
```

Expected result after approval:
- `is_active`: `true`
- `email_verified`: `true`
- `doctor_status`: `approved`
- `verification_status`: `verified`
