-- Refactor blog_posts table to support media relationships and content blocks

-- Add media_id column to blog_posts table
ALTER TABLE public.blog_posts
ADD COLUMN media_id UUID REFERENCES public.media(id) ON DELETE SET NULL;

-- Add content_blocks column to store structured content
ALTER TABLE public.blog_posts
ADD COLUMN content_blocks JSONB DEFAULT '[]'::jsonb;

-- Add description column for blog post description
ALTER TABLE public.blog_posts
ADD COLUMN description TEXT DEFAULT '';

-- Rename existing columns to match new schema
ALTER TABLE public.blog_posts
RENAME COLUMN featured_image TO image_url;

-- Add order column for sorting
ALTER TABLE public.blog_posts
ADD COLUMN "order" INTEGER DEFAULT 0;

-- Create function to handle media deletion and cleanup for blog posts
CREATE OR REPLACE FUNCTION delete_media_on_blog_post_delete()
RETURNS TRIGGER AS $$
BEGIN
  -- Only delete media if it exists and is not used elsewhere
  IF OLD.media_id IS NOT NULL THEN
    -- Check if media is used by other records
    IF NOT EXISTS (
      SELECT 1 FROM projects WHERE media_id = OLD.media_id
      UNION
      SELECT 1 FROM work_experiences WHERE company_logo_media_id = OLD.media_id
      UNION
      SELECT 1 FROM blog_posts WHERE media_id = OLD.media_id AND id != OLD.id
    ) THEN
      -- Delete the media record if not used elsewhere
      DELETE FROM media WHERE id = OLD.media_id;
    END IF;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to delete media when a blog post is deleted
CREATE OR REPLACE TRIGGER trigger_delete_media_on_blog_post_delete
AFTER DELETE ON blog_posts
FOR EACH ROW EXECUTE FUNCTION delete_media_on_blog_post_delete();

-- Create index for better performance
CREATE INDEX IF NOT EXISTS blog_posts_media_id_idx ON blog_posts(media_id);
CREATE INDEX IF NOT EXISTS blog_posts_order_idx ON blog_posts("order");

-- Update RLS policies for blog_posts
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$
BEGIN
    -- Drop the superadmin policy if it exists
    BEGIN
        DROP POLICY IF EXISTS "Allow full access for superadmin" ON blog_posts;
    EXCEPTION
        WHEN undefined_object THEN
            -- Policy doesn't exist, do nothing
    END;
    
    -- Drop the public read policy if it exists
    BEGIN
        DROP POLICY IF EXISTS "Allow read access for published posts" ON blog_posts;
    EXCEPTION
        WHEN undefined_object THEN
            -- Policy doesn't exist, do nothing
    END;
END $$;

-- Allow superadmin to do all operations
CREATE POLICY "Allow full access for superadmin" ON blog_posts
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

-- Allow read access for everyone for published posts
CREATE POLICY "Allow read access for published posts" ON blog_posts
    FOR SELECT
    TO public
    USING (is_published = true);