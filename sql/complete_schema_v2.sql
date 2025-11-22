-- HealthTime Complete Database Schema v2.0
-- Clean implementation with multi-authentication and landing page support
-- This script creates all tables from scratch with the latest requirements

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop all tables in reverse dependency order (clean slate)
DROP TABLE IF EXISTS landing_page_analytics CASCADE;
DROP TABLE IF EXISTS service_tiles CASCADE;
DROP TABLE IF EXISTS featured_content CASCADE;
DROP TABLE IF EXISTS hospital_reviews CASCADE;
DROP TABLE IF EXISTS doctor_reviews CASCADE;
DROP TABLE IF EXISTS feature_configurations CASCADE;
DROP TABLE IF EXISTS patient_testimonials CASCADE;
DROP TABLE IF EXISTS patient_vital_signs CASCADE;
DROP TABLE IF EXISTS patient_medical_history CASCADE;
DROP TABLE IF EXISTS doctor_notifications CASCADE;
DROP TABLE IF EXISTS doctor_publications CASCADE;
DROP TABLE IF EXISTS doctor_experience CASCADE;
DROP TABLE IF EXISTS doctor_education CASCADE;
DROP TABLE IF EXISTS doctor_availability CASCADE;
DROP TABLE IF EXISTS doctor_media CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS doctor_surgeries CASCADE;
DROP TABLE IF EXISTS implant_users CASCADE;
DROP TABLE IF EXISTS hospital_users CASCADE;
DROP TABLE IF EXISTS implants CASCADE;
DROP TABLE IF EXISTS hospitals CASCADE;
DROP TABLE IF EXISTS surgeries CASCADE;
-- DROP TABLE IF EXISTS admin_users CASCADE; -- removed - using unified users table
DROP TABLE IF EXISTS doctors CASCADE;
DROP TABLE IF EXISTS patients CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. Create users table with multi-authentication support
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255), -- Nullable for SSO-only users
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'backend_user', 'doctor', 'patient', 'hospital_admin', 'implant_admin')),
    
    -- Multi-Authentication Fields
    auth_provider VARCHAR(20) DEFAULT 'database' CHECK (auth_provider IN ('database', 'google', 'apple', 'microsoft', 'otp', 'hybrid')),
    auth_provider_id VARCHAR(100), -- External provider ID (same as 'id' for database users)
    is_sso_user BOOLEAN DEFAULT FALSE,
    
    -- OTP Authentication Fields
    phone_verified BOOLEAN DEFAULT FALSE,
    phone_verification_code VARCHAR(10),
    phone_verification_expires TIMESTAMP,
    email_verification_code VARCHAR(10),
    email_verification_expires TIMESTAMP,
    otp_login_enabled BOOLEAN DEFAULT FALSE,
    
    -- Account Management
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    last_login TIMESTAMP,
    failed_login_attempts INTEGER DEFAULT 0,
    account_locked_until TIMESTAMP,
    
    -- GDPR Compliance Fields
    deleted_at TIMESTAMP,
    deletion_reason VARCHAR(100),
    gdpr_deletion_requested_at TIMESTAMP,
    data_retention_until TIMESTAMP,
    
    -- Consent Management
    consent_marketing BOOLEAN DEFAULT false,
    consent_analytics BOOLEAN DEFAULT true,
    consent_updated_at TIMESTAMP,
    full_name VARCHAR(255), -- Added for admin users (no separate admin_users table)
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for users table
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_auth_provider_id ON users(auth_provider_id) WHERE auth_provider_id IS NOT NULL;
CREATE INDEX idx_users_deleted_at ON users(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX idx_users_gdpr_deletion ON users(gdpr_deletion_requested_at) WHERE gdpr_deletion_requested_at IS NOT NULL;
CREATE INDEX idx_users_retention ON users(data_retention_until) WHERE data_retention_until IS NOT NULL;

-- 2. Create patients table
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Personal Information
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    middle_names VARCHAR(255),
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
    
    -- Insurance Information (India + USA Compatible)
    insurance_provider VARCHAR(255) NOT NULL,
    insurance_policy_number VARCHAR(100) NOT NULL, -- Policy number (India) / Member ID (USA)
    insurance_type VARCHAR(50) DEFAULT 'individual', -- individual, family, corporate, government
    insurance_scheme VARCHAR(100), -- Ayushman Bharat, CGHS, ESIC, Private
    sum_insured DECIMAL(10,2), -- Coverage amount (critical for India)
    policy_start_date DATE,
    policy_end_date DATE,
    
    -- USA-specific fields (optional for Indian users)
    insurance_group_number VARCHAR(100), -- For USA corporate insurance
    employer_name VARCHAR(255), -- For USA employer-based insurance
    
    -- Secondary Insurance (less common in India)
    secondary_insurance_provider VARCHAR(255),
    secondary_insurance_number VARCHAR(100),
    
    -- Policy Holder Information
    policy_holder_name VARCHAR(255),
    policy_holder_relationship VARCHAR(50) DEFAULT 'self', -- self, spouse, parent, child
    
    -- Insurance Files (Images/Documents)
    insurance_card_front_url VARCHAR(500), -- Image: Front of insurance card (JPG/PNG)
    insurance_card_back_url VARCHAR(500),  -- Image: Back of insurance card (JPG/PNG)
    policy_document_url VARCHAR(500),      -- PDF: Complete insurance policy document
    coverage_summary_url VARCHAR(500),     -- PDF: Benefits summary document
    id_proof_url VARCHAR(500),             -- Image: Aadhaar/PAN for verification
    insurance_files_metadata JSONB,        -- File details: sizes, upload dates, file types
    insurance_file_uploaded BOOLEAN DEFAULT false, -- Flag: Any insurance file uploaded
    
    -- Financial Information (Patient Input)
    preferred_payment_method VARCHAR(50) DEFAULT 'insurance', -- Patient selects: insurance, cash, card, upi, emi
    financial_assistance_needed BOOLEAN DEFAULT false, -- Patient indicates if they need financial help
    
    -- Backend/System Managed Fields (Updated by staff/system)
    cashless_facility_available BOOLEAN DEFAULT false, -- System determines from hospital-insurance network
    insurance_preauth_status VARCHAR(50) DEFAULT 'pending', -- Insurance coordinator updates: pending, approved, rejected, not_required
    tpa_name VARCHAR(255), -- Auto-populated from insurance provider master data
    network_hospital_status VARCHAR(20) DEFAULT 'unknown', -- System determines: network, non_network, unknown
    insurance_verification_status VARCHAR(20) DEFAULT 'pending', -- Staff updates: pending, verified, invalid
    estimated_coverage_amount DECIMAL(10,2), -- System calculates based on treatment and policy
    patient_liability_amount DECIMAL(10,2), -- System calculates co-pay/deductible amount
    
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
    
    -- Flexible Extension Fields (for future additions without schema changes)
    additional_medical_info JSONB, -- Medical extensions
    preferences JSONB, -- User preferences and settings
    custom_attributes JSONB, -- Deployment-specific custom fields
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for patients table
CREATE INDEX idx_patients_user_id ON patients(user_id);
CREATE INDEX idx_patients_phone ON patients(phone);

-- Create GIN indexes for JSONB fields (for efficient querying)
CREATE INDEX idx_patients_additional_medical_info ON patients USING GIN (additional_medical_info);
CREATE INDEX idx_patients_preferences ON patients USING GIN (preferences);
CREATE INDEX idx_patients_custom_attributes ON patients USING GIN (custom_attributes);

-- 3. Create doctors table with landing page support
CREATE TABLE doctors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    
    -- Basic Information
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    middle_names VARCHAR(255),
    phone VARCHAR(20) NOT NULL,
    alternate_phone VARCHAR(20),
    date_of_birth DATE,
    gender VARCHAR(10),
    
    -- Professional Information
    medical_license_number VARCHAR(100) NOT NULL UNIQUE,
    license_issuing_authority VARCHAR(255),
    license_expiry_date DATE,
    years_of_experience INTEGER,
    
    -- Specialization
    primary_specialization VARCHAR(255) NOT NULL,
    secondary_specializations JSONB,
    subspecialties JSONB,
    
    -- Contact Information
    email VARCHAR(255) NOT NULL,
    clinic_address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    
    -- Professional Details
    consultation_fee DECIMAL(10,2),
    follow_up_fee DECIMAL(10,2),
    emergency_consultation_available BOOLEAN DEFAULT false,
    telemedicine_available BOOLEAN DEFAULT false,
    
    -- Verification Status
    verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
    verification_notes TEXT,
    verified_at TIMESTAMP,
    verified_by UUID REFERENCES users(id),
    
    -- Landing Page Features
    is_featured BOOLEAN DEFAULT false,
    feature_display_order INTEGER,
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INTEGER DEFAULT 0,
    success_rate DECIMAL(5,2),
    profile_image_url VARCHAR(500),
    bio TEXT,
    
    -- Availability
    consultation_hours JSONB,
    available_days JSONB,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for doctors table
CREATE INDEX idx_doctors_user_id ON doctors(user_id);
CREATE INDEX idx_doctors_specialization ON doctors(primary_specialization);
CREATE INDEX idx_doctors_verification ON doctors(verification_status);

-- 4. Create surgeries table
CREATE TABLE surgeries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100),
    duration_hours DECIMAL(4,2),
    anesthesia_type VARCHAR(50),
    recovery_time_days INTEGER,
    success_rate DECIMAL(5,2),
    risk_level VARCHAR(20) CHECK (risk_level IN ('low', 'medium', 'high')),
    base_cost DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for surgeries table
