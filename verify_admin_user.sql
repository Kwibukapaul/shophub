-- SQL Script to Verify and Set Admin User
-- Run this in your Supabase SQL Editor

-- Check if user exists and their current admin status
SELECT 
  u.id,
  u.email,
  p.is_admin,
  p.is_active,
  p.full_name,
  p.created_at
FROM auth.users u
LEFT JOIN user_profiles p ON u.id = p.id
WHERE u.email = 'kwibuka@gmail.com';

-- Set user as admin (run this if the user exists but is_admin is false)
UPDATE user_profiles 
SET is_admin = true,
    updated_at = now()
WHERE id = (
  SELECT id FROM auth.users 
  WHERE email = 'kwibuka@gmail.com'
);

-- Verify the update
SELECT 
  u.email,
  p.is_admin,
  p.is_active
FROM auth.users u
JOIN user_profiles p ON u.id = p.id
WHERE u.email = 'kwibuka@gmail.com';






