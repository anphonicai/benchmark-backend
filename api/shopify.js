const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const buildHeaders = (token) => ({
  'Content-Type': 'application/json',
  'X-Shopify-Access-Token': token,
});

const fetchJson = async (url, headers) => {
  const response = await fetch(url, { headers });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Shopify API error ${response.status}: ${text}`);
  }
  return response.json();
};

const fetchGraphql = async (url, headers, body) => {
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  const json = await response.json();
  if (!response.ok) {
    throw new Error(`Shopify GraphQL error ${response.status}: ${JSON.stringify(json)}`);
  }
  if (json.errors && json.errors.length > 0) {
    throw new Error(`Shopify GraphQL error: ${JSON.stringify(json.errors)}`);
  }
  return json;
};

const normalizeBaseUrl = (baseUrl) => baseUrl.replace(/\/+$/, '');

const getShopifyAdminBaseUrl = (value) => {
  if (!value) {
    return null;
  }

  let candidate = value.trim();
  if (!/^https?:\/\//i.test(candidate)) {
    candidate = `https://${candidate}`;
  }

  const url = new URL(candidate);
  if (url.pathname.includes('/admin/api/')) {
    return normalizeBaseUrl(`${url.origin}${url.pathname}`);
  }

  return normalizeBaseUrl(`${url.origin}/admin/api/2022-10`);
};

const getShopifyAdminGraphqlUrl = (value) => {
  const baseUrl = getShopifyAdminBaseUrl(value);
  return baseUrl ? `${baseUrl}/graphql.json` : null;
};

const parseShopifyQLTableData = (tableData) => {
  if (!tableData || !Array.isArray(tableData.columns) || !Array.isArray(tableData.rows)) {
    return { columns: [], rows: [] };
  }

  const columnNames = tableData.columns.map((col) => col.name);
  const rows = tableData.rows.map((row) => {
    if (row && typeof row === 'object' && !Array.isArray(row)) {
      return row;
    }
    if (Array.isArray(row)) {
      return columnNames.reduce((acc, name, index) => {
        acc[name] = row[index];
        return acc;
      }, {});
    }
    return {};
  });

  return { columns: tableData.columns, rows };
};

const fetchShopifyQL = async (accessToken, storeUrl, query) => {
  if (!accessToken) {
    throw new Error('Missing Shopify access token');
  }
  if (!query || typeof query !== 'string') {
    throw new Error('Missing ShopifyQL query string');
  }

  const graphqlUrl = getShopifyAdminGraphqlUrl(storeUrl);
  if (!graphqlUrl) {
    throw new Error('Missing Shopify store URL for GraphQL endpoint');
  }

  const headers = buildHeaders(accessToken);
  const body = {
    query: `query ShopifyQL($query: String!) {\n  shopifyqlQuery(query: $query) {\n    tableData {\n      columns { name dataType displayName }\n      rows\n    }\n    parseErrors\n  }\n}`,
    variables: {
      query,
    },
  };

  const response = await fetchGraphql(graphqlUrl, headers, body);
  if (!response.data || !response.data.shopifyqlQuery) {
    throw new Error('Invalid ShopifyQL response');
  }

  return {
    tableData: parseShopifyQLTableData(response.data.shopifyqlQuery.tableData),
    parseErrors: response.data.shopifyqlQuery.parseErrors || [],
  };
};

const fetchShopifyMetrics = async (accessToken, storeUrl) => {
  if (!accessToken) {
    throw new Error('Missing Shopify access token');
  }

  const baseUrl = storeUrl ? getShopifyAdminBaseUrl(storeUrl) : process.env.SHOPIFY_API_BASE_URL;
  if (!baseUrl) {
    throw new Error('Missing Shopify base URL. Provide shopifyStoreUrl/shopifyBaseUrl or set SHOPIFY_API_BASE_URL.');
  }

  const ordersUrl = `${baseUrl}/orders.json?limit=250&status=any`;
  const customersUrl = `${baseUrl}/customers.json?limit=250`;

  const headers = buildHeaders(accessToken);
  const [ordersResponse, customersResponse] = await Promise.all([
    fetchJson(ordersUrl, headers),
    fetchJson(customersUrl, headers),
  ]);

  const orders = Array.isArray(ordersResponse.orders) ? ordersResponse.orders : [];
  const customers = Array.isArray(customersResponse.customers) ? customersResponse.customers : [];

  const totalRevenue = orders.reduce((sum, order) => {
    const price = parseFloat(order.current_total_price || order.total_price || 0);
    return sum + (Number.isFinite(price) ? price : 0);
  }, 0);

  const totalOrders = orders.length;
  const repeatCustomers = customers.filter((customer) => Number(customer.orders_count) > 1).length;
  const totalCustomers = customers.length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const repeatRate = totalCustomers > 0 ? (repeatCustomers / totalCustomers) * 100 : 0;

  return {
    total_revenue: Number(totalRevenue.toFixed(2)),
    total_orders: totalOrders,
    total_customers: totalCustomers,
    repeat_customers: repeatCustomers,
    average_order_value: Number(averageOrderValue.toFixed(2)),
    repeat_rate: Number(repeatRate.toFixed(2)),
    shopify_store_url: baseUrl,
  };
};

module.exports = {
  fetchShopifyMetrics,
  fetchShopifyQL,
};