CREATE INDEX idx_surgeries_category ON surgeries(category);

-- 6. Create hospitals table with landing page support
CREATE TABLE hospitals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    zone VARCHAR(100),
    
    -- Contact Information
    phone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(500),
    
    -- Address
    address TEXT NOT NULL,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    country VARCHAR(100) DEFAULT 'India',
    
    -- Geo-location for nearby search
    latitude DECIMAL(10, 8), -- Hospital latitude
    longitude DECIMAL(11, 8), -- Hospital longitude
    geo_accuracy VARCHAR(20) DEFAULT 'approximate', -- exact, approximate, city_level
    location_verified BOOLEAN DEFAULT FALSE, -- Staff verified location
    
    -- Hospital Details
    hospital_type VARCHAR(100),
    bed_capacity INTEGER,
    established_year INTEGER,
    accreditations JSONB,
    
    -- Services
    services_offered JSONB,
    emergency_services BOOLEAN DEFAULT false,
    ambulance_services BOOLEAN DEFAULT false,
    
    -- Landing Page Features
    is_featured BOOLEAN DEFAULT false,
    feature_display_order INTEGER,
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INTEGER DEFAULT 0,
    hospital_image_url VARCHAR(500),
    specialties JSONB,
    
    -- Status
    approval_status VARCHAR(20) DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
    is_active BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for hospitals table
