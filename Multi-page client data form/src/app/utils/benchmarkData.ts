export type Gap = {
  title: string;
  revenueAtStake: string;
  description: string;
  additionalInfo: string;
};

export type MetricRow = {
  name: string;
  description: string;
  yourValue: string;
  cohortMedian: string;
  topQuartile: string;
  status: 'up' | 'down';
};

export type BenchmarkData = {
  shelfScore: number;
  percentile: string;
  verdictTitle: string;
  verdictDescription: string;
  gaps: Gap[];
  totalRevenueAtStake: string;
  metrics: MetricRow[];
  cohortSize: number;
  window: string;
};

const sampleBenchmarkData: BenchmarkData = {
  shelfScore: 49,
  percentile: '40th',
  verdictTitle: 'Your retention engine is in second gear.',
  verdictDescription:
    'The cohort median runs in fourth. You are acquiring well, but customers aren’t coming back at the rate top quartile brands manage.',
  gaps: [
    {
      title: 'Rebuy Engine running well below configuration target.',
      revenueAtStake: '₹8.4L',
      description:
        'Target range for a well-configured Rebuy account is 12-18% of store revenue. Portfolio average is 15.8%. You are at 5%.',
      additionalInfo:
        'The range across the cohort is 3.8% to 28.5%. Configuration quality matters more than the tool itself.',
    },
    {
      title: 'No Reorder Page live.',
      revenueAtStake: '₹9.6L',
      description:
        'Top quartile brands in your cohort run a dedicated reorder page that captures 3-4x the conversion of a generic home page. You currently route returning customers through the same flow as new visitors.',
      additionalInfo: 'Reorder Page is the #1 priority gap across the entire Shelf Index cohort.',
    },
    {
      title: 'Post-purchase upsell only partially live.',
      revenueAtStake: '₹12.0L',
      description:
        'Top quartile brands capture 14-22% of post-purchase visits with a one-click upsell or thank-you-page offer. You show a basic thank-you page.',
      additionalInfo:
        'Cohort data shows post-purchase AOV uplift averages 8-12% when implemented well.',
    },
  ],
  totalRevenueAtStake: '₹30.0L',
  metrics: [
    {
      name: 'Repeat purchase rate',
      description: '90 day window',
      yourValue: '20%',
      cohortMedian: '15%',
      topQuartile: '15.6%',
      status: 'up',
    },
    {
      name: 'Revenue from repeat customers',
      description: 'trailing 90 days',
      yourValue: '0%',
      cohortMedian: '48%',
      topQuartile: '61%',
      status: 'down',
    },
    {
      name: 'Time to second order',
      description: 'median',
      yourValue: '0 days',
      cohortMedian: '21 days',
      topQuartile: '14 days',
      status: 'up',
    },
    {
      name: 'Rebuy revenue share',
      description: 'personalisation revenue',
      yourValue: '5%',
      cohortMedian: '18.7%',
      topQuartile: '22.7%',
      status: 'down',
    },
    {
      name: 'Personalisation AOV lift',
      description: 'on Rebuy orders',
      yourValue: '10%',
      cohortMedian: '56.5%',
      topQuartile: '92.8%',
      status: 'down',
    },
  ],
  cohortSize: 13,
  window: '90 days',
};

export function loadBenchmarkData(): BenchmarkData | null {
  if (typeof window === 'undefined') {
    return sampleBenchmarkData;
  }

  try {
    const raw = localStorage.getItem('lastReport');
    if (!raw) {
      return sampleBenchmarkData;
    }
    const parsed = JSON.parse(raw);
    if (!parsed) {
      return sampleBenchmarkData;
    }

    if (parsed.shelfScore && parsed.metrics) {
      return parsed as BenchmarkData;
    }

    const report = parsed.report ?? parsed;

    const shelfScore = report.shelf_score ?? report.shelfScore ?? sampleBenchmarkData.shelfScore;
    const percentile = typeof report.percentile === 'number' ? `${report.percentile}th` : report.percentile ?? sampleBenchmarkData.percentile;
    const verdictTitle = report.verdict?.headline ?? sampleBenchmarkData.verdictTitle;
    const verdictDescription = report.verdict?.cohort_comparison ?? sampleBenchmarkData.verdictDescription;
    const totalRevenueAtStake = report.total_revenue_at_stake_inr
      ? `₹${(report.total_revenue_at_stake_inr / 100000).toFixed(1)}L`
      : report.totalRevenueAtStake ?? sampleBenchmarkData.totalRevenueAtStake;
    const cohortSize = report.methodology?.cohort_size ?? report.cohortSize ?? sampleBenchmarkData.cohortSize;
    const window = report.methodology?.window_days
      ? `${report.methodology.window_days} days`
      : report.window ?? sampleBenchmarkData.window;

    const gaps = Array.isArray(report.gaps)
      ? report.gaps.map((gap: any) => ({
          title: gap.title ?? gap.id ?? 'Gap',
          revenueAtStake: gap.revenue_at_stake_inr
            ? `₹${(gap.revenue_at_stake_inr / 100000).toFixed(1)}L`
            : gap.revenueAtStake ?? '',
          description: gap.comparison ?? gap.description ?? '',
          additionalInfo: gap.cohort_data ?? gap.additionalInfo ?? '',
        }))
      : sampleBenchmarkData.gaps;

    const metrics = Array.isArray(report.metrics_vs_cohort)
      ? report.metrics_vs_cohort.map((metric: any) => ({
          name: metric.label ?? metric.name ?? '',
          description: metric.sublabel ?? metric.description ?? '',
          yourValue: `${metric.you ?? metric.yourValue ?? '--'}${metric.unit ?? ''}`,
          cohortMedian: `${metric.cohort_median ?? metric.cohortMedian ?? '--'}${metric.unit ?? ''}`,
          topQuartile: `${metric.top_quartile ?? metric.topQuartile ?? '--'}${metric.unit ?? ''}`,
          status: metric.verdict === 'top' ? 'up' : 'down',
        }))
      : sampleBenchmarkData.metrics;

    return {
      shelfScore,
      percentile,
      verdictTitle,
      verdictDescription,
      gaps,
      totalRevenueAtStake,
      metrics,
      cohortSize,
      window,
    };
  } catch (error) {
    console.warn('Could not load saved benchmark data:', error);
    return sampleBenchmarkData;
  }
}
