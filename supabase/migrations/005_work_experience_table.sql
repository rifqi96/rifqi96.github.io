-- Create the work_experience table
CREATE TABLE public.work_experience (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company TEXT NOT NULL,
    location TEXT NOT NULL,
    role TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    description TEXT NOT NULL,
    technologies TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Add a check constraint to ensure end_date is after start_date
ALTER TABLE public.work_experience
ADD CONSTRAINT check_date_order CHECK (end_date IS NULL OR end_date > start_date);
-- Enable Row Level Security (RLS) on the work_experience table
ALTER TABLE public.work_experience ENABLE ROW LEVEL SECURITY;
-- Create policies for the work_experience table
-- Allow read access for all authenticated users
CREATE POLICY "Allow read access for all authenticated users"
ON public.work_experience
FOR SELECT
USING (auth.role() = 'authenticated');
-- Allow full access for superadmin
CREATE POLICY "Allow full access for superadmin"
ON public.work_experience
FOR ALL
USING (auth.uid() IN (
    SELECT id FROM public.profiles WHERE role = 'superadmin'
));
-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- Create a trigger to call the update_modified_column function
CREATE TRIGGER update_work_experience_modtime
BEFORE UPDATE ON public.work_experience
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();
