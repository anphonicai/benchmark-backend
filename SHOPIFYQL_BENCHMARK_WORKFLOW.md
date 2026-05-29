# ShopifyQL Benchmark Workflow

This document explains how the new benchmark route works, what it uses, and how to verify it.

## What was added

### New backend route
- `POST /api/companies/benchmark`

### What it does
1. Accepts company onboarding data and Shopify credentials.
2. Runs ShopifyQL summary queries against the store via GraphQL.
3. Parses the ShopifyQL response.
4. Upserts the company record in `companies`.
5. Stores a summary metrics row in `metrics`.
6. Returns a benchmark-ready response for the frontend.

## Required request fields

The route expects this payload:

```json
{
  "company_name": "Nourish Labs",
  "website": "https://nourishlabs.com",
  "tier": "Growth",
  "contact_name": "Alice Johnson",
  "contact_email": "contact@nourishlabs.com",
  "phone": "555-0002",
  "cluster": "Cluster A",
  "category": "Health & Nutrition",
  "shopify_store_url": "vv0akh-hg.myshopify.com",
  "shopify_access_token": "shpat_valid_token",
  "orders_per_month": 300
}
```

Required fields:
- `company_name`
- `shopify_store_url`
- `shopify_access_token`

Optional fields are accepted and stored in the `companies` table.

## ShopifyQL queries used

The backend runs three ShopifyQL queries:

1. Sales summary
   - `FROM sales SHOW total_sales, orders SINCE -365d`
   - Returns total revenue and total orders for the last 12 months.

2. Product category breakdown
   - `FROM sales SHOW product_type, total_sales, orders WHERE product_type IS NOT NULL GROUP BY product_type ORDER BY total_sales DESC LIMIT 20`
   - Returns sales and orders by product category.

3. Customer cohort summary
   - `FROM customers SHOW cohort_type, count() AS customer_count GROUP BY cohort_type`
   - Returns customer counts by cohort type, including repeat/returning customers.

## Data stored in the database

### `companies`
The route inserts or updates the company record based on `shopify_store_url`.

### `metrics`
The route stores a metrics row with:
- `total_revenue`
- `total_orders`
- `total_customers`
- `repeat_customers`
- `average_order_value`
- `repeat_rate`
- `add_to_cart_rate` (currently null)
- `revenue_from_repeat` (currently null)
- `shelf_score` (calculated when `orders_per_month` is provided)
- raw ShopifyQL/Shopify metrics payload is not persisted in the current schema

## How to verify it works

### 0. Available API routes

- `POST /api/companies/benchmark/manual` — save manual benchmark inputs and persist a metrics record
- `GET /api/companies/benchmark/:companyId` — fetch the latest stored benchmark report for a company

### 1. Start the backend

```bash
cd /Users/akshita/Documents/benchmark-backend
node server.js
```

### 2. Test the new route

Use Thunder Client, Postman, or curl.

#### Manual report save

```bash
curl -X POST http://localhost:3000/api/companies/benchmark/manual \
  -H "Content-Type: application/json" \
  -d '{
    "company_name": "Anphonic Demo",
    "website": "https://anphonic-demo.example",
    "tier": "Starter",
    "contact_name": "Demo User",
    "contact_email": "demo@anphonic.example",
    "phone": "555-0003",
    "cluster": "Demo Cluster",
    "category": "Demo",
    "shopify_store_url": "vv0akh-hg.myshopify.com",
    "total_revenue": 360000,
    "total_orders": 300,
    "total_customers": 240,
    "repeat_customers": 60,
    "average_order_value": 1200,
    "repeat_rate": 25,
    "add_to_cart_rate": 6.5,
    "revenue_from_repeat": 40000,
    "orders_per_month": 25
  }'
```

#### Fetch latest report by company

```bash
curl -X GET http://localhost:3000/api/companies/benchmark/1
```

Replace `1` with the actual `companyId` returned by the manual save call.

#### Existing ShopifyQL report endpoint

```bash
curl -X POST http://localhost:3000/api/companies/benchmark \
  -H "Content-Type: application/json" \
  -d '{
    "company_name": "Nourish Labs",
    "contact_email": "contact@nourishlabs.com",
    "contact_name": "Alice Johnson",
    "phone": "555-0002",
    "shopify_store_url": "vv0akh-hg.myshopify.com",
    "shopify_access_token": "shpat_valid_token",
    "category": "Health & Nutrition",
    "tier": "Growth",
    "cluster": "Cluster A",
    "website": "https://nourishlabs.com",
    "orders_per_month": 300
  }'
```

### 3. Expected response

The API should return a JSON response with:
- `success: true`
- `companyId`
- `metricsId`
- a `report` object containing:
  - `total_revenue`
  - `total_orders`
  - `total_customers`
  - `repeat_customers`
  - `repeat_rate`
  - `average_order_value`
  - `category_breakdown`
  - `customer_cohorts`

### 4. Frontend fetch example

Use this JavaScript snippet from your form submit handler:

```js
const payload = {
  company_name: formData.companyName,
  website: formData.website,
  tier: formData.tier,
  contact_name: formData.contactName,
  contact_email: formData.contactEmail,
  phone: formData.phone,
  cluster: formData.cluster,
  category: formData.category,
  shopify_store_url: formData.shopifyStoreUrl,
  total_revenue: Number(formData.totalRevenue),
  total_orders: Number(formData.totalOrders),
  total_customers: Number(formData.totalCustomers),
  repeat_customers: Number(formData.repeatCustomers),
  average_order_value: Number(formData.averageOrderValue),
  repeat_rate: Number(formData.repeatRate),
  add_to_cart_rate: Number(formData.addToCartRate),
  revenue_from_repeat: Number(formData.revenueFromRepeat),
  orders_per_month: Number(formData.ordersPerMonth),
};

fetch('http://localhost:3000/api/companies/benchmark/manual', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),
})
  .then((response) => response.json())
  .then((data) => {
    if (!data.success) {
      throw new Error(data.message || 'Report generation failed');
    }
    console.log('Benchmark report:', data.report);
    // Render report in the UI here.
  })
  .catch((error) => {
    console.error('Manual benchmark error:', error);
  });
```

If you want to fetch the saved report later:

```js
fetch(`http://localhost:3000/api/companies/benchmark/${companyId}`)
  .then((response) => response.json())
  .then((data) => {
    console.log('Latest report:', data.report);
  });
```

### 4. Check the database

Run queries against PostgreSQL to verify data is stored:

```sql
SELECT * FROM companies WHERE shopify_store_url = 'vv0akh-hg.myshopify.com';
SELECT * FROM metrics WHERE company_id = <companyId>;
```

### 5. Verify the report endpoint

A later frontend can request the stored metrics and build charts from the `report` object.

## Notes

- If the Shopify token is invalid, the route will return a 500 error with the token error message.
- The backend currently does not persist the full ShopifyQL response JSON in the `metrics` table.
- `add_to_cart_rate` and `revenue_from_repeat` are placeholders until a dedicated ShopifyQL query is added for those values.

## Next improvement

The next step is to add one more route that:
- queries category cohort averages from the `metrics` table
- compares the client against the benchmark cohort
- returns a full performance verdict

That will complete the benchmark report flow for the frontend.
