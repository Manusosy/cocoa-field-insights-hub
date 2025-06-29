
-- Update the user registration function to default new signups as 'admin' instead of 'field_officer'
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    'admin'  -- Changed from 'field_officer' to 'admin'
  );
  RETURN NEW;
END;
$$;

-- Update existing user who signed up as field_officer to admin (assuming there's only the test account)
UPDATE public.profiles 
SET role = 'admin' 
WHERE role = 'field_officer' 
AND created_at > NOW() - INTERVAL '1 day';  -- Only recent signups to be safe
