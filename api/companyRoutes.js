const express = require('express');
const pool = require('../db/connection');
const { fetchShopifyMetrics, fetchShopifyQL } = require('./shopify');

const router = express.Router();

const isEmptyValue = (value) => value === undefined || value === null || value === '';
const parseNumber = (value, fallback = null) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const requireFields = (body, fields) => {
  const missing = fields.filter((field) => isEmptyValue(body[field]));
  return missing.length ? missing : null;
};

const normalizeManualMetrics = (body) => {
  const totalRevenue = parseNumber(body.total_revenue);
  const totalOrders = parseNumber(body.total_orders);
  const totalCustomers = parseNumber(body.total_customers);
  const repeatCustomers = parseNumber(body.repeat_customers, 0);
  const averageOrderValue = parseNumber(body.average_order_value);
  const repeatRate = parseNumber(body.repeat_rate);
  const addToCartRate = parseNumber(body.add_to_cart_rate);
  const revenueFromRepeat = parseNumber(body.revenue_from_repeat);
  const ordersPerMonth = parseNumber(body.orders_per_month);

  return {
    totalRevenue,
    totalOrders,
    totalCustomers,
    repeatCustomers,
    averageOrderValue,
    repeatRate,
    addToCartRate,
    revenueFromRepeat,
    ordersPerMonth,
  };
};

