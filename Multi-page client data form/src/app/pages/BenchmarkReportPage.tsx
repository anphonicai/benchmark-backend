import { useState, useEffect } from "react";
import Logo from "../components/Logo";
import { ArrowUpRight, CheckCircle2, AlertTriangle, TrendingUp, Zap, Clock } from "lucide-react";
import { BenchmarkData, loadBenchmarkData } from "../utils/benchmarkData";

// ── Effort levels per gap ID ───────────────────────────────────────────────
const GAP_META: Record<string, { effort: string; time: string; action: string; effortColor: string }> = {
  missing_reorder_page: {
    effort: 'Medium',
    time: '2-4 weeks',
    action: 'Build a dedicated /reorder page or use Rebuy Smart Cart reorder flow to capture returning customers.',
    effortColor: 'bg-yellow-100 text-yellow-700',
  },
  missing_loyalty_program: {
    effort: 'Medium',
    time: '2-4 weeks',
    action: 'Set up Nector or POPcoins — most brands go live in under 3 weeks with significant repeat rate uplift.',
    effortColor: 'bg-yellow-100 text-yellow-700',
  },
  missing_post_purchase_upsell: {
    effort: 'Low',
    time: '1-2 weeks',
    action: 'Add a one-click thank-you page offer via Rebuy, Zipify, or AfterSell. Start with your top-selling SKU.',
    effortColor: 'bg-green-100 text-green-700',
  },
  missing_whatsapp_optin: {
    effort: 'Low',
    time: '1 week',
    action: 'Launch a Day-21 WhatsApp Reorder URL flow via Interakt, Wati, or Kwick Engage. Single flow, big impact.',
    effortColor: 'bg-green-100 text-green-700',
  },
};

// ── Score arc SVG ─────────────────────────────────────────────────────────
function ScoreGauge({ score }: { score: number }) {
  const color =
    score >= 70 ? '#22c55e' : score >= 50 ? '#f59e0b' : score >= 30 ? '#f97316' : '#ef4444';
  const label =
    score >= 70 ? 'Strong' : score >= 50 ? 'Building' : score >= 30 ? 'Developing' : 'Early Stage';

  return (
    <div className="flex flex-col items-center">
      <svg width="180" height="100" viewBox="0 0 180 100">
        <path d="M 10 90 A 80 80 0 0 1 170 90" fill="none" stroke="#f0f0f0" strokeWidth="14" strokeLinecap="round" />
        <path
          d="M 10 90 A 80 80 0 0 1 170 90"
          fill="none"
          stroke={color}
          strokeWidth="14"
          strokeLinecap="round"
          pathLength="100"
          strokeDasharray="100"
          strokeDashoffset={100 - score}
        />
        <text x="90" y="72" textAnchor="middle" fontSize="32" fontWeight="bold" fill="#1a1a1a">{score}</text>
        <text x="90" y="88" textAnchor="middle" fontSize="11" fill="#999">out of 100</text>
      </svg>
      <span className="text-sm font-medium mt-1" style={{ color }}>{label}</span>
    </div>
  );
}

