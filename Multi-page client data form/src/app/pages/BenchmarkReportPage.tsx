import { useState, useEffect, useRef } from "react";
import Logo from "../components/Logo";
import cohortConfig from "../utils/cohortConfig";

// ── Types ────────────────────────────────────────────────────────────────
interface Gap {
  id: string;
  title: string;
  revenueAtStake: string;
  description: string;
  additionalInfo: string;
}
interface Metric {
  key: string;
  label: string;
  sublabel: string;
  unit: string;
  you: number | null;
  cohort_median: number;
  top_quartile: number;
  verdict: string;
  lowerIsBetter: boolean;
}
interface ReportData {
  brandName: string;
  category: string;
  shelfScore: number;
  percentile: number;
  verdictHeadline: string;
  verdictDescription: string;
  metrics: Metric[];
  gaps: Gap[];
  totalRevenueAtStake: number;
  refCode: string;
}

// ── Gap metadata ──────────────────────────────────────────────────────────
const GAP_META: Record<string, { action: string }> = {
  missing_reorder_page: { action: 'Build a dedicated /reorder page or use Rebuy Smart Cart reorder flow to capture returning customers.' },
  missing_loyalty_program: { action: 'Set up Nector or POPcoins — most brands go live in under 3 weeks with significant repeat rate uplift.' },
  missing_post_purchase_upsell: { action: 'Add a one-click thank-you page offer via Rebuy, Zipify, or AfterSell. Start with your top-selling SKU.' },
  missing_whatsapp_optin: { action: 'Launch a Day-21 WhatsApp Reorder URL flow via Interakt, Wati, or Kwick Engage. Single flow, big impact.' },
};

// ── Bar segments calculation ──────────────────────────────────────────────
function getBarSegments(you: number, median: number, topQ: number, lowerIsBetter: boolean) {
  if (lowerIsBetter) {
    const maxRef = Math.max(you, median) * 1.5;
    const yourPerf  = Math.round(((maxRef - you)  / maxRef) * 100);
    const medPerf   = Math.round(((maxRef - median) / maxRef) * 100);
    const topPerf   = Math.round(((maxRef - topQ)  / maxRef) * 100);
    const isAbove   = you <= median;
    return {
      gold:  Math.min(yourPerf, 92),
      grey:  isAbove ? 0 : Math.max(0, medPerf - yourPerf),
      tealStart: Math.min(medPerf, 90),
      tealWidth: Math.max(0, Math.min(topPerf - medPerf, 90 - medPerf)),
      isAbove,
      isTop: you <= topQ,
    };
  }
  const maxRef  = topQ * 1.3;
  const yourW   = Math.round((you  / maxRef) * 100);
  const medW    = Math.round((median / maxRef) * 100);
  const topW    = Math.round((topQ / maxRef) * 100);
  const isAbove = you >= median;
  const isTop   = you >= topQ;
  return {
    gold:  Math.min(yourW, 92),
    grey:  isAbove ? 0 : Math.max(0, medW - yourW),
    tealStart: Math.min(medW, 90),
    tealWidth: Math.max(0, Math.min(topW - medW, 90 - medW)),
    isAbove,
    isTop,
  };
}

// ── Status label ──────────────────────────────────────────────────────────
function StatusLabel({ isTop, isAbove }: { isTop: boolean; isAbove: boolean }) {
  if (isTop) return <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: '#2CC5B0' }}>Top Quartile</span>;
  if (isAbove) return <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: '#2CC5B0' }}>Above Cohort</span>;
  return <span className="text-xs font-semibold tracking-widest uppercase text-red-400">Below Cohort</span>;
}

