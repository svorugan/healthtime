-- HealthTime Database Migration Script
-- This script creates all tables in the correct order to handle foreign key dependencies
-- Run this script to recreate the entire database structure

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop tables in reverse dependency order (if they exist)
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS patient_vital_signs CASCADE;
DROP TABLE IF EXISTS patient_medical_history CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS doctor_surgeries CASCADE;
DROP TABLE IF EXISTS implant_users CASCADE;
DROP TABLE IF EXISTS hospital_users CASCADE;
DROP TABLE IF EXISTS implants CASCADE;
DROP TABLE IF EXISTS hospitals CASCADE;
DROP TABLE IF EXISTS surgeries CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;
DROP TABLE IF EXISTS doctors CASCADE;
DROP TABLE IF EXISTS patients CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. Create users table (base table)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'doctor', 'patient', 'hospital', 'implant')),
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    last_login TIMESTAMP,
    failed_login_attempts INTEGER DEFAULT 0,
    account_locked_until TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for users table
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);

-- 2. Create patients table
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    -- Personal Information
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    alternate_phone VARCHAR(20),
    date_of_birth DATE NOT NULL,
    age INTEGER NOT NULL,
    gender VARCHAR(10) NOT NULL,
    occupation VARCHAR(255),
    preferred_language VARCHAR(50) DEFAULT 'English',
    -- Address Information
    current_address TEXT NOT NULL,
    permanent_address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    -- Emergency Contact
    emergency_contact_name VARCHAR(255) NOT NULL,
    emergency_contact_phone VARCHAR(20) NOT NULL,
    emergency_contact_relationship VARCHAR(100),
    -- Communication Preferences
    preferred_communication VARCHAR(20) DEFAULT 'email',
    -- Insurance Information
    insurance_provider VARCHAR(255) NOT NULL,
    insurance_number VARCHAR(100) NOT NULL,
    insurance_plan_type VARCHAR(100),
    insurance_group_number VARCHAR(100),
    policy_holder_name VARCHAR(255),
    employer_name VARCHAR(255),
    secondary_insurance_provider VARCHAR(255),
    secondary_insurance_number VARCHAR(100),
    -- Insurance Files
    insurance_card_front_url VARCHAR(500),
    insurance_card_back_url VARCHAR(500),
    insurance_file_uploaded BOOLEAN DEFAULT false,
    -- Financial Information
    preferred_payment_method VARCHAR(50) DEFAULT 'insurance',
    financial_assistance_needed BOOLEAN DEFAULT false,
    insurance_preauth_status VARCHAR(50) DEFAULT 'pending',
    -- Basic Medical Information
    blood_group VARCHAR(10),
    height_cm FLOAT,
    weight_kg FLOAT,
    bmi FLOAT,
    -- Lifestyle Factors
    smoking_status VARCHAR(20),
    alcohol_consumption VARCHAR(20),
    substance_use_history TEXT,
    -- Current Health Status (JSON fields)
    current_medications JSONB,
    known_allergies JSONB,
    chronic_conditions JSONB,
    past_surgeries JSONB,
    family_medical_history JSONB,
    -- Current Symptoms
    chief_complaint TEXT,
    current_symptoms JSONB,
    symptom_duration VARCHAR(100),
    pain_scale INTEGER,
    -- Healthcare Providers
    primary_care_physician VARCHAR(255),
    referring_doctor VARCHAR(255),
    -- System Fields
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create doctors table
CREATE TABLE doctors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    -- Basic Information
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(10),
    -- Professional Information
    primary_specialization VARCHAR(255) NOT NULL,
    secondary_specializations JSONB,
    medical_council_number VARCHAR(100) NOT NULL UNIQUE,
    medical_council_state VARCHAR(100),
    license_expiry_date DATE,
    -- Experience
    experience_years INTEGER NOT NULL,
    post_masters_years INTEGER DEFAULT 0,
    bio TEXT,
    -- Fees
    consultation_fee FLOAT NOT NULL,
    surgery_fee FLOAT,
    followup_fee FLOAT,
    -- Training & Credentials
    training_type VARCHAR(50),
    fellowships INTEGER DEFAULT 0,
    procedures_completed INTEGER DEFAULT 0,
    -- Online Presence
    google_reviews_link VARCHAR(500),
    website_url VARCHAR(500),
    linkedin_url VARCHAR(500),
    -- Availability
    online_consultation BOOLEAN DEFAULT false,
    in_person_consultation BOOLEAN DEFAULT true,
    emergency_services BOOLEAN DEFAULT false,
    -- Location
    location VARCHAR(255),
    clinic_address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    -- Rating & Status
    rating FLOAT DEFAULT 0.0,
    total_reviews INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending',
    verification_status VARCHAR(20) DEFAULT 'pending',
    -- Profile Metadata
    image_url VARCHAR(500),
    profile_video_url VARCHAR(500),
    online_status BOOLEAN DEFAULT false,
    profile_completeness INTEGER DEFAULT 0,
    verification_score INTEGER DEFAULT 0,
    -- Languages
    languages_spoken JSONB,
    -- Timestamps
    last_login TIMESTAMP,
    approved_at TIMESTAMP,
    approved_by UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create admin_users table
CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Create surgeries table
CREATE TABLE surgeries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    duration VARCHAR(100),
    recovery_time VARCHAR(100),
    anesthesia_type VARCHAR(100),
    image_url VARCHAR(500),
    video_url VARCHAR(500),
    base_cost FLOAT,
    prerequisites JSONB,
    risks JSONB,
    success_rate FLOAT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Create hospitals table
