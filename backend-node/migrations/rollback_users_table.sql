-- Rollback script for users table migration
-- Use this if you need to revert the changes

BEGIN;

-- Remove user_id foreign keys from profile tables
ALTER TABLE patients DROP COLUMN IF EXISTS user_id;
ALTER TABLE doctors DROP COLUMN IF EXISTS user_id;
ALTER TABLE admin_users DROP COLUMN IF EXISTS user_id;

-- Drop indexes
DROP INDEX IF EXISTS idx_users_email;
DROP INDEX IF EXISTS idx_users_role;
DROP INDEX IF EXISTS idx_users_is_active;
DROP INDEX IF EXISTS idx_patients_user_id;
DROP INDEX IF EXISTS idx_doctors_user_id;
DROP INDEX IF EXISTS idx_admin_users_user_id;

-- Drop trigger
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop users table
DROP TABLE IF EXISTS users;

COMMIT;

-- Note: This rollback does NOT restore email/password columns if they were dropped
-- Make sure to have a database backup before running the migration
