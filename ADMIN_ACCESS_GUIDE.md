# Admin Dashboard Access Guide

## How to Access the Admin Dashboard

### Step 1: Create an Admin User

To access the admin dashboard, you need a user account with admin privileges. There are two ways to set up an admin user:

#### Option A: Through Supabase Database (Recommended)

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Run the following SQL query to make a user an admin:

```sql
-- For the user kwibuka@gmail.com (or replace with your email)
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
```

**Note:** If the user profile doesn't exist, you may need to create it first:
```sql
-- Create profile if it doesn't exist
INSERT INTO user_profiles (id, is_admin, is_active)
SELECT id, true, true
FROM auth.users
WHERE email = 'kwibuka@gmail.com'
ON CONFLICT (id) DO UPDATE
SET is_admin = true, updated_at = now();
```

#### Option B: Through the Admin Panel (if you already have admin access)

1. Log in as an existing admin user
2. Go to the Users Management page
3. Find the user you want to make admin
4. Click Edit
5. Check the "Admin" checkbox
6. Click Update

### Step 2: Log In

1. Navigate to the login page
2. Enter your email and password (for the user you just made admin)
3. Click "Sign In"

### Step 3: Automatic Redirect

Once you log in with an admin account:

- **Admin users** are automatically redirected to the Admin Dashboard
- **Regular users** are redirected to the ShopHub Homepage

The system checks the `is_admin` field in the `user_profiles` table to determine if a user should see the admin dashboard.

## Admin Dashboard Features

The admin dashboard includes:

1. **Dashboard** - Overview with key metrics (orders, users, products, revenue)
2. **Products Management** - Add, edit, delete, and view all products
3. **Orders Management** - View and update order statuses
4. **Users Management** - View, edit, activate/deactivate, and delete users
5. **Analytics** - View sales analytics and reports

## Dark Mode

The entire application (including admin dashboard) supports dark mode:

- Toggle dark mode using the moon/sun icon in the navigation bar (user view) or sidebar (admin view)
- Your preference is saved and persists across sessions

## Database Connection

Your database is: `bolt-native-database-61634432`

Connection string format:

```
postgresql://postgres:[YOUR-PASSWORD]@db.uacfzrtsalllgrwnzgrp.supabase.co:5432/postgres
```

## Troubleshooting

If you can't access the admin dashboard:

1. Verify that `is_admin = true` in the `user_profiles` table for your user
2. Check that you're logged in with the correct account
3. Clear your browser cache and cookies
4. Try logging out and logging back in
