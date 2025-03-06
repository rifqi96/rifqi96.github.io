-- Update the handle_new_user function to work with Google authentication
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  is_whitelisted BOOLEAN;
  is_first_user BOOLEAN;
  user_email TEXT;
BEGIN
  -- Get the user's email (works for both email/password and OAuth)
  user_email := NEW.email;
  
  -- Check if this is the first user (will be superadmin)
  SELECT NOT EXISTS (SELECT 1 FROM public.profiles) INTO is_first_user;
  
  -- Check if email is whitelisted
  SELECT EXISTS (
    SELECT 1 FROM public.whitelist WHERE email = user_email
  ) INTO is_whitelisted;
  
  -- If first user, make superadmin
  IF is_first_user THEN
    INSERT INTO public.profiles (id, email, role)
    VALUES (NEW.id, user_email, 'superadmin');
  -- If email is whitelisted, create profile as whitelisted_user
  ELSIF is_whitelisted THEN
    INSERT INTO public.profiles (id, email, role)
    VALUES (NEW.id, user_email, 'whitelisted_user');
  -- Otherwise, create a basic profile with no special role
  ELSE
    INSERT INTO public.profiles (id, email, role)
    VALUES (NEW.id, user_email, 'whitelisted_user');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
