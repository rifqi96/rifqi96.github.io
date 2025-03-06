-- Modify work_experiences table to add ON DELETE SET NULL
ALTER TABLE work_experiences
    DROP CONSTRAINT work_experiences_company_logo_media_id_fkey,
    ADD CONSTRAINT work_experiences_company_logo_media_id_fkey
        FOREIGN KEY (company_logo_media_id)
        REFERENCES media(id)
        ON DELETE SET NULL;

-- Modify projects table to add ON DELETE SET NULL
ALTER TABLE projects
    DROP CONSTRAINT projects_media_id_fkey,
    ADD CONSTRAINT projects_media_id_fkey
        FOREIGN KEY (media_id)
        REFERENCES media(id)
        ON DELETE SET NULL;

-- Create function to handle media deletion and storage cleanup
CREATE OR REPLACE FUNCTION handle_media_deletion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Delete the file from storage
    DELETE FROM storage.objects
    WHERE bucket_id = OLD.bucket_name
        AND name = OLD.storage_path;
    RETURN OLD;
END;
$$;

-- Create trigger for media table
DROP TRIGGER IF EXISTS handle_media_deletion ON media;
CREATE TRIGGER handle_media_deletion
    AFTER DELETE ON media
    FOR EACH ROW
    EXECUTE FUNCTION handle_media_deletion();

-- Trigger to delete media when a project is deleted
CREATE OR REPLACE FUNCTION delete_media_on_project_delete()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM media WHERE id = OLD.media_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_delete_media_on_project_delete
AFTER DELETE ON projects
FOR EACH ROW EXECUTE FUNCTION delete_media_on_project_delete();

-- Trigger to delete media when a work experience is deleted
CREATE OR REPLACE FUNCTION delete_media_on_work_experience_delete()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM media WHERE id = OLD.company_logo_media_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_delete_media_on_work_experience_delete
AFTER DELETE ON work_experiences
FOR EACH ROW EXECUTE FUNCTION delete_media_on_work_experience_delete();