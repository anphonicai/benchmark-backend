const pool = require('./db/connection');
const { fetchShopifyMetrics } = require('./api/shopify');

/**
 * Configuration for your 5 Shopify companies
 * Update with your actual store details and access tokens
 */
const SHOPIFY_STORES = [
  {
    company_name: 'Aroha Wellness',
    contact_email: 'aroha@example.com',
    contact_name: 'Aroha Team',
    phone: '+91-1234567890',
    category: 'Wellness',
    shopifyStoreUrl: 'aroha.myshopify.com',
    shopifyToken: 'shpat_XXXXX_REPLACE_WITH_TOKEN_1',
  },
  {
    company_name: 'Nourish Labs',
    contact_email: 'nourish@example.com',
    contact_name: 'Nourish Team',
    phone: '+91-1234567891',
    category: 'Health & Nutrition',
    shopifyStoreUrl: 'nourishlabs.myshopify.com',
    shopifyToken: 'shpat_YYYYY_REPLACE_WITH_TOKEN_2',
  },
  {
    company_name: 'PurePulse',
    contact_email: 'purepulse@example.com',
    contact_name: 'PurePulse Team',
    phone: '+91-1234567892',
    category: 'Wellness',
    shopifyStoreUrl: 'purepulse.myshopify.com',
    shopifyToken: 'shpat_ZZZZZ_REPLACE_WITH_TOKEN_3',
  },
  {
    company_name: 'FreshBites',
    contact_email: 'freshbites@example.com',
    contact_name: 'FreshBites Team',
    phone: '+91-1234567893',
    category: 'F&B',
    shopifyStoreUrl: 'freshbites.myshopify.com',
    shopifyToken: 'shpat_AAAAA_REPLACE_WITH_TOKEN_4',
  },
  {
    company_name: 'GlowGrain',
    contact_email: 'glowgrain@example.com',
    contact_name: 'GlowGrain Team',
    phone: '+91-1234567894',
    category: 'Beauty',
    shopifyStoreUrl: 'glowgrain.myshopify.com',
    shopifyToken: 'shpat_BBBBB_REPLACE_WITH_TOKEN_5',
  },
];

/**
 * Calculate shelf score based on Shopify metrics
 */
const calculateShelfScore = (repeat_rate, add_to_cart_rate, total_orders) => {
  const score = (repeat_rate * 50) + (add_to_cart_rate * 30) + (total_orders / 100);
  return Math.round(score * 100) / 100;
};

async function importShopifyData() {
  console.log('Starting Shopify data import...\n');

  const results = [];
  const errors = [];

  for (const store of SHOPIFY_STORES) {
    try {
      console.log(`Fetching data for ${store.company_name}...`);

      // Check if token is a placeholder
      if (store.shopifyToken.includes('REPLACE_WITH')) {
        throw new Error('Shopify token not configured. Please replace the placeholder with a real token.');
      }

      // Fetch metrics from Shopify
      const metrics = await fetchShopifyMetrics(store.shopifyToken, store.shopifyStoreUrl);

      // Calculate shelf score
      const shelf_score = calculateShelfScore(
        metrics.repeat_rate || 0,
        metrics.add_to_cart_rate || 0,
        metrics.total_orders || 0
      );

      // Upsert company
      const companyQuery = `
        INSERT INTO companies (company_name, contact_email, contact_name, phone, category, shopify_store_url)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (company_name) DO UPDATE SET
          contact_email = EXCLUDED.contact_email,
          contact_name = EXCLUDED.contact_name,
          phone = EXCLUDED.phone,
          category = EXCLUDED.category,
          shopify_store_url = EXCLUDED.shopify_store_url
        RETURNING id;
      `;

      const companyResult = await pool.query(companyQuery, [
        store.company_name,
        store.contact_email,
        store.contact_name,
        store.phone,
        store.category,
        store.shopifyStoreUrl,
      ]);

      const companyId = companyResult.rows[0].id;

      // Insert metrics
      const metricsQuery = `
        INSERT INTO metrics (
          company_id,
          total_orders,
          total_customers,
          repeat_customers,
          repeat_rate,
          total_revenue,
          average_order_value,
          add_to_cart_rate,
          revenue_from_repeat,
          shelf_score
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id;
      `;

      const metricsResult = await pool.query(metricsQuery, [
        companyId,
        metrics.total_orders || 0,
        metrics.total_customers || 0,
        metrics.repeat_customers || 0,
        metrics.repeat_rate || 0,
        metrics.total_revenue || 0,
        metrics.average_order_value || 0,
        metrics.add_to_cart_rate || 0,
        (metrics.repeat_customers || 0) * (metrics.average_order_value || 0),
        shelf_score,
      ]);

      results.push({
        company_name: store.company_name,
        status: 'success',
        companyId,
        metricsId: metricsResult.rows[0].id,
        metrics,
      });

      console.log(`  ✓ Data imported successfully for ${store.company_name}\n`);
    } catch (error) {
      const errorMsg = error.message;
      errors.push({
        company_name: store.company_name,
        error: errorMsg,
      });
      console.error(`  ✗ Error for ${store.company_name}: ${errorMsg}\n`);
    }
  }

  console.log('\n========== IMPORT SUMMARY ==========');
  console.log(`Total stores: ${SHOPIFY_STORES.length}`);
  console.log(`Successful: ${results.length}`);
  console.log(`Failed: ${errors.length}`);

  if (errors.length > 0) {
    console.log('\nFailed stores:');
    errors.forEach((err) => {
      console.log(`  - ${err.company_name}: ${err.error}`);
    });
  }

  process.exit(errors.length > 0 ? 1 : 0);
}

