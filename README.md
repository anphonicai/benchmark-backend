# benchmark-backend

A Node.js + Express backend for benchmark analytics and Shopify-enabled lead capture. This backend stores lead submissions in PostgreSQL, fetches Shopify metrics, and calculates manual benchmark scores.

## Prerequisites

- Node.js 18+ (recommended)
- npm
- PostgreSQL

## Installation

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Update `.env` with your database connection and Shopify credentials.

4. Create the PostgreSQL database and run the schema script:
```bash
createdb benchmark
psql -U benchmark_user -d benchmark -f db/schema.sql
```

## Environment Variables

Use `.env` with values like:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=benchmark_user
DB_PASSWORD=yourpassword
DB_NAME=benchmark
SHOPIFY_API_BASE_URL=https://<your-shopify-store>.myshopify.com/admin/api/2022-10
SHOPIFY_API_TOKEN=shpat_your_token_here
```

## Running the Server

```bash
npm start
```

Server will start on `http://localhost:3000`

## Database Schema

The `benchmark_submissions` table stores lead data and benchmark metadata.
Use `db/schema.sql` to create the table.

## API Endpoints

### Health Check
- **GET** `/health`
- Response:
  ```json
  { "message": "Server is running" }
  ```

### Submit Lead
- **POST** `/lead`
- Required JSON body:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "phone": "555-1234",
    "brand_name": "Benchmark Brand",
    "shopify_store_url": "https://example-store.myshopify.com",
    "category": "Beauty",
    "orders_per_month": "120"
  }
  ```
- Response includes saved submission data.

### Shopify Metrics
- **POST** `/shopify`
- Request body:
  ```json
  {
    "shopifyToken": "shpat_XXXXX",
    "shopifyStoreUrl": "example-store.myshopify.com"
  }
  ```
- Response returns calculated Shopify metrics such as `average_order_value` and `repeat_rate`.

### Shopify Batch Metrics
- **POST** `/shopify/batch`
- Request body:
  ```json
  {
    "stores": [
      {
        "company_name": "Brand A",
        "shopifyToken": "shpat_XXXXX",
        "shopifyStoreUrl": "example-store.myshopify.com"
      },
      {
        "company_name": "Brand B",
        "shopifyToken": "shpat_YYYYY",
        "shopifyStoreUrl": "another-store.myshopify.com"
      }
    ]
  }
  ```
- Response returns an array of metrics results for each Shopify company.

### Manual Benchmark Calculation
- **POST** `/manual`
- Request body:
  ```json
  {
    "average_order_value": 75,
    "repeat_rate": 22,
    "add_to_cart_rate": 5.2,
    "percent_repeat_revenue": 38,
    "orders_per_month": 120
  }
  ```
- Response returns a `shelf_score`.

### Retrieve Metrics
- **GET** `/metrics`
- Returns all submissions from the `benchmark_submissions` table.

## Hosting both frontend and backend together
1. Build the React frontend:
   ```bash
   cd benchmark-frontend
   npm install
   npm run build
   ```
2. From the backend root, start the server:
   ```bash
   cd /Users/akshita/Documents/benchmark-backend
   npm install
   node server.js
   ```
3. The backend will serve the frontend build automatically if `benchmark-frontend/build/index.html` exists.

### Deployment notes
- Set environment variables for your production host:
  - `PORT`
  - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
  - optionally `SHOPIFY_API_BASE_URL`
- In production, use the public host URL for both frontend and backend.
- The hosted app will serve frontend pages from the backend and still use backend API routes like `/manual`, `/api/companies/*`, `/metrics`, and `/report`.

## Sample cURL Requests

Save a lead:
```bash
curl -X POST http://localhost:3000/lead \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "email": "jane@example.com",
    "phone": "555-1234",
    "brand_name": "Benchmark Brand",
    "shopify_store_url": "https://example-store.myshopify.com",
    "category": "Beauty",
    "orders_per_month": "120"
  }'
```

Fetch Shopify metrics:
```bash
curl -X POST http://localhost:3000/shopify \
  -H "Content-Type: application/json" \
  -d '{ "shopifyToken": "shpat_XXXXX", "shopifyStoreUrl": "example-store.myshopify.com" }'
```

Fetch Shopify metrics for multiple companies:
```bash
curl -X POST http://localhost:3000/shopify/batch \
  -H "Content-Type: application/json" \
  -d '{
    "stores": [
      {
        "company_name": "Brand A",
        "shopifyToken": "shpat_XXXXX",
        "shopifyStoreUrl": "brand-a.myshopify.com"
      },
      {
        "company_name": "Brand B",
        "shopifyToken": "shpat_YYYYY",
        "shopifyStoreUrl": "brand-b.myshopify.com"
      }
    ]
  }'
```

Calculate shelf score manually:
```bash
curl -X POST http://localhost:3000/manual \
  -H "Content-Type: application/json" \
  -d '{
    "average_order_value": 75,
    "repeat_rate": 22,
    "add_to_cart_rate": 5.2,
    "percent_repeat_revenue": 38,
    "orders_per_month": 120
  }'
```

Retrieve all benchmark submissions:
```bash
curl http://localhost:3000/metrics
```

## Notes

- Do not commit `.env` to version control.
- Update `SHOPIFY_API_BASE_URL` to your own Shopify Admin API URL.
- The Shopify endpoint fetches up to 250 orders and 250 customers from the REST Admin API for initial metrics.
