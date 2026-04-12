DROP POLICY IF EXISTS "Users can insert items in their own orders" ON order_items;

CREATE POLICY "Users can insert items in their own orders"
  ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );
