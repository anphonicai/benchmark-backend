# Automated Shopify Data Import

This guide explains how to automatically import real-time benchmark data from your 5 Shopify stores into the benchmark database.

## Overview

The automated import system:
1. Fetches live store metrics from Shopify Admin API
2. Calculates benchmark scores and performance verdicts
3. Stores data in PostgreSQL
4. Updates the report in real-time

You have two options:

- **Option A**: Use the backend Node script (faster, for one-time imports)
- **Option B**: Use the frontend UI (easier, visual setup)

---

## Option A: Automated Backend Import (Recommended for first-time setup)

### Step 1: Get Shopify access tokens

For each of your 5 stores, create a private app:

1. Log in to your Shopify admin: `https://your-store.myshopify.com/admin`
2. Go to **Settings** → **Apps and integrations**
3. Click **Develop apps**
4. Click **Create an app**
5. Name it "Benchmark Importer"
6. Under **Admin API scopes**, grant read access to:
   - `read_orders`
   - `read_customers`
   - `read_products`
7. Click **Save** and then **Reveal** to show the access token
8. Copy the token (starts with `shpat_`)

Do this for all 5 stores.

### Step 2: Update the import script

Edit `/Users/akshita/Documents/benchmark-backend/importShopifyData.js` and replace the placeholders:

```javascript
const SHOPIFY_STORES = [
  {
    company_name: 'Aroha Wellness',
    contact_email: 'aroha@example.com',
    contact_name: 'Aroha Team',
    phone: '+91-1234567890',
    brand_name: 'Aroha Wellness',
    category: 'Wellness',
    shopifyStoreUrl: 'aroha.myshopify.com',
    shopifyToken: 'shpat_XXXXX_YOUR_ACTUAL_TOKEN_HERE',  // ← Replace this
  },
  // ... repeat for all 5 stores
];
```

### Step 3: Run the import

```bash
cd /Users/akshita/Documents/benchmark-backend
node importShopifyData.js
```

Expected output:
```
Starting Shopify data import...

Fetching data for Aroha Wellness...
✓ Aroha Wellness: imported successfully
  - Revenue: ₹269500
  - Repeat rate: 35.56%
  - AOV: ₹2450

... (more stores)

=== Import Summary ===
Successful: 5
Failed: 0
```

✅ Data is now in your database! The frontend report will show real metrics.

---

## Option B: Frontend UI Import

### Step 1: Start the backend and frontend

```bash
# Terminal 1: Backend
cd /Users/akshita/Documents/benchmark-backend
npm start

# Terminal 2: Frontend
cd benchmark-frontend
npm start
```

### Step 2: Open the Import page

Navigate to: `http://localhost:3001/import`

### Step 3: Enter your tokens

For each store:
1. Find the "Shopify access token" field
2. Paste your token (from the Shopify admin)
3. The store URL is pre-filled

### Step 4: Click "Import all stores"

The frontend will:
- Validate all tokens
- Fetch metrics from each store
- Display success/error for each import
- Automatically update the database

When done, go to **Results** → see the benchmark report.

---

## What the import does

For each store, the script:

1. **Fetches Shopify data**:
   - Total orders (last 250)
   - Total revenue
   - Total customers (last 250)
   - Repeat customers (customers with >1 order)

2. **Calculates metrics**:
   - `average_order_value` = Total revenue ÷ Total orders
   - `repeat_rate` = (Repeat customers ÷ Total customers) × 100
   - `revenue_from_repeat` = Repeat revenue percentage
   - `shelf_score` = (repeat_rate × 50) + (add_to_cart_rate × 30) + (orders_per_month ÷ 100)
   - `performance_verdict` = verdict based on repeat_rate and AOV

3. **Stores in database**:
   - All brand info (name, email, category, etc.)
   - All calculated metrics
   - Raw Shopify JSON response

---

## Shopify API Limits

- **Rate limit**: 2 requests/second per app
- **Data limit**: API returns last 250 orders, 250 customers
- **Cost**: Free (uses Shopify Admin API)

For larger stores, this covers ~3-6 months of recent data.

---

## Troubleshooting

### Error: "Invalid Shopify access token format"
- Make sure the token starts with `shpat_`
- Check you copied the full token

### Error: "404 - Store not found"
- Make sure the store URL is correct (e.g., `brand.myshopify.com`)
- Remove `https://` or `http://` if present

### Error: "Insufficient permissions"
- The token needs read access to: orders, customers, products
- Go back to your Shopify app settings and grant scopes

### No data showing after import
- Run `/report` endpoint to verify: `curl http://localhost:3000/report`
- Check database directly: `psql -U benchmark_user -d benchmark -c "SELECT COUNT(*) FROM benchmark_submissions;"`

---

## Re-importing data

If you want to refresh all metrics (to get latest Shopify data):

```bash
# Run the import again
node importShopifyData.js
```

It uses `ON CONFLICT ... DO UPDATE`, so existing records are updated, not duplicated.

---

## Next steps

1. ✅ Import real data from your 5 stores
2. View the benchmark report at `/results`
3. Each brand will show:
   - Performance verdict
   - Percentile ranking within cohort
   - Category-level benchmarks
4. Use this to identify:
   - Which brands are top performers
   - Where your brand stands vs cohort
   - Key gaps vs benchmarks

---

## Database schema

The imported data is stored in:

```sql
benchmark_submissions (
  id, name, email, phone,
  shopify_store_url, brand_name, category,
  orders_per_month,
  average_order_value, total_revenue, total_orders, total_customers,
  repeat_customers, repeat_rate, add_to_cart_rate, revenue_from_repeat,
  shelf_score, cohort_percentile, performance_verdict,
  metrics (JSON), created_at
)
```

All fields are real and queryable for custom reports.
