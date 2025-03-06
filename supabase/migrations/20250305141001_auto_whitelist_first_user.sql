-- Create a function to handle auto-whitelisting the first user
CREATE OR REPLACE FUNCTION auto_whitelist_first_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if this is the first user (superadmin)
  IF (SELECT role FROM public.profiles WHERE id = NEW.id) = 'superadmin' THEN
    -- Insert into whitelist table
    INSERT INTO public.whitelist (email, added_by)
    VALUES (NEW.email, NEW.id)
    ON CONFLICT (email) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS trigger_auto_whitelist_first_user ON public.profiles;
CREATE TRIGGER trigger_auto_whitelist_first_user
  AFTER INSERT
  ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION auto_whitelist_first_user();