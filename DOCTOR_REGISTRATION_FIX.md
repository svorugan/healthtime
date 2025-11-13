# Doctor Registration Fix - Email Column Issue

## Problem
The POST endpoint `http://localhost:8000/api/auth/register/doctor` was failing with error:
```json
{
    "detail": "Registration failed",
    "message": "column \"email\" does not exist"
}
```

## Root Cause
The application migrated to a centralized authentication system where:
1. **Users table** stores `email`, `password`, and `role` for all user types
2. **Doctors table** no longer has `email` and `password` columns (they were removed after migration)
3. The Doctor model still defined `email` and `password` fields
4. The registration endpoints were trying to insert `email` and `password` into the `doctors` table

## Changes Made

### 1. Updated Doctor Model (`backend-node/src/models/Doctor.js`)
- **Removed**: `email` and `password` fields from the Doctor model definition
- **Kept**: `user_id` foreign key reference to the `users` table
- The model now correctly reflects the database schema after migration

### 2. Fixed Doctor Registration Endpoint (`backend-node/src/routes/auth-centralized.js`)

#### Basic Doctor Registration (`/api/auth/register/doctor`)
- Already had the correct implementation using transactions
- Creates User first, then creates Doctor profile
- Properly excludes `email` and `password` from doctor profile data

#### Enhanced Doctor Registration (`/api/auth/register/doctor/enhanced`)
- **Updated**: Email validation now checks the `users` table instead of `doctors` table
- **Added**: Transaction-based approach to create User and Doctor atomically
- **Fixed**: Excluded `email` and `password` from doctor profile data
- **Improved**: Returns both `user_id` and `doctor_id` in response

## How It Works Now

### Registration Flow:
1. **Validate** email doesn't exist in `users` table
2. **Validate** medical_council_number doesn't exist in `doctors` table
3. **Create User** record with email, password, and role='doctor'
4. **Create Doctor** profile with professional details and `user_id` reference
5. **Calculate** profile completeness
6. **Return** success response with user_id and doctor_id

### Database Schema:
```
users table:
- id (UUID, primary key)
- email (unique)
- password (hashed)
- role ('doctor')
- is_active (false until approved)
- email_verified

doctors table:
- id (UUID, primary key)
- user_id (UUID, foreign key to users.id)
- full_name
- phone
- primary_specialization
- medical_council_number (unique)
- ... other professional fields
- NO email or password columns
```

## Testing
To test the fix:
1. Start the backend server: `npm start`
2. Send POST request to `http://localhost:8000/api/auth/register/doctor`
3. Include required fields: email, password, full_name, primary_specialization, medical_council_number, phone, experience_years, consultation_fee
4. Should receive 201 response with user_id and doctor_id

## Notes
- Legacy auth routes (`/api/auth/legacy/*`) still have the old implementation but are not used by default
- The main endpoint `/api/auth/register/doctor` uses the centralized auth approach
- Doctors are created with `is_active: false` and require admin approval
