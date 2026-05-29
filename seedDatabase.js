const pool = require('./db/connection');

/**
 * Seed the database with 5 sample companies and metrics
 * This is useful for testing without real Shopify data
 */
const SAMPLE_DATA = [
  {
    company_name: 'Aroha Wellness',
    contact_email: 'aroha@example.com',
    contact_name: 'Aroha Team',
    phone: '+91-1234567890',
    category: 'Wellness',
    shopify_store_url: 'aroha.myshopify.com',
    metrics: {
      total_orders: 50,
      total_customers: 40,
      repeat_customers: 20,
      repeat_rate: 0.5,
      total_revenue: 200000,
      average_order_value: 5000,
      add_to_cart_rate: 0.3,
      revenue_from_repeat: 40000,
      shelf_score: 42.5,
    },
  },
  {
    company_name: 'Nourish Labs',
    contact_email: 'nourish@example.com',
    contact_name: 'Nourish Team',
    phone: '+91-1234567891',
    category: 'Health & Nutrition',
    shopify_store_url: 'nourishlabs.myshopify.com',
    metrics: {
      total_orders: 75,
      total_customers: 60,
      repeat_customers: 45,
      repeat_rate: 0.75,
      total_revenue: 300000,
      average_order_value: 4500,
      add_to_cart_rate: 0.45,
      revenue_from_repeat: 225000,
      shelf_score: 56.5,
    },
  },
  {
    company_name: 'PurePulse',
    contact_email: 'purepulse@example.com',
    contact_name: 'PurePulse Team',
    phone: '+91-1234567892',
    category: 'Wellness',
    shopify_store_url: 'purepulse.myshopify.com',
    metrics: {
      total_orders: 65,
      total_customers: 50,
      repeat_customers: 30,
      repeat_rate: 0.6,
      total_revenue: 350000,
      average_order_value: 6000,
      add_to_cart_rate: 0.35,
      revenue_from_repeat: 105000,
      shelf_score: 45.5,
    },
  },
  {
    company_name: 'FreshBites',
    contact_email: 'freshbites@example.com',
    contact_name: 'FreshBites Team',
    phone: '+91-1234567893',
    category: 'F&B',
    shopify_store_url: 'freshbites.myshopify.com',
    metrics: {
      total_orders: 45,
      total_customers: 38,
      repeat_customers: 15,
      repeat_rate: 0.39,
      total_revenue: 180000,
      average_order_value: 4000,
      add_to_cart_rate: 0.28,
      revenue_from_repeat: 70200,
      shelf_score: 35.7,
    },
  },
  {
    company_name: 'GlowGrain',
    contact_email: 'glowgrain@example.com',
    contact_name: 'GlowGrain Team',
    phone: '+91-1234567894',
    category: 'Beauty',
    shopify_store_url: 'glowgrain.myshopify.com',
    metrics: {
      total_orders: 80,
      total_customers: 65,
      repeat_customers: 52,
      repeat_rate: 0.8,
      total_revenue: 400000,
      average_order_value: 5500,
      add_to_cart_rate: 0.5,
      revenue_from_repeat: 320000,
      shelf_score: 64.0,
    },
  },
];

async function seedDatabase() {
  try {
    console.log('Starting database seed...\n');

    for (const data of SAMPLE_DATA) {
      console.log(`Processing ${data.company_name}...`);

      // Insert company
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
        data.company_name,
        data.contact_email,
        data.contact_name,
        data.phone,
        data.category,
        data.shopify_store_url,
      ]);

      const companyId = companyResult.rows[0].id;
      console.log(`  ✓ Company created/updated with ID: ${companyId}`);

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
        data.metrics.total_orders,
        data.metrics.total_customers,
        data.metrics.repeat_customers,
        data.metrics.repeat_rate,
        data.metrics.total_revenue,
        data.metrics.average_order_value,
        data.metrics.add_to_cart_rate,
        data.metrics.revenue_from_repeat,
        data.metrics.shelf_score,
      ]);

      console.log(`  ✓ Metrics inserted with ID: ${metricsResult.rows[0].id}\n`);
    }

    console.log('✓ Database seed completed successfully!');
    console.log('\nSummary:');
    console.log(`  - ${SAMPLE_DATA.length} companies created/updated`);
    console.log(`  - ${SAMPLE_DATA.length} metric records inserted`);

    process.exit(0);
  } catch (error) {
    console.error('Error during seed:', error.message);
    process.exit(1);
  }
}

seedDatabase();
