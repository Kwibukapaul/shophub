/*
  # Seed Initial Data

  1. Categories
    - Electronics category with sample description and image
    - Fashion category with sample description and image

  2. Sample Products
    - Electronics products (laptops, phones, accessories)
    - Fashion products (clothing, accessories)

  3. Purpose
    - Populate the database with test data for demonstration
    - Allow users to browse products immediately
*/

-- Insert Categories
INSERT INTO categories (name, slug, description, display_order)
VALUES
  ('Electronics', 'electronics', 'High-quality electronics and gadgets', 1),
  ('Fashion', 'fashion', 'Latest fashion trends and clothing', 2)
ON CONFLICT (slug) DO NOTHING;

-- Get category IDs
DO $$
DECLARE
  electronics_id uuid;
  fashion_id uuid;
BEGIN
  SELECT id INTO electronics_id FROM categories WHERE slug = 'electronics';
  SELECT id INTO fashion_id FROM categories WHERE slug = 'fashion';

  -- Insert Electronics Products
  INSERT INTO products (
    name, slug, description, long_description, price, cost_price, 
    category_id, stock_quantity, sku, is_featured, is_active, image_urls
  )
  VALUES
    (
      'Laptop Pro 15',
      'laptop-pro-15',
      'High-performance laptop for professionals',
      'Powerful 15-inch laptop with Intel i7, 16GB RAM, and 512GB SSD. Perfect for programming, design, and video editing.',
      1200000,
      800000,
      electronics_id,
      15,
      'LAPTOP-001',
      true,
      true,
      ARRAY['https://images.pexels.com/photos/18105/pexels-photo.jpg']
    ),
    (
      'Smartphone X Pro',
      'smartphone-x-pro',
      'Latest flagship smartphone with advanced features',
      '6.7-inch AMOLED display, 256GB storage, 48MP camera, 5G connectivity',
      800000,
      500000,
      electronics_id,
      25,
      'PHONE-001',
      true,
      true,
      ARRAY['https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg']
    ),
    (
      'Wireless Headphones',
      'wireless-headphones',
      'Premium noise-cancelling headphones',
      'Active noise cancellation, 30-hour battery life, premium sound quality',
      150000,
      80000,
      electronics_id,
      40,
      'HEAD-001',
      false,
      true,
      ARRAY['https://images.pexels.com/photos/3379957/pexels-photo-3379957.jpeg']
    ),
    (
      'USB-C Fast Charger',
      'usb-c-fast-charger',
      'Quick charging solution for all devices',
      '65W fast charger compatible with laptops and phones',
      45000,
      20000,
      electronics_id,
      100,
      'CHARGE-001',
      false,
      true,
      ARRAY['https://images.pexels.com/photos/4195325/pexels-photo-4195325.jpeg']
    );

  -- Insert Fashion Products
  INSERT INTO products (
    name, slug, description, long_description, price, cost_price, 
    category_id, stock_quantity, sku, is_featured, is_active, image_urls
  )
  VALUES
    (
      'Premium Denim Jacket',
      'premium-denim-jacket',
      'Classic denim jacket with modern style',
      'High-quality denim, perfect for casual and semi-formal occasions',
      120000,
      60000,
      fashion_id,
      30,
      'JACKET-001',
      true,
      true,
      ARRAY['https://images.pexels.com/photos/2468770/pexels-photo-2468770.jpeg']
    ),
    (
      'Casual Cotton T-Shirt',
      'casual-cotton-tshirt',
      'Comfortable everyday t-shirt',
      '100% organic cotton, available in multiple colors',
      35000,
      15000,
      fashion_id,
      80,
      'TSHIRT-001',
      false,
      true,
      ARRAY['https://images.pexels.com/photos/2769274/pexels-photo-2769274.jpeg']
    ),
    (
      'Elegant Evening Dress',
      'elegant-evening-dress',
      'Sophisticated dress for special occasions',
      'Premium fabric with elegant design, perfect for events',
      250000,
      120000,
      fashion_id,
      20,
      'DRESS-001',
      true,
      true,
      ARRAY['https://images.pexels.com/photos/1055691/pexels-photo-1055691.jpeg']
    ),
    (
      'Comfortable Running Shoes',
      'comfortable-running-shoes',
      'Professional running footwear',
      'Ergonomic design with superior cushioning and support',
      180000,
      90000,
      fashion_id,
      45,
      'SHOES-001',
      false,
      true,
      ARRAY['https://images.pexels.com/photos/1055691/pexels-photo-1055691.jpeg']
    );