CREATE INDEX idx_hospitals_city ON hospitals(city);
CREATE INDEX idx_hospitals_approval ON hospitals(approval_status);
CREATE INDEX idx_hospitals_featured ON hospitals(is_featured, feature_display_order) WHERE is_featured = true;

-- Geo-location indexes for nearby search
CREATE INDEX idx_hospitals_location ON hospitals(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
CREATE INDEX idx_hospitals_city_state ON hospitals(city, state);

-- 7. Create implants table
CREATE TABLE implants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(255) NOT NULL,
    manufacturer VARCHAR(255) NOT NULL,
    model_number VARCHAR(100),
    material VARCHAR(255),
    size_specifications JSONB,
    weight_grams DECIMAL(8,2),
    biocompatibility_rating VARCHAR(50),
    fda_approved BOOLEAN DEFAULT false,
    ce_marked BOOLEAN DEFAULT false,
    shelf_life_years INTEGER,
    sterilization_method VARCHAR(100),
    price DECIMAL(10,2),
    currency VARCHAR(10) DEFAULT 'INR',
    success_rate DECIMAL(5,2),
    complications_rate DECIMAL(5,2),
    surgery_compatibility JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for implants table
CREATE INDEX idx_implants_brand ON implants(brand);
CREATE INDEX idx_implants_name ON implants(name);

-- 8. Create hospital_users table (junction table)
CREATE TABLE hospital_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id),
    hospital_id UUID NOT NULL REFERENCES hospitals(id),
    role VARCHAR(50) DEFAULT 'admin',
    permissions JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for hospital_users table
CREATE INDEX idx_hospital_users_user_id ON hospital_users(user_id);
CREATE INDEX idx_hospital_users_hospital_id ON hospital_users(hospital_id);

-- 9. Create implant_users table (junction table)
CREATE TABLE implant_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    implant_id UUID NOT NULL REFERENCES implants(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, implant_id)
);

-- Create indexes for implant_users table
CREATE INDEX idx_implant_users_user_id ON implant_users(user_id);
CREATE INDEX idx_implant_users_implant_id ON implant_users(implant_id);

-- 10. Create hospital_availability table (Hospital offers their facilities)
CREATE TABLE hospital_availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
    
    -- Facility Details
    facility_type VARCHAR(50) NOT NULL, -- 'operation_theater', 'consultation_room', 'diagnostic_center'
    facility_name VARCHAR(100), -- 'OT-1', 'Cardiac OT', 'General Consultation Room-A'
    specialization_supported JSONB, -- ["orthopedic", "cardiac", "general"]
    equipment_available JSONB, -- ["c_arm", "arthroscopy", "robotic_surgery"]
    
    -- Availability
    available_date DATE NOT NULL,
    available_time_slots JSONB NOT NULL, -- [{"start": "09:00", "end": "12:00", "status": "available"}]
    
    -- Pricing
    facility_cost_per_hour DECIMAL(10,2),
    equipment_cost DECIMAL(10,2),
    support_staff_cost DECIMAL(10,2),
    total_package_cost DECIMAL(10,2),
    
    -- Status
    is_available BOOLEAN DEFAULT true,
    booking_lead_time_hours INTEGER DEFAULT 24, -- Minimum hours notice required
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for hospital_availability table
CREATE INDEX idx_hospital_availability_hospital_id ON hospital_availability(hospital_id);
CREATE INDEX idx_hospital_availability_date ON hospital_availability(available_date);
CREATE INDEX idx_hospital_availability_facility ON hospital_availability(facility_type);
CREATE INDEX idx_hospital_availability_specialization ON hospital_availability USING GIN (specialization_supported);