importShopifyData();

    contact_email: 'glowgrain@example.com',
    contact_name: 'GlowGrain Team',
    phone: '+91-1234567894',
    brand_name: 'GlowGrain',
    category: 'Beauty',
    shopifyStoreUrl: 'glowgrain.myshopify.com',
    shopifyToken: 'shpat_BBBBB_REPLACE_WITH_TOKEN_5',
  },
];

/**
 * Calculate shelf score based on Shopify metrics
 */
const calculateShelfScore = (repeat_rate, add_to_cart_rate, orders_per_month) => {
  const score = (repeat_rate * 50) + (add_to_cart_rate * 30) + (orders_per_month / 100);
  return Math.round(score * 100) / 100;
};

/**
 * Generate performance verdict based on metrics
 */
const generateVerdict = (repeat_rate, aov, add_to_cart_rate) => {
  if (repeat_rate > 30 && aov > 2000) {
    return 'Top performer';
  }
  if (repeat_rate > 25 && aov > 1800) {
    return 'Above cohort median';
  }
  if (repeat_rate > 20) {
    return 'Competitive with cohort';
  }
  if (repeat_rate > 15) {
    return 'Developing performance';
  }
  return 'Needs improvement';
};

async function importShopifyData() {
  console.log('Starting Shopify data import...\n');

  const results = [];
  const errors = [];

  for (const store of SHOPIFY_STORES) {
    try {
      console.log(`Fetching data for ${store.company_name}...`);

      // Check if token is a placeholder
      if (store.shopifyToken.includes('REPLACE_WITH')) {
        throw new Error('Shopify token not configured. Please replace the placeholder with a real token.');
      }

      // Fetch metrics from Shopify
      const metrics = await fetchShopifyMetrics(store.shopifyToken, store.shopifyStoreUrl);

      // Calculate derived metrics
      const shelf_score = calculateShelfScore(
        metrics.repeat_rate,
        5.0, // default add_to_cart_rate for demo
        metrics.total_orders
      );
      const performance_verdict = generateVerdict(
        metrics.repeat_rate,
        metrics.average_order_value,
        5.0
      );

      // Prepare insert data
      const insertData = {
        name: store.contact_name,
        email: store.contact_email,
        phone: store.phone,
        shopify_store_url: store.shopifyStoreUrl,
        brand_name: store.brand_name,
        category: store.category,
        orders_per_month: metrics.total_orders,
        average_order_value: metrics.average_order_value,
        total_revenue: metrics.total_revenue,
        total_orders: metrics.total_orders,
        total_customers: metrics.total_customers,
        repeat_customers: metrics.repeat_customers,
        repeat_rate: metrics.repeat_rate,
        add_to_cart_rate: 5.0,
        revenue_from_repeat: (metrics.repeat_customers / metrics.total_customers) * 100,
        shelf_score,
        performance_verdict,
        metrics: JSON.stringify(metrics),
      };

      // Insert into database
      const query = `
        INSERT INTO benchmark_submissions (
          name,
          email,
          phone,
          shopify_store_url,
          brand_name,
          category,
          orders_per_month,
          average_order_value,
          total_revenue,
          total_orders,
          total_customers,
          repeat_customers,
          repeat_rate,
          add_to_cart_rate,
          revenue_from_repeat,
          shelf_score,
          performance_verdict,
          metrics
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
        ON CONFLICT (email) DO UPDATE SET
          average_order_value = $8,
          total_revenue = $9,
          total_orders = $10,
          total_customers = $11,
          repeat_customers = $12,
          repeat_rate = $13,
          revenue_from_repeat = $15,
          shelf_score = $16,
          performance_verdict = $17,
          metrics = $18
      `;

      const values = [
        insertData.name,
        insertData.email,
        insertData.phone,
        insertData.shopify_store_url,
        insertData.brand_name,
        insertData.category,
        insertData.orders_per_month,
        insertData.average_order_value,
        insertData.total_revenue,
        insertData.total_orders,
        insertData.total_customers,
        insertData.repeat_customers,
        insertData.repeat_rate,
        insertData.add_to_cart_rate,
        insertData.revenue_from_repeat,
        insertData.shelf_score,
        insertData.performance_verdict,
        insertData.metrics,
      ];

      await pool.query(query, values);

      results.push({
        company: store.company_name,
        status: 'success',
        metrics: {
          total_revenue: metrics.total_revenue,
          repeat_rate: metrics.repeat_rate,
          average_order_value: metrics.average_order_value,
          shelf_score,
        },
      });

      console.log(`✓ ${store.company_name}: imported successfully`);
      console.log(`  - Revenue: ₹${metrics.total_revenue}`);
      console.log(`  - Repeat rate: ${metrics.repeat_rate}%`);
      console.log(`  - AOV: ₹${metrics.average_order_value}\n`);
    } catch (err) {
      errors.push({
        company: store.company_name,
        error: err.message,
      });
      console.log(`✗ ${store.company_name}: failed`);
      console.log(`  Error: ${err.message}\n`);
    }
  }

  // Summary
  console.log('\n=== Import Summary ===');
  console.log(`Successful: ${results.length}`);
  console.log(`Failed: ${errors.length}`);

  if (errors.length > 0) {
    console.log('\nErrors:');
    errors.forEach((err) => {
      console.log(`  - ${err.company}: ${err.error}`);
    });
  }

  process.exit(errors.length > 0 ? 1 : 0);
}

importShopifyData();
