export type Gap = {
  id: string;
  title: string;
  revenueAtStake: string;
  description: string;
  additionalInfo: string;
};

export type MetricRow = {
  name: string;
  description: string;
  yourValue: string;
  yourValueRaw: number | null;
  cohortMedian: string;
  cohortMedianRaw: number | null;
  topQuartile: string;
  topQuartileRaw: number | null;
  unit: string;
  status: 'up' | 'down';
  lowerIsBetter: boolean;
};

export type BenchmarkData = {
  brandName: string;
  category: string;
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
  brandName: 'Your Brand',
  category: 'Overall',
  shelfScore: 49,
  percentile: '40th',
  verdictTitle: 'Your retention engine is in second gear.',
  verdictDescription:
    'The cohort median runs in fourth. You are acquiring well, but customers aren\'t coming back at the rate top quartile brands manage.',
  gaps: [
    {
      id: 'missing_reorder_page',
      title: 'No Reorder Page live.',
      revenueAtStake: '₹9.6L',
      description:
        'Top quartile brands in your cohort run a dedicated reorder page that captures 3-4x the conversion of a generic home page. You currently route returning customers through the same flow as new visitors.',
      additionalInfo: 'Reorder Page is the #1 priority gap across the entire Shelf Index cohort.',
    },
    {
      id: 'missing_post_purchase_upsell',
      title: 'Post-purchase upsell only partially live.',
      revenueAtStake: '₹12.0L',
      description:
        'Top quartile brands capture 14-22% of post-purchase visits with a one-click upsell or thank-you-page offer. You show a basic thank-you page.',
      additionalInfo: 'Cohort data shows post-purchase AOV uplift averages 8-12% when implemented well.',
    },
    {
      id: 'missing_whatsapp_optin',
      title: 'No WhatsApp re-engagement live.',
      revenueAtStake: '₹15.0L',
      description:
        'Top quartile brands run Day-21 WhatsApp Reorder URL flows that drive 12-22% of repeat revenue. You have no WhatsApp re-engagement layer.',
      additionalInfo: 'WhatsApp read rates sit above 80% across all India geographies.',
    },
  ],
  totalRevenueAtStake: '₹36.6L',
  metrics: [
    {
      name: 'Revenue from repeat customers',
      description: 'trailing 90 days',
      yourValue: '28%',
      yourValueRaw: 28,
      cohortMedian: '40%',
      cohortMedianRaw: 40,
      topQuartile: '64%',
      topQuartileRaw: 64,
      unit: '%',
      status: 'down',
      lowerIsBetter: false,
    },
    {
      name: 'Time to second order',
      description: 'median days',
      yourValue: '32 days',
      yourValueRaw: 32,
      cohortMedian: '21 days',
      cohortMedianRaw: 21,
      topQuartile: '14 days',
      topQuartileRaw: 14,
      unit: ' days',
      status: 'down',
      lowerIsBetter: true,
    },
  ],
  cohortSize: 13,
  window: '90 days',
};

export function loadBenchmarkData(): BenchmarkData | null {
  if (typeof window === 'undefined') return sampleBenchmarkData;

  try {
    const raw = localStorage.getItem('lastReport');
    if (!raw) return sampleBenchmarkData;
    const parsed = JSON.parse(raw);
    if (!parsed) return sampleBenchmarkData;

    const report = parsed.report ?? parsed;

    const brandInfoRaw = localStorage.getItem('brandInfo');
    const brandInfo = brandInfoRaw ? JSON.parse(brandInfoRaw) : {};

    const shelfScore = report.shelf_score ?? report.shelfScore ?? sampleBenchmarkData.shelfScore;
    const percentile =
      typeof report.percentile === 'number'
        ? `${report.percentile}th`
        : report.percentile ?? sampleBenchmarkData.percentile;

    const gaps: Gap[] = Array.isArray(report.gaps)
      ? report.gaps.map((gap: any) => ({
          id: gap.id ?? 'unknown',
          title: gap.title ?? '',
          revenueAtStake: gap.revenue_at_stake_inr
            ? `₹${(gap.revenue_at_stake_inr / 100000).toFixed(1)}L`
            : gap.revenueAtStake ?? '',
          description: gap.comparison ?? gap.description ?? '',
          additionalInfo: gap.cohort_data ?? gap.additionalInfo ?? '',
        }))
      : sampleBenchmarkData.gaps;

    const metrics: MetricRow[] = Array.isArray(report.metrics_vs_cohort)
      ? report.metrics_vs_cohort.map((m: any) => {
          const youRaw = m.you ?? null;
          const medianRaw = m.cohort_median ?? null;
          const topQRaw = m.top_quartile ?? null;
          const unit = m.unit ?? '';
          const lowerIsBetter = m.lowerIsBetter ?? (m.key === 'time_to_2nd_order_days');
          const verdict = m.verdict ?? 'below';
          return {
            name: m.label ?? m.name ?? '',
            description: m.sublabel ?? m.description ?? '',
            yourValue: youRaw !== null ? `${youRaw}${unit}` : '--',
            yourValueRaw: youRaw !== null ? Number(youRaw) : null,
            cohortMedian: medianRaw !== null ? `${medianRaw}${unit}` : '--',
            cohortMedianRaw: medianRaw !== null ? Number(medianRaw) : null,
            topQuartile: topQRaw !== null ? `${topQRaw}${unit}` : '--',
            topQuartileRaw: topQRaw !== null ? Number(topQRaw) : null,
            unit,
            status: verdict === 'top' || verdict === 'above' ? 'up' : 'down',
            lowerIsBetter,
          };
        })
      : sampleBenchmarkData.metrics;

    const totalRevenueAtStake = report.total_revenue_at_stake_inr
      ? `₹${(report.total_revenue_at_stake_inr / 100000).toFixed(1)}L`
      : sampleBenchmarkData.totalRevenueAtStake;

    return {
      brandName: brandInfo.brandName || report.input?.company_name || 'Your Brand',
      category: report.category_used || brandInfo.category || 'Overall',
      shelfScore,
      percentile,
      verdictTitle: report.verdict?.headline ?? sampleBenchmarkData.verdictTitle,
      verdictDescription: report.verdict?.cohort_comparison ?? sampleBenchmarkData.verdictDescription,
      gaps,
      totalRevenueAtStake,
      metrics,
      cohortSize: report.methodology?.cohort_size ?? sampleBenchmarkData.cohortSize,
      window: report.methodology?.window_days
        ? `${report.methodology.window_days} days`
        : sampleBenchmarkData.window,
    };
  } catch {
    return sampleBenchmarkData;
  }
}
