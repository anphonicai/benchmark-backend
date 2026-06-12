import { useState, useEffect, useRef } from "react";

import Logo from "../components/Logo";
import cohortConfig from "../utils/cohortConfig";
import { resizeLenis } from "../utils/lenisInstance";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, ExternalLink, Calendar } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

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

const GAP_META: Record<string, { action: string }> = {
  missing_reorder_page: { action: "Build a dedicated /reorder page or use Rebuy Smart Cart reorder flow to capture returning customers." },
  missing_loyalty_program: { action: "Set up Nector or POPcoins — most brands go live in under 3 weeks with significant repeat rate uplift." },
  missing_post_purchase_upsell: { action: "Add a one-click thank-you page offer via Rebuy, Zipify, or AfterSell. Start with your top-selling SKU." },
  missing_whatsapp_optin: { action: "Launch a Day-21 WhatsApp Reorder URL flow via Interakt, Wati, or Kwick Engage. Single flow, big impact." },
};

function getBarSegments(you: number, median: number, topQ: number, lowerIsBetter: boolean) {
  if (lowerIsBetter) {
    const maxRef = Math.max(you, median) * 1.5;
    const yourPerf = Math.round(((maxRef - you) / maxRef) * 100);
    const medPerf = Math.round(((maxRef - median) / maxRef) * 100);
    const topPerf = Math.round(((maxRef - topQ) / maxRef) * 100);
    const isAbove = you <= median;
    return {
      gold: Math.min(yourPerf, 92),
      grey: isAbove ? 0 : Math.max(0, medPerf - yourPerf),
      tealStart: Math.min(medPerf, 90),
      tealWidth: Math.max(0, Math.min(topPerf - medPerf, 90 - medPerf)),
      isAbove,
      isTop: you <= topQ,
    };
  }
  const maxRef = topQ * 1.3;
  const yourW = Math.round((you / maxRef) * 100);
  const medW = Math.round((median / maxRef) * 100);
  const topW = Math.round((topQ / maxRef) * 100);
  const isAbove = you >= median;
  const isTop = you >= topQ;
  return {
    gold: Math.min(yourW, 92),
    grey: isAbove ? 0 : Math.max(0, medW - yourW),
    tealStart: Math.min(medW, 90),
    tealWidth: Math.max(0, Math.min(topW - medW, 90 - medW)),
    isAbove,
    isTop,
  };
}

function StatusPill({ isTop, isAbove }: { isTop: boolean; isAbove: boolean }) {
  if (isTop) return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold tracking-widest uppercase bg-[#e5faf9] text-[#14b8a6] border border-[#b6ece7]">
      <span className="w-1.5 h-1.5 rounded-full bg-[#14b8a6]" />
      Top Quartile
    </span>
  );
  if (isAbove) return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold tracking-widest uppercase bg-[#e5faf9] text-[#14b8a6] border border-[#b6ece7]">
      <span className="w-1.5 h-1.5 rounded-full bg-[#14b8a6]" />
      Above Cohort
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold tracking-widest uppercase bg-red-50 text-red-400 border border-red-200">
      <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
      Below Cohort
    </span>
  );
}

const defaultData: ReportData = {
  brandName: "Your Brand",
  category: "Overall",
  shelfScore: 47,
  percentile: 34,
  verdictHeadline: "Your retention engine is in second gear.",
  verdictDescription: "You're acquiring well, but customers aren't coming back at the rate top quartile brands manage. Three specific gaps drive most of the difference. We've quantified each below.",
  metrics: [
    { key: "repeat_revenue_pct", label: "Revenue from repeat customers", sublabel: "90 day window", unit: "%", you: 28, cohort_median: 40, top_quartile: 64, verdict: "below", lowerIsBetter: false },
    { key: "time_to_2nd_order_days", label: "Time to second order", sublabel: "Median days", unit: " days", you: 23, cohort_median: 21, top_quartile: 14, verdict: "below", lowerIsBetter: true },
  ],
  gaps: [
    { id: "missing_post_purchase_upsell", title: "No post-purchase upsell flow.", revenueAtStake: "₹18.4L", description: "Top quartile brands capture 14% to 22% of post-purchase visits with a one-click upsell or thank-you-page offer. You show a static thank-you page.", additionalInfo: "Cohort data shows post-purchase AOV uplift averages 8 to 12% when implemented well." },
    { id: "missing_loyalty_program", title: "No loyalty program live.", revenueAtStake: "₹42.6L", description: "Top quartile F&B brands run Nector or POPcoins with redemption rates of 11% to 18%. Their repeat rate sits 14 points above cohort median. You have no loyalty system.", additionalInfo: "Closing this is the single highest-leverage move for brands in your bracket." },
    { id: "missing_whatsapp_optin", title: "WhatsApp opt-in below cohort.", revenueAtStake: "₹11.2L", description: "Top quartile brands capture 45% to 60% of buyers into WhatsApp via checkout opt-in. You use a tool but lack the checkout-stage opt-in flow.", additionalInfo: "Cohort data shows WhatsApp drives 22% of repeat revenue at top quartile brands." },
  ],
  totalRevenueAtStake: 7220000,
  refCode: "ABM-2026-0001",
};

