const pool = require('./connection');

const sampleData = [
    {
        company_name: 'Aroha Wellness',
        website: 'https://aroha.myshopify.com',
        tier: 'Tier 1',
        contact_name: 'Pratish',
        contact_email: 'aroha@example.com',
        phone: '+91-1234567890',
        cluster: 'Cluster 2 F&B Delhi',
        category: 'Food & Beverages',
        shopify_store_url: 'aroha.myshopify.com',
        total_orders: 50,
        total_customers: 40,
        repeat_customers: 20,
        repeat_rate: 50,
        total_revenue: 200000,
        average_order_value: 5000,
        add_to_cart_rate: 30,
        revenue_from_repeat: 40000,
    },
    // Add more companies here if needed
];

const seedDatabase = async () => {
    try {
        for (const company of sampleData) {
            const companyInsert = `
                INSERT INTO companies (company_name, website, tier, contact_name, contact_email, phone, cluster, category, shopify_store_url)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                ON CONFLICT (company_name) DO NOTHING
                RETURNING id;
            `;

            const companyResult = await pool.query(companyInsert, [
                company.company_name,
                company.website,
                company.tier,
                company.contact_name,
                company.contact_email,
                company.phone,
                company.cluster,
                company.category,
                company.shopify_store_url,
            ]);

            const companyId = companyResult.rows[0]?.id;

            const metricsInsert = `
                INSERT INTO metrics (company_id, total_orders, total_customers, repeat_customers, repeat_rate, total_revenue, average_order_value, add_to_cart_rate, revenue_from_repeat)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);
            `;

            await pool.query(metricsInsert, [
                companyId,
                company.total_orders,
                company.total_customers,
                company.repeat_customers,
                company.repeat_rate / 100,
                company.total_revenue,
                company.average_order_value,
                company.add_to_cart_rate / 100,
                company.revenue_from_repeat,
            ]);
        }
        console.log('Sample data successfully seeded!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedDatabase();