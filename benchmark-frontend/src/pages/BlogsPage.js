import { Box, Chip, Divider, Typography } from '@mui/material';
import { useEffect } from 'react';

const benchmarkData = [
  { label: '30-day repeat purchase rate (avg)', value: '12%' },
  { label: '30-day repeat purchase rate (top performers)', value: '22%' },
  { label: '90-day repeat purchase rate (avg)', value: '18%' },
  { label: '90-day repeat purchase rate (top performers)', value: '32%' },
  { label: '12-month CLV (avg)', value: '₹2,800' },
  { label: '12-month CLV (top performers)', value: '₹6,500' },
];

function BlogsPage() {
  useEffect(() => {
    document.title = 'India D2C Retention Benchmarks in 2026 | Anphonic';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute(
        'content',
        'Discover the retention benchmarks shaping Indian D2C in 2026, including repeat purchase rates, cohort behavior, and the personalization tactics top brands use to grow profitably.'
      );
    }
  }, []);

  return (
    <Box sx={{ maxWidth: 720, mx: 'auto', py: 4 }}>
      <Chip label="Retention" size="small" sx={{ mb: 2 }} />
      <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
        India D2C Retention Benchmarks in 2026: What Top Brands Do Differently
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        June 2026 · Anphonic Benchmark Team
      </Typography>

      <Divider sx={{ mb: 4 }} />

      <Typography variant="body1" paragraph>
        Indian D2C brands are no longer competing only on acquisition. In 2026, the real gap is
        between brands that keep customers coming back and brands that keep paying to replace them.
      </Typography>

      <Typography variant="body1" paragraph>
        Retention has become one of the clearest signals of brand health because it directly affects
        repeat revenue, customer lifetime value, and payback period. Recent benchmark data shows
        repeat purchase rates vary widely by category, with top brands consistently outperforming
        the average through stronger post-purchase journeys and better re-engagement timing.
      </Typography>

      <Typography variant="body1" paragraph>
        The lesson is simple: if your retention curve is flat, you are likely leaving revenue on
        the table even if your top-of-funnel looks healthy.
      </Typography>

      <Typography variant="h5" component="h2" fontWeight={600} sx={{ mt: 5, mb: 2 }}>
        What the benchmark data is showing
      </Typography>

      <Typography variant="body1" paragraph>
        Across Indian D2C categories, the spread between average and top-performing brands is large.
        The benchmark data puts this in sharp relief:
      </Typography>

      <Box
        component="table"
        sx={{
          width: '100%',
          borderCollapse: 'collapse',
          mb: 4,
          '& th, & td': {
            textAlign: 'left',
            px: 2,
            py: 1.5,
            borderBottom: '1px solid',
            borderColor: 'divider',
            typography: 'body2',
          },
          '& th': { fontWeight: 600, bgcolor: 'action.hover' },
        }}
      >
        <thead>
          <tr>
            <th>Metric</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {benchmarkData.map((row) => (
            <tr key={row.label}>
              <td>{row.label}</td>
              <td>
                <strong>{row.value}</strong>
              </td>
            </tr>
          ))}
        </tbody>
      </Box>

      <Typography variant="body1" paragraph>
        That gap matters because it reflects how well a brand turns first-time buyers into repeat
        customers through post-purchase communication, personalization, and offer sequencing.
      </Typography>

      <Typography variant="h5" component="h2" fontWeight={600} sx={{ mt: 5, mb: 2 }}>
        Why brands lose repeat sales
      </Typography>

      <Typography variant="body1" paragraph>
        Most brands do not lose customers because of one bad campaign. They lose them because the
        post-purchase experience is too generic, too late, or not connected to the next best product
        recommendation.
      </Typography>

      <Typography variant="body1" gutterBottom>
        A common failure pattern looks like this:
      </Typography>

      <Box
        component="ol"
        sx={{ pl: 3, mb: 3, '& li': { mb: 1, typography: 'body1' } }}
      >
        <li>The first order is won with paid media.</li>
        <li>The customer gets a basic confirmation email.</li>
        <li>No meaningful follow-up happens within the first week.</li>
        <li>The next purchase opportunity is missed entirely.</li>
      </Box>

      <Typography variant="body1" paragraph>
        In other words, the brand spends to acquire attention but does not build a system to convert
        that attention into habit.
      </Typography>

      <Typography variant="h5" component="h2" fontWeight={600} sx={{ mt: 5, mb: 2 }}>
        What top brands do differently
      </Typography>

      <Typography variant="body1" paragraph>
        The strongest D2C brands use the first seven days after purchase as a retention window.
        They send useful order updates, ask for feedback, and introduce complementary products while
        the original purchase is still top of mind.
      </Typography>

      <Typography variant="body1" paragraph>
        They also track the right metrics — repeat purchase rate, days between purchases, cohort
        revenue curves, and reactivation rate. Those metrics show whether retention is actually
        compounding, instead of just looking good in a dashboard.
      </Typography>

      <Typography variant="body1" paragraph>
        Personalization matters here because one-size-fits-all retention flows usually underperform.
        Brands that segment by product type, category affinity, and timing can make post-purchase
        offers feel relevant rather than pushy.
      </Typography>

      <Divider sx={{ mt: 6, mb: 3 }} />

      <Typography variant="body2" color="text.secondary">
        Want to see where your brand sits against these benchmarks?{' '}
        <Box
          component="a"
          href="/"
          sx={{ color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
        >
          Run your free benchmark
        </Box>
        .
      </Typography>
    </Box>
  );
}

export default BlogsPage;
