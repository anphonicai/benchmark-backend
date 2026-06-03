import { useState, useEffect } from "react";
import Logo from "../components/Logo";
import { ArrowUpRight, Download, AlertTriangle, Zap } from "lucide-react";
import cohortConfig from "../utils/cohortConfig";

// ── Types ────────────────────────────────────────────────────────────────
interface Gap {
  title: string;
  revenueAtStake: string;
  revenuePerYear: string;
  effort: string;
  timeline: string;
  description: string;
  recommendedAction: string;
}

interface Metric {
  name: string;
  description: string;
  yourValue: string | number;
  cohortMedian: string | number;
  topQuartile: string | number;
  yourPosition: number;
  medianPosition: number;
  topQuartilePosition: number;
  status: "above" | "below";
}

interface NewBenchmarkData {
  brandName: string;
  category: string;
  shelfScore: number;
  scoreLabel: string;
  scoreColor: string;
  percentile: string;
  percentileText: string;
  verdictTitle: string;
  verdictDescription: string;
  cohortStage: number;
  metrics: Metric[];
  gaps: Gap[];
  totalRevenueAtStake: string;
  cohortSize: number;
  cohortDescription: string;
  dataWindow: string;
  dataWindowDescription: string;
  source: string;
  sourceEdition: string;
}

// ── Gap metadata ─────────────────────────────────────────────────────────
const GAP_META: Record<string, { effort: string; timeline: string; action: string }> = {
  missing_reorder_page: {
    effort: 'Medium effort',
    timeline: '2-4 weeks',
    action: 'Build a dedicated /reorder page or use Rebuy Smart Cart reorder list to capture returning customers.',
  },
  missing_loyalty_program: {
    effort: 'Medium effort',
    timeline: '2-4 weeks',
    action: 'Set up Nector or POPcoins — most brands go live in under 3 weeks with significant repeat rate uplift.',
  },
  missing_post_purchase_upsell: {
    effort: 'Low effort',
    timeline: '1-2 weeks',
    action: 'Add a one-click thank-you page offer via Rebuy, Zipify, or AfterSell. Start with your top-selling SKU.',
  },
  missing_whatsapp_optin: {
    effort: 'Low effort',
    timeline: '1 week',
    action: 'Launch a Day-21 WhatsApp Reorder URL flow via Interakt, Wati, or Kwick Engage. Single flow, big impact.',
  },
};

// ── Score helpers ─────────────────────────────────────────────────────────
const getScoreLabel = (score: number) =>
  score >= 70 ? 'Strong' : score >= 50 ? 'Building' : score >= 30 ? 'Developing' : 'Early Stage';

const getScoreColor = (score: number) =>
  score >= 70 ? '#44dd44' : score >= 50 ? '#ffdd00' : score >= 30 ? '#ffaa00' : '#ff4444';

// ── Position helpers (0-100 scale for bar chart) ─────────────────────────
const calcPositions = (
  yourRaw: number,
  medianRaw: number,
  topQRaw: number,
  lowerIsBetter: boolean
) => {
  if (lowerIsBetter) {
    // Higher value = more bar = visually worse (raw days on scale)
    const max = Math.max(yourRaw, medianRaw) * 1.5;
    return {
      yourPosition: Math.round(Math.min(95, (yourRaw / max) * 100)),
      medianPosition: Math.round(Math.min(95, (medianRaw / max) * 100)),
      topQuartilePosition: Math.round(Math.min(95, (topQRaw / max) * 100)),
    };
  }
  // Percentage metric: use raw value directly (already 0-100 scale)
  return {
    yourPosition: Math.round(Math.max(2, Math.min(95, yourRaw))),
    medianPosition: Math.round(Math.max(2, Math.min(95, medianRaw))),
    topQuartilePosition: Math.round(Math.max(2, Math.min(95, topQRaw))),
  };
};

