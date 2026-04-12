CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (
    id,
    full_name,
    phone,
    profile_image_url,
    is_admin
  )
  VALUES (
    NEW.id,
    COALESCE(
      NULLIF(NEW.raw_user_meta_data->>'full_name', ''),
      NULLIF(NEW.raw_user_meta_data->>'display_name', '')
    ),
    COALESCE(
      NULLIF(NEW.raw_user_meta_data->>'phone', ''),
      NULLIF(NEW.phone, '')
    ),
    NULLIF(NEW.raw_user_meta_data->>'profile_image_url', ''),
    false
  )
  ON CONFLICT (id) DO UPDATE
  SET full_name = COALESCE(EXCLUDED.full_name, user_profiles.full_name),
      phone = COALESCE(EXCLUDED.phone, user_profiles.phone),
      profile_image_url = COALESCE(EXCLUDED.profile_image_url, user_profiles.profile_image_url),
      updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
