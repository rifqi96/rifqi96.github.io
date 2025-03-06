-- Drop existing policies first
DROP POLICY IF EXISTS "Allow read access for all authenticated users" ON work_experience;
DROP POLICY IF EXISTS "Allow full access for superadmin" ON work_experience;

-- Rename work_experience table to work_experiences
ALTER TABLE work_experience RENAME TO work_experiences;

-- Update foreign key constraints
ALTER TABLE work_experiences 
    RENAME CONSTRAINT work_experience_company_logo_media_id_fkey 
    TO work_experiences_company_logo_media_id_fkey;

-- Recreate policies on the new table
CREATE POLICY "Allow read access for all authenticated users"
ON work_experiences
FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Allow full access for superadmin"
ON work_experiences
FOR ALL
USING (auth.uid() IN (
    SELECT id FROM public.profiles WHERE role = 'superadmin'
));

-- Update triggers
ALTER TRIGGER update_work_experience_modtime ON work_experiences 
    RENAME TO update_work_experiences_modtime;
