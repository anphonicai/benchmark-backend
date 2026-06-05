const express = require('express');
const pool = require('../db/connection');
const { computeShelfScore, computePercentile, computeVerdict, scoreBrand } = require('./scoring');
const { fetchShopifyMetrics, fetchShopifyQL } = require('./shopify');

const router = express.Router();

const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const SHOPIFY_HEADERS = ['x-shopid', 'x-shopify-stage', 'x-shardid', 'x-sorting-hat-podid'];
const BLOCKLISTED_HOSTS = /localhost|127\.0\.0\.1|0\.0\.0\.0|192\.168\.|^10\.|example\.com|test\.com/i;

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
    repeatRate90dPct: parseNumber(body.repeat_rate_90d_pct),
    repeatRevenuePct: parseNumber(body.repeat_revenue_pct),
    timeTo2ndOrderDaysMedian: parseNumber(body.time_to_2nd_order_days_median),
    rebuyRevenueSharePct: parseNumber(body.rebuy_revenue_share_pct),
    personalisationAovLiftPct: parseNumber(body.personalisation_aov_lift_pct),
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
  
  const {
    company_id,
    company_name,
    website,
    tier,
    contact_name,
    contact_email,
    phone,
    cluster,
    category,
    shopify_store_url,
    repeat_rate_90d_pct,
    repeat_revenue_pct,
    time_to_2nd_order_days_median,
    rebuy_revenue_share_pct,
    personalisation_aov_lift_pct,
    loyalty,
    postPurchaseUpsell,
    whatsappTool,
  } = req.body;

  // Require either an existing companyId or a brand name to create one
  if (!company_id && !company_name) {
    return res.status(400).json({
      success: false,
      message: 'Missing required field: company_name',
    });
  }

  // Check if cohort metrics are provided
  const hasCohortMetrics = [
    repeat_rate_90d_pct,
    repeat_revenue_pct,
    time_to_2nd_order_days_median,
    rebuy_revenue_share_pct,
    personalisation_aov_lift_pct,
  ].some((val) => val !== null && val !== undefined && val !== '');

  if (!hasCohortMetrics) {
    return res.status(400).json({
      success: false,
      message: 'Please provide at least one metric: repeat_rate_90d_pct, repeat_revenue_pct, time_to_2nd_order_days_median, rebuy_revenue_share_pct, or personalisation_aov_lift_pct',
    });
  }

  try {
    let companyId = company_id ? Number(company_id) : null;

    // Only insert a new company if we don't already have one from BrandInfoPage
    if (!companyId) {
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
      companyId = companyResult.rows[0].id;
    }

    // Build metrics payload for scoreBrand
    const metrics = {
      repeat_rate_90d_pct: parseNumber(repeat_rate_90d_pct),
      repeat_revenue_pct: parseNumber(repeat_revenue_pct),
      time_to_2nd_order_days_median: parseNumber(time_to_2nd_order_days_median),
      rebuy_revenue_share_pct: parseNumber(rebuy_revenue_share_pct),
      personalisation_aov_lift_pct: parseNumber(personalisation_aov_lift_pct),
    };

    // Build manual inputs for gap analysis
    const manualInputs = {
      loyalty: loyalty || null,
      upsell: postPurchaseUpsell || null,
      whatsapp: whatsappTool || null,
    };

    // Call scoreBrand for full report
    const scoreResult = scoreBrand({
      metrics,
      manualInputs,
      category: category || 'overall',
      brandContext: {},
    });

    // Insert metrics record
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
         shelf_score,
         cohort_percentile
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING id`,
      [
        companyId,
        0,
        0,
        0,
        0,
        parseNumber(req.body.average_order_value),
        0,
        parseNumber(req.body.add_to_cart_rate),
        0,
        scoreResult.shelf_score,
        scoreResult.percentile,
      ]
    );

    return res.status(201).json({
      success: true,
      companyId,
      metricsId: metricsResult.rows[0].id,
      ...scoreResult,
      input: {
        company_name,
        category,
        repeat_rate_90d_pct,
        repeat_revenue_pct,
        time_to_2nd_order_days_median,
        rebuy_revenue_share_pct,
        personalisation_aov_lift_pct,
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

// POST /api/companies/brand-info - Store brand info from step 01 (BrandInfoPage)
router.post('/brand-info', async (req, res) => {
  console.log('POST /api/companies/brand-info hit');
  
  const {
    fullName,
    role,
    email,
    phone,
    brandName,
    shopifyUrl,
    category,
    ordersPerMonth,
  } = req.body;

  // Validate required fields
  if (!email || !brandName) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: email and brandName are required',
    });
  }

  // Email format validation
  const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(String(email).trim())) {
    return res.status(400).json({
      success: false,
      field: 'email',
      message: 'Please enter a valid email address (e.g. rohan@yourbrand.com).',
    });
  }

  // Phone validation: India or UAE mobile numbers
  if (phone) {
    const digits = String(phone).replace(/\D/g, '');
    let core = '';
    let country = '';

    // India: +91XXXXXXXXXX (12), 0XXXXXXXXXX (11), XXXXXXXXXX (10)
    if (digits.length === 12 && digits.startsWith('91') && /^[6-9]/.test(digits[2])) {
      core = digits.slice(2); country = 'IN';
    } else if (digits.length === 11 && digits.startsWith('0') && /^[6-9]/.test(digits[1])) {
      core = digits.slice(1); country = 'IN';
    } else if (digits.length === 10 && /^[6-9]/.test(digits[0])) {
      core = digits; country = 'IN';
    // UAE: +971XXXXXXXXX (12), 05XXXXXXXXX (10 with 0), 5XXXXXXXXX (9)
    } else if (digits.length === 12 && digits.startsWith('971') && digits[3] === '5') {
      core = digits.slice(3); country = 'AE';
    } else if (digits.length === 10 && digits.startsWith('05')) {
      core = digits.slice(1); country = 'AE';
    } else if (digits.length === 9 && digits.startsWith('5')) {
      core = digits; country = 'AE';
    }

    const indiaValid = country === 'IN' && /^[6-9]\d{9}$/.test(core);
    const uaeValid   = country === 'AE' && /^5\d{8}$/.test(core);
    const notFake    = !/(\d)\1{3}/.test(core) && new Set(core.split('')).size >= 4;

    if ((!indiaValid && !uaeValid) || !notFake) {
      return res.status(400).json({
        success: false,
        field: 'phone',
        message: 'Enter a valid Indian (10-digit) or UAE (+971 / 05X) mobile number.',
      });
    }
  }

  // Brand name: must contain letters, 2–100 chars
  if (brandName) {
    if (brandName.trim().length < 2 || brandName.trim().length > 100 || !/[a-zA-Z]/.test(brandName)) {
      return res.status(400).json({
        success: false,
        field: 'brandName',
        message: 'Brand name must be 2–100 characters and contain at least some letters.',
      });
    }
  }

  // Shopify URL: valid domain, max 200 chars
  if (shopifyUrl) {
    const domainRegex = /^https:\/\/(([a-zA-Z0-9][a-zA-Z0-9\-]*\.)+[a-zA-Z]{2,})(\/[^\s]{0,200})?$/;
    if (shopifyUrl.length > 200 || !domainRegex.test(shopifyUrl.trim())) {
      return res.status(400).json({
        success: false,
        field: 'shopifyUrl',
        message: 'Please enter a valid store URL (e.g. https://yourbrand.com).',
      });
    }
  }

  try {
    const result = await pool.query(
      `INSERT INTO companies (company_name, website, tier, contact_name, contact_email, phone, cluster, category, shopify_store_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (shopify_store_url) DO UPDATE SET
         company_name = EXCLUDED.company_name,
         contact_name = EXCLUDED.contact_name,
         contact_email = EXCLUDED.contact_email,
         phone = EXCLUDED.phone,
         category = EXCLUDED.category,
         updated_at = NOW()
       RETURNING id`,
      [
        brandName, // company_name
        null, // website
        role || null, // tier (storing role here temporarily)
        fullName || null, // contact_name
        email, // contact_email
        phone || null, // phone
        null, // cluster
        category || null, // category
        shopifyUrl || null, // shopify_store_url
      ]
    );

    const companyId = result.rows[0].id;

    return res.status(201).json({
      success: true,
      companyId,
      message: 'Brand info saved successfully',
      data: {
        fullName,
        role,
        email,
        phone,
        brandName,
        shopifyUrl,
        category,
        ordersPerMonth,
      },
    });
  } catch (error) {
    console.error('Error saving brand info:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// GET /api/companies/validate-shopify-url?url=https://yourbrand.com
router.get('/validate-shopify-url', async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ success: false, message: 'url query param is required' });
  }

  const trimmed = String(url).trim();

  if (!trimmed.startsWith('https://')) {
    return res.status(200).json({ success: false, isShopify: false, message: 'URL must start with https://' });
  }

  if (BLOCKLISTED_HOSTS.test(trimmed)) {
    return res.status(200).json({ success: false, isShopify: false, message: 'Please enter a real Shopify store URL.' });
  }

  // .myshopify.com domains are always Shopify — no HTTP check needed
  if (/\.myshopify\.com(\/.*)?$/i.test(trimmed)) {
    return res.status(200).json({ success: true, isShopify: true });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    let response;
    try {
      response = await fetch(trimmed, {
        method: 'HEAD',
        redirect: 'follow',
        signal: controller.signal,
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; BenchmarkChecker/1.0)' },
      });
    } finally {
      clearTimeout(timeout);
    }

    const isShopify = SHOPIFY_HEADERS.some((h) => response.headers.has(h));

    if (!isShopify) {
      return res.status(200).json({ success: true, isShopify: false, message: 'This does not appear to be a Shopify store.' });
    }

    return res.status(200).json({ success: true, isShopify: true });
  } catch (error) {
    if (error.name === 'AbortError') {
      return res.status(200).json({ success: false, isShopify: false, message: 'Store URL timed out. Please check it is live.' });
    }
    return res.status(200).json({ success: false, isShopify: false, message: 'Could not reach this URL. Please verify it is correct and live.' });
  }
});

module.exports = router;