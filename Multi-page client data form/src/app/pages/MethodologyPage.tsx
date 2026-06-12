import { useEffect, useRef } from "react";
import { Link } from "react-router";
import Logo from "../components/Logo";
import cohortConfig from "../utils/cohortConfig";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { resizeLenis } from "../utils/lenisInstance";

gsap.registerPlugin(ScrollTrigger);

export default function MethodologyPage() {
  const headerRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const sectionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(headerRef.current,
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" }
      );
      gsap.fromTo(heroRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: "power2.out", delay: 0.2 }
      );

      if (statsRef.current) {
        const cards = statsRef.current.querySelectorAll(".stat-card");
        gsap.fromTo(cards,
          { y: 32, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power2.out",
            scrollTrigger: { trigger: statsRef.current, start: "top 82%" }
          }
        );
      }

      if (sectionsRef.current) {
        const items = sectionsRef.current.querySelectorAll(".section-item");
        gsap.fromTo(items,
          { y: 24, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 0.6, stagger: 0.12, ease: "power2.out",
            scrollTrigger: { trigger: sectionsRef.current, start: "top 82%" }
          }
        );
      }
    });

    setTimeout(resizeLenis, 100);
    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F3EF]">
      <header
        ref={headerRef}
        className="flex justify-between items-center px-6 py-5 md:px-16 md:py-6 border-b border-[#E8E3DA] bg-[#F5F3EF]/80 backdrop-blur-sm"
      >
        <Logo />
        <Link
          to="/"
          className="text-xs text-[#9CA3AF] hover:text-[#14b8a6] transition-colors font-medium tracking-wider"
        >
          ← Back to home
        </Link>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16 md:py-24">

        {/* Hero */}
        <div ref={heroRef} className="mb-16">
          <div className="inline-flex items-center gap-2 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#14b8a6]" />
            <span className="text-xs text-[#14b8a6] font-semibold tracking-[0.16em] uppercase">
              Methodology
            </span>
          </div>
          <h1
            className="text-3xl md:text-5xl text-[#0a1f3d] mb-6 leading-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            How your benchmark is calculated
          </h1>
          <p className="text-lg leading-relaxed text-[#6B7280] max-w-2xl">
            Your Shelf Score compares your retention performance against a cohort
            of {cohortConfig.cohort_size} leading Indian D2C brands. Here's exactly how that cohort was
            built, what data we use, and how we protect every brand's identity.
          </p>
        </div>

        {/* Stats Grid */}
        <div ref={statsRef} className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-16">
          {[
            {
              label: "Cohort size",
              value: `${cohortConfig.cohort_size} brands`,
              body: "All India-based D2C brands operating on Shopify, with active retention infrastructure (Rebuy Engine installed for at least 3 months).",
            },
            {
              label: "Data window",
              value: cohortConfig.data_window_full,
              body: "Four months of order and customer data, captured from each brand's Shopify backend. Updated quarterly as new cohorts are admitted.",
            },
            {
              label: "Tracked transactions",
              value: cohortConfig.tracked_value,
              body: "Total gross transaction value across the cohort during the data window. Represents a meaningful slice of India's D2C retention economy.",
            },
            {
              label: "Categories represented",
              value: cohortConfig.categories,
              body: "We benchmark you against your category peers where the sample is statistically meaningful, and against the full cohort otherwise.",
              small: true,
            },
          ].map((item, i) => (
            <div key={i} className="stat-card bg-white border border-[#E8E3DA] rounded-2xl p-6 shadow-sm">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9CA3AF] mb-2">
                {item.label}
              </p>
              <p className={`font-semibold text-[#14b8a6] mb-3 leading-snug ${item.small ? "text-base" : "text-2xl"}`}>
                {item.value}
              </p>
              <p className="text-sm leading-relaxed text-[#6B7280]">{item.body}</p>
            </div>
          ))}
        </div>

        {/* Content sections */}
        <div ref={sectionsRef} className="space-y-10">
          {[
            {
              title: "What we measure",
              body: [
                "We compute five retention metrics from your Shopify order history: average order value, repeat purchase rate, time to second order, revenue from repeat customers, and orders per month. Each metric is scored against the cohort median and the cohort top quartile.",
                "We also score your retention infrastructure (loyalty, WhatsApp, post-purchase, reviews) based on what you've told us or what we detect from your store.",
              ],
            },
            {
              title: "How we protect cohort brands",
              body: [
                "No individual brand in the cohort is identified by name in your benchmark, our published reports, or any external communication. Before any data is aggregated, we apply per-brand statistical adjustment so that no published metric can be reverse-engineered back to any specific brand.",
                "Cohort brands have signed formal data usage agreements with us and retain the right to opt out of any publication with 30 days' notice.",
              ],
            },
            {
              title: "How we aggregate",
              body: [
                "We use median-of-brand-medians as our standard aggregation. This prevents any single large brand from skewing the benchmark, and means a small ₹1 Cr brand and a large ₹50 Cr brand contribute equally to the cohort median.",
                "For each metric, we publish the cohort median and the top quartile. Your score is your position relative to both.",
              ],
            },
          ].map((s, i) => (
            <div key={i} className="section-item bg-white border border-[#E8E3DA] rounded-2xl p-6 md:p-8 shadow-sm">
              <h2
                className="text-xl font-semibold text-[#0a1f3d] mb-4"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {s.title}
              </h2>
              {s.body.map((p, j) => (
                <p key={j} className="text-sm leading-relaxed text-[#6B7280] mb-3 last:mb-0">{p}</p>
              ))}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-14 pt-8 border-t border-[#E8E3DA] text-sm text-[#9CA3AF]">
          <p>
            Source: {cohortConfig.source}, {cohortConfig.edition}.{" "}
            <a
              href="https://www.anphonic.ai/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#14b8a6] font-medium hover:underline"
            >
              Learn more about Anphonic →
            </a>
          </p>
        </div>

      </main>
    </div>
  );
}
