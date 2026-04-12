DROP FUNCTION IF EXISTS public.place_order_from_cart(text, text, text, text, text, text, text);

CREATE OR REPLACE FUNCTION public.place_order_from_cart(
  p_full_name text,
  p_phone text,
  p_address text,
  p_city text,
  p_delivery_type text,
  p_payment_method text,
  p_pickup_location text DEFAULT NULL
)
RETURNS TABLE(order_id uuid, order_number text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_shipping_address_id uuid := NULL;
  v_order_id uuid;
  v_order_number text;
  v_subtotal numeric(10, 2) := 0;
  v_tax numeric(10, 2) := 0;
  v_shipping_fee numeric(10, 2) := 0;
  v_total numeric(10, 2) := 0;
  v_cart_count integer := 0;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required to place an order.';
  END IF;

  IF p_delivery_type NOT IN ('delivery', 'pickup') THEN
    RAISE EXCEPTION 'Invalid delivery type: %', p_delivery_type;
  END IF;

  IF p_payment_method NOT IN ('credit_card', 'mobile_money', 'e_wallet') THEN
    RAISE EXCEPTION 'Invalid payment method: %', p_payment_method;
  END IF;

  IF COALESCE(trim(p_full_name), '') = '' THEN
    RAISE EXCEPTION 'Full name is required.';
  END IF;

  IF COALESCE(trim(p_phone), '') = '' THEN
    RAISE EXCEPTION 'Phone number is required.';
  END IF;

  IF p_delivery_type = 'delivery' THEN
    IF COALESCE(trim(p_address), '') = '' THEN
      RAISE EXCEPTION 'Street address is required for delivery orders.';
    END IF;

    IF COALESCE(trim(p_city), '') = '' THEN
      RAISE EXCEPTION 'City is required for delivery orders.';
    END IF;
  END IF;

  SELECT COUNT(*)
  INTO v_cart_count
  FROM cart_items
  WHERE user_id = v_user_id;

  IF v_cart_count = 0 THEN
    RAISE EXCEPTION 'Your cart is empty.';
  END IF;

  SELECT COALESCE(SUM((p.price * c.quantity)::numeric), 0)
  INTO v_subtotal
  FROM cart_items c
  JOIN products p ON p.id = c.product_id
  WHERE c.user_id = v_user_id;

  IF v_subtotal <= 0 THEN
    RAISE EXCEPTION 'Unable to calculate order total from cart items.';
  END IF;

  v_tax := round(v_subtotal * 0.18, 2);
  v_shipping_fee := CASE WHEN p_delivery_type = 'delivery' THEN 5000 ELSE 0 END;
  v_total := v_subtotal + v_tax + v_shipping_fee;

  IF p_delivery_type = 'delivery' THEN
    UPDATE user_addresses
    SET is_default = false,
        updated_at = now()
    WHERE user_id = v_user_id
      AND type = 'shipping';

    INSERT INTO user_addresses (
      user_id,
      type,
      full_name,
      phone,
      street_address,
      city,
      is_default
    )
    VALUES (
      v_user_id,
      'shipping',
      trim(p_full_name),
      trim(p_phone),
      trim(p_address),
      trim(p_city),
      true
    )
    RETURNING id INTO v_shipping_address_id;
  END IF;

  v_order_number := 'ORD-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));

  INSERT INTO orders (
    order_number,
    user_id,
    subtotal,
    tax,
    shipping_fee,
    total_amount,
    status,
    payment_method,
    payment_status,
    delivery_type,
    shipping_address_id,
    pickup_location
  )
  VALUES (
    v_order_number,
    v_user_id,
    v_subtotal,
    v_tax,
    v_shipping_fee,
    v_total,
    'pending',
    p_payment_method,
    'pending',
    p_delivery_type,
    v_shipping_address_id,
    CASE
      WHEN p_delivery_type = 'pickup' THEN COALESCE(NULLIF(trim(p_pickup_location), ''), 'Main partner pickup point')
      ELSE NULL
    END
  )
  RETURNING id INTO v_order_id;

  INSERT INTO order_items (
    order_id,
    product_id,
    product_name,
    product_price,
    quantity,
    subtotal
  )
  SELECT
    v_order_id,
    p.id,
    p.name,
    p.price,
    c.quantity,
    round((p.price * c.quantity)::numeric, 2)
  FROM cart_items c
  JOIN products p ON p.id = c.product_id
  WHERE c.user_id = v_user_id;

  INSERT INTO order_status_history (
    order_id,
    status,
    note,
    changed_by
  )
  VALUES (
    v_order_id,
    'pending',
    'Order placed by customer',
    v_user_id
  );

  DELETE FROM cart_items
  WHERE user_id = v_user_id;

  RETURN QUERY
  SELECT v_order_id, v_order_number;
END;
$$;

GRANT EXECUTE ON FUNCTION public.place_order_from_cart(text, text, text, text, text, text, text) TO authenticated;
