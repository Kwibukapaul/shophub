CREATE TABLE IF NOT EXISTS store_managers (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  store_id uuid NOT NULL REFERENCES partner_stores(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE store_managers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage admin users" ON admin_users;
CREATE POLICY "Admins can manage admin users"
  ON admin_users FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Store managers can view their own assignment" ON store_managers;
CREATE POLICY "Store managers can view their own assignment"
  ON store_managers FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id
    OR EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can manage store managers" ON store_managers;
CREATE POLICY "Admins can manage store managers"
  ON store_managers FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_store_managers_store_id ON store_managers(store_id);