// ── Map API response → NewBenchmarkData ───────────────────────────────────
function mapReport(report: any, brandInfo: any): NewBenchmarkData {
  const shelfScore = report.shelf_score ?? report.shelfScore ?? 0;
  const percentileNum =
    typeof report.percentile === 'number' ? report.percentile : parseInt(report.percentile) || 0;

  const gaps: Gap[] = Array.isArray(report.gaps)
    ? report.gaps
        .filter((g: any) => g.id !== 'underutilised_rebuy')
        .map((g: any) => {
          const meta = GAP_META[g.id] || {
            effort: 'Medium effort',
            timeline: '2-4 weeks',
            action: 'Review with your growth team.',
          };
          const rev = g.revenue_at_stake_inr
            ? `₹${(g.revenue_at_stake_inr / 100000).toFixed(1)}L`
            : g.revenueAtStake ?? '';
          return {
            title: g.title ?? '',
            revenueAtStake: rev,
            revenuePerYear: rev,
            effort: meta.effort,
            timeline: meta.timeline,
            description: g.comparison ?? g.description ?? '',
            recommendedAction: meta.action,
          };
        })
    : [];

  const metrics: Metric[] = Array.isArray(report.metrics_vs_cohort)
    ? report.metrics_vs_cohort
        .filter(
          (m: any) =>
            !['rebuy_revenue_share_pct', 'personalisation_aov_lift_pct', 'repeat_rate_90d_pct'].includes(m.key)
        )
        .map((m: any) => {
          const yourRaw = m.you !== null && m.you !== undefined ? Number(m.you) : null;
          const medianRaw = Number(m.cohort_median ?? 0);
          const topQRaw = Number(m.top_quartile ?? 0);
          const unit = m.unit ?? '';
          const lowerIsBetter = m.key === 'time_to_2nd_order_days';
          const verdict = m.verdict ?? 'below';
          const status: 'above' | 'below' =
            verdict === 'top' || verdict === 'above' ? 'above' : 'below';

          const positions =
            yourRaw !== null
              ? calcPositions(yourRaw, medianRaw, topQRaw, lowerIsBetter)
              : { yourPosition: 2, medianPosition: 50, topQuartilePosition: 75 };

          return {
            name: m.label ?? '',
            description: m.sublabel ?? '',
            yourValue: yourRaw !== null ? `${yourRaw}${unit}` : '--',
            cohortMedian: `${medianRaw}${unit}`,
            topQuartile: `${topQRaw}${unit}`,
            ...positions,
            status,
          };
        })
    : [];

  const totalRev = report.total_revenue_at_stake_inr
    ? `₹${(report.total_revenue_at_stake_inr / 100000).toFixed(1)}L`
    : '₹0L';

  return {
    brandName: brandInfo.brandName || report.input?.company_name || 'Your Brand',
    category: report.category_used || brandInfo.category || 'Overall',
    shelfScore,
    scoreLabel: getScoreLabel(shelfScore),
    scoreColor: getScoreColor(shelfScore),
    percentile: `${percentileNum}th`,
    percentileText: `Among ${report.methodology?.cohort_size ?? 13} India D2C brands benchmarked`,
    verdictTitle: report.verdict?.headline ?? '',
    verdictDescription: report.verdict?.cohort_comparison ?? '',
    cohortStage: Math.min(95, Math.max(2, shelfScore)),
    metrics,
    gaps,
    totalRevenueAtStake: totalRev,
    cohortSize: report.methodology?.cohort_size ?? 13,
    cohortDescription: 'India based, Shopify-native',
    dataWindow: report.methodology?.window_days ? `${report.methodology.window_days} days` : '90 days',
    dataWindowDescription: 'Rolling cohort period',
    source: 'The Shelf Index',
    sourceEdition: 'Edition 01 · Anphonic, 2026',
  };
}