END $$;

-- Insert Partner Stores (seed)
INSERT INTO partner_stores (name, slug, description, website, contact_email, is_active)
VALUES
  ('Alpha Electronics', 'alpha-electronics', 'Official partner store for Alpha Electronics', 'https://alpha.example.com', 'sales@alpha.example.com', true),
  ('Fashionista Co', 'fashionista-co', 'Trendy fashion store and partner', 'https://fashionista.example.com', 'hello@fashionista.example.com', true),
  ('HomeGoods Depot', 'homegoods-depot', 'Home and living partner store', 'https://homegoods.example.com', 'support@homegoods.example.com', true)
ON CONFLICT (slug) DO NOTHING;

-- Associate some existing products with partner stores and add a few extra partner products
DO $$
DECLARE
  alpha_id uuid;
  fashionista_id uuid;
  homegoods_id uuid;
  prod_id uuid;
BEGIN
  SELECT id INTO alpha_id FROM partner_stores WHERE slug = 'alpha-electronics';
  SELECT id INTO fashionista_id FROM partner_stores WHERE slug = 'fashionista-co';
  SELECT id INTO homegoods_id FROM partner_stores WHERE slug = 'homegoods-depot';

  -- Assign a couple of products to stores (if they exist)
  UPDATE products SET partner_store_id = alpha_id WHERE slug IN ('laptop-pro-15', 'smartphone-x-pro');
  UPDATE products SET partner_store_id = fashionista_id WHERE slug IN ('premium-denim-jacket', 'elegant-evening-dress');

  -- Insert a few more partner-specific products
  INSERT INTO products (
    name, slug, description, long_description, price, cost_price,
    category_id, stock_quantity, sku, is_featured, is_active, image_urls, partner_store_id
  )
  SELECT
    'Alpha USB-C Dock', 'alpha-usb-c-dock', 'Docking station for laptops', 'Multi-port docking station with HDMI and Ethernet', 90000, 40000,
    c.id, 50, 'DOCK-001', false, true, ARRAY['https://images.pexels.com/photos/577585/pexels-photo-577585.jpeg'], alpha_id
  FROM categories c WHERE c.slug = 'electronics'
  LIMIT 1
  ON CONFLICT (slug) DO NOTHING;

  INSERT INTO products (
    name, slug, description, long_description, price, cost_price,
    category_id, stock_quantity, sku, is_featured, is_active, image_urls, partner_store_id
  )
  SELECT
    'Fashionista Sunglasses', 'fashionista-sunglasses', 'Stylish UV-protective sunglasses', 'Lightweight frame, polarized lenses', 45000, 20000,
    c.id, 120, 'SUN-001', false, true, ARRAY['https://images.pexels.com/photos/46710/pexels-photo-46710.jpeg'], fashionista_id
  FROM categories c WHERE c.slug = 'fashion'
  LIMIT 1
  ON CONFLICT (slug) DO NOTHING;

  INSERT INTO products (
    name, slug, description, long_description, price, cost_price,
    category_id, stock_quantity, sku, is_featured, is_active, image_urls, partner_store_id
  )
  SELECT
    'HomeComfort Pillow', 'homecomfort-pillow', 'Ergonomic memory foam pillow', 'Designed for better neck support and sleep', 30000, 12000,
    c.id, 200, 'PILLOW-001', false, true, ARRAY['https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg'], homegoods_id
  FROM categories c WHERE c.slug = 'fashion' -- use fashion as fallback if no home category
  LIMIT 1
  ON CONFLICT (slug) DO NOTHING;
END $$;