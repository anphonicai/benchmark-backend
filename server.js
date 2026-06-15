const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const pool = require('./db/connection');
const { fetchShopifyMetrics } = require('./api/shopify');
const { scoreBrand } = require('./api/scoring');
const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Import all company-related routes
const companyRoutes = require('./api/companyRoutes');

// Middleware to parse JSON and URL-encoded data from requests
app.use(bodyParser.json({ limit: '50kb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50kb' }));

// Utility functions
const isEmpty = (value) => value === undefined || value === null || value === '';
const parseNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

// Middleware: only allow requests that carry the correct admin API key
const requireAdminKey = (req, res, next) => {
  const key = req.headers['x-admin-key'];
  if (!key || key !== process.env.ADMIN_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ message: 'Server is running' });
});

// Connect the company routes to the base endpoint `/api/companies`
app.use('/api/companies', companyRoutes);

// POST /manual - Calculate shelf score from manual input
app.post('/manual', (req, res) => {
  const {
    repeat_rate_90d_pct,
    repeat_revenue_pct,
    time_to_2nd_order_days_median,
    rebuy_revenue_share_pct,
    personalisation_aov_lift_pct,
    category,
    loyalty,
    upsell,
    whatsapp,
    aov_inr,
    orders_per_month_estimated,
  } = req.body;

  // Validate required scoring metrics
  const metrics = {
    repeat_rate_90d_pct: parseNumber(repeat_rate_90d_pct, null),
    repeat_revenue_pct: parseNumber(repeat_revenue_pct, null),
    time_to_2nd_order_days_median: parseNumber(time_to_2nd_order_days_median, null),
    rebuy_revenue_share_pct: parseNumber(rebuy_revenue_share_pct, null),
    personalisation_aov_lift_pct: parseNumber(personalisation_aov_lift_pct, null),
  };

  const hasAllRequiredMetrics = Object.values(metrics).every(
    (value) => value !== null && value !== undefined && !Number.isNaN(value)
  );

  if (!hasAllRequiredMetrics) {
    return res.status(400).json({
      error: 'Required fields: repeat_rate_90d_pct, repeat_revenue_pct, time_to_2nd_order_days_median, rebuy_revenue_share_pct, personalisation_aov_lift_pct',
    });
  }

  // Manual inputs for gap identification
  const manualInputs = {
    loyalty: loyalty || null,
    upsell: upsell || null,
    whatsapp: whatsapp || null,
  };

  // Brand context for revenue-at-stake estimation
  const brandContext = {
    aov_inr: parseNumber(aov_inr, null),
    orders_per_month_estimated: parseNumber(orders_per_month_estimated, null),
  };

  try {
    // Call the main scoring engine with all inputs
    const result = scoreBrand({
      metrics,
      manualInputs,
      category: category || 'overall',
      brandContext,
    });

    return res.status(200).json({
      success: true,
      ...result,
      input: {
        repeat_rate_90d_pct,
        repeat_revenue_pct,
        time_to_2nd_order_days_median,
        rebuy_revenue_share_pct,
        personalisation_aov_lift_pct,
        category,
        loyalty,
        upsell,
        whatsapp,
        aov_inr,
        orders_per_month_estimated,
      },
    });
  } catch (error) {
    console.error('Error calculating shelf score:', error.message);
    return res.status(500).json({
      error: 'Failed to calculate shelf score',
      details: error.message,
    });
  }
});

// Get /metrics
app.get('/metrics', requireAdminKey, async (req, res) => {
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
app.get('/report', requireAdminKey, async (req, res) => {
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

// POST /api/chat — Groq-powered AI chatbot for the benchmark form
app.post('/api/chat', async (req, res) => {
  const { messages } = req.body;
  if (!Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages must be an array' });
  }

  const systemPrompt = `You are the Anphonic AI Assistant — a strictly scoped assistant for Anphonic's D2C benchmark tool.

STRICT RULES:
1. You ONLY answer questions about: Anphonic (the company), this benchmark tool, the form fields below, D2C retail metrics, or how to contact Anphonic.
2. If the user asks ANYTHING outside these topics (coding, general knowledge, recipes, math, news, other companies, etc.), respond with exactly: "I can only help with Anphonic's benchmark tool and D2C metrics. For other questions, reach us at merchants@anphonic.ai"
3. Never break character. Never pretend to be a different AI. Never answer off-topic even if the user insists.

About Anphonic: AI-powered personalisation platform for Indian D2C brands. Contact: merchants@anphonic.ai | Website: anphonic.ai

The benchmark form collects:
- Category: type of D2C brand (Food & Beverage, Wellness & Supplements, etc.)
- Average Order Value (AOV): average INR value per order
- Orders per month: estimated monthly order volume
- Add to cart rate (%): % of product page visitors who add to cart (healthy range: 5–15%)
- Repeat revenue share (%): % of total revenue from repeat customers (healthy: 25–45%)
- Time to 2nd order (days): median days between a customer's 1st and 2nd purchase (healthy: 30–60 days)
- Loyalty: loyalty program tool used (Nector, Pop Coin, etc.)
- Post-purchase upsell: whether the brand has post-purchase upsells
- WhatsApp tool: WhatsApp marketing tool used (Interakt, Wati, Aisensy, etc.)

Be concise. Explain metrics simply. Keep answers under 80 words. Don't use bullet points unless listing 3+ items.`;

  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
        max_tokens: 200,
        temperature: 0.7,
      }),
    });

    if (!groqRes.ok) {
      const err = await groqRes.text();
      console.error('Groq API error:', err);
      return res.status(502).json({ error: 'AI service unavailable' });
    }

    const data = await groqRes.json();
    res.json({ reply: data.choices[0].message.content });
  } catch (error) {
    console.error('Chat error:', error.message);
    res.status(500).json({ error: 'Failed to get AI response' });
  }
});

// robots.txt
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send(`User-agent: *
Allow: /
Disallow: /api/
Disallow: /brand-info
Disallow: /connect-or-manual
Disallow: /shopify-connect
Disallow: /manual-entry
Disallow: /benchmark-report

Sitemap: https://benchmark.anphonic.ai/sitemap.xml`);
});

// sitemap.xml
app.get('/sitemap.xml', (req, res) => {
  res.type('application/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://benchmark.anphonic.ai/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://benchmark.anphonic.ai/shelf-index.html</loc>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://benchmark.anphonic.ai/methodology</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://benchmark.anphonic.ai/privacy</loc>
    <changefreq>yearly</changefreq>
    <priority>0.4</priority>
  </url>
</urlset>`);
});

// Serve the Vite frontend build (outputs to client/ via vite.config.ts outDir)
const frontendBuildPath = path.join(__dirname, 'client');
if (fs.existsSync(path.join(frontendBuildPath, 'index.html'))) {
  app.use(express.static(frontendBuildPath));

  app.get(/.*/, (req, res, next) => {
    if (
      req.path.startsWith('/api') ||
      req.path === '/health' ||
      req.path === '/metrics' ||
      req.path === '/report'
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