// ── Metric visual bar ─────────────────────────────────────────────────────
function MetricBar({ metric }: { metric: BenchmarkData['metrics'][0] }) {
  const { yourValueRaw, cohortMedianRaw, topQuartileRaw, lowerIsBetter } = metric;
  if (yourValueRaw === null || cohortMedianRaw === null || topQuartileRaw === null) return null;

  const max = lowerIsBetter
    ? Math.max(yourValueRaw, cohortMedianRaw) * 1.3
    : Math.max(yourValueRaw, topQuartileRaw) * 1.2;

  const pct = (v: number) => Math.min(100, Math.round((v / max) * 100));

  const isAhead = lowerIsBetter
    ? yourValueRaw <= cohortMedianRaw
    : yourValueRaw >= cohortMedianRaw;

  const barColor = isAhead ? '#22c55e' : '#ef4444';

  return (
    <div className="mt-3">
      <div className="relative h-3 bg-[#f0f0f0] rounded-full overflow-visible">
        {/* Your bar */}
        <div
          className="absolute top-0 left-0 h-3 rounded-full"
          style={{ width: `${pct(yourValueRaw)}%`, backgroundColor: barColor }}
        />
        {/* Median marker */}
        <div
          className="absolute top-[-4px] w-[2px] h-5 bg-[#999]"
          style={{ left: `${pct(cohortMedianRaw)}%` }}
          title={`Cohort median: ${metric.cohortMedian}`}
        />
        {/* Top Q marker */}
        <div
          className="absolute top-[-4px] w-[2px] h-5 bg-[#1a1a1a]"
          style={{ left: `${pct(topQuartileRaw)}%` }}
          title={`Top quartile: ${metric.topQuartile}`}
        />
      </div>
      <div className="flex justify-between text-xs text-[#999] mt-2">
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-1 rounded" style={{ backgroundColor: barColor }} />
          You: <strong className="text-[#1a1a1a]">{metric.yourValue}</strong>
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-[2px] h-3 bg-[#999]" />
          Median: {metric.cohortMedian}
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-[2px] h-3 bg-[#1a1a1a]" />
          Top Q: {metric.topQuartile}
        </span>
      </div>
    </div>
  );
}

// ── Performance band ──────────────────────────────────────────────────────
function PerformanceBand({ score }: { score: number }) {
  const bands = [
    { label: 'Early Stage', range: '0-30', end: 30 },
    { label: 'Developing', range: '30-50', end: 50 },
    { label: 'Building', range: '50-70', end: 70 },
    { label: 'Strong', range: '70-100', end: 100 },
  ];
  const position = Math.min(98, Math.max(2, score));

  return (
    <div className="mt-4">
      <div className="relative h-3 rounded-full overflow-hidden"
        style={{ background: 'linear-gradient(to right, #ef4444, #f97316, #f59e0b, #22c55e)' }}>
        <div
          className="absolute top-[-5px] w-4 h-4 bg-[#1a1a1a] border-2 border-white rounded-full shadow"
          style={{ left: `calc(${position}% - 8px)` }}
        />
      </div>
      <div className="flex justify-between mt-2">
        {bands.map((b) => (
          <div key={b.label} className="text-center">
            <div className="text-xs text-[#999]">{b.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const defaultBenchmarkData: BenchmarkData = {
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
        'Top quartile brands in your cohort run a dedicated reorder page that captures 3-4x the conversion of a generic home page.',
      additionalInfo: 'Reorder Page is the #1 priority gap across the entire Shelf Index cohort.',
    },
    {
      id: 'missing_post_purchase_upsell',
      title: 'Post-purchase upsell only partially live.',
      revenueAtStake: '₹12.0L',
      description:
        'Top quartile brands capture 14-22% of post-purchase visits with a one-click upsell. You show a static thank-you page.',
      additionalInfo: 'Cohort data shows post-purchase AOV uplift averages 8-12% when implemented well.',
    },
    {
      id: 'missing_whatsapp_optin',
      title: 'No WhatsApp re-engagement live.',
      revenueAtStake: '₹15.0L',
      description:
        'Top quartile brands run Day-21 WhatsApp Reorder URL flows that drive 12-22% of repeat revenue.',
      additionalInfo: 'WhatsApp read rates sit above 80% across all India geographies.',
    },
  ],
  totalRevenueAtStake: '₹36.6L',
  metrics: [
    {
      name: 'Revenue from repeat customers',
      description: 'trailing 90 days',
      yourValue: '28%', yourValueRaw: 28,
      cohortMedian: '40%', cohortMedianRaw: 40,
      topQuartile: '64%', topQuartileRaw: 64,
      unit: '%', status: 'down', lowerIsBetter: false,
    },
    {
      name: 'Time to second order',
      description: 'median days',
      yourValue: '32 days', yourValueRaw: 32,
      cohortMedian: '21 days', cohortMedianRaw: 21,
      topQuartile: '14 days', topQuartileRaw: 14,
      unit: ' days', status: 'down', lowerIsBetter: true,
    },
  ],
  cohortSize: 13,
  window: '90 days',
};

export default function BenchmarkReportPage() {
  const [data, setData] = useState<BenchmarkData>(defaultBenchmarkData);

  useEffect(() => {
    const saved = loadBenchmarkData();
    if (saved) setData(saved);
  }, []);

  const winningMetrics = data.metrics.filter((m) => m.status === 'up');
  const quickWins = data.gaps.filter((g) => (GAP_META[g.id]?.effort === 'Low'));
  const growthPlays = data.gaps.filter((g) => (GAP_META[g.id]?.effort !== 'Low'));

  return (
    <div className="min-h-screen bg-[#f8f6f3] print:bg-white">
      {/* Header */}
      <header className="px-12 py-6 flex items-center justify-between print:hidden">
        <Logo />
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 bg-[#1a1a1a] text-white px-5 py-2.5 rounded-lg hover:bg-[#333] transition-colors text-sm"
        >
          ↓ Download PDF
        </button>
      </header>

      <main className="px-12 py-10 max-w-5xl mx-auto print:px-4 print:py-4">

        {/* Report label */}
        <div className="text-xs text-[#999] uppercase tracking-widest mb-2">
          The Shelf Index · Edition 01 · Anphonic
        </div>
        <h1 className="text-4xl mb-1">{data.brandName}</h1>
        <p className="text-[#999] text-sm mb-10 capitalize">{data.category} · Cohort of {data.cohortSize} D2C brands · {data.window} window</p>

        {/* ── 1. SCORE HERO ── */}
        <div className="bg-white rounded-2xl p-10 mb-6 shadow-sm">
          <div className="grid grid-cols-3 gap-8 items-center">
            {/* Score gauge */}
            <div className="flex flex-col items-center">
              <ScoreGauge score={data.shelfScore} />
              <div className="text-xs text-[#999] mt-2 text-center">Shelf Score</div>
            </div>

            {/* Percentile */}
            <div className="text-center border-x border-[#f0f0f0] px-6">
              <div className="text-xs text-[#999] mb-1 uppercase tracking-wide">Cohort Percentile</div>
              <div className="text-6xl font-light mb-1">{data.percentile}</div>
              <div className="text-sm text-[#666]">
                Among {data.cohortSize} India D2C brands benchmarked
              </div>
            </div>

            {/* Verdict */}
            <div>
              <div className="text-xs text-[#999] mb-2 uppercase tracking-wide">Verdict</div>
              <p className="text-lg font-semibold mb-2 leading-snug">{data.verdictTitle}</p>
              <p className="text-sm text-[#666] leading-relaxed">{data.verdictDescription}</p>
            </div>
          </div>

          {/* Performance band */}
          <div className="mt-8 pt-6 border-t border-[#f0f0f0]">
            <div className="text-xs text-[#999] mb-2 uppercase tracking-wide">Where you sit in the cohort</div>
            <PerformanceBand score={data.shelfScore} />
          </div>
        </div>

        {/* ── 2. METRICS DEEP DIVE ── */}
        <div className="bg-white rounded-2xl p-10 mb-6 shadow-sm">
          <h2 className="text-2xl mb-1">Your Numbers vs The Cohort</h2>
          <p className="text-sm text-[#999] mb-8">Grey line = cohort median · Black line = top quartile · Colour bar = you</p>

          <div className="space-y-8">
            {data.metrics.map((metric, i) => (
              <div key={i} className={`pb-8 ${i < data.metrics.length - 1 ? 'border-b border-[#f5f5f5]' : ''}`}>
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <div className="font-medium">{metric.name}</div>
                    <div className="text-xs text-[#999]">{metric.description}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {metric.status === 'up' ? (
                      <span className="flex items-center gap-1 text-green-600 text-sm font-medium bg-green-50 px-2 py-1 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Above median
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-500 text-sm font-medium bg-red-50 px-2 py-1 rounded-full">
                        <AlertTriangle className="w-3.5 h-3.5" /> Below median
                      </span>
                    )}
                  </div>
                </div>
                <MetricBar metric={metric} />
                {metric.yourValueRaw !== null && metric.cohortMedianRaw !== null && (
                  <div className="mt-2 text-xs text-[#999]">
                    {metric.lowerIsBetter ? (
                      metric.yourValueRaw <= metric.cohortMedianRaw
                        ? `✓ You're ${metric.cohortMedianRaw - metric.yourValueRaw}${metric.unit} faster than the median.`
                        : `Gap to median: ${metric.yourValueRaw - metric.cohortMedianRaw}${metric.unit} slower. Top brands close this in 3-6 months.`
                    ) : (
                      metric.yourValueRaw >= metric.cohortMedianRaw
                        ? `✓ You're ${metric.yourValueRaw - metric.cohortMedianRaw}${metric.unit} above the median.`
                        : `Gap to median: ${metric.cohortMedianRaw - metric.yourValueRaw}${metric.unit}. Top quartile is at ${metric.topQuartile}.`
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── 3. WHAT'S WORKING (if any) ── */}
        {winningMetrics.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-8 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <h2 className="text-xl text-green-700">What's Working</h2>
            </div>
            <div className="space-y-3">
              {winningMetrics.map((m, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-green-800">{m.name}</span>
                    <span className="text-green-600 text-sm ml-2">— {m.description}</span>
                  </div>
                  <div className="text-green-700 font-semibold">{m.yourValue}</div>
                </div>
              ))}
            </div>
            <p className="text-xs text-green-600 mt-4">
              These are strengths to protect as you fix the gaps below.
            </p>
          </div>
        )}

        {/* ── 4. PRIORITY GAPS ── */}
        <div className="bg-white rounded-2xl p-10 mb-6 shadow-sm">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h2 className="text-2xl mb-1">Priority Gaps · Revenue at Stake</h2>
              <p className="text-sm text-[#999]">Ranked by annualised revenue opportunity based on your scale</p>
            </div>
            <div className="text-right">
              <div className="text-xs text-[#999] mb-1">Total annual opportunity</div>
              <div className="text-3xl font-light">{data.totalRevenueAtStake}</div>
            </div>
          </div>

          <div className="space-y-6">
            {data.gaps.map((gap, i) => {
              const meta = GAP_META[gap.id] || { effort: 'Medium', time: '2-4 weeks', action: 'Review with your growth team.', effortColor: 'bg-yellow-100 text-yellow-700' };
              return (
                <div key={i} className="border border-[#f0f0f0] rounded-xl p-6 hover:border-[#d4d4d4] transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-[#1a1a1a] text-white text-xs flex items-center justify-center font-bold flex-shrink-0">
                        {i + 1}
                      </span>
                      <h3 className="text-base font-semibold leading-snug">{gap.title}</h3>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <div className="text-xs text-[#999]">Revenue at stake</div>
                      <div className="text-2xl font-light">{gap.revenueAtStake}</div>
                      <div className="text-xs text-[#999]">per year</div>
                    </div>
                  </div>

                  {/* Effort + time badges */}
                  <div className="flex gap-2 mb-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${meta.effortColor}`}>
                      {meta.effort} effort
                    </span>
                    <span className="text-xs px-2 py-1 rounded-full bg-[#f5f5f5] text-[#666] flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {meta.time}
                    </span>
                  </div>

                  <p className="text-sm text-[#666] mb-2 leading-relaxed">{gap.description}</p>
                  <p className="text-xs text-[#999] mb-4 italic">{gap.additionalInfo}</p>

                  {/* Specific action */}
                  <div className="bg-[#f8f6f3] rounded-lg p-3 flex items-start gap-2">
                    <Zap className="w-4 h-4 text-[#0066ff] flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-semibold text-[#0066ff] mb-0.5">Recommended action</div>
                      <div className="text-xs text-[#666]">{meta.action}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── 5. ACTION ROADMAP ── */}
        {(quickWins.length > 0 || growthPlays.length > 0) && (
          <div className="bg-white rounded-2xl p-10 mb-6 shadow-sm">
            <h2 className="text-2xl mb-6">Your Action Roadmap</h2>
            <div className="grid grid-cols-2 gap-8">
              {quickWins.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    <h3 className="font-semibold text-green-700">Quick Wins — Start This Week</h3>
                  </div>
                  <div className="space-y-3">
                    {quickWins.map((g, i) => (
                      <div key={i} className="flex items-start gap-3 text-sm">
                        <span className="w-5 h-5 rounded-full bg-green-100 text-green-700 text-xs flex items-center justify-center font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                        <div>
                          <div className="font-medium text-[#1a1a1a]">{g.title}</div>
                          <div className="text-[#999] text-xs mt-0.5">{GAP_META[g.id]?.time} · {g.revenueAtStake} opportunity</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {growthPlays.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-2 h-2 rounded-full bg-yellow-500" />
                    <h3 className="font-semibold text-yellow-700">Growth Plays — Next 30 Days</h3>
                  </div>
                  <div className="space-y-3">
                    {growthPlays.map((g, i) => (
                      <div key={i} className="flex items-start gap-3 text-sm">
                        <span className="w-5 h-5 rounded-full bg-yellow-100 text-yellow-700 text-xs flex items-center justify-center font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                        <div>
                          <div className="font-medium text-[#1a1a1a]">{g.title}</div>
                          <div className="text-[#999] text-xs mt-0.5">{GAP_META[g.id]?.time} · {g.revenueAtStake} opportunity</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── 6. METHODOLOGY ── */}
        <div className="bg-white rounded-2xl p-8 mb-6 shadow-sm">
          <h3 className="text-base font-semibold mb-3">About This Benchmark</h3>
          <div className="grid grid-cols-3 gap-6 text-sm">
            <div>
              <div className="text-[#999] text-xs mb-1">COHORT SIZE</div>
              <div className="font-medium">{data.cohortSize} D2C brands</div>
              <div className="text-xs text-[#999] mt-1">India-based, Shopify-native</div>
            </div>
            <div>
              <div className="text-[#999] text-xs mb-1">DATA WINDOW</div>
              <div className="font-medium">{data.window}</div>
              <div className="text-xs text-[#999] mt-1">Rolling cohort period</div>
            </div>
            <div>
              <div className="text-[#999] text-xs mb-1">SOURCE</div>
              <div className="font-medium">The Shelf Index</div>
              <div className="text-xs text-[#999] mt-1">Edition 01 · Anphonic, 2026</div>
            </div>
          </div>
        </div>

        {/* ── 7. DOWNLOAD ── */}
        <div className="bg-[#1a1a1a] rounded-2xl p-8 mb-6 flex items-center justify-between print:hidden">
          <div>
            <h3 className="text-white text-xl mb-1">Download the Shelf Index</h3>
            <p className="text-[#999] text-sm">Save your full benchmark report as a PDF to share with your team.</p>
          </div>
          <button
            onClick={() => window.print()}
            className="flex-shrink-0 bg-white text-[#1a1a1a] px-6 py-3 rounded-lg hover:bg-[#f0f0f0] transition-colors font-medium"
          >
            ↓ Download Report
          </button>
        </div>

        {/* ── 8. CTA ── */}
        <div className="bg-gradient-to-br from-[#0066ff] to-[#0052cc] rounded-2xl p-12 text-center text-white shadow-lg print:hidden">
          <h2 className="text-3xl mb-3">Want to close these gaps faster?</h2>
          <p className="text-base mb-6 opacity-90 max-w-lg mx-auto">
            Anphonic works with D2C brands to implement every gap above — reorder pages, loyalty, WhatsApp flows — in 4-6 weeks.
          </p>
          <a
            href="https://www.anphonic.ai/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-[#0066ff] px-8 py-4 rounded-lg hover:bg-[#f0f0f0] transition-colors text-base font-medium group"
          >
            <span>Talk to Anphonic</span>
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>
        </div>

      </main>
    </div>
  );
}
