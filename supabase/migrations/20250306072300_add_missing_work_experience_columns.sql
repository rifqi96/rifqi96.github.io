-- Add missing columns to work_experience table
ALTER TABLE work_experience
ADD COLUMN position TEXT NOT NULL DEFAULT '',
ADD COLUMN current BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN company_url TEXT;

-- Rename role column to position and copy data
UPDATE work_experience SET position = role;
ALTER TABLE work_experience DROP COLUMN role;
