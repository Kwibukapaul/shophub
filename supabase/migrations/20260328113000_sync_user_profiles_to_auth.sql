CREATE OR REPLACE FUNCTION public.sync_user_profile_to_auth()
RETURNS TRIGGER AS $$
DECLARE
  current_metadata jsonb;
  next_full_name text;
  next_phone text;
  next_profile_image_url text;
BEGIN
  next_full_name := NULLIF(trim(COALESCE(NEW.full_name, '')), '');
  next_phone := NULLIF(trim(COALESCE(NEW.phone, '')), '');
  next_profile_image_url := NULLIF(trim(COALESCE(NEW.profile_image_url, '')), '');

  SELECT COALESCE(raw_user_meta_data, '{}'::jsonb)
  INTO current_metadata
  FROM auth.users
  WHERE id = NEW.id;

  UPDATE auth.users
  SET raw_user_meta_data = jsonb_strip_nulls(
        COALESCE(current_metadata, '{}'::jsonb) || jsonb_build_object(
          'full_name', next_full_name,
          'display_name', next_full_name,
          'phone', next_phone,
          'profile_image_url', next_profile_image_url
        )
      ),
      phone = next_phone,
      updated_at = now()
  WHERE id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

DROP TRIGGER IF EXISTS on_user_profile_synced_to_auth ON public.user_profiles;
CREATE TRIGGER on_user_profile_synced_to_auth
  AFTER INSERT OR UPDATE OF full_name, phone, profile_image_url ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_user_profile_to_auth();

UPDATE auth.users AS auth_user
SET raw_user_meta_data = jsonb_strip_nulls(
      COALESCE(auth_user.raw_user_meta_data, '{}'::jsonb) || jsonb_build_object(
        'full_name', NULLIF(trim(COALESCE(profile.full_name, '')), ''),
        'display_name', NULLIF(trim(COALESCE(profile.full_name, '')), ''),
        'phone', NULLIF(trim(COALESCE(profile.phone, '')), ''),
        'profile_image_url', NULLIF(trim(COALESCE(profile.profile_image_url, '')), '')
      )
    ),
    phone = NULLIF(trim(COALESCE(profile.phone, '')), ''),
    updated_at = now()
FROM public.user_profiles AS profile
WHERE profile.id = auth_user.id;