-- 11. Create doctor_availability table (Doctors offer their services)
CREATE TABLE doctor_availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    
    -- Availability Details
    available_date DATE NOT NULL,
    available_time_slots JSONB NOT NULL, -- [{"start": "09:00", "end": "17:00", "status": "available"}]
    
    -- Location Flexibility
    willing_to_travel BOOLEAN DEFAULT false,
    max_travel_distance_km INTEGER DEFAULT 0, -- 0 = local only, 500 = willing to fly
    preferred_cities JSONB, -- ["Chennai", "Bangalore", "Hyderabad"]
    
    -- Service Details
    consultation_fee DECIMAL(10,2),
    surgery_fee DECIMAL(10,2),
    travel_allowance DECIMAL(10,2), -- If traveling to different city
    
    -- Requirements
    required_equipment JSONB, -- ["c_arm", "arthroscopy_equipment"]
    required_support_staff INTEGER DEFAULT 2,
    
    -- Status
    is_available BOOLEAN DEFAULT true,
    booking_lead_time_hours INTEGER DEFAULT 48, -- Minimum hours notice required
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for doctor_availability table
CREATE INDEX idx_doctor_availability_doctor_id ON doctor_availability(doctor_id);
CREATE INDEX idx_doctor_availability_date ON doctor_availability(available_date);
CREATE INDEX idx_doctor_availability_travel ON doctor_availability(willing_to_travel) WHERE willing_to_travel = true;

-- 10. Create doctor_surgeries table (many-to-many relationship)
CREATE TABLE doctor_surgeries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    surgery_id UUID NOT NULL REFERENCES surgeries(id) ON DELETE CASCADE,
    experience_years INTEGER,
    cases_performed INTEGER DEFAULT 0,
    success_rate DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(doctor_id, surgery_id)
);

-- Create indexes for doctor_surgeries table
CREATE INDEX idx_doctor_surgeries_doctor_id ON doctor_surgeries(doctor_id);
CREATE INDEX idx_doctor_surgeries_surgery_id ON doctor_surgeries(surgery_id);

-- 11. Create bookings table
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id),
    doctor_id UUID NOT NULL REFERENCES doctors(id),
    surgery_id UUID REFERENCES surgeries(id),
    hospital_id UUID REFERENCES hospitals(id),
    implant_id UUID REFERENCES implants(id),
    
    -- Booking Details
    booking_date DATE NOT NULL,
    booking_time TIME NOT NULL,
    consultation_type VARCHAR(50) DEFAULT 'in-person',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    
    -- Cost Information
    consultation_fee DECIMAL(10,2),
    surgery_cost DECIMAL(10,2),
    implant_cost DECIMAL(10,2),
    hospital_charges DECIMAL(10,2),
    total_cost DECIMAL(10,2),
    
    -- Additional Information
    notes TEXT,
    special_requirements TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for bookings table
CREATE INDEX idx_bookings_patient_id ON bookings(patient_id);
CREATE INDEX idx_bookings_doctor_id ON bookings(doctor_id);
CREATE INDEX idx_bookings_date ON bookings(booking_date);
CREATE INDEX idx_bookings_status ON bookings(status);

-- 12. Create patient_medical_history table
CREATE TABLE patient_medical_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id),
    chronic_diseases JSONB,
    past_surgeries JSONB,
    current_medications JSONB,
    allergies JSONB,
    family_history JSONB,
    lifestyle_factors JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for patient_medical_history table
CREATE INDEX idx_patient_medical_history_patient_id ON patient_medical_history(patient_id);

-- 13. Create patient_vital_signs table
CREATE TABLE patient_vital_signs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id),
    blood_pressure_systolic INTEGER,
    blood_pressure_diastolic INTEGER,
    heart_rate INTEGER,
    temperature_celsius DECIMAL(4,2),
    respiratory_rate INTEGER,
    oxygen_saturation DECIMAL(5,2),
    weight_kg DECIMAL(5,2),
    height_cm DECIMAL(5,2),
    bmi DECIMAL(4,2),
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    recorded_by UUID REFERENCES users(id)
);

-- Create indexes for patient_vital_signs table
CREATE INDEX idx_patient_vital_signs_patient_id ON patient_vital_signs(patient_id);
CREATE INDEX idx_patient_vital_signs_recorded_at ON patient_vital_signs(recorded_at);

-- 14. Create patient_testimonials table with landing page support
CREATE TABLE patient_testimonials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id UUID NOT NULL REFERENCES doctors(id),
    patient_id UUID REFERENCES patients(id),
    hospital_id UUID REFERENCES hospitals(id),
    booking_id UUID REFERENCES bookings(id),
    
    -- Testimonial Content
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    testimonial_text TEXT NOT NULL,
    treatment_type VARCHAR(255),
    
    -- Landing Page Features
    is_featured BOOLEAN DEFAULT false,
    display_order INTEGER,
    region VARCHAR(10) DEFAULT 'global',
    consent_for_display BOOLEAN DEFAULT false,
    
    -- Privacy
    is_anonymous BOOLEAN DEFAULT false,
    patient_name_display VARCHAR(255), -- For anonymous testimonials
    
    -- Status
    is_verified BOOLEAN DEFAULT false,
    verified_at TIMESTAMP,
    verified_by UUID REFERENCES users(id),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for patient_testimonials table
