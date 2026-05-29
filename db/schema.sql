-- Create the benchmark database before running this script.
-- Example:
-- createdb benchmark
-- psql -U benchmark_user -d benchmark -f db/schema.sql

CREATE TABLE IF NOT EXISTS benchmark_submissions (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  shopify_store_url TEXT,
  brand_name TEXT,
  category TEXT,
  orders_per_month INTEGER,
  average_order_value NUMERIC,
  total_revenue NUMERIC,
  total_orders INTEGER,
  total_customers INTEGER,
  repeat_customers INTEGER,
  repeat_rate NUMERIC,
  add_to_cart_rate NUMERIC,
  revenue_from_repeat NUMERIC,
  metrics JSONB DEFAULT '{}'::jsonb,
  shelf_score NUMERIC,
  cohort_percentile NUMERIC,
  performance_verdict TEXT,
  gap01_desc TEXT,
  gap01_value TEXT,
  gap02_desc TEXT,
  gap02_value TEXT,
  gap03_desc TEXT,
  gap03_value TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
