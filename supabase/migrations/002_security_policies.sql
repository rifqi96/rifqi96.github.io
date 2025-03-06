-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whitelist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playground_features ENABLE ROW LEVEL SECURITY;
-- Create a function to check if the current user is a superadmin
CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'superadmin'
  );
$$ LANGUAGE sql SECURITY DEFINER;
-- Create a function to check if the current user is whitelisted
CREATE OR REPLACE FUNCTION public.is_whitelisted_user()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'whitelisted_user'
  );
$$ LANGUAGE sql SECURITY DEFINER;
-- Create a function to check if an email is in the whitelist
CREATE OR REPLACE FUNCTION public.is_email_whitelisted(email TEXT)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.whitelist
    WHERE whitelist.email = is_email_whitelisted.email
  );
$$ LANGUAGE sql SECURITY DEFINER;
-- Profiles table policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);
CREATE POLICY "Superadmin can view all profiles"
  ON public.profiles FOR SELECT
  USING (is_superadmin());
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);
-- Portfolio items policies
CREATE POLICY "Anyone can view published portfolio items"
  ON public.portfolio_items FOR SELECT
  USING (is_published = true);
CREATE POLICY "Superadmin can view all portfolio items"
  ON public.portfolio_items FOR SELECT
  USING (is_superadmin());
CREATE POLICY "Superadmin can insert portfolio items"
  ON public.portfolio_items FOR INSERT
  WITH CHECK (is_superadmin());
CREATE POLICY "Superadmin can update portfolio items"
  ON public.portfolio_items FOR UPDATE
  USING (is_superadmin());
CREATE POLICY "Superadmin can delete portfolio items"
  ON public.portfolio_items FOR DELETE
  USING (is_superadmin());
-- Blog posts policies
CREATE POLICY "Anyone can view published blog posts"
  ON public.blog_posts FOR SELECT
  USING (is_published = true);
CREATE POLICY "Superadmin can view all blog posts"
  ON public.blog_posts FOR SELECT
  USING (is_superadmin());
CREATE POLICY "Superadmin can insert blog posts"
  ON public.blog_posts FOR INSERT
  WITH CHECK (is_superadmin());
CREATE POLICY "Superadmin can update blog posts"
  ON public.blog_posts FOR UPDATE
  USING (is_superadmin());
CREATE POLICY "Superadmin can delete blog posts"
  ON public.blog_posts FOR DELETE
  USING (is_superadmin());
-- Whitelist policies
CREATE POLICY "Superadmin can view whitelist"
  ON public.whitelist FOR SELECT
  USING (is_superadmin());
CREATE POLICY "Superadmin can manage whitelist"
  ON public.whitelist FOR ALL
  USING (is_superadmin());
-- Options policies
CREATE POLICY "Superadmin can view all options"
  ON public.options FOR SELECT
  USING (is_superadmin());
CREATE POLICY "Whitelisted users can view whitelisted options"
  ON public.options FOR SELECT
  USING (
    is_whitelisted_user() AND 
    (access_level = 'whitelisted' OR access_level = 'public')
  );
CREATE POLICY "Public can view public options"
  ON public.options FOR SELECT
  USING (access_level = 'public');
CREATE POLICY "Superadmin can manage options"
  ON public.options FOR ALL
  USING (is_superadmin());
-- Playground features policies
CREATE POLICY "Whitelisted users can view playground features"
  ON public.playground_features FOR SELECT
  USING (is_whitelisted_user() OR is_superadmin());
CREATE POLICY "Superadmin can manage playground features"
  ON public.playground_features FOR ALL
  USING (is_superadmin());