CREATE INDEX idx_testimonials_doctor_id ON patient_testimonials(doctor_id);
CREATE INDEX idx_testimonials_featured ON patient_testimonials(is_featured, display_order) WHERE is_featured = true;

-- 15. Create doctor_reviews table
CREATE TABLE doctor_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id UUID NOT NULL REFERENCES doctors(id),
    patient_id UUID REFERENCES patients(id),
    booking_id UUID REFERENCES bookings(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    review_categories JSONB, -- {"bedside_manner": 5, "expertise": 4, "communication": 5}
    is_verified BOOLEAN DEFAULT false,
    is_anonymous BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for doctor_reviews table
CREATE INDEX idx_doctor_reviews_doctor_id ON doctor_reviews(doctor_id);

-- 16. Create hospital_reviews table
CREATE TABLE hospital_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hospital_id UUID NOT NULL REFERENCES hospitals(id),
    patient_id UUID REFERENCES patients(id),
    booking_id UUID REFERENCES bookings(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    review_categories JSONB, -- {"cleanliness": 5, "staff": 4, "facilities": 5}
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for hospital_reviews table
CREATE INDEX idx_hospital_reviews_hospital_id ON hospital_reviews(hospital_id);

-- 17. Create feature_configurations table for modular system
CREATE TABLE feature_configurations (
    config_id SERIAL PRIMARY KEY,
    deployment_id VARCHAR(100) UNIQUE NOT NULL,
    deployment_type VARCHAR(50) NOT NULL,
    module_config JSONB NOT NULL,
    auth_config JSONB NOT NULL,
    branding_config JSONB,
    landing_page_config JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for feature_configurations table
CREATE INDEX idx_feature_configs_deployment_id ON feature_configurations(deployment_id);

-- 18. Create service_tiles table for landing page
CREATE TABLE service_tiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_name VARCHAR(100) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    icon_url VARCHAR(500),
    description TEXT,
    avg_cost_min INTEGER,
    avg_cost_max INTEGER,
    currency VARCHAR(10) DEFAULT 'INR',
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER,
    region VARCHAR(10) DEFAULT 'global',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for service_tiles table
CREATE INDEX idx_service_tiles_active ON service_tiles(is_active, display_order) WHERE is_active = true;

-- 19. Create featured_content table for landing page
CREATE TABLE featured_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_type VARCHAR(50) NOT NULL, -- 'doctor', 'hospital', 'testimonial', 'procedure'
    entity_id UUID NOT NULL, -- References doctors.id, hospitals.id, etc.
    display_order INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    region VARCHAR(10) DEFAULT 'global', -- 'india', 'usa', 'global'
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for featured_content table
CREATE INDEX idx_featured_content_active ON featured_content(is_active, display_order) WHERE is_active = true;

-- 20. Create landing_page_analytics table
CREATE TABLE landing_page_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(100),
    user_id UUID REFERENCES users(id), -- If logged in
    user_location JSONB, -- IP-based location data
    clicked_tile VARCHAR(50), -- Which service tile was clicked
    search_query VARCHAR(255),
    conversion_action VARCHAR(50), -- 'registration', 'booking', 'doctor_view'
    page_section VARCHAR(50), -- 'hero', 'service_tiles', 'carousel', 'testimonials'
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for landing_page_analytics table
CREATE INDEX idx_landing_analytics_timestamp ON landing_page_analytics(timestamp);

-- Create triggers for automatic rating updates
CREATE OR REPLACE FUNCTION update_doctor_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE doctors 
    SET 
        average_rating = (
            SELECT AVG(rating)::DECIMAL(3,2) 
            FROM doctor_reviews 
            WHERE doctor_id = COALESCE(NEW.doctor_id, OLD.doctor_id)
        ),
        total_reviews = (
            SELECT COUNT(*) 
            FROM doctor_reviews 
            WHERE doctor_id = COALESCE(NEW.doctor_id, OLD.doctor_id)
        )
    WHERE id = COALESCE(NEW.doctor_id, OLD.doctor_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_doctor_rating
    AFTER INSERT OR UPDATE OR DELETE ON doctor_reviews
    FOR EACH ROW EXECUTE FUNCTION update_doctor_rating();

CREATE OR REPLACE FUNCTION update_hospital_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE hospitals 
    SET 
        average_rating = (
            SELECT AVG(rating)::DECIMAL(3,2) 
            FROM hospital_reviews 
            WHERE hospital_id = COALESCE(NEW.hospital_id, OLD.hospital_id)
        ),
        total_reviews = (
            SELECT COUNT(*) 
            FROM hospital_reviews 
            WHERE hospital_id = COALESCE(NEW.hospital_id, OLD.hospital_id)
        )
    WHERE id = COALESCE(NEW.hospital_id, OLD.hospital_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_hospital_rating
    AFTER INSERT OR UPDATE OR DELETE ON hospital_reviews
    FOR EACH ROW EXECUTE FUNCTION update_hospital_rating();

-- Create trigger for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER trigger_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_patients_updated_at BEFORE UPDATE ON patients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_doctors_updated_at BEFORE UPDATE ON doctors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_surgeries_updated_at BEFORE UPDATE ON surgeries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_hospitals_updated_at BEFORE UPDATE ON hospitals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_implants_updated_at BEFORE UPDATE ON implants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_feature_configurations_updated_at BEFORE UPDATE ON feature_configurations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_service_tiles_updated_at BEFORE UPDATE ON service_tiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default feature configuration
INSERT INTO feature_configurations (
    deployment_id, 
    deployment_type, 
    module_config, 
    auth_config,
    branding_config,
    landing_page_config
) VALUES (
    'default_healthtime',
    'full_platform',
    '{
        "authentication": {"enabled": true, "required": true},
        "patients": {"enabled": true, "required": false},
        "doctors": {"enabled": true, "required": false},
        "hospitals": {"enabled": true, "required": false},
        "clinics": {"enabled": false, "required": false},
        "implants": {"enabled": true, "required": false},
        "surgeries": {"enabled": true, "required": false},
        "bookings": {"enabled": true, "required": false},
        "analytics": {"enabled": true, "required": false}
    }',
    '{
        "providers": ["database", "google", "apple", "microsoft"],
        "primary_provider": "database",
        "google": {"enabled": true, "client_id": ""},
        "apple": {"enabled": true, "client_id": ""},
        "microsoft": {"enabled": true, "tenant_id": ""}
    }',
    '{
        "app_name": "HealthTime",
        "theme": "healthcare",
        "logo_url": "",
        "primary_color": "#2563eb",
        "secondary_color": "#10b981"
    }',
    '{
        "hero_section": {"enabled": true},
        "service_tiles": {"enabled": true, "max_display": 8},
        "doctor_carousel": {"enabled": true, "max_display": 10},
        "hospital_carousel": {"enabled": true, "max_display": 8},
        "testimonials": {"enabled": true, "max_display": 6}
    }'
);

-- Insert default service tiles
INSERT INTO service_tiles (service_name, display_name, description, avg_cost_min, avg_cost_max, display_order, region) VALUES
('orthopedic', 'Orthopedic Surgery', 'Bone, joint, and musculoskeletal procedures', 50000, 200000, 1, 'india'),
('cosmetic', 'Cosmetic Surgery', 'Aesthetic and reconstructive procedures', 30000, 150000, 2, 'india'),
('dental', 'Dental Care', 'Comprehensive dental treatments and oral surgery', 5000, 50000, 3, 'india'),
('cardiology', 'Cardiac Surgery', 'Heart and cardiovascular procedures', 100000, 500000, 4, 'india'),
('orthopedic', 'Orthopedic Surgery', 'Bone, joint, and musculoskeletal procedures', 5000, 25000, 1, 'usa'),
('cosmetic', 'Cosmetic Surgery', 'Aesthetic and reconstructive procedures', 3000, 20000, 2, 'usa'),
('dental', 'Dental Care', 'Comprehensive dental treatments and oral surgery', 500, 5000, 3, 'usa'),
('cardiology', 'Cardiac Surgery', 'Heart and cardiovascular procedures', 15000, 75000, 4, 'usa');

-- 21. Create OTP logs table for security and tracking
CREATE TABLE otp_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    phone VARCHAR(20),
    email VARCHAR(255),
    otp_code VARCHAR(10) NOT NULL,
    otp_type VARCHAR(20) NOT NULL CHECK (otp_type IN ('login', 'registration', 'password_reset', 'phone_verification', 'email_verification')),
    delivery_method VARCHAR(10) NOT NULL CHECK (delivery_method IN ('sms', 'email', 'whatsapp')),
    status VARCHAR(20) DEFAULT 'sent' CHECK (status IN ('sent', 'verified', 'expired', 'failed')),
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    expires_at TIMESTAMP NOT NULL,
    verified_at TIMESTAMP,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for OTP logs table
CREATE INDEX idx_otp_logs_user_id ON otp_logs(user_id);
CREATE INDEX idx_otp_logs_phone ON otp_logs(phone);
CREATE INDEX idx_otp_logs_email ON otp_logs(email);
CREATE INDEX idx_otp_logs_code ON otp_logs(otp_code);
CREATE INDEX idx_otp_logs_status ON otp_logs(status);
CREATE INDEX idx_otp_logs_expires ON otp_logs(expires_at);
CREATE INDEX idx_otp_logs_created ON otp_logs(created_at);

-- Function to clean up expired OTPs
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS void AS $$
BEGIN
    -- Update expired OTPs
    UPDATE otp_logs 
    SET status = 'expired' 
    WHERE status = 'sent' 
    AND expires_at < CURRENT_TIMESTAMP;
    
    -- Clean up old OTP records (older than 30 days)
    DELETE FROM otp_logs 
    WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- 22. Create comprehensive reviews system
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Review Target (polymorphic - can review doctors, hospitals, or overall experience)
    reviewable_type VARCHAR(20) NOT NULL CHECK (reviewable_type IN ('doctor', 'hospital', 'implant_company', 'booking_experience', 'platform')),
    reviewable_id UUID NOT NULL, -- References doctors.id, hospitals.id, or bookings.id
    
    -- Reviewer Information
    reviewer_id UUID NOT NULL REFERENCES users(id),
    reviewer_type VARCHAR(20) NOT NULL CHECK (reviewer_type IN ('patient', 'doctor', 'hospital')),
    
    -- Review Content
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_title VARCHAR(200),
    review_text TEXT,
    
    -- Detailed Ratings (JSONB for flexibility)
    detailed_ratings JSONB, -- {"communication": 5, "expertise": 4, "facilities": 5, "cost_value": 4}
    
    -- Review Context
    booking_id UUID REFERENCES bookings(id), -- Associated booking if applicable
    procedure_type VARCHAR(100), -- What procedure was reviewed
    treatment_date DATE, -- When the treatment occurred
    
    -- Review Status
    is_verified BOOLEAN DEFAULT FALSE,
    is_anonymous BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE, -- For landing page testimonials
    
    -- Moderation
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'flagged')),
    moderation_notes TEXT,
    moderated_by UUID REFERENCES users(id),
    moderated_at TIMESTAMP,
    
    -- Helpfulness
    helpful_count INTEGER DEFAULT 0,
    not_helpful_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for reviews table
