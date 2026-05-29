import { useState } from 'react';
import { Box, Button, Card, CardContent, Grid, TextField, Typography } from '@mui/material';
import Loader from '../components/Loader';
import { submitManual } from '../api/api';

function ManualEntryPage() {
  const [formData, setFormData] = useState({
    average_order_value: '',
    repeat_rate: '',
    add_to_cart_rate: '',
    percent_repeat_revenue: '',
    orders_per_month: '',
  });
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
      const response = await submitManual(formData);
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Unable to calculate score');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Manual Benchmark
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        Enter manual Shopify benchmark values to calculate a shelf score.
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Average order value"
                  name="average_order_value"
                  value={formData.average_order_value}
                  type="number"
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Repeat rate (%)"
                  name="repeat_rate"
                  value={formData.repeat_rate}
                  type="number"
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Add to cart rate (%)"
                  name="add_to_cart_rate"
                  value={formData.add_to_cart_rate}
                  type="number"
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Percent repeat revenue (%)"
                  name="percent_repeat_revenue"
                  value={formData.percent_repeat_revenue}
                  type="number"
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Orders per month"
                  name="orders_per_month"
                  value={formData.orders_per_month}
                  type="number"
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>
            </Grid>
            <Box sx={{ mt: 3 }}>
              <Button type="submit" variant="contained" disabled={loading}>
                Calculate Shelf Score
              </Button>
            </Box>
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
            <Typography variant="h6">Shelf Score</Typography>
            <Typography sx={{ mt: 1, mb: 2, fontSize: '1.5rem' }}>{result.shelf_score}</Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}

export default ManualEntryPage;
