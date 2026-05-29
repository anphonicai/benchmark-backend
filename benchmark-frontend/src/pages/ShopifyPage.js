import { useState } from 'react';
import { Box, Button, Card, CardContent, TextField, Typography } from '@mui/material';
import Loader from '../components/Loader';
import { submitShopify } from '../api/api';

function ShopifyPage() {
  const [formData, setFormData] = useState({ shopifyToken: '', shopifyStoreUrl: '' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);

    try {
      const response = await submitShopify(formData);
      setResult(response.data.metrics);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Unable to fetch metrics');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Shopify Benchmark
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        Paste a Shopify access token and store domain to fetch benchmark metrics for one store.
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <TextField
              label="Shopify access token"
              name="shopifyToken"
              value={formData.shopifyToken}
              onChange={handleChange}
              fullWidth
              required
              sx={{ mb: 2 }}
            />
            <TextField
              label="Store domain or URL"
              name="shopifyStoreUrl"
              value={formData.shopifyStoreUrl}
              onChange={handleChange}
              fullWidth
              required
              sx={{ mb: 2 }}
            />
            <Button type="submit" variant="contained" disabled={loading}>
              Fetch Shopify Metrics
            </Button>
          </form>
        </CardContent>
      </Card>

      {loading && <Loader />}
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      {result && (
        <Card>
          <CardContent>
            <Typography variant="h6">Shopify Metrics</Typography>
            <Typography>Store URL: {result.shopify_store_url}</Typography>
            <Typography>Total revenue: ₹{result.total_revenue}</Typography>
            <Typography>Total orders: {result.total_orders}</Typography>
            <Typography>Total customers: {result.total_customers}</Typography>
            <Typography>Repeat customers: {result.repeat_customers}</Typography>
            <Typography>AOV: ₹{result.average_order_value}</Typography>
            <Typography>Repeat rate: {result.repeat_rate}%</Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}

export default ShopifyPage;
