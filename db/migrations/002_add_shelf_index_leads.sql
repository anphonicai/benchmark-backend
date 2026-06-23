-- Shelf Index lead captures: people who unlock the report
CREATE TABLE IF NOT EXISTS shelf_index_leads (
  id          SERIAL PRIMARY KEY,
  full_name   VARCHAR(200) NOT NULL,
  email       VARCHAR(255) NOT NULL,
  brand_url   VARCHAR(500) NOT NULL,
  phone       VARCHAR(20)  NOT NULL,
  source      VARCHAR(100) DEFAULT 'shelf-index-page',
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shelf_leads_email ON shelf_index_leads(email);
CREATE INDEX IF NOT EXISTS idx_shelf_leads_created ON shelf_index_leads(created_at);