// ── Default data ──────────────────────────────────────────────────────────
const defaultData: NewBenchmarkData = {
  brandName: 'Your Brand',
  category: 'Overall',
  shelfScore: 7,
  scoreLabel: 'Early Stage',
  scoreColor: '#ff4444',
  percentile: '5th',
  percentileText: 'Among 13 India D2C brands benchmarked',
  verdictTitle: 'Your retention engine has not been switched on.',
  verdictDescription:
    'The cohort runs in fourth gear on average. The good news: every gap below is a documented, fixable pattern from the Shelf Index data.',
  cohortStage: 15,
  metrics: [
    {
      name: 'Revenue from repeat customers',
      description: 'trailing 90 days',
      yourValue: '3%',
      cohortMedian: '40%',
      topQuartile: '64%',
      yourPosition: 3,
      medianPosition: 40,
      topQuartilePosition: 64,
      status: 'below',
    },
    {
      name: 'Time to second order',
      description: 'median',
      yourValue: '32 days',
      cohortMedian: '21 days',
      topQuartile: '14 days',
      yourPosition: 65,
      medianPosition: 43,
      topQuartilePosition: 28,
      status: 'below',
    },
  ],
  gaps: [
    {
      title: 'No Reorder Page live.',
      revenueAtStake: '₹9.6L',
      revenuePerYear: '₹9.6L',
      effort: 'Medium effort',
      timeline: '2-4 weeks',
      description:
        'Top quartile brands in your cohort run a dedicated /reorder page that captures 3-4x the conversion of a generic home page. You currently route returning customers through the same flow as new visitors.',
      recommendedAction:
        'Build a dedicated /reorder page or use Rebuy Smart Cart reorder list to capture returning customers.',
    },
  ],
  totalRevenueAtStake: '₹9.6L',
  cohortSize: 13,
  cohortDescription: 'India based, Shopify-native',
  dataWindow: '90 days',
  dataWindowDescription: 'Rolling cohort period',
  source: 'The Shelf Index',
  sourceEdition: 'Edition 01 · Anphonic, 2026',
};

