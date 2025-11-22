-- HealthTime Sample Data Script
-- This script inserts sample data for testing and development
-- Run this after creating the tables with 01_create_tables.sql

-- Insert sample surgeries
INSERT INTO surgeries (id, name, description, category, duration, recovery_time, anesthesia_type, base_cost, success_rate) VALUES
(uuid_generate_v4(), 'Knee Replacement', 'Total knee replacement surgery', 'Orthopedic', '2-3 hours', '6-8 weeks', 'General', 150000.00, 95.5),
(uuid_generate_v4(), 'Hip Replacement', 'Total hip replacement surgery', 'Orthopedic', '1-2 hours', '4-6 weeks', 'General', 180000.00, 96.2),
(uuid_generate_v4(), 'Shoulder Replacement', 'Total shoulder replacement surgery', 'Orthopedic', '2-3 hours', '8-12 weeks', 'General', 200000.00, 92.8),
(uuid_generate_v4(), 'Ankle Replacement', 'Total ankle replacement surgery', 'Orthopedic', '2-4 hours', '10-12 weeks', 'General', 220000.00, 89.5);

-- Insert sample hospitals
INSERT INTO hospitals (id, name, zone, location, city, state, phone, email, status) VALUES
(uuid_generate_v4(), 'Apollo Hospital', 'South', 'Jubilee Hills', 'Hyderabad', 'Telangana', '+91-40-23607777', 'info@apollohyd.com', 'approved'),
(uuid_generate_v4(), 'Fortis Hospital', 'North', 'Bannerghatta Road', 'Bangalore', 'Karnataka', '+91-80-66214444', 'info@fortisbangalore.com', 'approved'),
(uuid_generate_v4(), 'Max Healthcare', 'West', 'Saket', 'New Delhi', 'Delhi', '+91-11-26515050', 'info@maxhealthcare.com', 'approved'),
(uuid_generate_v4(), 'Manipal Hospital', 'East', 'Salt Lake', 'Kolkata', 'West Bengal', '+91-33-66527777', 'info@manipalkolkata.com', 'approved');

-- Insert sample implants
INSERT INTO implants (id, name, brand, manufacturer, material, surgery_type, price, success_rate) VALUES
(uuid_generate_v4(), 'DePuy Attune Knee System', 'DePuy Synthes', 'Johnson & Johnson', 'Titanium Alloy', 'Knee Replacement', 85000.00, 96.5),
(uuid_generate_v4(), 'Zimmer Persona Knee', 'Zimmer Biomet', 'Zimmer Biomet', 'Cobalt Chrome', 'Knee Replacement', 90000.00, 95.8),
(uuid_generate_v4(), 'Stryker Triathlon Knee', 'Stryker', 'Stryker Corporation', 'Titanium', 'Knee Replacement', 88000.00, 96.2),
(uuid_generate_v4(), 'Smith & Nephew OXINIUM Hip', 'Smith & Nephew', 'Smith & Nephew', 'OXINIUM', 'Hip Replacement', 95000.00, 97.1);

-- Success message
SELECT 'Sample data inserted successfully!' as status;
