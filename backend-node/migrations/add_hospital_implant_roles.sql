-- Migration: Add Hospital and Implant User Roles
-- This migration adds support for hospital and implant user roles

-- Step 1: Update users table to allow new roles (if constraint exists, drop and recreate)
-- Note: This may need to be done via ALTER TABLE depending on your PostgreSQL version

-- Step 2: Create hospital_users table
CREATE TABLE IF NOT EXISTS hospital_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    designation VARCHAR(100),
    department VARCHAR(100),
    is_primary_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Step 3: Create implant_users table
CREATE TABLE IF NOT EXISTS implant_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    implant_id UUID NOT NULL REFERENCES implants(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    designation VARCHAR(100),
    is_primary_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Step 4: Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_hospital_users_user_id ON hospital_users(user_id);
CREATE INDEX IF NOT EXISTS idx_hospital_users_hospital_id ON hospital_users(hospital_id);
CREATE INDEX IF NOT EXISTS idx_implant_users_user_id ON implant_users(user_id);
CREATE INDEX IF NOT EXISTS idx_implant_users_implant_id ON implant_users(implant_id);

-- Step 5: Add status column to hospitals table if it doesn't exist (for approval workflow)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'hospitals' AND column_name = 'status'
    ) THEN
        ALTER TABLE hospitals ADD COLUMN status VARCHAR(20) DEFAULT 'pending';
    END IF;
END $$;

-- Step 6: Add status column to implants table if it doesn't exist (for approval workflow)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'implants' AND column_name = 'status'
    ) THEN
        ALTER TABLE implants ADD COLUMN status VARCHAR(20) DEFAULT 'pending';
    END IF;
END $$;

-- Note: The role validation in the User model will be updated in the application code
-- PostgreSQL doesn't enforce ENUM constraints the same way, so the application-level validation is sufficient