// ── Default / fallback data ───────────────────────────────────────────────
const defaultData: ReportData = {
  brandName: 'Your Brand',
  category: 'Overall',
  shelfScore: 47,
  percentile: 34,
  verdictHeadline: 'Your retention engine is in second gear.',
  verdictDescription: "You're acquiring well, but customers aren't coming back at the rate top quartile brands manage. Three specific gaps drive most of the difference. We've quantified each below.",
  metrics: [
    { key: 'repeat_revenue_pct', label: 'Revenue from repeat customers', sublabel: '90 day window', unit: '%', you: 28, cohort_median: 40, top_quartile: 64, verdict: 'below', lowerIsBetter: false },
    { key: 'time_to_2nd_order_days', label: 'Time to second order', sublabel: 'Median days', unit: ' days', you: 23, cohort_median: 21, top_quartile: 14, verdict: 'below', lowerIsBetter: true },
  ],
  gaps: [
    { id: 'missing_post_purchase_upsell', title: 'No post-purchase upsell flow.', revenueAtStake: '₹18.4L', description: 'Top quartile brands capture 14% to 22% of post-purchase visits with a one-click upsell or thank-you-page offer. You show a static thank-you page.', additionalInfo: 'Cohort data shows post-purchase AOV uplift averages 8 to 12% when implemented well.' },
    { id: 'missing_loyalty_program', title: 'No loyalty program live.', revenueAtStake: '₹42.6L', description: 'Top quartile F&B brands run Nector or POPcoins with redemption rates of 11% to 18%. Their repeat rate sits 14 points above cohort median. You have no loyalty system.', additionalInfo: 'Closing this is the single highest-leverage move for brands in your bracket.' },
    { id: 'missing_whatsapp_optin', title: 'WhatsApp opt-in below cohort.', revenueAtStake: '₹11.2L', description: 'Top quartile brands capture 45% to 60% of buyers into WhatsApp via checkout opt-in. You use a tool but lack the checkout-stage opt-in flow.', additionalInfo: 'Cohort data shows WhatsApp drives 22% of repeat revenue at top quartile brands.' },
  ],
  totalRevenueAtStake: 7220000,
  refCode: 'ABM-2026-0001',
};

// ── Map raw API response → ReportData ─────────────────────────────────────
function mapReport(parsed: any, brandInfo: any): ReportData {
  const report = parsed.report ?? parsed;
  const shelfScore = report.shelf_score ?? 0;
  const percentile = typeof report.percentile === 'number' ? report.percentile : parseInt(report.percentile) || 0;

  const metrics: Metric[] = Array.isArray(report.metrics_vs_cohort)
    ? report.metrics_vs_cohort
        .filter((m: any) => !['rebuy_revenue_share_pct', 'personalisation_aov_lift_pct'].includes(m.key))
        .map((m: any) => ({
          key: m.key,
          label: m.label ?? '',
          sublabel: m.sublabel ?? '',
          unit: m.unit ?? '',
          you: m.you !== null && m.you !== undefined ? Number(m.you) : null,
          cohort_median: Number(m.cohort_median ?? 0),
          top_quartile: Number(m.top_quartile ?? 0),
          verdict: m.verdict ?? 'below',
          lowerIsBetter: m.key === 'time_to_2nd_order_days',
        }))
    : defaultData.metrics;

  const gaps: Gap[] = Array.isArray(report.gaps)
    ? report.gaps
        .filter((g: any) => g.id !== 'underutilised_rebuy')
        .map((g: any) => ({
          id: g.id ?? 'unknown',
          title: g.title ?? '',
          revenueAtStake: g.revenue_at_stake_inr
            ? `₹${(g.revenue_at_stake_inr / 100000).toFixed(1)}L`
            : '',
          description: g.comparison ?? g.description ?? '',
          additionalInfo: g.cohort_data ?? '',
        }))
    : defaultData.gaps;

  const now = new Date();
  const refCode = `ABM-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}`;

  return {
    brandName: brandInfo.brandName || report.input?.company_name || 'Your Brand',
    category: report.category_used || brandInfo.category || 'Overall',
    shelfScore,
    percentile,
    verdictHeadline: report.verdict?.headline ?? defaultData.verdictHeadline,
    verdictDescription: report.verdict?.cohort_comparison ?? defaultData.verdictDescription,
    metrics,
    gaps,
    totalRevenueAtStake: report.total_revenue_at_stake_inr ?? 0,
    refCode,
  };
}

// ── Verdict headline with italic colored keyword ───────────────────────────
function VerdictHeadline({ text }: { text: string }) {
  // Italicise the gear phrase e.g. "second gear"
  const match = text.match(/(.*?)([\w]+ gear)(.*)/i);
  if (!match) return <span>{text}</span>;
  return (
    <>
      {match[1]}
      <em style={{ color: '#D4A54A', fontStyle: 'italic' }}>{match[2]}</em>
      {match[3]}
    </>
  );
}

// ── Calendar slots ────────────────────────────────────────────────────────
const CALENDAR_SLOTS = [
  { label: 'Book a session · Option A', url: 'https://calendar.app.google/nwch6oMUqo9gHTnK9' },
  { label: 'Book a session · Option B', url: 'https://calendar.app.google/eBoyKNzeUxUvhmUU8' },
  { label: 'Book a session · Option C', url: 'https://calendar.app.google/2XQVSd57xK9B49Y68' },
];

