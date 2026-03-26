# Fix for 500 Error and Infinite Loading

## Problem
The website was showing a 500 error when trying to fetch user profiles and loading indefinitely.

## Root Cause
1. The RLS (Row Level Security) policy for `user_profiles` table was missing an INSERT policy
2. Error handling wasn't properly catching and handling database errors
3. Loading state wasn't being set to false when errors occurred

## Fixes Applied

### 1. Updated `src/context/AuthContext.tsx`
- Added better error handling that doesn't block the app
- Ensured `isLoading` is always set to false, even on errors
- Added cleanup function to prevent memory leaks
- Made the profile fetch more resilient to errors

### 2. Updated `src/App.tsx`
- Fixed loading condition to not wait indefinitely
- Only waits for userProfile when there's actually a session

### 3. Created Migration File
- Created `supabase/migrations/20251218080000_fix_user_profiles_rls.sql`
- Adds missing INSERT policy for user_profiles
- Adds policy for admins to view all profiles

## Next Steps

### Run the Migration
You need to run the migration SQL file in your Supabase dashboard:

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the contents of `supabase/migrations/20251218080000_fix_user_profiles_rls.sql`

Or run it directly in your database:

```sql
-- Fix RLS policies for user_profiles
-- Add INSERT policy so users can create their own profile

-- Drop existing policies if they exist (optional, for idempotency)
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;

-- Recreate SELECT policy
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Recreate UPDATE policy
CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Add INSERT policy so users can create their own profile
CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Allow admins to view all profiles (for admin dashboard)
CREATE POLICY "Admins can view all profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );
```

## Testing
After running the migration:
1. Clear your browser cache
2. Refresh the website
3. The loading should complete and the site should work
4. Try logging in - it should work without errors

## If Issues Persist
If you still see errors:
1. Check the browser console for specific error messages
2. Verify the migration ran successfully in Supabase
3. Check that your Supabase connection is working (check environment variables)






