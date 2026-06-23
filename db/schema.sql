-- Create the benchmark database before running this script.
-- Example:
-- createdb benchmark
-- psql -U benchmark_user -d benchmark -f db/schema.sql

-- Companies table: stores brand info
CREATE TABLE IF NOT EXISTS companies (
  id SERIAL PRIMARY KEY,
  company_name VARCHAR(255) NOT NULL,
  website VARCHAR(255),
  tier VARCHAR(50),
  contact_name VARCHAR(255),
  contact_email VARCHAR(255),
  phone VARCHAR(20),
  cluster VARCHAR(100),
  category VARCHAR(100),
  shopify_store_url VARCHAR(255) UNIQUE,
  show_on_leaderboard BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Metrics table: stores benchmark results
CREATE TABLE IF NOT EXISTS metrics (
  id SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  total_revenue NUMERIC,
  total_orders INTEGER,
  total_customers INTEGER,
  repeat_customers INTEGER,
  average_order_value NUMERIC,
  repeat_rate NUMERIC,
  add_to_cart_rate NUMERIC,
  revenue_from_repeat NUMERIC,
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

-- Legacy table: benchmark_submissions (kept for backwards compatibility)
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

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_companies_email ON companies(contact_email);
CREATE INDEX IF NOT EXISTS idx_companies_shopify ON companies(shopify_store_url);
CREATE INDEX IF NOT EXISTS idx_metrics_company ON metrics(company_id);
CREATE INDEX IF NOT EXISTS idx_metrics_created ON metrics(created_at);