// ── Component ─────────────────────────────────────────────────────────────
export default function BenchmarkReportPage() {
  const [benchmarkData, setBenchmarkData] = useState<NewBenchmarkData>(defaultData);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('lastReport');
      const brandInfoRaw = localStorage.getItem('brandInfo');
      if (!raw) return;
      const parsed = JSON.parse(raw);
      const brandInfo = brandInfoRaw ? JSON.parse(brandInfoRaw) : {};
      const report = parsed.report ?? parsed;
      const mapped = mapReport(report, brandInfo);
      setBenchmarkData(mapped);
    } catch (e) {
      console.warn('Failed to load benchmark data', e);
    }
  }, []);

  useEffect(() => {
    document.title = `Anphonic.ai Benchmark — ${benchmarkData.brandName}`;
    return () => { document.title = 'Anphonic.ai Benchmark'; };
  }, [benchmarkData.brandName]);

  const scorePercentage = (benchmarkData.shelfScore / 100) * 360;
  const circumference = 2 * Math.PI * 88;
  const dashArray = (scorePercentage / 360) * circumference;

  return (
    <div className="min-h-screen bg-[#f8f6f3] print:bg-white">
      <header className="px-12 py-6 print:hidden">
        <Logo />
      </header>

      <main className="px-12 py-16 max-w-5xl mx-auto print:px-4 print:py-4">
        {/* Top Info */}
        <div className="mb-12">
          <p className="text-xs text-[#999] uppercase tracking-wider mb-4">
            THE SHELF INDEX · EDITION 01 · ANPHONIC
          </p>
          <h1 className="text-5xl mb-3">{benchmarkData.brandName}</h1>
        </div>

        {/* Cohort caption pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#F0FAFA] border border-[#CCE8E8] rounded-full text-xs font-medium text-[#1C9393] tracking-wide mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[#30B4B7] flex-shrink-0" />
          Benchmarked against {cohortConfig.cohort_size} Indian D2C brands · {cohortConfig.tracked_value} tracked · {cohortConfig.data_window_full}
        </div>

        {/* Score Card */}
        <div className="bg-white rounded-2xl p-12 mb-8 shadow-sm">
          <div className="grid grid-cols-[280px_1fr] gap-16">
            {/* Score Circle */}
            <div className="flex flex-col items-center">
              <div className="relative w-48 h-48">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="96" cy="96" r="88" stroke="#f0f0f0" strokeWidth="16" fill="none" />
                  <circle
                    cx="96" cy="96" r="88"
                    stroke={benchmarkData.scoreColor}
                    strokeWidth="16"
                    fill="none"
                    strokeDasharray={`${dashArray} ${circumference}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-7xl">{benchmarkData.shelfScore}</div>
                </div>
              </div>
              <div className="mt-6 text-center">
                <div className="text-sm mb-1" style={{ color: benchmarkData.scoreColor }}>
                  {benchmarkData.scoreLabel}
                </div>
                <div className="text-xs text-[#999]">Shelf Score</div>
              </div>
            </div>

            {/* Percentile & Verdict */}
            <div className="flex flex-col justify-center">
              <div className="mb-8">
                <div className="text-xs text-[#999] uppercase tracking-wider mb-2">COHORT PERCENTILE</div>
                <div className="text-6xl mb-2">{benchmarkData.percentile}</div>
                <div className="text-sm text-[#666]">{benchmarkData.percentileText}</div>
              </div>
              <div>
                <div className="text-xs text-[#999] uppercase tracking-wider mb-3">VERDICT</div>
                <p className="text-lg mb-3"><strong>{benchmarkData.verdictTitle}</strong></p>
                <p className="text-[#666]">{benchmarkData.verdictDescription}</p>
              </div>
            </div>
          </div>

          {/* Cohort band */}
          <div className="mt-12 pt-10 border-t border-[#e5e5e5]">
            <div className="text-xs text-[#999] uppercase tracking-wider mb-4">WHERE YOU SIT IN THE COHORT</div>
            <div className="relative h-3 bg-gradient-to-r from-[#ff4444] via-[#ffaa00] via-[#ffdd00] to-[#44dd44] rounded-full">
              <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 bg-[#1a1a1a] rounded-full border-4 border-white shadow-lg"
                style={{ left: `${benchmarkData.cohortStage}%` }}
              />
            </div>
            <div className="flex justify-between mt-3 text-xs text-[#666]">
              <span>Early Stage</span>
              <span>Developing</span>
              <span>Building</span>
              <span>Thriving</span>
            </div>
          </div>
        </div>

        {/* Metrics */}
        {benchmarkData.metrics.length > 0 && (
          <div className="bg-white rounded-2xl p-12 mb-8 shadow-sm">
            <h2 className="text-3xl mb-2">Your Numbers vs The Cohort</h2>
            <p className="text-sm text-[#666] mb-12">
              Grey line = cohort median · Black line = top quartile · Colour bar = you
            </p>

            <div className="space-y-16">
              {benchmarkData.metrics.map((metric, index) => (
                <div key={index}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="font-medium text-lg">{metric.name}</div>
                      <div className="text-sm text-[#666]">{metric.description}</div>
                    </div>
                    {metric.status === 'below' && (
                      <div className="flex items-center gap-2 text-[#ff4444] text-sm">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Below median</span>
                      </div>
                    )}
                  </div>

                  {/* Label above bar */}
                  <div className="relative h-6 mb-2">
                    <div className="absolute -translate-x-1/2" style={{ left: `${metric.yourPosition}%` }}>
                      <div className="text-sm font-medium whitespace-nowrap">You: {metric.yourValue}</div>
                    </div>
                  </div>

                  {/* Bar */}
                  <div className="relative h-10 bg-[#f0f0f0] rounded-lg">
                    <div
                      className="h-full rounded-lg"
                      style={{
                        width: `${metric.yourPosition}%`,
                        backgroundColor: metric.status === 'below' ? '#ff4444' : '#44dd44',
                      }}
                    />
                    <div className="absolute top-0 bottom-0 w-0.5 bg-[#999]" style={{ left: `${metric.medianPosition}%` }} />
                    <div className="absolute top-0 bottom-0 w-0.5 bg-[#1a1a1a]" style={{ left: `${metric.topQuartilePosition}%` }} />
                  </div>

                  {/* Labels below bar */}
                  <div className="relative h-6 mt-2">
                    <div className="absolute -translate-x-1/2" style={{ left: `${metric.medianPosition}%` }}>
                      <div className="text-xs text-[#666] whitespace-nowrap">Median: {metric.cohortMedian}</div>
                    </div>
                    <div className="absolute -translate-x-1/2" style={{ left: `${metric.topQuartilePosition}%` }}>
                      <div className="text-xs text-[#666] whitespace-nowrap">Top Q: {metric.topQuartile}</div>
                    </div>
                  </div>

                  {metric.status === 'below' && (
                    <p className="text-sm text-[#666] mt-4">
                      Gap to median: {metric.cohortMedian}. Top brands close this in 3-6 months.
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Priority Gaps */}
        {benchmarkData.gaps.length > 0 && (
          <div className="bg-white rounded-2xl p-12 mb-8 shadow-sm">
            <div className="flex justify-between items-start mb-10">
              <div>
                <h2 className="text-3xl mb-2">Priority Gaps : Revenue at Stake</h2>
                <p className="text-sm text-[#666]">Ranked by annualized revenue opportunity based on your scale</p>
              </div>
              <div className="text-right">
                <div className="text-xs text-[#999] mb-1">Total annual opportunity</div>
                <div className="text-4xl">{benchmarkData.totalRevenueAtStake}</div>
              </div>
            </div>

            <div className="space-y-8">
              {benchmarkData.gaps.map((gap, index) => (
                <div key={index} className="flex items-start gap-6">
                  <div className="w-10 h-10 bg-[#1a1a1a] text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-medium text-xl pr-4">{gap.title}</h3>
                      <div className="text-right flex-shrink-0">
                        <div className="text-xs text-[#999]">Revenue at stake</div>
                        <div className="text-2xl">{gap.revenuePerYear}</div>
                        <div className="text-xs text-[#666]">per year</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mb-4">
                      <span className="inline-block px-3 py-1 bg-[#fff9e6] text-[#b8860b] text-xs rounded-md">
                        {gap.effort}
                      </span>
                      <span className="text-sm text-[#666]">⏱ {gap.timeline}</span>
                    </div>

                    <p className="text-[#666] mb-4">{gap.description}</p>

                    <div className="bg-[#f0f8ff] border-l-4 border-[#4285f4] pl-5 py-3 rounded-r">
                      <div className="flex items-start gap-3">
                        <Zap className="w-5 h-5 text-[#4285f4] flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="text-xs text-[#4285f4] font-medium uppercase tracking-wider mb-1">
                            Recommended action
                          </div>
                          <p className="text-sm text-[#666]">{gap.recommendedAction}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* About This Benchmark */}
        <div className="bg-white rounded-2xl p-12 mb-8 shadow-sm">
          <h3 className="text-2xl mb-8">About This Benchmark</h3>
          <div className="grid grid-cols-3 gap-10">
            <div>
              <div className="text-xs text-[#999] uppercase tracking-wider mb-2">COHORT SIZE</div>
              <div className="font-medium text-lg mb-2">{benchmarkData.cohortSize} D2C brands</div>
              <div className="text-sm text-[#666]">{benchmarkData.cohortDescription}</div>
            </div>
            <div>
              <div className="text-xs text-[#999] uppercase tracking-wider mb-2">DATA WINDOW</div>
              <div className="font-medium text-lg mb-2">{benchmarkData.dataWindow}</div>
              <div className="text-sm text-[#666]">{benchmarkData.dataWindowDescription}</div>
            </div>
            <div>
              <div className="text-xs text-[#999] uppercase tracking-wider mb-2">SOURCE</div>
              <div className="font-medium text-lg mb-2">{benchmarkData.source}</div>
              <div className="text-sm text-[#666]">{benchmarkData.sourceEdition}</div>
            </div>
          </div>
        </div>

        {/* Download CTA */}
        <div className="bg-[#1a1a1a] rounded-2xl p-10 mb-8 text-white flex justify-between items-center print:hidden">
          <div>
            <h3 className="text-2xl mb-2">Download the Shelf Index</h3>
            <p className="text-sm text-[#999]">Get the full Shelf Index report as a PDF to share with your team.</p>
          </div>
          <a
            href="https://drive.google.com/uc?export=download&id=1I7geihmjOueHGG69zHNbki6u8JGydEDL"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-white text-[#1a1a1a] px-8 py-4 rounded-lg hover:bg-[#f0f0f0] transition-colors flex-shrink-0"
          >
            <Download className="w-5 h-5" />
            <span>Download Report</span>
          </a>
        </div>

        {/* Talk to Anphonic */}
        <div className="bg-gradient-to-br from-[#0066ff] to-[#0052cc] rounded-2xl p-14 text-center text-white shadow-lg print:hidden">
          <h2 className="text-4xl mb-4">Want to close these gaps faster?</h2>
          <p className="text-lg mb-10 opacity-90">
            Anphonic works with D2C brands to implement every gap above —<br />
            reorder pages, loyalty, WhatsApp flows — in 4-6 weeks.
          </p>
          <a
            href="https://www.anphonic.ai/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-[#0066ff] px-10 py-4 rounded-lg hover:bg-[#f0f0f0] transition-colors text-lg group"
          >
            <span>Talk to Anphonic</span>
            <ArrowUpRight className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>
        </div>
      </main>
    </div>
  );
}
