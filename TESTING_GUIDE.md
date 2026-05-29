# Complete Testing Guide: Frontend + Backend + Manual Benchmark Report

This guide walks you through running both the frontend and backend together, then testing the manual benchmark input and report generation flow step by step.

---

## Part 1: Starting Frontend and Backend

### Terminal 1: Start the Backend

```bash
cd /Users/akshita/Documents/benchmark-backend
node server.js
```

**Expected output:**
```
Server running on http://localhost:3000
Environment: development
Connected to database: benchmark
```

### Terminal 2: Start the Frontend

```bash
cd /Users/akshita/Documents/benchmark-backend/benchmark-frontend
npm start
```

**Expected output:**
```
Compiled successfully!

You can now view benchmark-frontend in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000
```

> **Important:** If the frontend tries to run on port 3000 and it's already taken by the backend, it will prompt you to run on a different port (e.g., 3001). Accept and use that port.

### Access the app

- If frontend is on port 3000: http://localhost:3000
- If frontend is on port 3001: http://localhost:3001

---

## Part 2: Step-by-Step Manual Benchmark Testing

### Step 1: Navigate to Manual Input Form

1. Open the browser at `http://localhost:3000` (or 3001)
2. Look for a "Benchmark" or "Manual Entry" form
3. You should see form fields for:
   - Company name
   - Website
   - Tier
   - Contact name
   - Contact email
   - Phone
   - Cluster
   - Category
   - Shopify store URL
   - Total revenue
   - Total orders
   - Total customers
   - Repeat customers
   - Average order value
   - Repeat rate (%)
   - Add-to-cart rate (%)
   - Revenue from repeat
   - Orders per month

### Step 2: Fill in Sample Data

Use these sample values:

```
Company name: Anphonic Demo
Website: https://anphonic-demo.example
Tier: Starter
Contact name: Demo User
Contact email: demo@anphonic.example
Phone: 555-0003
Cluster: Demo Cluster
Category: Demo
Shopify store URL: vv0akh-hg.myshopify.com
Total revenue: 360000
Total orders: 300
Total customers: 240
Repeat customers: 60
Average order value: 1200
Repeat rate (%): 25
Add-to-cart rate (%): 6.5
Revenue from repeat: 40000
Orders per month: 25
```

### Step 3: Submit the Form

1. Click "Submit" or "Generate Report"
2. **Wait for the API response** — you should see:
   - A loading spinner (briefly)
   - Success notification
   - The generated report displayed on screen

### Step 4: Verify the Response

The report should display:
- `total_revenue`: 360000
- `total_orders`: 300
- `total_customers`: 240
- `repeat_customers`: 60
- `repeat_rate`: 25
- `average_order_value`: 1200
- `shelf_score`: 1445.25 (calculated)

### Step 5: Check the Backend Console

In Terminal 1 (backend), you should see:
```
POST /api/companies/benchmark/manual
```

And a success response.

### Step 6: Verify Database Persistence

In a new terminal, run:

```bash
cd /Users/akshita/Documents/benchmark-backend
node - <<'NODE'
const pool = require('./db/connection');
(async () => {
  try {
    const companies = await pool.query("SELECT * FROM companies WHERE shopify_store_url = 'vv0akh-hg.myshopify.com' ORDER BY id DESC LIMIT 1");
    const companyId = companies.rows[0]?.id;
    console.log('Company:', companies.rows[0]);
    if (companyId) {
      const metrics = await pool.query("SELECT * FROM metrics WHERE company_id = $1 ORDER BY id DESC LIMIT 1", [companyId]);
      console.log('Metrics:', metrics.rows[0]);
    }
  } catch (err) {
    console.error('Error:', err.message);
  } finally { await pool.end(); }
})();
NODE
```

**Expected output:**
- Company record with all input fields
- Metrics record with calculated values (shelf_score, repeat_rate, etc.)

---

## Part 3: Fetch the Saved Report

### Step 7: Retrieve Saved Report (via GET endpoint)

After saving, you can fetch the report later using the company ID. In a new terminal:

```bash
curl -i http://localhost:3000/api/companies/benchmark/<COMPANY_ID>
```

Replace `<COMPANY_ID>` with the actual company ID from the database (e.g., 10).