// ── Calendar Modal ────────────────────────────────────────────────────────
function CalendarModal({ onClose, teal, navy }: { onClose: () => void; teal: string; navy: string }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(11,24,41,0.75)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
        style={{ animation: 'modalPop 0.22s cubic-bezier(0.34,1.56,0.64,1)' }}
      >
        {/* Head */}
        <div className="relative px-8 py-7" style={{ backgroundColor: navy }}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center text-sm transition-opacity hover:opacity-80"
            style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}
          >
            ✕
          </button>
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: teal }}>
            Free · 20 minutes · No commitment
          </p>
          <h3 className="text-xl font-normal text-white leading-snug mb-1">
            Book your diagnostic call
          </h3>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
            We'll walk through your gaps and show how top quartile brands close them.
          </p>
        </div>
        {/* Body */}
        <div className="px-8 py-6 bg-white">
          <p className="text-xs mb-4" style={{ color: '#888' }}>
            Pick any slot — all open Google Calendar booking.
          </p>
          {CALENDAR_SLOTS.map((slot, i) => (
            <a
              key={i}
              href={slot.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-xl px-5 py-4 mb-3 last:mb-0 transition-colors group"
              style={{ background: '#fafaf8', border: '0.5px solid #e2e2e0' }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = teal;
                (e.currentTarget as HTMLAnchorElement).style.background = '#e1f5ee';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = '#e2e2e0';
                (e.currentTarget as HTMLAnchorElement).style.background = '#fafaf8';
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#e1f5ee' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={teal} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-medium" style={{ color: navy }}>{slot.label}</div>
                  <div className="text-xs" style={{ color: '#888' }}>Opens Google Calendar · 20 min</div>
                </div>
              </div>
              <span style={{ color: teal, fontSize: 16 }}>→</span>
            </a>
          ))}
        </div>
      </div>
      <style>{`@keyframes modalPop { from { transform: scale(0.93); opacity: 0; } to { transform: scale(1); opacity: 1; } }`}</style>
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────
export default function BenchmarkReportPage() {
  const [data, setData] = useState<ReportData>(defaultData);
  const [showCalModal, setShowCalModal] = useState(false);
  const generatedRef = useRef(
    new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase()
  );

  useEffect(() => {
    try {
      const raw = localStorage.getItem('lastReport');
      const brandInfoRaw = localStorage.getItem('brandInfo');
      if (!raw) return;
      const parsed = JSON.parse(raw);
      const brandInfo = brandInfoRaw ? JSON.parse(brandInfoRaw) : {};
      setData(mapReport(parsed, brandInfo));
    } catch { /* keep default */ }
  }, []);

  useEffect(() => {
    document.title = `Anphonic.ai Benchmark — ${data.brandName}`;
    return () => { document.title = 'Anphonic.ai Benchmark'; };
  }, [data.brandName]);

  const totalL = data.totalRevenueAtStake > 0
    ? `₹${(data.totalRevenueAtStake / 100000).toFixed(1)}L`
    : data.gaps.reduce((s, g) => s, '');

  const NAVY = '#0B1829';
  const GOLD = '#D4A54A';
  const TEAL = '#2CC5B0';
  const CREAM = '#F5EDE3';

  return (
    <div className="min-h-screen" style={{ backgroundColor: CREAM, fontFamily: 'inherit' }}>

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section style={{ backgroundColor: NAVY }} className="px-4 py-6 md:px-12 md:py-10 print:px-6">
        {/* Nav */}
        <div className="flex items-center justify-between mb-10 md:mb-16 print:hidden">
          <Logo variant="dark" />
          <a
            href="/shelf-index.html"
            download="The_Shelf_Index_Edition01.html"
            className="text-xs tracking-widest border px-4 py-2 rounded transition-opacity hover:opacity-70"
            style={{ color: TEAL, borderColor: TEAL }}
          >
            DOWNLOAD SHELF INDEX
          </a>
        </div>

        {/* Generated label */}
        <p className="text-xs tracking-widest mb-10 opacity-50 text-white uppercase">
          Your Benchmark · Generated {generatedRef.current}
        </p>

        {/* Score + Verdict grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center max-w-5xl mb-8 md:mb-12">
          {/* Score */}
          <div>
            <div className="flex items-end gap-3 mb-4 md:mb-6">
              <span className="font-light text-white" style={{ fontSize: 'clamp(4rem, 18vw, 9rem)', lineHeight: 1, letterSpacing: '-0.04em' }}>
                {data.shelfScore}
              </span>
              <span className="text-2xl md:text-4xl mb-4 md:mb-6 font-light" style={{ color: TEAL }}>/100</span>
            </div>
          </div>

          {/* Verdict */}
          <div>
            <h2 className="text-2xl md:text-3xl text-white font-normal leading-snug mb-4">
              <VerdictHeadline text={data.verdictHeadline} />
            </h2>
            <p className="text-sm leading-relaxed opacity-70 text-white">{data.verdictDescription}</p>
          </div>
        </div>

        {/* Percentile strip */}
        <div className="inline-flex flex-wrap items-center gap-3 px-4 py-2.5 rounded-sm text-sm" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
          <span style={{ color: TEAL }} className="font-medium">{data.percentile}th percentile</span>
          <span className="text-white opacity-40">·</span>
          <span className="text-white opacity-60">
            {data.percentile < 50 ? 'below median' : data.percentile < 75 ? 'above median' : 'top quartile'}
          </span>
          <span className="text-white opacity-40">·</span>
          <span className="text-white opacity-60 capitalize">{data.category} cohort, India</span>
        </div>
      </section>

      {/* ── METRICS ──────────────────────────────────────────────────── */}
      <section style={{ backgroundColor: CREAM }} className="px-4 py-10 md:px-12 md:py-16 print:px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl mb-2" style={{ color: NAVY }}>Metric by metric.</h2>
          <p className="text-sm mb-8 opacity-60" style={{ color: NAVY }}>
            Where you sit on each dimension the Shelf Index measures.
            Anonymized cohort of {cohortConfig.cohort_size} brands, {cohortConfig.dataWindow} rolling window.
          </p>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 md:gap-6 mb-8 md:mb-10 text-xs" style={{ color: NAVY }}>
            <span className="flex items-center gap-2">
              <span className="w-4 h-3 rounded-sm inline-block" style={{ backgroundColor: GOLD }} />
              You
            </span>
            <span className="flex items-center gap-2">
              <span className="w-4 h-3 rounded-sm inline-block bg-gray-400" />
              Cohort median
            </span>
            <span className="flex items-center gap-2">
              <span className="w-4 h-3 rounded-sm inline-block" style={{ backgroundColor: TEAL }} />
              Top quartile
            </span>
          </div>

          {/* Metric rows */}
          <div className="space-y-0 border rounded-xl overflow-hidden" style={{ borderColor: '#DDD5C8' }}>
            {data.metrics.map((m, i) => {
              if (m.you === null) return null;
              const segs = getBarSegments(m.you, m.cohort_median, m.top_quartile, m.lowerIsBetter);
              return (
                <div key={i} className={`flex flex-col md:flex-row md:items-center gap-3 md:gap-8 px-4 md:px-8 py-5 md:py-6 bg-white ${i > 0 ? 'border-t' : ''}`} style={{ borderColor: '#EEE8E0' }}>
                  {/* Label + status (status shown inline on mobile) */}
                  <div className="flex items-start justify-between md:block md:w-56 md:flex-shrink-0">
                    <div>
                      <div className="font-medium text-sm" style={{ color: NAVY }}>{m.label}</div>
                      <div className="text-xs uppercase tracking-wider opacity-50 mt-0.5" style={{ color: NAVY }}>{m.sublabel}</div>
                    </div>
                    <div className="md:hidden ml-2 flex-shrink-0">
                      <StatusLabel isTop={segs.isTop} isAbove={segs.isAbove} />
                    </div>
                  </div>

                  {/* Bar */}
                  <div className="flex-1">
                    <div className="relative h-8 rounded-sm overflow-hidden" style={{ backgroundColor: '#EDE6DC' }}>
                      {/* Gold: your value */}
                      <div className="absolute inset-y-0 left-0 rounded-sm"
                        style={{ width: `${segs.gold}%`, backgroundColor: GOLD }} />
                      {/* Grey: gap to median (only when below) */}
                      {segs.grey > 0 && (
                        <div className="absolute inset-y-0"
                          style={{ left: `${segs.gold}%`, width: `${segs.grey}%`, backgroundColor: '#B0A898' }} />
                      )}
                      {/* Teal: top quartile band */}
                      {segs.tealWidth > 0 && (
                        <div className="absolute inset-y-0"
                          style={{ left: `${segs.tealStart + segs.grey}%`, width: `${segs.tealWidth}%`, backgroundColor: TEAL, opacity: 0.7 }} />
                      )}
                    </div>

                    {/* Value labels below bar */}
                    <div className="flex justify-between mt-2 text-xs opacity-50" style={{ color: NAVY }}>
                      <span>You: {m.you}{m.unit}</span>
                      <span>Median: {m.cohort_median}{m.unit}</span>
                      <span>Top Q: {m.top_quartile}{m.unit}</span>
                    </div>
                  </div>

                  {/* Status — desktop only */}
                  <div className="hidden md:block w-28 text-right flex-shrink-0">
                    <StatusLabel isTop={segs.isTop} isAbove={segs.isAbove} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── GAPS ─────────────────────────────────────────────────────── */}
      {data.gaps.length > 0 && (
        <section style={{ backgroundColor: NAVY }} className="px-4 py-10 md:px-12 md:py-16 print:px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl text-white font-normal mb-3">
              {data.gaps.length === 1 ? 'One gap.' : `${['One','Two','Three'][data.gaps.length - 1] ?? data.gaps.length} gaps.`} Quantified.
            </h2>
            <p className="text-sm opacity-50 text-white mb-12">
              Top quartile brands aren't smarter, they've built specific systems.
              Here's what closing each gap is worth, modelled on your current order volume.
            </p>

            <div className="space-y-6">
              {data.gaps.map((gap, i) => {
                const meta = GAP_META[gap.id];
                return (
                  <div key={i} className="flex flex-col md:flex-row gap-6 md:gap-8 border-l-2 pl-4 md:pl-8 py-6" style={{ borderColor: GOLD }}>
                    {/* Number + content */}
                    <div className="flex-1">
                      <div className="text-5xl font-light italic mb-4" style={{ color: GOLD, fontFamily: 'Georgia, serif' }}>
                        0{i + 1}
                      </div>
                      <h3 className="text-xl text-white font-medium mb-3">{gap.title}</h3>
                      <p className="text-sm leading-relaxed mb-2" style={{ color: 'rgba(255,255,255,0.65)' }}>
                        {gap.description}
                      </p>
                      <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
                        {gap.additionalInfo}
                      </p>
                      {meta && (
                        <p className="text-xs mt-4 font-medium" style={{ color: TEAL }}>
                          → {meta.action}
                        </p>
                      )}
                    </div>

                    {/* Revenue box */}
                    <div className="md:flex-shrink-0 md:w-44 rounded-xl p-5 md:p-6 text-right" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
                      <div className="text-xs tracking-widest uppercase mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        Annual Revenue<br />at Stake
                      </div>
                      <div className="text-3xl font-light" style={{ color: TEAL }}>{gap.revenueAtStake}</div>
                      <div className="text-xs mt-1 uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>Year One</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      <section style={{ backgroundColor: CREAM }} className="px-4 py-12 md:px-12 md:py-20 text-center print:hidden">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-normal leading-tight mb-4" style={{ color: NAVY }}>
            Want us to walk you through<br />
            your <em style={{ color: TEAL, fontStyle: 'italic' }}>full diagnostic?</em>
          </h2>
          <p className="text-base opacity-60 mb-10" style={{ color: NAVY }}>
            A 20-minute call with our team. We'll show you exactly how top quartile brands
            close each gap, and whether Anphonic's managed model fits where you are.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <button
              onClick={() => setShowCalModal(true)}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-lg text-white font-medium hover:opacity-90 transition-opacity cursor-pointer"
              style={{ backgroundColor: NAVY, border: 'none' }}
            >
              Book a 20-minute diagnostic →
            </button>
            <a
              href="/shelf-index.html"
              download="The_Shelf_Index_Edition01.html"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-lg font-medium border hover:opacity-70 transition-opacity"
              style={{ color: NAVY, borderColor: NAVY }}
            >
              Download The Shelf Index
            </a>
          </div>

          <p className="text-xs tracking-widest opacity-40 uppercase" style={{ color: NAVY }}>
            Your benchmark has been saved · Reference {data.refCode}
          </p>
        </div>
      </section>

      {/* ── CALENDAR MODAL ───────────────────────────────────────────── */}
      {showCalModal && (
        <CalendarModal
          onClose={() => setShowCalModal(false)}
          teal={TEAL}
          navy={NAVY}
        />
      )}

    </div>
  );
}
