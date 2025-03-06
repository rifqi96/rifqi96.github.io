-- Drop existing view and policies
DROP VIEW IF EXISTS public.whitelist_with_profiles;
DROP POLICY IF EXISTS "Superadmin can view whitelist" ON public.whitelist;
DROP POLICY IF EXISTS "Superadmin can manage whitelist" ON public.whitelist;

-- Create a view to join whitelist with profiles
CREATE VIEW public.whitelist_with_profiles AS
SELECT 
  w.id,
  w.email,
  w.added_by,
  w.created_at,
  p.email as added_by_email
FROM public.whitelist w
LEFT JOIN public.profiles p ON w.added_by = p.id;

-- Grant permissions
GRANT SELECT ON public.whitelist_with_profiles TO authenticated;

-- Create policies
CREATE POLICY "Superadmin can view whitelist" ON public.whitelist
  FOR SELECT USING (is_superadmin());

CREATE POLICY "Superadmin can manage whitelist" ON public.whitelist
  FOR ALL USING (is_superadmin());