import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import Loader from '../components/Loader';
import { getReport } from '../api/api';

function ResultsPage() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      setError('');
      try {
        // Fetch report summary + category data, and metrics (brands)
        const [reportRes, metricsRes] = await Promise.all([getReport(), getMetrics()]);

        const reportData = reportRes.data || {};
        const metricsData = metricsRes.data || {};

        // Normalize shapes expected by this UI
        const summary = reportData.report_summary || reportData.summary || null;
        const categories = reportData.report_by_category || reportData.categories || [];

        // Map metrics rows to brands list used in the table
        const brands = (metricsData.metrics || metricsData.rows || []).map((m) => ({
          id: m.company_id || m.id,
          brand_name: m.brand_name || m.name || m.company_name || '--',
          category: m.category,
          repeat_rate: m.repeat_rate,
          average_order_value: m.average_order_value || m.aov || '--',
          repeat_percentile: m.cohort_percentile ? m.cohort_percentile / 100 : (m.cohort_percentile || 0),
          performance_verdict: m.verdict?.headline || m.shelf_score || '--',
        }));

        setReport({ summary, categories, brands });
      } catch (err) {
        setError(err.response?.data?.error || err.message || 'Unable to load report');
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, []);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Benchmark Report
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        Review the cohort summary and stored benchmark performance for your brands.
      </Typography>

      {loading && <Loader />}
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {report?.summary && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2">Total brands</Typography>
                <Typography variant="h5">{report.summary.total_brands}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2">Median repeat rate</Typography>
                <Typography variant="h5">{report.summary.median_repeat_rate}%</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2">Median AOV</Typography>
                <Typography variant="h5">₹{report.summary.median_aov}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {report?.categories?.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Category summary
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Category</TableCell>
                    <TableCell>Count</TableCell>
                    <TableCell>Avg repeat rate</TableCell>
                    <TableCell>Avg AOV</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {report.categories.map((category) => (
                    <TableRow key={category.category}>
                      <TableCell>{category.category}</TableCell>
                      <TableCell>{category.count}</TableCell>
                      <TableCell>{category.avg_repeat_rate}%</TableCell>
                      <TableCell>₹{category.avg_aov}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {report?.brands?.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Brand performance
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Brand</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Repeat rate</TableCell>
                    <TableCell>AOV</TableCell>
                    <TableCell>Repeat percentile</TableCell>
                    <TableCell>Verdict</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {report.brands.map((brand) => (
                    <TableRow key={brand.id}>
                      <TableCell>{brand.brand_name || brand.name}</TableCell>
                      <TableCell>{brand.category || '--'}</TableCell>
                      <TableCell>{brand.repeat_rate}%</TableCell>
                      <TableCell>₹{brand.average_order_value}</TableCell>
                      <TableCell>{Math.round(brand.repeat_percentile * 100)}%</TableCell>
                      <TableCell>{brand.performance_verdict || '--'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}

export default ResultsPage;
