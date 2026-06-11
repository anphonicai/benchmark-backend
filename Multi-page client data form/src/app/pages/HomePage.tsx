import { useNavigate, Link } from "react-router";
import { ArrowRight } from "lucide-react";
import Logo from "../components/Logo";
import cohortConfig from "../utils/cohortConfig";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function HomePage() {
  const navigate = useNavigate();

  const navRef = useRef<HTMLElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const heroCardRef = useRef<HTMLDivElement>(null);
  const credentialRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Nav slide down
      gsap.fromTo(navRef.current,
        { y: -28, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" }
      );

      // Badge pop in
      gsap.fromTo(badgeRef.current,
        { scale: 0.85, opacity: 0, y: 8 },
        { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: "back.out(1.7)", delay: 0.25 }
      );

      // Headline — each word with blur + rise
      if (headlineRef.current) {
        const words = headlineRef.current.querySelectorAll(".word");
        gsap.fromTo(words,
          { y: 60, opacity: 0, filter: "blur(8px)", rotateX: -25 },
          {
            y: 0, opacity: 1, filter: "blur(0px)", rotateX: 0,
            duration: 0.7, stagger: 0.07, ease: "power3.out", delay: 0.4,
            transformOrigin: "50% 100%",
          }
        );
      }

      // Subtitle
      gsap.fromTo(subtitleRef.current,
        { y: 18, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.65, ease: "power2.out", delay: 0.78 }
      );

      // CTA
      gsap.fromTo(ctaRef.current,
        { y: 18, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power2.out", delay: 0.92 }
      );

      // Hero preview card slides in from right
      gsap.fromTo(heroCardRef.current,
        { x: 55, opacity: 0, scale: 0.95 },
        { x: 0, opacity: 1, scale: 1, duration: 1, ease: "power3.out", delay: 0.55 }
      );

      // Credential cards on scroll
      gsap.fromTo(credentialRef.current,
        { y: 36, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.75, ease: "power3.out",
          scrollTrigger: { trigger: credentialRef.current, start: "top 82%" }
        }
      );

      if (credentialRef.current) {
        const cards = credentialRef.current.querySelectorAll(".cred-card");
        gsap.fromTo(cards,
          { y: 24, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 0.55, stagger: 0.12, ease: "power2.out",
            scrollTrigger: { trigger: credentialRef.current, start: "top 78%" }
          }
        );
      }

      // Stat cards stagger on scroll
      if (statsRef.current) {
        const cols = statsRef.current.querySelectorAll(".stat-col");
        gsap.fromTo(cols,
          { y: 40, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 0.7, stagger: 0.13, ease: "power3.out",
            scrollTrigger: { trigger: statsRef.current, start: "top 82%" }
          }
        );

        // Counter-up animation
        const nums = statsRef.current.querySelectorAll(".count-num");
        nums.forEach((el) => {
          const target = parseFloat(el.getAttribute("data-target") || "0");
          const isFloat = el.getAttribute("data-float") === "true";
          const suffix = el.getAttribute("data-suffix") || "%";
          const obj = { val: 0 };
          ScrollTrigger.create({
            trigger: el,
            start: "top 88%",
            once: true,
            onEnter: () => {
              gsap.to(obj, {
                val: target,
                duration: 1.3,
                ease: "power1.out",
                onUpdate: () => {
                  el.textContent =
                    (isFloat ? obj.val.toFixed(1) : Math.round(obj.val).toString()) + suffix;
                },
              });
            },
          });
        });
      }

      // Floating ambient particles
      if (particlesRef.current) {
        particlesRef.current.querySelectorAll(".particle").forEach((p, i) => {
          gsap.to(p, {
            y: `${-16 + (i % 3) * 10}px`,
            x: `${-5 + (i % 4) * 4}px`,
            duration: 2.8 + i * 0.35,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
            delay: i * 0.25,
          });
        });
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F3EF] overflow-x-hidden">

      {/* Ambient floating particles */}
      <div ref={particlesRef} className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="particle absolute rounded-full bg-[#10b981]"
            style={{
              opacity: 0.04,
              width: `${90 + i * 35}px`,
              height: `${90 + i * 35}px`,
              top: `${8 + i * 14}%`,
              left: `${5 + i * 15}%`,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header
        ref={navRef}
        className="relative z-10 flex justify-between items-center px-6 py-5 md:px-16 md:py-6 border-b border-[#E8E3DA] bg-[#F5F3EF]/80 backdrop-blur-sm"
      >
        <Logo />
        <div className="flex items-center gap-6 md:gap-10">
          <a
            href="#benchmarks"
            className="text-[#999] hover:text-[#1a1a1a] transition-colors text-xs tracking-[0.16em] hidden sm:block font-medium"
          >
            BENCHMARKS
          </a>
          <Link
            to="/methodology"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#EBF8F7] border border-[#B8E0E0] rounded-full text-xs font-semibold text-[#1C9393] tracking-wide hover:bg-[#D4EFEF] transition-colors"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#30B4B7]" />
            HOW WE BENCHMARK
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 px-6 md:px-16 pt-14 md:pt-20 pb-12 md:pb-0">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12 lg:gap-16 items-center lg:py-20">

          {/* Left: text */}
          <div>
            {/* Badge */}
            <div
              ref={badgeRef}
              className="inline-flex items-center gap-3 px-4 py-2 border border-[#DDD8CF] rounded-full mb-10 bg-white/70 backdrop-blur-sm shadow-sm"
            >
              <span className="text-[#999] text-xs tracking-[0.16em] font-medium">THE SHELF INDEX</span>
              <span className="text-[#DDD] font-thin text-lg leading-none">|</span>
              <span className="text-[#999] text-xs tracking-[0.16em] font-medium">
                INDIA D2C {cohortConfig.data_window_year}
              </span>
            </div>

            {/* Headline */}
            <h1
              ref={headlineRef}
              className="text-5xl md:text-[4.75rem] leading-[1.06] mb-7 font-semibold tracking-tight"
              style={{ perspective: "600px" }}
            >
              <span className="block overflow-hidden">
                {["Where", "does", "your"].map((w) => (
                  <span key={w} className="word inline-block mr-[0.22em] text-[#0D0D0D]">{w}</span>
                ))}
              </span>
              <span className="block overflow-hidden">
                {["D2C", "brand"].map((w) => (
                  <span key={w} className="word inline-block mr-[0.22em] text-[#0D0D0D]">{w}</span>
                ))}
                <em
                  className="word inline-block mr-[0.22em] text-[#10b981] not-italic"
                  style={{ fontStyle: "italic" }}
                >
                  actually
                </em>
              </span>
              <span className="block overflow-hidden">
                <span className="word inline-block text-[#0D0D0D]">stand?</span>
              </span>
            </h1>

            {/* Subtitle */}
            <p ref={subtitleRef} className="text-[#6B7280] text-lg mb-10 max-w-lg leading-relaxed">
              Benchmark your retention metrics against India's leading D2C brands.
              Connect your Shopify store and get a verified diagnostic in 90 seconds.
            </p>

            {/* CTA */}
            <div ref={ctaRef} className="flex flex-col gap-5">
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => navigate("/brand-info")}
                  className="group bg-[#0D0D0D] text-white px-7 py-3.5 rounded-xl hover:bg-[#222] transition-all duration-200 flex items-center gap-2 hover:gap-3 shadow-lg shadow-black/10 hover:shadow-xl hover:shadow-black/15 font-medium text-sm"
                >
                  <span>Start free benchmark</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
                <Link
                  to="/methodology"
                  className="px-7 py-3.5 rounded-xl border border-[#DDD8CF] text-[#555] hover:border-[#1C9393] hover:text-[#1C9393] transition-all duration-200 font-medium text-sm flex items-center bg-white/50 hover:bg-white"
                >
                  See how it works
                </Link>
              </div>
              <div className="flex flex-wrap gap-3 text-[11px] text-[#C0BAB0] font-medium tracking-[0.1em]">
                <span>NO CREDIT CARD</span>
                <span className="text-[#DDD]">·</span>
                <span>90 SECONDS</span>
                <span className="text-[#DDD]">·</span>
                <span>READ-ONLY SHOPIFY ACCESS</span>
              </div>
            </div>
          </div>

          {/* Right: benchmark preview card */}
          <div ref={heroCardRef} className="relative hidden lg:block">
            <div className="bg-white rounded-3xl border border-[#E8E3DA] shadow-2xl shadow-black/[0.07] p-7 relative overflow-hidden">

              {/* Card header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="text-[10px] text-[#C0BAB0] tracking-[0.15em] uppercase font-medium mb-1">
                    Sample Report
                  </div>
                  <div className="text-sm font-semibold text-[#1a1a1a]">Your Brand vs Cohort</div>
                </div>
                <span className="px-2.5 py-1 bg-[#ECFDF5] text-[#059669] text-[10px] font-bold tracking-wide rounded-full border border-[#A7F3D0]">
                  LIVE DATA
                </span>
              </div>

              {/* Sample metric bars */}
              {[
                { label: "Repeat Purchase Rate", your: 29, median: 22, top: 38 },
                { label: "Add to Cart Rate", your: 8.2, median: 6.4, top: 9.8, isFloat: true },
                { label: "Revenue from Repeats", your: 41, median: 31, top: 54 },
              ].map((m, i) => (
                <div key={i} className="mb-5 last:mb-0">
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-xs text-[#6B7280]">{m.label}</span>
                    <span className="text-sm font-bold text-[#0D0D0D] tabular-nums">
                      {m.isFloat ? m.your.toFixed(1) : m.your}%
                    </span>
                  </div>
                  <div className="relative h-2 bg-[#F3F0EB] rounded-full overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 bg-[#D1FAE5] rounded-full"
                      style={{ width: `${(m.median / m.top) * 100}%` }}
                    />
                    <div
                      className="absolute inset-y-0 left-0 bg-[#10b981] rounded-full"
                      style={{ width: `${(m.your / m.top) * 100}%`, opacity: 0.9 }}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[10px] text-[#C4BFB8]">
                      Median {m.isFloat ? m.median.toFixed(1) : m.median}%
                    </span>
                    <span className="text-[10px] text-[#C4BFB8]">Top {m.top}%</span>
                  </div>
                </div>
              ))}

              {/* Status footer */}
              <div className="mt-6 pt-5 border-t border-[#F0EDE8] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
                  <span className="text-xs text-[#6B7280]">Above cohort median</span>
                </div>
                <span className="text-xs font-bold text-[#10b981]">Top 30%</span>
              </div>

              {/* Decorative blobs inside card */}
              <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-[#10b981] opacity-[0.05] blur-2xl pointer-events-none" />
              <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-[#1C9393] opacity-[0.06] blur-xl pointer-events-none" />
            </div>

            {/* Floating stat chips */}
            <div className="absolute -top-5 -left-8 bg-white border border-[#E8E3DA] rounded-2xl px-4 py-3 shadow-xl shadow-black/[0.06]">
              <div className="text-[10px] text-[#C0BAB0] uppercase tracking-wider mb-0.5">Cohort</div>
              <div className="text-lg font-bold text-[#1C9393]">{cohortConfig.cohort_size}</div>
            </div>
            <div className="absolute -bottom-5 -right-5 bg-white border border-[#E8E3DA] rounded-2xl px-4 py-3 shadow-xl shadow-black/[0.06]">
              <div className="text-[10px] text-[#C0BAB0] uppercase tracking-wider mb-0.5">Window</div>
              <div className="text-lg font-bold text-[#1C9393]">{cohortConfig.data_window}</div>
            </div>
          </div>

        </div>
      </section>

      {/* Cohort credential strip */}
      <section className="relative z-10 px-6 md:px-16 py-20 md:py-28" id="benchmarks">
        <div ref={credentialRef} className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
            {[
              { val: cohortConfig.cohort_size, label: "Leading Indian D2C Brands" },
              { val: cohortConfig.tracked_value, label: "Tracked Transactions" },
              { val: cohortConfig.data_window, label: `${cohortConfig.data_window_year} Data Window` },
            ].map((item, i) => (
              <div
                key={i}
                className="cred-card bg-white border border-[#E8E3DA] rounded-2xl px-6 py-8 text-center shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-4xl font-bold text-[#1C9393] tracking-tight mb-2">{item.val}</div>
                <div className="text-xs text-[#9CA3AF] uppercase tracking-wider font-medium leading-snug">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-sm text-[#9CA3AF]">
            Your brand is benchmarked against this cohort.{" "}
            <Link to="/methodology" className="text-[#1C9393] font-semibold hover:underline">
              How this works →
            </Link>
          </p>
        </div>
      </section>

      {/* Benchmark stats */}
      <section className="relative z-10 px-6 md:px-16 pb-24 md:pb-32">
        <div ref={statsRef} className="max-w-[1200px] mx-auto">
          <div className="text-center mb-12">
            <div className="text-[10px] text-[#C4BFB8] tracking-[0.2em] uppercase font-medium mb-3">
              Cohort Benchmarks
            </div>
            <h2 className="text-2xl md:text-3xl font-semibold text-[#0D0D0D] tracking-tight">
              India D2C {cohortConfig.data_window_year}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 md:gap-7">
            {[
              { label: "01 · REPEAT PURCHASE RATE", medianVal: 22, topVal: 38, suffix: "%" },
              { label: "02 · ADD TO CART RATE", medianVal: 6.4, topVal: 9.8, suffix: "%", isFloat: true },
              { label: "03 · REVENUE FROM REPEATS", medianVal: 31, topVal: 54, suffix: "%" },
            ].map((s, i) => (
              <div
                key={i}
                className="stat-col bg-white border border-[#E8E3DA] rounded-2xl p-7 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-[10px] text-[#C4BFB8] tracking-[0.18em] mb-6 uppercase font-medium">
                  {s.label}
                </div>
                <div className="space-y-5">
                  {/* Median row */}
                  <div>
                    <div className="flex justify-between items-baseline mb-2.5">
                      <span className="text-xs text-[#9CA3AF] font-medium">Cohort median</span>
                      <span
                        className="count-num text-3xl font-bold text-[#0D0D0D] tabular-nums leading-none"
                        data-target={s.medianVal}
                        data-suffix={s.suffix}
                        data-float={s.isFloat ? "true" : "false"}
                      >
                        0{s.suffix}
                      </span>
                    </div>
                    <div className="h-1.5 bg-[#F3F0EB] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#D1FAE5] rounded-full"
                        style={{ width: `${(s.medianVal / s.topVal) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="h-px bg-[#F3F0EB]" />

                  {/* Top quartile row */}
                  <div>
                    <div className="flex justify-between items-baseline mb-2.5">
                      <span className="text-xs text-[#9CA3AF] font-medium">Top quartile</span>
                      <span
                        className="count-num text-3xl font-bold text-[#10b981] tabular-nums leading-none"
                        data-target={s.topVal}
                        data-suffix={s.suffix}
                        data-float={s.isFloat ? "true" : "false"}
                      >
                        0{s.suffix}
                      </span>
                    </div>
                    <div className="h-1.5 bg-[#F3F0EB] rounded-full overflow-hidden">
                      <div className="h-full bg-[#10b981] rounded-full w-full opacity-80" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
