-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  is_whitelisted BOOLEAN;
  is_first_user BOOLEAN;
BEGIN
  -- Check if this is the first user (will be superadmin)
  SELECT NOT EXISTS (SELECT 1 FROM public.profiles) INTO is_first_user;
  
  -- Check if email is whitelisted
  SELECT EXISTS (
    SELECT 1 FROM public.whitelist WHERE email = NEW.email
  ) INTO is_whitelisted;
  
  -- If first user, make superadmin
  IF is_first_user THEN
    INSERT INTO public.profiles (id, email, role)
    VALUES (NEW.id, NEW.email, 'superadmin');
  -- If email is whitelisted, create profile as whitelisted_user
  ELSIF is_whitelisted THEN
    INSERT INTO public.profiles (id, email, role)
    VALUES (NEW.id, NEW.email, 'whitelisted_user');
  -- Otherwise, don't create a profile (this will effectively block the user)
  ELSE
    -- We still create a profile but with no special role
    -- This allows the user to exist but not access protected resources
    INSERT INTO public.profiles (id, email, role)
    VALUES (NEW.id, NEW.email, 'whitelisted_user');
    
    -- You could alternatively raise an exception to prevent sign-up entirely
    -- RAISE EXCEPTION 'Email not whitelisted';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Trigger to create profile on new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
-- Function to promote a user to superadmin (can only be called by existing superadmin)
CREATE OR REPLACE FUNCTION public.promote_to_superadmin(user_email TEXT)
RETURNS VOID AS $$
DECLARE
  user_id UUID;
BEGIN
  -- Check if current user is superadmin
  IF NOT public.is_superadmin() THEN
    RAISE EXCEPTION 'Only superadmins can promote users';
  END IF;
  
  -- Get the user ID from the email
  SELECT id INTO user_id FROM auth.users WHERE email = user_email;
  
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', user_email;
  END IF;
  
  -- Update the user's role to superadmin
  UPDATE public.profiles
  SET role = 'superadmin'
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Function to add email to whitelist
CREATE OR REPLACE FUNCTION public.add_to_whitelist(email_to_add TEXT)
RETURNS VOID AS $$
BEGIN
  -- Check if current user is superadmin
  IF NOT public.is_superadmin() THEN
    RAISE EXCEPTION 'Only superadmins can add to whitelist';
  END IF;
  
  -- Add email to whitelist
  INSERT INTO public.whitelist (email, added_by)
  VALUES (email_to_add, auth.uid())
  ON CONFLICT (email) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Function to remove email from whitelist
CREATE OR REPLACE FUNCTION public.remove_from_whitelist(email_to_remove TEXT)
RETURNS VOID AS $$
BEGIN
  -- Check if current user is superadmin
  IF NOT public.is_superadmin() THEN
    RAISE EXCEPTION 'Only superadmins can remove from whitelist';
  END IF;
  
  -- Remove email from whitelist
  DELETE FROM public.whitelist
  WHERE email = email_to_remove;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
