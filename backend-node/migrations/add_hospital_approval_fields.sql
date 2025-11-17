-- Add status, approved_at, and approved_by fields to hospitals table
-- This migration enables hospital approval functionality

ALTER TABLE hospitals 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending' NOT NULL,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES users(id);

-- Update existing hospitals to have 'pending' status if they don't have one
UPDATE hospitals 
SET status = 'pending' 
WHERE status IS NULL;

-- Add index for faster queries on hospital status
CREATE INDEX IF NOT EXISTS idx_hospitals_status ON hospitals(status);

COMMENT ON COLUMN hospitals.status IS 'Hospital approval status: pending, approved, rejected';
COMMENT ON COLUMN hospitals.approved_at IS 'Timestamp when hospital was approved';
COMMENT ON COLUMN hospitals.approved_by IS 'Admin user ID who approved the hospital';
