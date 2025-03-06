-- Add author_id column to blog_posts table
ALTER TABLE public.blog_posts
ADD COLUMN author_id UUID REFERENCES public.profiles(id);

-- Add index on author_id for better query performance
CREATE INDEX blog_posts_author_id_idx ON public.blog_posts(author_id);

-- Update RLS policies to include author-based access
CREATE POLICY "Authors can update their own posts" ON public.blog_posts
FOR UPDATE
USING (auth.uid() = author_id)
WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can delete their own posts" ON public.blog_posts
FOR DELETE
USING (auth.uid() = author_id);