function mapReport(parsed: any, brandInfo: any): ReportData {
  const report = parsed.report ?? parsed;
  const shelfScore = report.shelf_score ?? 0;
  const percentile = typeof report.percentile === "number" ? report.percentile : parseInt(report.percentile) || 0;
  const metrics: Metric[] = Array.isArray(report.metrics_vs_cohort)
    ? report.metrics_vs_cohort
        .filter((m: any) => !["rebuy_revenue_share_pct", "personalisation_aov_lift_pct"].includes(m.key))
        .map((m: any) => ({
          key: m.key, label: m.label ?? "", sublabel: m.sublabel ?? "", unit: m.unit ?? "",
          you: m.you !== null && m.you !== undefined ? Number(m.you) : null,
          cohort_median: Number(m.cohort_median ?? 0), top_quartile: Number(m.top_quartile ?? 0),
          verdict: m.verdict ?? "below", lowerIsBetter: m.key === "time_to_2nd_order_days",
        }))
    : defaultData.metrics;
  const rawGaps = Array.isArray(report.gaps)
    ? report.gaps.filter((g: any) => g.id !== "underutilised_rebuy")
    : null;
  const gaps: Gap[] = rawGaps
    ? rawGaps.map((g: any) => ({
        id: g.id ?? "unknown", title: g.title ?? "",
        revenueAtStake: g.revenue_at_stake_inr ? `₹${(g.revenue_at_stake_inr / 100000).toFixed(1)}L` : "",
        description: g.comparison ?? g.description ?? "", additionalInfo: g.cohort_data ?? "",
      }))
    : defaultData.gaps;
  const gapSum = rawGaps
    ? rawGaps.reduce((sum: number, g: any) => sum + (Number(g.revenue_at_stake_inr) || 0), 0)
    : 0;
  const totalRevenueAtStake = report.total_revenue_at_stake_inr || gapSum;
  const now = new Date();
  const refCode = `ABM-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  return {
    brandName: brandInfo.brandName || report.input?.company_name || "Your Brand",
    category: report.category_used || brandInfo.category || "Overall",
    shelfScore, percentile,
    verdictHeadline: report.verdict?.headline ?? defaultData.verdictHeadline,
    verdictDescription: report.verdict?.cohort_comparison ?? defaultData.verdictDescription,
    metrics, gaps,
    totalRevenueAtStake,
    refCode,
  };
}

function VerdictHeadline({ text }: { text: string }) {
  const match = text.match(/(.*?)([\w]+ gear)(.*)/i);
  if (!match) return <span>{text}</span>;
  return (
    <>
      {match[1]}
      <em style={{ color: "#D4A54A", fontStyle: "italic" }}>{match[2]}</em>
      {match[3]}
    </>
  );
}

const CALENDAR_URL = "https://calendar.app.google/2XQVSd57xK9B49Y68";

function CalendarModal({ onClose }: { onClose: () => void }) {
  const TEAL = "#14b8a6";
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(11,24,41,0.7)", backdropFilter: "blur(6px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-[#E8E3DA]"
        style={{ animation: "modalPop 0.22s cubic-bezier(0.34,1.56,0.64,1)" }}
      >
        <div className="relative px-8 py-8 bg-[#0a1f3d]">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-sm hover:opacity-80 transition-opacity"
            style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)" }}
          >
            ✕
          </button>
          <div className="mb-1">
            <Logo variant="dark" size="sm" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-widest mt-4 mb-2" style={{ color: TEAL }}>
            Free · 20 minutes · No commitment
          </p>
          <h3 className="text-xl text-white leading-snug mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
            Book your diagnostic call
          </h3>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
            We'll walk through your gaps and show how top quartile brands close them.
          </p>
        </div>
        <div className="px-8 py-6 bg-white">
          <a
            href={CALENDAR_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-xl px-5 py-4 border border-[#E8E3DA] bg-[#fafaf8] hover:border-[#14b8a6] hover:bg-[#e5faf9] transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center bg-[#e5faf9]">
                <Calendar className="w-4 h-4 text-[#14b8a6]" />
              </div>
              <div>
                <div className="text-sm font-medium text-[#0a1f3d]">Book a session</div>
                <div className="text-xs text-[#999]">Opens Google Calendar · 20 min</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#14b8a6] group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>
      </div>
      <style>{`@keyframes modalPop { from { transform: scale(0.93); opacity: 0; } to { transform: scale(1); opacity: 1; } }`}</style>
    </div>
  );
}

export default function BenchmarkReportPage() {
  const [data, setData] = useState<ReportData>(defaultData);
  const [showCalModal, setShowCalModal] = useState(false);

  const generatedRef = useRef(
    new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }).toUpperCase()
  );

  const heroRef = useRef<HTMLElement>(null);
  const scoreRef = useRef<HTMLDivElement>(null);
  const verdictRef = useRef<HTMLDivElement>(null);
  const percentileRef = useRef<HTMLDivElement>(null);
  const metricsHeaderRef = useRef<HTMLDivElement>(null);
  const metricsRowsRef = useRef<HTMLDivElement>(null);
  const gapsHeaderRef = useRef<HTMLDivElement>(null);
  const gapCardsRef = useRef<HTMLDivElement>(null);
  const ctaSectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("lastReport");
      const brandInfoRaw = localStorage.getItem("brandInfo");
      if (!raw) return;
      const parsed = JSON.parse(raw);
      const brandInfo = brandInfoRaw ? JSON.parse(brandInfoRaw) : {};
      setData(mapReport(parsed, brandInfo));
      setTimeout(resizeLenis, 100);
    } catch { /* keep default */ }
  }, []);

  useEffect(() => {
    document.title = `Anphonic.ai Benchmark — ${data.brandName}`;
    return () => { document.title = "Anphonic.ai Benchmark"; };
  }, [data.brandName]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (scoreRef.current) {
        gsap.fromTo(scoreRef.current,
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.9, ease: "power3.out", delay: 0.2 }
        );
        const scoreEl = scoreRef.current.querySelector(".score-number");
        if (scoreEl) {
          const target = parseInt(scoreEl.getAttribute("data-target") || "0");
          const obj = { val: 0 };
          gsap.to(obj, {
            val: target, duration: 1.4, ease: "power2.out", delay: 0.5,
            onUpdate: () => { scoreEl.textContent = Math.round(obj.val).toString(); },
          });
        }
      }
      if (verdictRef.current) {
        gsap.fromTo(verdictRef.current,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", delay: 0.4 }
        );
      }
      if (percentileRef.current) {
        gsap.fromTo(percentileRef.current,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7, ease: "power2.out", delay: 0.65 }
        );
      }
      if (metricsHeaderRef.current) {
        gsap.fromTo(metricsHeaderRef.current,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7, ease: "power2.out",
            scrollTrigger: { trigger: metricsHeaderRef.current, start: "top 80%" } }
        );
      }
      if (metricsRowsRef.current) {
        const rows = metricsRowsRef.current.querySelectorAll(".metric-row");
        gsap.fromTo(rows,
          { x: -30, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.6, stagger: 0.12, ease: "power2.out",
            scrollTrigger: { trigger: metricsRowsRef.current, start: "top 78%" } }
        );
        const bars = metricsRowsRef.current.querySelectorAll(".bar-fill");
        bars.forEach((bar) => {
          const targetW = (bar as HTMLElement).getAttribute("data-width") || "0";
          gsap.fromTo(bar,
            { width: "0%" },
            { width: targetW + "%", duration: 1.1, ease: "power2.out",
              scrollTrigger: { trigger: bar, start: "top 85%", once: true } }
          );
        });
      }
      if (gapsHeaderRef.current) {
        gsap.fromTo(gapsHeaderRef.current,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7, ease: "power2.out",
            scrollTrigger: { trigger: gapsHeaderRef.current, start: "top 80%" } }
        );
      }
      if (gapCardsRef.current) {
        const cards = gapCardsRef.current.querySelectorAll(".gap-card");
        gsap.fromTo(cards,
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7, stagger: 0.15, ease: "power3.out",
            scrollTrigger: { trigger: gapCardsRef.current, start: "top 78%" } }
        );
      }
      if (ctaSectionRef.current) {
        gsap.fromTo(ctaSectionRef.current,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: "power2.out",
            scrollTrigger: { trigger: ctaSectionRef.current, start: "top 80%" } }
        );
      }
    });
    return () => ctx.revert();
  }, [data]);

  return (
    <div className="min-h-screen bg-[#F5F3EF]" style={{ fontFamily: "inherit" }}>

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section ref={heroRef} className="bg-[#0a1f3d] px-6 py-8 md:px-16 md:py-12">
        {/* Nav */}
        <div className="flex items-center justify-between mb-12 md:mb-20">
          <div className="relative">
            <div className="absolute inset-0 -inset-3 rounded-xl bg-[#14b8a6] blur-xl opacity-10 pointer-events-none" />
            <Logo variant="dark" size="md" />
          </div>
          <a
            href="/shelf-index.html"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs tracking-widest border px-4 py-2 rounded-lg transition-opacity hover:opacity-70"
            style={{ color: "#14b8a6", borderColor: "rgba(20,184,166,0.4)" }}
          >
            <ExternalLink className="w-3 h-3" />
            VIEW SHELF INDEX
          </a>
        </div>

        {/* Generated label */}
        <p className="text-xs tracking-widest mb-10 text-white/40 uppercase">
          {data.brandName} · Benchmark Generated {generatedRef.current}
        </p>

        {/* Score + Verdict grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20 items-center max-w-5xl mb-10 md:mb-14">
          {/* Score */}
          <div ref={scoreRef}>
            <div className="text-[10px] tracking-[0.25em] uppercase text-white/40 mb-4 font-medium">
              Shelf Score
            </div>
            <div className="flex items-end gap-3 mb-5">
              <span
                className="score-number font-light text-white"
                data-target={data.shelfScore}
                style={{ fontSize: "clamp(5rem, 18vw, 9.5rem)", lineHeight: 1, letterSpacing: "-0.04em", fontFamily: "'Playfair Display', serif" }}
              >
                0
              </span>
              <span className="text-3xl md:text-5xl mb-4 font-light" style={{ color: "#14b8a6" }}>/100</span>
            </div>
            {/* Mini score bar */}
            <div className="relative h-1.5 bg-white/10 rounded-full overflow-hidden max-w-xs">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#14b8a6] to-[#10b981]"
                style={{ width: `${data.shelfScore}%` }}
              />
              <div className="absolute inset-y-0 w-0.5 bg-white/30" style={{ left: "50%" }} />
            </div>
            <div className="flex justify-between mt-2 text-[10px] text-white/30 max-w-xs">
              <span>0</span>
              <span>Median 50</span>
              <span>100</span>
            </div>
          </div>

          {/* Verdict */}
          <div ref={verdictRef}>
            <h2
              className="text-2xl md:text-3xl text-white font-normal leading-snug mb-4"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              <VerdictHeadline text={data.verdictHeadline} />
            </h2>
            <p className="text-sm leading-relaxed text-white/55">{data.verdictDescription}</p>
          </div>
        </div>

        {/* Percentile strip */}
        <div ref={percentileRef}>
          <div className="inline-flex flex-wrap items-center gap-3 px-5 py-3 rounded-xl text-sm border border-white/10 bg-white/5 backdrop-blur-sm">
            <span className="font-semibold" style={{ color: "#14b8a6" }}>{data.percentile}th percentile</span>
            <span className="text-white/20">·</span>
            <span className="text-white/50">
              {data.percentile < 50 ? "below median" : data.percentile < 75 ? "above median" : "top quartile"}
            </span>
            <span className="text-white/20">·</span>
            <span className="text-white/50 capitalize">{data.category} cohort, India</span>
            <span className="text-white/20">·</span>
            <span className="text-white/50">{cohortConfig.cohort_size} brands benchmarked</span>
          </div>
        </div>
      </section>

      {/* ── METRICS ──────────────────────────────────────────────────── */}
      <section className="px-6 py-14 md:px-16 md:py-20">
        <div className="max-w-5xl mx-auto">
          <div ref={metricsHeaderRef} className="mb-10">
            <div className="text-[10px] text-[#C4BFB8] tracking-[0.22em] uppercase font-medium mb-3">
              Metric by metric
            </div>
            <h2
              className="text-3xl md:text-4xl text-[#0a1f3d] mb-2"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Where you sit.
            </h2>
            <p className="text-sm text-[#9CA3AF] max-w-lg">
              Anonymized cohort of {cohortConfig.cohort_size} brands, {cohortConfig.dataWindow} rolling window.
            </p>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-5 mb-8 text-xs text-[#6B7280]">
            <span className="flex items-center gap-2">
              <span className="w-4 h-2.5 rounded-sm inline-block bg-[#D4A54A]" />
              You
            </span>
            <span className="flex items-center gap-2">
              <span className="w-4 h-2.5 rounded-sm inline-block bg-[#B0A898]" />
              Cohort median
            </span>
            <span className="flex items-center gap-2">
              <span className="w-4 h-2.5 rounded-sm inline-block bg-[#14b8a6]" />
              Top quartile
            </span>
          </div>

          <div ref={metricsRowsRef} className="rounded-2xl overflow-hidden border border-[#E8E3DA] shadow-sm">
            {data.metrics.map((m, i) => {
              if (m.you === null) return null;
              const segs = getBarSegments(m.you, m.cohort_median, m.top_quartile, m.lowerIsBetter);
              return (
                <div
                  key={i}
                  className={`metric-row flex flex-col md:flex-row md:items-center gap-4 md:gap-8 px-6 md:px-8 py-6 bg-white ${i > 0 ? "border-t border-[#F0EDE8]" : ""}`}
                >
                  <div className="flex items-start justify-between md:block md:w-60 md:flex-shrink-0">
                    <div>
                      <div className="font-medium text-sm text-[#0a1f3d]">{m.label}</div>
                      <div className="text-[10px] uppercase tracking-wider text-[#9CA3AF] mt-0.5">{m.sublabel}</div>
                    </div>
                    <div className="md:hidden ml-2 flex-shrink-0 mt-0.5">
                      <StatusPill isTop={segs.isTop} isAbove={segs.isAbove} />
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="relative h-9 rounded-lg overflow-hidden bg-[#F3F0EB]">
                      <div
                        className="bar-fill absolute inset-y-0 left-0 rounded-lg"
                        data-width={segs.gold}
                        style={{ width: "0%", backgroundColor: "#D4A54A" }}
                      />
                      {segs.grey > 0 && (
                        <div
                          className="bar-fill absolute inset-y-0 rounded-lg"
                          data-width={segs.grey}
                          style={{ left: `${segs.gold}%`, width: "0%", backgroundColor: "#B0A898" }}
                        />
                      )}
                      {segs.tealWidth > 0 && (
                        <div
                          className="bar-fill absolute inset-y-0 rounded-lg"
                          data-width={segs.tealWidth}
                          style={{ left: `${segs.tealStart + segs.grey}%`, width: "0%", backgroundColor: "#14b8a6", opacity: 0.7 }}
                        />
                      )}
                      <div className="absolute inset-y-0 left-3 flex items-center">
                        <span className="text-xs font-semibold text-white/80 drop-shadow">
                          {m.you}{m.unit}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between mt-2 text-[10px] text-[#B0A898]">
                      <span>Median: {m.cohort_median}{m.unit}</span>
                      <span>Top Q: {m.top_quartile}{m.unit}</span>
                    </div>
                  </div>

                  <div className="hidden md:flex md:w-36 justify-end flex-shrink-0">
                    <StatusPill isTop={segs.isTop} isAbove={segs.isAbove} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── GAPS ─────────────────────────────────────────────────────── */}
      {data.gaps.length > 0 && (
        <section className="px-6 py-14 md:px-16 md:py-20 bg-[#0a1f3d]">
          <div className="max-w-5xl mx-auto">
            <div ref={gapsHeaderRef} className="mb-14">
              <div className="text-[10px] text-[#14b8a6]/60 tracking-[0.22em] uppercase font-medium mb-3">
                Revenue Gaps
              </div>
              <h2
                className="text-3xl md:text-4xl text-white font-normal mb-3"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {data.gaps.length === 1
                  ? "One gap."
                  : `${["One", "Two", "Three"][data.gaps.length - 1] ?? data.gaps.length} gaps.`}{" "}
                <em style={{ color: "#D4A54A", fontStyle: "italic" }}>Quantified.</em>
              </h2>
              <p className="text-sm text-white/45 max-w-lg">
                Top quartile brands aren't smarter — they've built specific systems.
                Here's what closing each gap is worth, modelled on your current order volume.
              </p>
            </div>

            <div ref={gapCardsRef} className="space-y-5">
              {data.gaps.map((gap, i) => {
                const meta = GAP_META[gap.id];
                return (
                  <div
                    key={i}
                    className="gap-card rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm"
                  >
                    <div className="flex flex-col md:flex-row gap-0">
                      <div className="flex-1 px-7 py-7 md:py-8">
                        <div className="flex items-start gap-5">
                          <div
                            className="flex-shrink-0 text-4xl font-light italic leading-none mt-0.5"
                            style={{ color: "#D4A54A", fontFamily: "Georgia, serif", minWidth: "2.5rem" }}
                          >
                            0{i + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base md:text-lg text-white font-medium mb-3 leading-snug">
                              {gap.title}
                            </h3>
                            <p className="text-sm leading-relaxed mb-2 text-white/60">
                              {gap.description}
                            </p>
                            <p className="text-sm leading-relaxed text-white/35">
                              {gap.additionalInfo}
                            </p>
                            {meta && (
                              <div className="mt-4 flex items-start gap-2">
                                <span className="text-[#14b8a6] mt-0.5 flex-shrink-0">→</span>
                                <p className="text-xs text-[#14b8a6] leading-relaxed">{meta.action}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {gap.revenueAtStake && (
                        <div className="md:flex-shrink-0 md:w-48 flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-2 px-7 py-5 md:py-8 border-t md:border-t-0 md:border-l border-white/10">
                          <div className="text-[10px] tracking-widest uppercase text-white/30 md:text-right leading-snug">
                            Annual Revenue<br className="hidden md:block" /> at Stake
                          </div>
                          <div>
                            <div
                              className="text-3xl md:text-4xl font-light leading-none"
                              style={{ color: "#14b8a6", fontFamily: "'Playfair Display', serif" }}
                            >
                              {gap.revenueAtStake}
                            </div>
                            <div className="text-[10px] uppercase tracking-widest text-white/25 mt-1 md:text-right">
                              Year One
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {data.totalRevenueAtStake > 0 && (
              <div className="mt-8 rounded-2xl border border-[#D4A54A]/30 bg-[#D4A54A]/5 px-7 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <div className="text-[10px] tracking-widest uppercase text-[#D4A54A]/60 mb-1">
                    Total Revenue at Stake
                  </div>
                  <div className="text-sm text-white/50">Across all identified gaps, modelled on your volume</div>
                </div>
                <div className="text-4xl font-light" style={{ color: "#D4A54A", fontFamily: "'Playfair Display', serif" }}>
                  ₹{(data.totalRevenueAtStake / 100000).toFixed(1)}L
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      <section ref={ctaSectionRef} className="px-6 py-16 md:px-16 md:py-24 bg-[#F5F3EF]">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 -inset-4 rounded-2xl bg-[#14b8a6] blur-2xl opacity-10 pointer-events-none" />
              <Logo size="lg" />
            </div>
          </div>

          <h2
            className="text-3xl md:text-5xl font-normal leading-tight mb-5 text-[#0a1f3d]"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Want us to walk you through
            <br />
            your{" "}
            <em style={{ color: "#14b8a6", fontStyle: "italic" }}>full diagnostic?</em>
          </h2>
          <p className="text-base text-[#6B7280] mb-12 max-w-xl mx-auto leading-relaxed">
            A 20-minute call with our team. We'll show you exactly how top quartile brands
            close each gap — and whether Anphonic's managed model fits where you are.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <button
              onClick={() => setShowCalModal(true)}
              className="group inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-[#0a1f3d] text-white font-medium hover:bg-[#162d57] transition-all shadow-lg shadow-black/10 hover:shadow-xl hover:shadow-black/15 text-sm"
            >
              Book a 20-minute diagnostic
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <a
              href="/shelf-index.html"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border border-[#DDD8CF] text-[#555] hover:border-[#14b8a6] hover:text-[#14b8a6] transition-all font-medium text-sm bg-white/50 hover:bg-white"
            >
              <ExternalLink className="w-4 h-4" />
              View Shelf Index
            </a>
          </div>

          <p className="text-[11px] tracking-widest uppercase text-[#C0BAB0]">
            Your benchmark has been saved · Reference {data.refCode}
          </p>
        </div>
      </section>

      {showCalModal && <CalendarModal onClose={() => setShowCalModal(false)} />}
    </div>
  );
}
