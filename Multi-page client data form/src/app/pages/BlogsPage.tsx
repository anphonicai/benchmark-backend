import { useEffect, useRef } from "react";
import { Link } from "react-router";
import Logo from "../components/Logo";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { resizeLenis } from "../utils/lenisInstance";

gsap.registerPlugin(ScrollTrigger);

const benchmarkRows = [
  { label: "30-day repeat purchase rate", avg: "12%", top: "22%" },
  { label: "90-day repeat purchase rate", avg: "18%", top: "32%" },
  { label: "12-month customer lifetime value", avg: "₹2,800", top: "₹6,500" },
];

const failureSteps = [
  "The first order is won with paid media.",
  "The customer gets a basic confirmation email.",
  "No meaningful follow-up happens within the first week.",
  "The next purchase opportunity is missed entirely.",
];

export default function BlogsPage() {
  const headerRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title =
      "India D2C Retention Benchmarks in 2026: What Top Brands Do Differently | Anphonic";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute(
        "content",
        "Discover the retention benchmarks shaping Indian D2C in 2026, including repeat purchase rates, cohort behavior, and the personalization tactics top brands use to grow profitably."
      );
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        headerRef.current,
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" }
      );
      gsap.fromTo(
        heroRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: "power2.out", delay: 0.2 }
      );
      if (bodyRef.current) {
        const items = bodyRef.current.querySelectorAll(".fade-in");
        gsap.fromTo(
          items,
          { y: 20, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: "power2.out",
            scrollTrigger: { trigger: bodyRef.current, start: "top 85%" },
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
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#14b8a6]" />
            <span className="text-xs text-[#14b8a6] font-semibold tracking-[0.16em] uppercase">
              Retention
            </span>
            <span className="text-xs text-[#9CA3AF]">· June 2026</span>
          </div>
          <h1
            className="text-3xl md:text-5xl text-[#0a1f3d] mb-6 leading-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            India D2C Retention Benchmarks in 2026: What Top Brands Do Differently
          </h1>
          <p className="text-lg leading-relaxed text-[#6B7280] max-w-2xl">
            Indian D2C brands are no longer competing only on acquisition. In 2026, the real gap is
            between brands that keep customers coming back and brands that keep paying to replace them.
          </p>
        </div>

        {/* Body */}
        <div ref={bodyRef} className="space-y-10">

          {/* Intro */}
          <div className="fade-in space-y-4 text-[15px] leading-relaxed text-[#6B7280]">
            <p>
              Retention has become one of the clearest signals of brand health because it directly
              affects repeat revenue, customer lifetime value, and payback period. Recent benchmark
              data shows repeat purchase rates vary widely by category, with top brands consistently
              outperforming the average through stronger post-purchase journeys and better
              re-engagement timing.
            </p>
            <p>
              The lesson is simple: if your retention curve is flat, you are likely leaving revenue
              on the table even if your top-of-funnel looks healthy.
            </p>
          </div>

          {/* Benchmark data section */}
          <div className="fade-in bg-white border border-[#E8E3DA] rounded-2xl p-6 md:p-8 shadow-sm">
            <h2
              className="text-xl font-semibold text-[#0a1f3d] mb-2"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              What the benchmark data is showing
            </h2>
            <p className="text-sm leading-relaxed text-[#6B7280] mb-6">
              Across Indian D2C categories, the spread between average and top-performing brands
              is large.
            </p>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E8E3DA]">
                  <th className="text-left py-2 pr-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9CA3AF]">
                    Metric
                  </th>
                  <th className="text-right py-2 px-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9CA3AF]">
                    Average
                  </th>
                  <th className="text-right py-2 pl-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#14b8a6]">
                    Top performers
                  </th>
                </tr>
              </thead>
              <tbody>
                {benchmarkRows.map((row) => (
                  <tr key={row.label} className="border-b border-[#F5F3EF]">
                    <td className="py-3 pr-4 text-[#374151]">{row.label}</td>
                    <td className="py-3 px-4 text-right text-[#6B7280]">{row.avg}</td>
                    <td className="py-3 pl-4 text-right font-semibold text-[#14b8a6]">{row.top}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-sm leading-relaxed text-[#6B7280] mt-6">
              That gap matters because it reflects how well a brand turns first-time buyers into
              repeat customers through post-purchase communication, personalization, and offer
              sequencing.
            </p>
          </div>

          {/* Why brands lose */}
          <div className="fade-in bg-white border border-[#E8E3DA] rounded-2xl p-6 md:p-8 shadow-sm">
            <h2
              className="text-xl font-semibold text-[#0a1f3d] mb-4"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Why brands lose repeat sales
            </h2>
            <p className="text-sm leading-relaxed text-[#6B7280] mb-5">
              Most brands do not lose customers because of one bad campaign. They lose them because
              the post-purchase experience is too generic, too late, or not connected to the next
              best product recommendation.
            </p>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9CA3AF] mb-3">
              A common failure pattern
            </p>
            <ol className="space-y-2">
              {failureSteps.map((step, i) => (
                <li key={i} className="flex gap-3 text-sm text-[#6B7280]">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full border border-[#E8E3DA] flex items-center justify-center text-[10px] font-semibold text-[#9CA3AF]">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
            <p className="text-sm leading-relaxed text-[#6B7280] mt-5">
              In other words, the brand spends to acquire attention but does not build a system to
              convert that attention into habit.
            </p>
          </div>

          {/* What top brands do */}
          <div className="fade-in bg-white border border-[#E8E3DA] rounded-2xl p-6 md:p-8 shadow-sm">
            <h2
              className="text-xl font-semibold text-[#0a1f3d] mb-4"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              What top brands do differently
            </h2>
            <div className="space-y-4 text-sm leading-relaxed text-[#6B7280]">
              <p>
                The strongest D2C brands use the first seven days after purchase as a retention
                window. They send useful order updates, ask for feedback, and introduce
                complementary products while the original purchase is still top of mind.
              </p>
              <p>
                They also track the right metrics — repeat purchase rate, days between purchases,
                cohort revenue curves, and reactivation rate. Those metrics show whether retention
                is actually compounding, instead of just looking good in a dashboard.
              </p>
              <p>
                Personalization matters here because one-size-fits-all retention flows usually
                underperform. Brands that segment by product type, category affinity, and timing
                can make post-purchase offers feel relevant rather than pushy.
              </p>
            </div>
          </div>

        </div>

        {/* Footer CTA */}
        <div className="mt-14 pt-8 border-t border-[#E8E3DA]">
          <p className="text-sm text-[#9CA3AF]">
            Want to see where your brand sits against these benchmarks?{" "}
            <Link
              to="/"
              className="text-[#14b8a6] font-medium hover:underline"
            >
              Run your free benchmark →
            </Link>
          </p>
        </div>

      </main>
    </div>
  );
}