CREATE TABLE hospitals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    zone VARCHAR(100),
    location VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    latitude FLOAT,
    longitude FLOAT,
    facilities JSONB,
    total_beds INTEGER,
    icu_beds INTEGER,
    operation_theaters INTEGER,
    emergency_services BOOLEAN DEFAULT true,
    ambulance_service BOOLEAN DEFAULT true,
    insurance_accepted BOOLEAN DEFAULT true,
    accreditations JSONB,
    base_price FLOAT,
    consumables_cost FLOAT,
    room_charges_per_day FLOAT,
    phone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(500),
    image_url VARCHAR(500),
    images JSONB,
    rating FLOAT DEFAULT 0.0,
    total_reviews INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending' NOT NULL,
    approved_at TIMESTAMP,
    approved_by UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Create implants table
CREATE TABLE implants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(255) NOT NULL,
    brand_type VARCHAR(100),
    manufacturer VARCHAR(255),
    material VARCHAR(255),
    surgery_type VARCHAR(255),
    expected_life VARCHAR(100),
    range_of_motion VARCHAR(100),
    peer_reviewed_studies INTEGER DEFAULT 0,
    success_rate FLOAT,
    warranty VARCHAR(100),
    price FLOAT NOT NULL,
    description TEXT,
    features JSONB,
    company_highlights JSONB,
    suitable_age VARCHAR(100),
    activity_level VARCHAR(100),
    image_url VARCHAR(500),
    brochure_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Create hospital_users table
CREATE TABLE hospital_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id),
    hospital_id UUID NOT NULL REFERENCES hospitals(id),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    designation VARCHAR(100), -- Admin, Manager, Staff
    department VARCHAR(100),
    is_primary_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Create implant_users table
CREATE TABLE implant_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    implant_id UUID NOT NULL REFERENCES implants(id),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    designation VARCHAR(100), -- Admin, Sales Rep, Manager
    is_primary_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, implant_id)
);

-- 10. Create doctor_surgeries table (many-to-many relationship)
CREATE TABLE doctor_surgeries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    surgery_id UUID NOT NULL REFERENCES surgeries(id) ON DELETE CASCADE,
    experience_years INTEGER DEFAULT 0,
    procedures_completed INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(doctor_id, surgery_id)
);

-- 11. Create bookings table
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id),
    surgery_id UUID NOT NULL REFERENCES surgeries(id),
    doctor_id UUID NOT NULL REFERENCES doctors(id),
    implant_id UUID REFERENCES implants(id),
    hospital_id UUID NOT NULL REFERENCES hospitals(id),
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    preferred_surgery_date TIMESTAMP,
    actual_surgery_date TIMESTAMP,
    status VARCHAR(50) DEFAULT 'pending',
    payment_status VARCHAR(50) DEFAULT 'pending',
    total_cost FLOAT NOT NULL,
    advance_payment FLOAT NOT NULL,
    paid_amount FLOAT DEFAULT 0.0,
    remaining_amount FLOAT,
    special_requirements TEXT,
    notes TEXT,
    confirmed_at TIMESTAMP,
    completed_at TIMESTAMP,
    cancelled_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12. Create patient_medical_history table
CREATE TABLE patient_medical_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id),
    chronic_diseases JSONB,
    past_surgeries_detailed JSONB,
    current_medications_detailed JSONB,
    allergies_detailed JSONB,
    immunization_records JSONB,
    family_history JSONB,
    medical_reports_url JSONB,
    prescription_url JSONB,
    lab_reports_url JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 13. Create patient_vital_signs table
CREATE TABLE patient_vital_signs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id),
    blood_pressure_systolic INTEGER,
    blood_pressure_diastolic INTEGER,
    heart_rate INTEGER,
    temperature FLOAT,
    respiratory_rate INTEGER,
    oxygen_saturation FLOAT,
    blood_glucose FLOAT,
    weight_kg FLOAT,
    height_cm FLOAT,
    bmi FLOAT,
    measured_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    measured_by VARCHAR(255),
    measurement_context VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 14. Create notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info' NOT NULL, -- info, success, warning, error
    category VARCHAR(50) DEFAULT 'system', -- booking, appointment, payment, system, etc.
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    action_url VARCHAR(500), -- URL to navigate when notification is clicked
    metadata JSONB, -- Additional data (booking_id, etc.)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for notifications table
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply the trigger to tables that have updated_at column
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_doctors_updated_at BEFORE UPDATE ON doctors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_surgeries_updated_at BEFORE UPDATE ON surgeries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_hospitals_updated_at BEFORE UPDATE ON hospitals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_implants_updated_at BEFORE UPDATE ON implants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_hospital_users_updated_at BEFORE UPDATE ON hospital_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_implant_users_updated_at BEFORE UPDATE ON implant_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_doctor_surgeries_updated_at BEFORE UPDATE ON doctor_surgeries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_patient_medical_history_updated_at BEFORE UPDATE ON patient_medical_history FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user (password should be hashed in production)
-- Default password: 'admin123' (you should change this immediately)
INSERT INTO users (id, email, password, role, is_active, email_verified) 
VALUES (
    uuid_generate_v4(),
    'admin@healthtime.com',
    '$2b$10$rOzJqKqJqKqJqKqJqKqJqOzJqKqJqKqJqKqJqKqJqKqJqKqJqKqJq', -- This is a placeholder hash
    'admin',
    true,
    true
);

-- Success message
SELECT 'Database tables created successfully!' as status;