CREATE INDEX idx_reviews_reviewable ON reviews(reviewable_type, reviewable_id);
CREATE INDEX idx_reviews_reviewer ON reviews(reviewer_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_status ON reviews(status);
CREATE INDEX idx_reviews_featured ON reviews(is_featured) WHERE is_featured = true;
CREATE INDEX idx_reviews_booking ON reviews(booking_id) WHERE booking_id IS NOT NULL;

-- 23. Create commission agreements table
CREATE TABLE commission_agreements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Agreement Parties
    entity_type VARCHAR(20) NOT NULL CHECK (entity_type IN ('doctor', 'hospital', 'implant_company')),
    entity_id UUID NOT NULL, -- References doctors.id, hospitals.id, or implant companies
    
    -- Commission Structure
    commission_type VARCHAR(20) NOT NULL CHECK (commission_type IN ('percentage', 'fixed_amount', 'tiered', 'hybrid')),
    commission_rate DECIMAL(5,2), -- Percentage (e.g., 15.50 for 15.5%)
    fixed_amount DECIMAL(10,2), -- Fixed amount per transaction
    
    -- Tiered Commission (JSONB for complex structures)
    tiered_structure JSONB, -- [{"min_amount": 0, "max_amount": 50000, "rate": 10}, {"min_amount": 50001, "max_amount": 100000, "rate": 8}]
    
    -- Agreement Terms
    minimum_monthly_volume DECIMAL(12,2), -- Minimum monthly transaction volume
    payment_terms VARCHAR(50) DEFAULT 'net_30', -- net_15, net_30, net_45
    currency VARCHAR(10) DEFAULT 'INR',
    
    -- Service Categories
    applicable_services JSONB, -- ["consultation", "surgery", "facility_booking", "implant_sales"]
    excluded_services JSONB, -- Services excluded from commission
    
    -- Agreement Status
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'suspended', 'terminated', 'expired')),
    effective_date DATE NOT NULL,
    expiry_date DATE,
    auto_renewal BOOLEAN DEFAULT FALSE,
    
    -- Legal and Compliance
    agreement_document_url VARCHAR(500), -- Signed agreement document
    tax_treatment VARCHAR(50), -- How commission is treated for tax purposes
    compliance_notes TEXT,
    
    -- Performance Metrics
    total_transactions INTEGER DEFAULT 0,
    total_commission_earned DECIMAL(12,2) DEFAULT 0.00,
    last_commission_date DATE,
    
    -- Approval Workflow
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for commission_agreements table
CREATE INDEX idx_commission_agreements_entity ON commission_agreements(entity_type, entity_id);
CREATE INDEX idx_commission_agreements_status ON commission_agreements(status);
CREATE INDEX idx_commission_agreements_effective_date ON commission_agreements(effective_date);
CREATE INDEX idx_commission_agreements_expiry ON commission_agreements(expiry_date) WHERE expiry_date IS NOT NULL;

