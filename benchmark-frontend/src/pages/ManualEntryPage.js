import { useState } from 'react';
import { Box, Button, Card, CardContent, Grid, TextField, Typography, MenuItem } from '@mui/material';
import Loader from '../components/Loader';
import { submitManual } from '../api/api';

function ManualEntryPage() {
  const [formData, setFormData] = useState({
    category: '',
    repeat_rate_90d_pct: '',
    repeat_revenue_pct: '',
    time_to_2nd_order_days_median: '',
    rebuy_revenue_share_pct: '',
    personalisation_aov_lift_pct: '',
    // optional manual/brand context inputs
    loyalty: '',
    upsell: '',
    whatsapp: '',
    aov_inr: '',
    orders_per_month_estimated: '',
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
      // Build payload with numeric parsing and explicit fields expected by the backend
      const payload = {
        category: formData.category,
        repeat_rate_90d_pct: formData.repeat_rate_90d_pct === '' ? null : Number(formData.repeat_rate_90d_pct),
        repeat_revenue_pct: formData.repeat_revenue_pct === '' ? null : Number(formData.repeat_revenue_pct),
        time_to_2nd_order_days_median: formData.time_to_2nd_order_days_median === '' ? null : Number(formData.time_to_2nd_order_days_median),
        rebuy_revenue_share_pct: formData.rebuy_revenue_share_pct === '' ? null : Number(formData.rebuy_revenue_share_pct),
        personalisation_aov_lift_pct: formData.personalisation_aov_lift_pct === '' ? null : Number(formData.personalisation_aov_lift_pct),
        // Brand context
        aov_inr: formData.aov_inr === '' ? null : Number(formData.aov_inr),
        orders_per_month_estimated: formData.orders_per_month_estimated === '' ? null : Number(formData.orders_per_month_estimated),
        // Manual flags for gap analysis
        loyalty: formData.loyalty || null,
        upsell: formData.upsell || null,
        whatsapp: formData.whatsapp || null,
      };

      const response = await submitManual(payload);
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
                  label="Category"
                  name="category"
                  value={formData.category}
                  type="text"
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Repeat rate 90d (%)"
                  name="repeat_rate_90d_pct"
                  value={formData.repeat_rate_90d_pct}
                  type="number"
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Repeat revenue share (%)"
                  name="repeat_revenue_pct"
                  value={formData.repeat_revenue_pct}
                  type="number"
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Time to 2nd order (days)"
                  name="time_to_2nd_order_days_median"
                  value={formData.time_to_2nd_order_days_median}
                  type="number"
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Rebuy revenue share (%)"
                  name="rebuy_revenue_share_pct"
                  value={formData.rebuy_revenue_share_pct}
                  type="number"
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Personalisation AOV lift (%)"
                  name="personalisation_aov_lift_pct"
                  value={formData.personalisation_aov_lift_pct}
                  type="number"
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Average order value (INR)"
                  name="aov_inr"
                  value={formData.aov_inr}
                  type="number"
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Estimated orders / month"
                  name="orders_per_month_estimated"
                  value={formData.orders_per_month_estimated}
                  type="number"
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  select
                  label="Loyalty"
                  name="loyalty"
                  value={formData.loyalty}
                  onChange={handleChange}
                  fullWidth
                >
                  <MenuItem value="">None</MenuItem>
                  <MenuItem value="Basic">Basic</MenuItem>
                  <MenuItem value="Advanced">Advanced</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  select
                  label="Post-purchase upsell"
                  name="upsell"
                  value={formData.upsell}
                  onChange={handleChange}
                  fullWidth
                >
                  <MenuItem value="">Not yet</MenuItem>
                  <MenuItem value="Partially implemented">Partially implemented</MenuItem>
                  <MenuItem value="Live">Live</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  select
                  label="WhatsApp opt-in"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleChange}
                  fullWidth
                >
                  <MenuItem value="">None</MenuItem>
                  <MenuItem value="Opt-in">Opt-in</MenuItem>
                </TextField>
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
        <Box>
          {/* Shelf Score & Percentile */}
          <Card sx={{ mb: 3, backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Your Shelf Score
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
                <Typography sx={{ fontSize: '4rem', fontWeight: 'bold' }}>
                  {result.shelf_score}
                </Typography>
                <Box>
                  <Typography variant="body1">Percentile: {result.percentile}%</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Category: {result.category_used}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Verdict */}
          {result.verdict && (
            <Card sx={{ mb: 3, borderLeft: '4px solid #667eea' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  {result.verdict.headline}
                </Typography>
                <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
                  Gear: <strong>{result.verdict.gear}</strong>
                </Typography>
                <Typography variant="body1">
                  {result.verdict.cohort_comparison}
                </Typography>
              </CardContent>
            </Card>
          )}

          {/* Metrics vs Cohort */}
          {result.metrics_vs_cohort && result.metrics_vs_cohort.length > 0 && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Your Metrics vs Cohort
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {result.metrics_vs_cohort.map((metric) => (
                    <Box key={metric.key} sx={{ borderBottom: '1px solid #eee', pb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                            {metric.label}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#999' }}>
                            {metric.sublabel}
                          </Typography>
                        </Box>
                        <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#667eea' }}>
                          {metric.you}{metric.unit}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, fontSize: '0.9rem' }}>
                        <Box>
                          <Typography variant="caption">Median: {metric.cohort_median}{metric.unit}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption">Top Quartile: {metric.top_quartile}{metric.unit}</Typography>
                        </Box>
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 'bold',
                            color:
                              metric.verdict === 'top'
                                ? '#4caf50'
                                : metric.verdict === 'above'
                                ? '#8bc34a'
                                : metric.verdict === 'at'
                                ? '#ff9800'
                                : '#f44336',
                          }}
                        >
                          {metric.verdict === 'top' && 'Top Quartile'}
                          {metric.verdict === 'above' && 'Above Median'}
                          {metric.verdict === 'at' && 'At Median'}
                          {metric.verdict === 'below' && 'Below Median'}
                          {metric.verdict === 'no_data' && 'No Data'}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Top 3 Gaps & Revenue at Stake */}
          {result.gaps && result.gaps.length > 0 && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Top Gaps to Address
                  </Typography>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" sx={{ color: '#999' }}>
                      Total Revenue at Stake (Annual)
                    </Typography>
                    <Typography variant="h6" sx={{ color: '#e74c3c', fontWeight: 'bold' }}>
                      ₹{(result.total_revenue_at_stake_inr || 0).toLocaleString('en-IN')}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {result.gaps.map((gap, idx) => (
                    <Box
                      key={gap.id}
                      sx={{
                        p: 2,
                        borderRadius: '8px',
                        border: '1px solid #ddd',
                        backgroundColor: '#f9f9f9',
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Box>
                          <Typography
                            variant="body1"
                            sx={{
                              fontWeight: 'bold',
                              mb: 0.5,
                            }}
                          >
                            #{idx + 1}: {gap.title}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                            {gap.comparison}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#999', fontStyle: 'italic' }}>
                            {gap.cohort_data}
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right', ml: 2, minWidth: '140px' }}>
                          <Typography variant="caption" sx={{ color: '#999' }}>
                            Revenue at Stake
                          </Typography>
                          <Typography variant="h6" sx={{ color: '#e74c3c', fontWeight: 'bold' }}>
                            ₹{(gap.revenue_at_stake_inr || 0).toLocaleString('en-IN')}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#999' }}>
                            {gap.revenue_period}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Methodology */}
          {result.methodology && (
            <Card sx={{ backgroundColor: '#f0f0f0' }}>
              <CardContent>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  <strong>Methodology:</strong> {result.methodology.source} • Cohort size: {result.methodology.cohort_size}
                  • Window: {result.methodology.window_days} days
                </Typography>
              </CardContent>
            </Card>
          )}
        </Box>
      )}
    </Box>
  );
}

export default ManualEntryPage;
