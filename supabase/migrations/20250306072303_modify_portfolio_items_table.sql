-- Drop existing policies first
DROP POLICY IF EXISTS "Allow read access for all authenticated users" ON portfolio_items;
DROP POLICY IF EXISTS "Allow full access for superadmin" ON portfolio_items;
DROP POLICY IF EXISTS "Anyone can view published portfolio items" ON portfolio_items;
DROP POLICY IF EXISTS "Superadmin can view all portfolio items" ON portfolio_items;
DROP POLICY IF EXISTS "Superadmin can insert portfolio items" ON portfolio_items;
DROP POLICY IF EXISTS "Superadmin can update portfolio items" ON portfolio_items;
DROP POLICY IF EXISTS "Superadmin can delete portfolio items" ON portfolio_items;

-- Rename portfolio_items table to projects
ALTER TABLE portfolio_items RENAME TO projects;

-- Add new columns
ALTER TABLE projects
ADD COLUMN repo_url TEXT,
ADD COLUMN is_featured BOOLEAN DEFAULT false,
ADD COLUMN is_available BOOLEAN DEFAULT true,
ADD COLUMN is_coming_soon BOOLEAN DEFAULT false,
ADD COLUMN media_id UUID REFERENCES media(id);

-- Rename project_url to link
ALTER TABLE projects
RENAME COLUMN project_url TO link;

-- Add constraint for media_id similar to work_experience
ALTER TABLE projects
ADD CONSTRAINT media_check
    CHECK (
        (image_url IS NULL AND media_id IS NOT NULL) OR
        (image_url IS NOT NULL AND media_id IS NULL) OR
        (image_url IS NULL AND media_id IS NULL)
    );

-- Enable Row Level Security (RLS) on the projects table
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Recreate policies on the new table
CREATE POLICY "Anyone can view published projects"
ON projects
FOR SELECT
USING (is_published = true);

CREATE POLICY "Allow full access for superadmin"
ON projects
FOR ALL
USING (auth.uid() IN (
    SELECT id FROM public.profiles WHERE role = 'superadmin'
));

-- Create a trigger to call the update_modified_column function
CREATE TRIGGER update_projects_modtime
BEFORE UPDATE ON public.projects
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();
