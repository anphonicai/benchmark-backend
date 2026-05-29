const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const pool = require('./db/connection');
const { fetchShopifyMetrics } = require('./api/shopify');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Import all company-related routes
const companyRoutes = require('./api/companyRoutes');

// Middleware to parse JSON and URL-encoded data from requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Utility functions
const isEmpty = (value) => value === undefined || value === null || value === '';
const parseNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ message: 'Server is running' });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Benchmark Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      companies: '/api/companies',
      benchmarkManual: 'POST /api/companies/benchmark/manual',
      benchmarkReport: 'GET /api/companies/benchmark/:companyId',
      metrics: 'GET /api/companies/metrics',
    },
  });
});

// Connect the company routes to the base endpoint `/api/companies`
app.use('/api/companies', companyRoutes);

// POST /manual - Calculate shelf score from manual input
app.post('/manual', (req, res) => {
  const {
    average_order_value,
    repeat_rate,
    add_to_cart_rate,
    percent_repeat_revenue,
    orders_per_month,
  } = req.body;

  // Validate required fields
  if (isEmpty(average_order_value) || isEmpty(repeat_rate) || isEmpty(add_to_cart_rate) || isEmpty(orders_per_month)) {
    return res.status(400).json({
      error: 'Required fields are: average_order_value, repeat_rate, add_to_cart_rate, orders_per_month',
    });
  }

  // Parse and calculate values
  const repeatRate = parseNumber(repeat_rate);
  const addToCartRate = parseNumber(add_to_cart_rate);
  const orderCount = parseNumber(orders_per_month);
  const avgOrderValue = parseNumber(average_order_value);
  const percentRepeatRevenue = parseNumber(percent_repeat_revenue, 0);

  const normalizedAOV = avgOrderValue / 100;
  const normalizedOrders = orderCount / 10;
  const shelf_score = Number(
    (
      (normalizedAOV + repeatRate + addToCartRate + percentRepeatRevenue + normalizedOrders) /
      5
    ).toFixed(2)
  );

  // Respond with the shelf score and its calculation breakdown
  return res.status(200).json({
    success: true,
    shelf_score,
    input: {
      average_order_value: avgOrderValue,
      repeat_rate: repeatRate,
      add_to_cart_rate: addToCartRate,
      percent_repeat_revenue: percentRepeatRevenue,
      orders_per_month: orderCount,
    },
    formula: 'shelf_score = average of normalized inputs: average_order_value/100, repeat_rate, add_to_cart_rate, percent_repeat_revenue, orders_per_month/10',
  });
});

// Get /metrics
app.get('/metrics', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        m.id,
        c.id AS company_id,
        c.company_name,
        c.shopify_store_url,
        c.category,
        c.contact_email,
        m.total_orders,
        m.total_customers,
        m.repeat_customers,
        m.repeat_rate,
        m.total_revenue,
        m.average_order_value,
        m.add_to_cart_rate,
        m.revenue_from_repeat,
        m.shelf_score,
        m.cohort_percentile,
        m.created_at
      FROM metrics m
      INNER JOIN companies c ON m.company_id = c.id
      ORDER BY m.created_at DESC;
    `);

    return res.status(200).json({
      success: true,
      metrics: result.rows,
      count: result.rowCount,
    });
  } catch (error) {
    console.error('Error retrieving metrics:', error.message);
    return res.status(500).json({
      error: 'Failed to retrieve metrics',
      details: error.message,
    });
  }
});

// GET /report
app.get('/report', async (req, res) => {
  try {
    // High-level performance summary
    const summaryResult = await pool.query(`
      SELECT
        COUNT(DISTINCT c.id) AS total_brands,
        ROUND(AVG(m.repeat_rate)::numeric, 2) AS avg_repeat_rate,
        COUNT(DISTINCT c.category) AS distinct_categories
      FROM metrics m
      INNER JOIN companies c ON c.id = m.company_id;
    `);

    // Per-category analytics
    const categoryResult = await pool.query(`
      SELECT 
        c.category,
        COUNT(DISTINCT m.company_id) AS companies,
        ROUND(AVG(m.total_revenue)::numeric, 2) AS avg_revenue,
        ROUND(AVG(m.average_order_value)::numeric, 2) AS avg_aov,
        ROUND(AVG(m.repeat_rate)::numeric, 2) AS avg_repeat_rate
      FROM metrics m
      INNER JOIN companies c ON c.id = m.company_id
      GROUP BY c.category;
    `);

    return res.status(200).json({
      success: true,
      report_summary: summaryResult.rows[0],
      report_by_category: categoryResult.rows,
    });
  } catch (error) {
    console.error('Error generating report:', error.message);
    return res.status(500).json({ error: 'Failed to generate report', details: error.message });
  }
});

// Serve frontend build if it exists
const frontendBuildPath = path.join(__dirname, 'benchmark-frontend', 'build');
if (fs.existsSync(path.join(frontendBuildPath, 'index.html'))) {
  app.use(express.static(frontendBuildPath));

  app.get('*', (req, res, next) => {
    if (
      req.path.startsWith('/api') ||
      req.path === '/health' ||
      req.path === '/metrics' ||
      req.path === '/report' ||
      req.path === '/manual'
    ) {
      return next();
    }
    res.sendFile(path.join(frontendBuildPath, 'index.html'));
  });
}

// Start the application
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Connected to database: ${process.env.DB_NAME}`);
});