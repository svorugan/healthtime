-- HealthTime Complete Database Deployment Script
-- This script safely recreates all tables with proper dependency handling
-- Run this script on a fresh database or to completely rebuild schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop all tables in correct dependency order (if they exist)
DROP TABLE IF EXISTS commission_transactions CASCADE;
DROP TABLE IF EXISTS commission_agreements CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS otp_logs CASCADE;
DROP TABLE IF EXISTS landing_page_analytics CASCADE;
DROP TABLE IF EXISTS featured_content CASCADE;
DROP TABLE IF EXISTS service_tiles CASCADE;
DROP TABLE IF EXISTS feature_configurations CASCADE;
DROP TABLE IF EXISTS hospital_reviews CASCADE;
DROP TABLE IF EXISTS doctor_reviews CASCADE;
DROP TABLE IF EXISTS patient_testimonials CASCADE;
DROP TABLE IF EXISTS patient_vital_signs CASCADE;
DROP TABLE IF EXISTS patient_medical_history CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS doctor_surgeries CASCADE;
DROP TABLE IF EXISTS doctor_availability CASCADE;
DROP TABLE IF EXISTS hospital_availability CASCADE;
DROP TABLE IF EXISTS implant_users CASCADE;
DROP TABLE IF EXISTS hospital_users CASCADE;
DROP TABLE IF EXISTS implants CASCADE;
DROP TABLE IF EXISTS hospitals CASCADE;
DROP TABLE IF EXISTS surgeries CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;
DROP TABLE IF EXISTS doctors CASCADE;
DROP TABLE IF EXISTS patients CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop functions if they exist
DROP FUNCTION IF EXISTS calculate_commission(UUID, DECIMAL);
DROP FUNCTION IF EXISTS update_entity_ratings();
DROP FUNCTION IF EXISTS update_hospital_rating();
DROP FUNCTION IF EXISTS update_doctor_rating();
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS cleanup_expired_otps();

-- Now recreate all tables by running the complete schema
\i sql/complete_schema_v2.sql

-- Verify deployment
SELECT 'HealthTime Database Deployment Completed Successfully!' as status;

-- Show table count
SELECT 
    schemaname,
    COUNT(*) as table_count
FROM pg_tables 
WHERE schemaname = 'public' 
GROUP BY schemaname;

-- Show all created tables
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