**Expected response:**
```json
{
  "success": true,
  "report": {
    "metrics_id": 8,
    "company_id": 10,
    "company_name": "Anphonic Demo",
    "shopify_store_url": "vv0akh-hg.myshopify.com",
    "category": "Demo",
    "contact_email": "demo@anphonic.example",
    "contact_name": "Demo User",
    "total_revenue": 360000,
    "total_orders": 300,
    "total_customers": 240,
    "repeat_customers": 60,
    "average_order_value": 1200,
    "repeat_rate": 25,
    "add_to_cart_rate": 6.5,
    "revenue_from_repeat": 40000,
    "shelf_score": 1445.25,
    "created_at": "2026-05-26T10:12:27.000Z"
  }
}
```

---

## Part 4: Test Error Cases

### Test Case 1: Missing Required Fields

Submit the form with blank "Company name" field:

**Expected:** Error message: `Missing required fields: company_name`

### Test Case 2: Invalid Numeric Values

Fill in "Total revenue" with text like "abc":

**Expected:** Error message: `Invalid numeric values for total_revenue, total_orders, or total_customers`

### Test Case 3: Duplicate Store URL

Submit the form twice with the same `shopify_store_url`:

**Expected:** 
- First submission: new company created
- Second submission: same company updated, new metrics row added
- Database should show 1 company and 2 metrics records

---

## Part 5: Manual API Testing (if frontend not available)

If the frontend form isn't ready, test the API directly using curl:

```bash
curl -X POST http://localhost:3000/api/companies/benchmark/manual \
  -H "Content-Type: application/json" \
  -d '{
    "company_name":"Anphonic Demo",
    "website":"https://anphonic-demo.example",
    "tier":"Starter",
    "contact_name":"Demo User",
    "contact_email":"demo@anphonic.example",
    "phone":"555-0003",
    "cluster":"Demo Cluster",
    "category":"Demo",
    "shopify_store_url":"vv0akh-hg.myshopify.com",
    "total_revenue":360000,
    "total_orders":300,
    "total_customers":240,
    "repeat_customers":60,
    "average_order_value":1200,
    "repeat_rate":25,
    "add_to_cart_rate":6.5,
    "revenue_from_repeat":40000,
    "orders_per_month":25
  }'
```

**Expected response:**
```json
{
  "success":true,
  "companyId":10,
  "metricsId":8,
  "report":{
    "total_revenue":360000,
    "total_orders":300,
    "total_customers":240,
    "repeat_customers":60,
    "repeat_rate":25,
    "average_order_value":1200,
    "category_breakdown":[],
    "customer_cohorts":[],
    "shelf_score":1445.25
  }
}
```

---

## Part 6: Troubleshooting

### Frontend can't connect to backend

**Error:** `Network error` or `Cannot reach http://localhost:3000`

**Solution:**
- Ensure backend is running on port 3000
- Check if port 3000 is in use: `lsof -iTCP:3000 -sTCP:LISTEN -P -n`
- Kill existing process if needed: `kill -9 <PID>`
- Restart backend

### Form not showing or crashing

**Solution:**
- Check browser console (F12) for JavaScript errors
- Verify frontend is running: check Terminal 2 output
- Try hard refresh: `Ctrl+Shift+R` (or `Cmd+Shift+R` on Mac)

### Database error

**Error:** `Cannot connect to database`

**Solution:**
- Verify PostgreSQL is running
- Check environment variables in `.env`
- Verify database `benchmark` exists and is accessible

### Backend shows "column metrics does not exist"

**Solution:**
- This was a schema mismatch bug that has been fixed
- If you see this, restart the backend: `kill 8509 && node server.js`

---

## Quick Checklist

- [ ] Backend running on port 3000
- [ ] Frontend running on port 3000 or 3001
- [ ] Frontend form displays all input fields
- [ ] Submit form with sample data
- [ ] See success report with shelf_score calculated
- [ ] Backend logs show POST request
- [ ] Database has new company and metrics records
- [ ] Can fetch saved report via GET endpoint

---

## API Endpoints Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/api/companies/benchmark/manual` | Save manual benchmark metrics |
| `GET` | `/api/companies/benchmark/:companyId` | Fetch latest saved report |
| `POST` | `/api/companies/benchmark` | Auto-fetch from Shopify + save (requires valid token) |
| `POST` | `/api/companies/lead` | Legacy lead onboarding |

---

## Next Steps

Once manual benchmark testing is complete:
1. Build the benchmark comparison route (compare company vs cohort averages)
2. Add performance verdict visualization
3. Add category-level benchmarking charts