-- 24. Create commission_transactions table (for tracking actual commissions)
CREATE TABLE commission_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Reference to agreement and booking
    commission_agreement_id UUID NOT NULL REFERENCES commission_agreements(id),
    booking_id UUID NOT NULL REFERENCES bookings(id),
    
    -- Transaction Details
    transaction_amount DECIMAL(10,2) NOT NULL, -- Original transaction amount
    commission_rate_applied DECIMAL(5,2), -- Rate applied for this transaction
    commission_amount DECIMAL(10,2) NOT NULL, -- Calculated commission
    
    -- Payment Status
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'disputed', 'refunded')),
    payment_date DATE,
    payment_reference VARCHAR(100),
    
    -- Transaction Context
    service_type VARCHAR(50), -- consultation, surgery, facility_booking, etc.
    transaction_date DATE NOT NULL,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for commission_transactions table
CREATE INDEX idx_commission_transactions_agreement ON commission_transactions(commission_agreement_id);
CREATE INDEX idx_commission_transactions_booking ON commission_transactions(booking_id);
CREATE INDEX idx_commission_transactions_status ON commission_transactions(payment_status);
CREATE INDEX idx_commission_transactions_date ON commission_transactions(transaction_date);

-- Create triggers for automatic rating updates (enhanced)
CREATE OR REPLACE FUNCTION update_entity_ratings()
RETURNS TRIGGER AS $$
BEGIN
    -- Update doctor ratings
    IF NEW.reviewable_type = 'doctor' OR OLD.reviewable_type = 'doctor' THEN
        UPDATE doctors 
        SET 
            average_rating = (
                SELECT AVG(rating)::DECIMAL(3,2) 
                FROM reviews 
                WHERE reviewable_type = 'doctor' 
                AND reviewable_id = COALESCE(NEW.reviewable_id, OLD.reviewable_id)
                AND status = 'approved'
            ),
            total_reviews = (
                SELECT COUNT(*) 
                FROM reviews 
                WHERE reviewable_type = 'doctor' 
                AND reviewable_id = COALESCE(NEW.reviewable_id, OLD.reviewable_id)
                AND status = 'approved'
            )
        WHERE id = COALESCE(NEW.reviewable_id, OLD.reviewable_id);
    END IF;
    
    -- Update hospital ratings
    IF NEW.reviewable_type = 'hospital' OR OLD.reviewable_type = 'hospital' THEN
        UPDATE hospitals 
        SET 
            average_rating = (
                SELECT AVG(rating)::DECIMAL(3,2) 
                FROM reviews 
                WHERE reviewable_type = 'hospital' 
                AND reviewable_id = COALESCE(NEW.reviewable_id, OLD.reviewable_id)
                AND status = 'approved'
            ),
            total_reviews = (
                SELECT COUNT(*) 
                FROM reviews 
                WHERE reviewable_type = 'hospital' 
                AND reviewable_id = COALESCE(NEW.reviewable_id, OLD.reviewable_id)
                AND status = 'approved'
            )
        WHERE id = COALESCE(NEW.reviewable_id, OLD.reviewable_id);
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_entity_ratings
    AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_entity_ratings();

