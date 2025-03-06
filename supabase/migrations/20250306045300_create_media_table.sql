-- Create media table
CREATE TABLE media (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    bucket_name text NOT NULL,
    storage_path text NOT NULL,
    file_name text NOT NULL,
    mime_type text NOT NULL,
    size_bytes bigint NOT NULL,
    created_by uuid DEFAULT auth.uid() NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(bucket_name, storage_path)
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to update updated_at
CREATE TRIGGER update_media_updated_at
    BEFORE UPDATE ON media
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create RLS policies
ALTER TABLE media ENABLE ROW LEVEL SECURITY;

-- Allow superadmin to do all operations
CREATE POLICY "Allow full access for superadmin" ON media
    FOR ALL
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role = 'superadmin'
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role = 'superadmin'
    ));

-- Allow read access for everyone
CREATE POLICY "Allow read access for everyone" ON media
    FOR SELECT
    TO public;

-- Create function to handle storage deletions
CREATE OR REPLACE FUNCTION handle_storage_deletion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM media
  WHERE bucket_name = TG_ARGV[0]
    AND storage_path = OLD.name;
  RETURN OLD;
END;
$$;

-- Create trigger for the media bucket
CREATE TRIGGER handle_storage_object_deletion
  AFTER DELETE ON storage.objects
  FOR EACH ROW
  EXECUTE FUNCTION handle_storage_deletion('media');

-- Add index for faster lookups
CREATE INDEX idx_media_storage_lookup ON media (bucket_name, storage_path);

-- Create storage bucket for media
INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true);

-- Set up storage policies
CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'media');

CREATE POLICY "Allow authenticated users to upload media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'media' AND
    auth.role() = 'authenticated' AND
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role = 'superadmin'
    )
);

CREATE POLICY "Allow authenticated users to update their media"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'media' AND
    auth.role() = 'authenticated' AND
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role = 'superadmin'
    )
)
WITH CHECK (
    bucket_id = 'media' AND
    auth.role() = 'authenticated' AND
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role = 'superadmin'
    )
);

CREATE POLICY "Allow authenticated users to delete their media"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'media' AND
    auth.role() = 'authenticated' AND
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role = 'superadmin'
    )
);

-- Modify work_experience table to support media
ALTER TABLE work_experience 
ADD COLUMN company_logo_url text,
ADD COLUMN company_logo_media_id uuid REFERENCES media(id),
ADD CONSTRAINT company_logo_check 
    CHECK (
        (company_logo_url IS NULL AND company_logo_media_id IS NOT NULL) OR
        (company_logo_url IS NOT NULL AND company_logo_media_id IS NULL) OR
        (company_logo_url IS NULL AND company_logo_media_id IS NULL)
    );
