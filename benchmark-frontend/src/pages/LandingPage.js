import { Box, Button, Card, CardContent, Grid, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

function LandingPage() {
  return (
    <Box>
      <Typography variant="h3" component="h1" gutterBottom>
        Where does your D2C brand actually stand?
      </Typography>
      <Typography variant="body1" sx={{ mb: 4 }}>
        Benchmark your retention metrics against India's leading Shopify brands. Connect your store and get a verified diagnostic.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Repeat Purchase Rate</Typography>
              <Typography variant="h4" sx={{ mt: 2 }}>22%</Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Cohort median from your benchmark dataset.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Add to Cart Rate</Typography>
              <Typography variant="h4" sx={{ mt: 2 }}>6.4%</Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Benchmarked against real Shopify data.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Revenue from Repeats</Typography>
              <Typography variant="h4" sx={{ mt: 2 }}>31%</Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Typical contribution from repeat customers.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Button component={Link} to="/shopify" variant="contained">
          Start with Shopify
        </Button>
        <Button component={Link} to="/manual" variant="outlined">
          Manual Benchmark
        </Button>
        <Button component={Link} to="/results" variant="outlined">
          View Stored Results
        </Button>
      </Box>
    </Box>
  );
}

export default LandingPage;