-- Create function to calculate commission
CREATE OR REPLACE FUNCTION calculate_commission(agreement_id UUID, transaction_amount DECIMAL)
RETURNS DECIMAL AS $$
DECLARE
    agreement_record commission_agreements%ROWTYPE;
    calculated_commission DECIMAL(10,2) := 0;
    tier_record JSONB;
BEGIN
    -- Get the commission agreement
    SELECT * INTO agreement_record FROM commission_agreements WHERE id = agreement_id;
    
    IF NOT FOUND THEN
        RETURN 0;
    END IF;
    
    -- Calculate based on commission type
    CASE agreement_record.commission_type
        WHEN 'percentage' THEN
            calculated_commission := transaction_amount * (agreement_record.commission_rate / 100);
        WHEN 'fixed_amount' THEN
            calculated_commission := agreement_record.fixed_amount;
        WHEN 'tiered' THEN
            -- Find applicable tier
            FOR tier_record IN SELECT * FROM jsonb_array_elements(agreement_record.tiered_structure)
            LOOP
                IF transaction_amount >= (tier_record->>'min_amount')::DECIMAL 
                   AND (tier_record->>'max_amount' IS NULL OR transaction_amount <= (tier_record->>'max_amount')::DECIMAL) THEN
                    calculated_commission := transaction_amount * ((tier_record->>'rate')::DECIMAL / 100);
                    EXIT;
                END IF;
            END LOOP;
        WHEN 'hybrid' THEN
            -- Custom logic for hybrid commission structures
            calculated_commission := LEAST(
                transaction_amount * (agreement_record.commission_rate / 100),
                agreement_record.fixed_amount
            );
    END CASE;
    
    RETURN calculated_commission;
END;
$$ LANGUAGE plpgsql;

-- Schema creation completed successfully
SELECT 'HealthTime Complete Schema v2.0 with Reviews & Commission System created successfully!' as status;
