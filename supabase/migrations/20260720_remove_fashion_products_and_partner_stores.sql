-- Migration: remove fashion products and partner stores (except store1 and Kigali Tech Hub)
-- IMPORTANT: This permanently deletes data. BACKUP your database before running.

BEGIN;

-- 1) Identify fashion category ids (case-insensitive match on slug or name)
--    If your category slug is different, adjust the WHERE clause.
CREATE TEMP TABLE tmp_fashion_cat_ids (id uuid) ON COMMIT DROP;
INSERT INTO tmp_fashion_cat_ids (id)
SELECT id FROM categories WHERE lower(slug) = 'fashion' OR lower(name) = 'fashion';

-- 2) Identify product ids in those categories
CREATE TEMP TABLE tmp_fashion_product_ids (id uuid) ON COMMIT DROP;
INSERT INTO tmp_fashion_product_ids (id)
SELECT id FROM products WHERE category_id IN (SELECT id FROM tmp_fashion_cat_ids);

-- 3) Delete dependent rows that reference products (order_items, product_reviews, cart_items)
--    Adjust or remove any statements here if your DB uses different table names.
DELETE FROM order_items WHERE product_id IN (SELECT id FROM tmp_fashion_product_ids);
DELETE FROM product_reviews WHERE product_id IN (SELECT id FROM tmp_fashion_product_ids);
DELETE FROM cart_items WHERE product_id IN (SELECT id FROM tmp_fashion_product_ids);

-- 4) Delete the products themselves
DELETE FROM products WHERE id IN (SELECT id FROM tmp_fashion_product_ids);

-- 5) Optionally remove the fashion category row(s) themselves (UNCOMMENT to enable)
-- DELETE FROM categories WHERE id IN (SELECT id FROM tmp_fashion_cat_ids);

-- 6) Delete partner stores except the two allowed names (case-insensitive)
DELETE FROM partner_stores
WHERE lower(name) NOT IN ('store1', 'kigali tech hub');

COMMIT;

-- NOTES:
-- - If you have foreign keys that cascade, some dependent deletes may be redundant.
-- - If any DELETE fails due to FK constraints, review the dependent table names and adjust the script.
-- - Test on a staging copy first.
