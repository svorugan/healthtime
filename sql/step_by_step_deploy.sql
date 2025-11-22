-- HealthTime Step-by-Step Database Deployment
-- This script recreates tables one by one with detailed logging

\echo 'Starting HealthTime Database Deployment...'

-- Step 1: Enable extensions
\echo 'Step 1: Enabling PostgreSQL extensions...'
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
\echo 'Extensions enabled successfully.'

-- Step 2: Drop existing tables (in dependency order)
\echo 'Step 2: Dropping existing tables...'

-- Drop dependent tables first
DROP TABLE IF EXISTS commission_transactions CASCADE;
\echo 'Dropped: commission_transactions'

DROP TABLE IF EXISTS commission_agreements CASCADE;
\echo 'Dropped: commission_agreements'

DROP TABLE IF EXISTS reviews CASCADE;
\echo 'Dropped: reviews'

DROP TABLE IF EXISTS otp_logs CASCADE;
\echo 'Dropped: otp_logs'

DROP TABLE IF EXISTS landing_page_analytics CASCADE;
\echo 'Dropped: landing_page_analytics'

DROP TABLE IF EXISTS featured_content CASCADE;
\echo 'Dropped: featured_content'

DROP TABLE IF EXISTS service_tiles CASCADE;
\echo 'Dropped: service_tiles'

DROP TABLE IF EXISTS feature_configurations CASCADE;
\echo 'Dropped: feature_configurations'

DROP TABLE IF EXISTS hospital_reviews CASCADE;
\echo 'Dropped: hospital_reviews'

DROP TABLE IF EXISTS doctor_reviews CASCADE;
\echo 'Dropped: doctor_reviews'

DROP TABLE IF EXISTS patient_testimonials CASCADE;
\echo 'Dropped: patient_testimonials'

DROP TABLE IF EXISTS patient_vital_signs CASCADE;
\echo 'Dropped: patient_vital_signs'

DROP TABLE IF EXISTS patient_medical_history CASCADE;
\echo 'Dropped: patient_medical_history'

DROP TABLE IF EXISTS bookings CASCADE;
\echo 'Dropped: bookings'

DROP TABLE IF EXISTS doctor_surgeries CASCADE;
\echo 'Dropped: doctor_surgeries'

DROP TABLE IF EXISTS doctor_availability CASCADE;
\echo 'Dropped: doctor_availability'

DROP TABLE IF EXISTS hospital_availability CASCADE;
\echo 'Dropped: hospital_availability'

DROP TABLE IF EXISTS implant_users CASCADE;
\echo 'Dropped: implant_users'

DROP TABLE IF EXISTS hospital_users CASCADE;
\echo 'Dropped: hospital_users'

DROP TABLE IF EXISTS implants CASCADE;
\echo 'Dropped: implants'

DROP TABLE IF EXISTS hospitals CASCADE;
\echo 'Dropped: hospitals'

DROP TABLE IF EXISTS surgeries CASCADE;
\echo 'Dropped: surgeries'

DROP TABLE IF EXISTS admin_users CASCADE;
\echo 'Dropped: admin_users'

DROP TABLE IF EXISTS doctors CASCADE;
\echo 'Dropped: doctors'

DROP TABLE IF EXISTS patients CASCADE;
\echo 'Dropped: patients'

DROP TABLE IF EXISTS users CASCADE;
\echo 'Dropped: users'

-- Drop functions
DROP FUNCTION IF EXISTS calculate_commission(UUID, DECIMAL) CASCADE;
DROP FUNCTION IF EXISTS update_entity_ratings() CASCADE;
DROP FUNCTION IF EXISTS update_hospital_rating() CASCADE;
DROP FUNCTION IF EXISTS update_doctor_rating() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS cleanup_expired_otps() CASCADE;
\echo 'All existing tables and functions dropped successfully.'

-- Step 3: Create tables
\echo 'Step 3: Creating new tables...'
\echo 'Running complete_schema_v2.sql...'

-- Include the complete schema file
\i complete_schema_v2.sql

-- Step 4: Verification
\echo 'Step 4: Verifying deployment...'

-- Check table count
SELECT 
    'Total tables created: ' || COUNT(*)::text as result
FROM pg_tables 
WHERE schemaname = 'public';

-- List all tables
\echo 'Created tables:'
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

-- Check functions
\echo 'Created functions:'
SELECT proname as function_name 
FROM pg_proc 
WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
AND proname IN ('calculate_commission', 'update_entity_ratings', 'update_hospital_rating', 'update_doctor_rating', 'update_updated_at_column', 'cleanup_expired_otps');

\echo 'HealthTime Database Deployment Completed Successfully!'
