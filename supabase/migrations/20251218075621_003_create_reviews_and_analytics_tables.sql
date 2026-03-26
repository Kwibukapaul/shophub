/*
  # Create Reviews and Analytics Tables

  1. New Tables
    - `product_reviews` - Customer reviews and ratings for products
    - `website_reviews` - Platform reviews and feedback
    - `sales_analytics` - Daily sales metrics for admin dashboard
  
  2. Security
    - Enable RLS on all tables
    - Allow users to create and view reviews
    - Restrict analytics to admins only
*/

CREATE TABLE IF NOT EXISTS product_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text,
  comment text,
  helpful_count integer DEFAULT 0,
  is_verified_purchase boolean DEFAULT false,
  is_approved boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(product_id, user_id)
);

CREATE TABLE IF NOT EXISTS website_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  category text CHECK (category IN ('user_experience', 'product_quality', 'delivery', 'customer_service', 'other')),
  is_approved boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sales_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL UNIQUE,
  total_orders integer DEFAULT 0,
  total_revenue decimal(10, 2) DEFAULT 0,
  total_cost decimal(10, 2) DEFAULT 0,
  profit decimal(10, 2) DEFAULT 0,
  avg_order_value decimal(10, 2) DEFAULT 0,
  orders_by_category jsonb DEFAULT '{}',
  payment_method_breakdown jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for product_reviews
CREATE POLICY "Product reviews are viewable by everyone"
  ON product_reviews FOR SELECT
  USING (is_approved = true);

CREATE POLICY "Users can view all reviews including unapproved"
  ON product_reviews FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create product reviews"
  ON product_reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
  ON product_reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews"
  ON product_reviews FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for website_reviews
CREATE POLICY "Approved website reviews are viewable by everyone"
  ON website_reviews FOR SELECT
  USING (is_approved = true);

CREATE POLICY "Admins can view all website reviews"
  ON website_reviews FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create website reviews"
  ON website_reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update website reviews"
  ON website_reviews FOR UPDATE
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

-- RLS Policies for sales_analytics (admins only)
CREATE POLICY "Only admins can view sales analytics"
  ON sales_analytics FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Only admins can insert analytics"
  ON sales_analytics FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Only admins can update analytics"
  ON sales_analytics FOR UPDATE
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_user_id ON product_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_is_approved ON product_reviews(is_approved);
CREATE INDEX IF NOT EXISTS idx_product_reviews_created_at ON product_reviews(created_at);
CREATE INDEX IF NOT EXISTS idx_website_reviews_user_id ON website_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_website_reviews_is_approved ON website_reviews(is_approved);
CREATE INDEX IF NOT EXISTS idx_sales_analytics_date ON sales_analytics(date);