// POST /api/companies/lead
router.post('/lead', async (req, res) => {
  const {
    company_name,
    website,
    tier,
    contact_name,
    contact_email,
    phone,
    cluster,
    category,
    shopify_store_url,
    shopify_access_token,
  } = req.body;

  // Validate required fields
  if (!company_name || !shopify_store_url || !shopify_access_token) {
    return res.status(400).json({
      error: true,
      message: 'Missing required fields: company_name, shopify_store_url, or shopify_access_token',
    });
  }

  try {
    // Fetch metrics from Shopify
    const metrics = await fetchShopifyMetrics(shopify_access_token, shopify_store_url);

    // Insert company into the database
    const companyResult = await pool.query(
      `INSERT INTO companies (company_name, website, tier, contact_name, contact_email, phone, cluster, category, shopify_store_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (shopify_store_url) DO UPDATE SET
         company_name = EXCLUDED.company_name,
         website = EXCLUDED.website,
         tier = EXCLUDED.tier,
         contact_name = EXCLUDED.contact_name,
         contact_email = EXCLUDED.contact_email,
         phone = EXCLUDED.phone,
         cluster = EXCLUDED.cluster,
         category = EXCLUDED.category
       RETURNING id`,
      [company_name, website, tier, contact_name, contact_email, phone, cluster, category, shopify_store_url]
    );

    const companyId = companyResult.rows[0].id;

    // Insert metrics for the company
    await pool.query(
      `INSERT INTO metrics (company_id, total_revenue, total_orders, total_customers, repeat_customers, average_order_value, repeat_rate)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        companyId,
        metrics.total_revenue,
        metrics.total_orders,
        metrics.total_customers,
        metrics.repeat_customers,
        metrics.average_order_value,
        metrics.repeat_rate,
      ]
    );

    res.status(201).json({ success: true, message: 'Company added successfully', metrics });
  } catch (error) {
    console.error('Error in adding lead:', error.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

const parseCohortCounts = (rows) => {
  let totalCustomers = 0;
  let repeatCustomers = 0;

  if (!Array.isArray(rows)) {
    return { totalCustomers, repeatCustomers };
  }

  rows.forEach((row) => {
    const type = String(row.cohort_type || row.customer_type || '').toLowerCase();
    const count = Number(row.customer_count || row.count || row.customers || 0);
    totalCustomers += count;
    if (type.includes('repeat') || type.includes('returning')) {
      repeatCustomers += count;
    }
  });

  return { totalCustomers, repeatCustomers };
};

// POST /api/companies/benchmark
router.post('/benchmark', async (req, res) => {
  const {
    company_name,
    website,
    tier,
    contact_name,
    contact_email,
    phone,
    cluster,
    category,
    shopify_store_url,
    shopify_access_token,
    orders_per_month,
  } = req.body;

  if (!company_name || !shopify_store_url || !shopify_access_token) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: company_name, shopify_store_url, or shopify_access_token',
    });
  }

  try {
    const salesQuery = 'FROM sales SHOW total_sales, orders SINCE -365d';
    const categoryQuery = 'FROM sales SHOW product_type, total_sales, orders WHERE product_type IS NOT NULL GROUP BY product_type ORDER BY total_sales DESC LIMIT 20';
    const cohortQuery = 'FROM customers SHOW cohort_type, count() AS customer_count GROUP BY cohort_type';

    const [salesResult, categoryResult, cohortResult] = await Promise.all([
      fetchShopifyQL(shopify_access_token, shopify_store_url, salesQuery),
      fetchShopifyQL(shopify_access_token, shopify_store_url, categoryQuery),
      fetchShopifyQL(shopify_access_token, shopify_store_url, cohortQuery),
    ]);

    const salesRow = Array.isArray(salesResult.tableData.rows) ? salesResult.tableData.rows[0] : null;
    const totalRevenue = Number(salesRow?.total_sales || 0);
    const totalOrders = Number(salesRow?.orders || 0);
    const averageOrderValue = totalOrders > 0 ? Number((totalRevenue / totalOrders).toFixed(2)) : 0;

    const cohortCounts = parseCohortCounts(cohortResult.tableData.rows);
    const totalCustomers = cohortCounts.totalCustomers;
    const repeatCustomers = cohortCounts.repeatCustomers;
    const repeatRate = totalCustomers > 0 ? Number(((repeatCustomers / totalCustomers) * 100).toFixed(2)) : 0;

    const companyResult = await pool.query(
      `INSERT INTO companies (company_name, website, tier, contact_name, contact_email, phone, cluster, category, shopify_store_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (shopify_store_url) DO UPDATE SET
         company_name = EXCLUDED.company_name,
         website = EXCLUDED.website,
         tier = EXCLUDED.tier,
         contact_name = EXCLUDED.contact_name,
         contact_email = EXCLUDED.contact_email,
         phone = EXCLUDED.phone,
         cluster = EXCLUDED.cluster,
         category = EXCLUDED.category
       RETURNING id`,
      [company_name, website, tier, contact_name, contact_email, phone, cluster, category, shopify_store_url]
    );

    const companyId = companyResult.rows[0].id;
    const addToCartRate = null;
    const revenueFromRepeat = null;
    const shelfScore = orders_per_month ? Number((((repeatRate || 0) * 50) + ((addToCartRate || 0) * 30) + (Number(orders_per_month) / 100)).toFixed(2)) : null;

    const metricsResult = await pool.query(
      `INSERT INTO metrics (
         company_id,
         total_revenue,
         total_orders,
         total_customers,
         repeat_customers,
         average_order_value,
         repeat_rate,
         add_to_cart_rate,
         revenue_from_repeat,
         shelf_score
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id`,
      [
        companyId,
        totalRevenue,
        totalOrders,
        totalCustomers,
        repeatCustomers,
        averageOrderValue,
        repeatRate,
        addToCartRate,
        revenueFromRepeat,
        shelfScore,
      ]
    );

    return res.status(201).json({
      success: true,
      companyId,
      metricsId: metricsResult.rows[0].id,
      report: {
        total_revenue: totalRevenue,
        total_orders: totalOrders,
        total_customers: totalCustomers,
        repeat_customers: repeatCustomers,
        repeat_rate: repeatRate,
        average_order_value: averageOrderValue,
        category_breakdown: categoryResult.tableData.rows,
        customer_cohorts: cohortResult.tableData.rows,
      },
    });
  } catch (error) {
    console.error('Error in benchmark onboarding:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/companies/shopifyql
router.post('/shopifyql', async (req, res) => {
  const { shopify_access_token, shopify_store_url, query } = req.body;

  if (!shopify_access_token || !shopify_store_url || !query) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: shopify_access_token, shopify_store_url, or query',
    });
  }

  try {
    const shopifyqlResult = await fetchShopifyQL(shopify_access_token, shopify_store_url, query);
    return res.status(200).json({ success: true, data: shopifyqlResult });
  } catch (error) {
    console.error('Error executing ShopifyQL query:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/companies/benchmark/manual
router.post('/benchmark/manual', async (req, res) => {
  console.log('manual benchmark route hit');
  const required = requireFields(req.body, ['company_name', 'total_revenue', 'total_orders', 'total_customers']);
  if (required) {
    return res.status(400).json({
      success: false,
      message: `Missing required fields: ${required.join(', ')}`,
    });
  }

  const {
    company_name,
    website,
    tier,
    contact_name,
    contact_email,
    phone,
    cluster,
    category,
    shopify_store_url,
  } = req.body;

  const {
    totalRevenue,
    totalOrders,
    totalCustomers,
    repeatCustomers,
    averageOrderValue,
    repeatRate,
    addToCartRate,
    revenueFromRepeat,
    ordersPerMonth,
  } = normalizeManualMetrics(req.body);

  if (totalRevenue === null || totalOrders === null || totalCustomers === null) {
    return res.status(400).json({
      success: false,
      message: 'Invalid numeric values for total_revenue, total_orders, or total_customers',
    });
  }

  const safeAverageOrderValue = averageOrderValue !== null
    ? averageOrderValue
    : totalOrders > 0 ? Number((totalRevenue / totalOrders).toFixed(2)) : 0;

  const safeRepeatRate = repeatRate !== null
    ? repeatRate
    : totalCustomers > 0 ? Number(((repeatCustomers || 0) / totalCustomers) * 100) : 0;

  const shelfScore = ordersPerMonth !== null
    ? Number((((safeRepeatRate || 0) * 50) + ((addToCartRate || 0) * 30) + (ordersPerMonth / 100)).toFixed(2))
    : null;

  try {
    const companyResult = await pool.query(
      `INSERT INTO companies (company_name, website, tier, contact_name, contact_email, phone, cluster, category, shopify_store_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (shopify_store_url) DO UPDATE SET
         company_name = EXCLUDED.company_name,
         website = EXCLUDED.website,
         tier = EXCLUDED.tier,
         contact_name = EXCLUDED.contact_name,
         contact_email = EXCLUDED.contact_email,
         phone = EXCLUDED.phone,
         cluster = EXCLUDED.cluster,
         category = EXCLUDED.category
       RETURNING id`,
      [company_name, website, tier, contact_name, contact_email, phone, cluster, category, shopify_store_url]
    );

    const companyId = companyResult.rows[0].id;

    const metricsResult = await pool.query(
      `INSERT INTO metrics (
         company_id,
         total_revenue,
         total_orders,
         total_customers,
         repeat_customers,
         average_order_value,
         repeat_rate,
         add_to_cart_rate,
         revenue_from_repeat,
         shelf_score
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id`,
      [
        companyId,
        totalRevenue,
        totalOrders,
        totalCustomers,
        repeatCustomers,
        safeAverageOrderValue,
        safeRepeatRate,
        addToCartRate,
        revenueFromRepeat,
        shelfScore,
      ]
    );

    return res.status(201).json({
      success: true,
      companyId,
      metricsId: metricsResult.rows[0].id,
      report: {
        total_revenue: totalRevenue,
        total_orders: totalOrders,
        total_customers: totalCustomers,
        repeat_customers: repeatCustomers,
        repeat_rate: safeRepeatRate,
        average_order_value: safeAverageOrderValue,
        category_breakdown: [],
        customer_cohorts: [],
        shelf_score: shelfScore,
      },
    });
  } catch (error) {
    console.error('Error saving manual benchmark:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/companies/benchmark/:companyId
router.get('/benchmark/:companyId', async (req, res) => {
  const companyId = parseNumber(req.params.companyId);

  if (!companyId || companyId <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Invalid companyId parameter',
    });
  }

  try {
    const result = await pool.query(
      `SELECT
         m.id AS metrics_id,
         c.id AS company_id,
         c.company_name,
         c.shopify_store_url,
         c.category,
         c.contact_email,
         c.contact_name,
         m.total_revenue,
         m.total_orders,
         m.total_customers,
         m.repeat_customers,
         m.average_order_value,
         m.repeat_rate,
         m.add_to_cart_rate,
         m.revenue_from_repeat,
         m.shelf_score,
         m.created_at
       FROM metrics m
       INNER JOIN companies c ON c.id = m.company_id
       WHERE m.company_id = $1
       ORDER BY m.created_at DESC
       LIMIT 1`,
      [companyId]
    );

    if (!result.rowCount) {
      return res.status(404).json({ success: false, message: 'No benchmark report found for this company' });
    }

    return res.status(200).json({ success: true, report: result.rows[0] });
  } catch (error) {
    console.error('Error fetching latest report:', error.message);
    return res.status(500).json({ success: false, message: 'Error retrieving latest report' });
  }
});

// GET /api/companies/metrics
router.get('/metrics', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM metrics');
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error retrieving metrics:', error.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

module.exports = router;