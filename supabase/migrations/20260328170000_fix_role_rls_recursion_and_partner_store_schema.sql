-- Repair recursive RLS policy chains and partner_stores schema drift.
-- This migration is safe to apply on top of earlier migrations and replaces
-- role checks with SECURITY DEFINER helpers so PostgREST does not recurse.

ALTER TABLE IF EXISTS public.partner_stores
  ADD COLUMN IF NOT EXISTS slug text;

ALTER TABLE IF EXISTS public.partner_stores
  ADD COLUMN IF NOT EXISTS website text;

UPDATE public.partner_stores
SET slug = lower(trim(both '-' FROM regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g')))
           || '-'
           || left(id::text, 8)
WHERE slug IS NULL
   OR btrim(slug) = '';

CREATE TABLE IF NOT EXISTS public.store_managers (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  store_id uuid NOT NULL REFERENCES public.partner_stores(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.store_managers ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin_user(target_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE id = target_user_id
  );
$$;

CREATE OR REPLACE FUNCTION public.manages_store(target_user_id uuid, target_store_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.store_managers
    WHERE id = target_user_id
      AND store_id = target_store_id
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin_user(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.manages_store(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin_user(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.manages_store(uuid, uuid) TO authenticated;

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;
CREATE POLICY "Admins can view all profiles"
  ON public.user_profiles FOR SELECT
  TO authenticated
  USING (public.is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "Only admins can view admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can manage admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can view admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can insert admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can update admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can delete admin users" ON public.admin_users;

CREATE POLICY "Admins can view admin users"
  ON public.admin_users FOR SELECT
  TO authenticated
  USING (public.is_admin_user(auth.uid()));

CREATE POLICY "Admins can insert admin users"
  ON public.admin_users FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin_user(auth.uid()));

CREATE POLICY "Admins can update admin users"
  ON public.admin_users FOR UPDATE
  TO authenticated
  USING (public.is_admin_user(auth.uid()))
  WITH CHECK (public.is_admin_user(auth.uid()));

CREATE POLICY "Admins can delete admin users"
  ON public.admin_users FOR DELETE
  TO authenticated
  USING (public.is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "Store managers can view their own assignment" ON public.store_managers;
DROP POLICY IF EXISTS "Admins can manage store managers" ON public.store_managers;
DROP POLICY IF EXISTS "Admins can insert store managers" ON public.store_managers;
DROP POLICY IF EXISTS "Admins can update store managers" ON public.store_managers;
DROP POLICY IF EXISTS "Admins can delete store managers" ON public.store_managers;

CREATE POLICY "Store managers can view their own assignment"
  ON public.store_managers FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id
    OR public.is_admin_user(auth.uid())
  );

CREATE POLICY "Admins can insert store managers"
  ON public.store_managers FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin_user(auth.uid()));

CREATE POLICY "Admins can update store managers"
  ON public.store_managers FOR UPDATE
  TO authenticated
  USING (public.is_admin_user(auth.uid()))
  WITH CHECK (public.is_admin_user(auth.uid()));

CREATE POLICY "Admins can delete store managers"
  ON public.store_managers FOR DELETE
  TO authenticated
  USING (public.is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;

CREATE POLICY "Admins can view all orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (public.is_admin_user(auth.uid()));

CREATE POLICY "Admins can update orders"
  ON public.orders FOR UPDATE
  TO authenticated
  USING (public.is_admin_user(auth.uid()))
  WITH CHECK (public.is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "Admins can view all order items" ON public.order_items;
CREATE POLICY "Admins can view all order items"
  ON public.order_items FOR SELECT
  TO authenticated
  USING (public.is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "Admins can view all order history" ON public.order_status_history;
DROP POLICY IF EXISTS "Admins can insert order status history" ON public.order_status_history;

CREATE POLICY "Admins can view all order history"
  ON public.order_status_history FOR SELECT
  TO authenticated
  USING (public.is_admin_user(auth.uid()));

CREATE POLICY "Admins can insert order status history"
  ON public.order_status_history FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "Admins can view all payment transactions" ON public.payment_transactions;
CREATE POLICY "Admins can view all payment transactions"
  ON public.payment_transactions FOR SELECT
  TO authenticated
  USING (public.is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "Admins can view all website reviews" ON public.website_reviews;
DROP POLICY IF EXISTS "Admins can update website reviews" ON public.website_reviews;

CREATE POLICY "Admins can view all website reviews"
  ON public.website_reviews FOR SELECT
  TO authenticated
  USING (public.is_admin_user(auth.uid()));

CREATE POLICY "Admins can update website reviews"
  ON public.website_reviews FOR UPDATE
  TO authenticated
  USING (public.is_admin_user(auth.uid()))
  WITH CHECK (public.is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "Only admins can view sales analytics" ON public.sales_analytics;
DROP POLICY IF EXISTS "Only admins can insert analytics" ON public.sales_analytics;
DROP POLICY IF EXISTS "Only admins can update analytics" ON public.sales_analytics;

CREATE POLICY "Only admins can view sales analytics"
  ON public.sales_analytics FOR SELECT
  TO authenticated
  USING (public.is_admin_user(auth.uid()));

CREATE POLICY "Only admins can insert analytics"
  ON public.sales_analytics FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin_user(auth.uid()));

CREATE POLICY "Only admins can update analytics"
  ON public.sales_analytics FOR UPDATE
  TO authenticated
  USING (public.is_admin_user(auth.uid()))
  WITH CHECK (public.is_admin_user(auth.uid()));
