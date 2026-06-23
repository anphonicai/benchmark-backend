import { useEffect, useRef, useState, type SyntheticEvent } from "react";
import { Link, useNavigate } from "react-router";
import { motion, useSpring, useMotionValue } from "motion/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, ChevronDown, X, User, Mail, Globe, Phone, ChevronRight } from "lucide-react";
import Logo from "../components/Logo";
import cohortConfig from "../utils/cohortConfig";

gsap.registerPlugin(ScrollTrigger);

const NAVY  = "#0a1f3d";
const TEAL  = "#14b8a6";
const GOLD  = "#c9973d";
const CREAM = "#F5F0E8";
const SAND  = "#EDE8DF";

const CHAPTERS = [
  { n: "01", title: "Customer lifetime value and the second order" },
  { n: "02", title: "The 21-day repeat window" },
  { n: "03", title: "Why 60-day re-engagement is too late" },
  { n: "04", title: "Returning customer revenue share" },
  { n: "05", title: "Personalisation and AOV lift" },
  { n: "06", title: "Rebuy revenue share by brand" },
  { n: "07", title: "India vs global retention benchmarks" },
  { n: "08", title: "What smart operators should do next" },
];

const STATS = [
  { value: 38, suffix: "%",     label: "Repeat Purchase Rate", context: "Top-quartile Indian D2C brands hit 38%. The cohort median sits at 22%. The gap compounds every quarter.", color: TEAL },
  { value: 21, suffix: " days", label: "The Critical Window",  context: "Brands that re-engage within 21 days see 2.4× higher lifetime value. Most wait 60 — too late.", color: GOLD },
  { value: 54, suffix: "%",     label: "Revenue from Repeats", context: "The strongest operators earn 54% of revenue from returning customers. The cohort median? 31%.", color: TEAL },
];

const inputCls = (err: string) =>
  `w-full px-4 py-3 bg-white border rounded-xl text-[#0a1f3d] placeholder:text-[#C4BFB8] focus:outline-none transition-colors text-sm ${err ? "border-red-300" : "border-[#E8E3DA] focus:border-[#0a1f3d]"}`;

// ── Magnetic button ────────────────────────────────────────────────────────
function MagneticBtn({ children, className, style, onClick }: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 20 });
  const sy = useSpring(y, { stiffness: 220, damping: 20 });
  return (
    <motion.button
      ref={ref}
      style={{ x: sx, y: sy, ...style }}
      className={className}
      onMouseMove={(e) => {
        if (!ref.current) return;
        const r = ref.current.getBoundingClientRect();
        x.set((e.clientX - r.left - r.width / 2) * 0.3);
        y.set((e.clientY - r.top - r.height / 2) * 0.3);
      }}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
    >
      {children}
    </motion.button>
  );
}

// ── Scrolling ticker ───────────────────────────────────────────────────────
function Ticker() {
  const items = [`${cohortConfig.cohort_size} Brands`, cohortConfig.data_window, "8 Chapters", "FY2025–26", "India D2C", "Verified Data"];
  return (
    <div className="overflow-hidden border-y py-3" style={{ borderColor: "#E2DDD5", backgroundColor: SAND }}>
      <motion.div
        className="flex gap-16 whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 22, ease: "linear", repeat: Infinity }}
      >
        {[...items, ...items].map((item, i) => (
          <span key={i} className="flex items-center gap-4 text-[10px] font-medium tracking-[0.24em] uppercase"
            style={{ color: "rgba(10,31,61,0.35)", fontFamily: "'DM Mono', monospace" }}>
            <span className="w-1 h-1 rounded-full inline-block" style={{ backgroundColor: TEAL }} />
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// ── Counter ────────────────────────────────────────────────────────────────
function Counter({ value, suffix, color }: { value: number; suffix: string; color: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const done = useRef(false);
  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    ScrollTrigger.create({
      trigger: el, start: "top 88%", once: true,
      onEnter: () => {
        if (done.current) return;
        done.current = true;
        const obj = { val: 0 };
        gsap.to(obj, {
          val: value, duration: 1.8, ease: "power2.out",
          onUpdate: () => { el.textContent = Math.round(obj.val) + suffix; },
        });
      },
    });
  }, [value, suffix]);
  return <span ref={ref} style={{ color, fontFamily: "'Playfair Display', serif", lineHeight: 1 }}>0{suffix}</span>;
}

// ── Main ───────────────────────────────────────────────────────────────────
export default function SelfIndexPage() {
  const navigate = useNavigate();
  const [navScrolled, setNavScrolled] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ fullName: "", email: "", brandUrl: "", phone: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const navRef      = useRef<HTMLElement>(null);
  const eyebrowRef  = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subRef      = useRef<HTMLParagraphElement>(null);
  const ctaRef      = useRef<HTMLDivElement>(null);
  const metaRef     = useRef<HTMLDivElement>(null);
  const cardRef     = useRef<HTMLDivElement>(null);
  const introRef    = useRef<HTMLDivElement>(null);
  const chaptersRef = useRef<HTMLDivElement>(null);
  const statsRef    = useRef<HTMLDivElement>(null);
  const reportRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = () => setNavScrolled(window.scrollY > 50);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(navRef.current, { y: -36, opacity: 0 }, { y: 0, opacity: 1, duration: 0.65, ease: "power3.out" });
      gsap.fromTo(eyebrowRef.current, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.55, ease: "power2.out", delay: 0.25 });
      if (headlineRef.current) {
        gsap.fromTo(headlineRef.current.querySelectorAll(".w"),
          { y: 72, opacity: 0, filter: "blur(8px)", rotateX: -28 },
          { y: 0, opacity: 1, filter: "blur(0px)", rotateX: 0, duration: 0.82, stagger: 0.05, ease: "power4.out", delay: 0.42, transformOrigin: "50% 100%" }
        );
      }
      gsap.fromTo([subRef.current, ctaRef.current, metaRef.current],
        { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.65, stagger: 0.1, ease: "power2.out", delay: 1.05 }
      );
      gsap.fromTo(cardRef.current,
        { x: 55, opacity: 0, scale: 0.95 }, { x: 0, opacity: 1, scale: 1, duration: 1.05, ease: "power3.out", delay: 0.65 }
      );
      if (introRef.current) {
        gsap.fromTo(introRef.current.querySelectorAll(".intro-line"),
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.75, stagger: 0.12, ease: "power3.out", scrollTrigger: { trigger: introRef.current, start: "top 78%" } }
        );
      }
      if (chaptersRef.current) {
        gsap.fromTo(chaptersRef.current.querySelectorAll(".ch"),
          { x: -40, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.6, stagger: 0.07, ease: "power3.out", scrollTrigger: { trigger: chaptersRef.current, start: "top 78%" } }
        );
      }
      if (statsRef.current) {
        gsap.fromTo(statsRef.current.querySelectorAll(".sc"),
          { y: 36, opacity: 0, scale: 0.92 },
          { y: 0, opacity: 1, scale: 1, duration: 0.72, stagger: 0.13, ease: "back.out(1.2)", scrollTrigger: { trigger: statsRef.current, start: "top 80%" } }
        );
      }
      gsap.fromTo(reportRef.current, { y: 48, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.85, ease: "power3.out", scrollTrigger: { trigger: reportRef.current, start: "top 82%" } }
      );
    });
    return () => ctx.revert();
  }, []);

  const openModal = () => { setErrors({}); setShowModal(true); };

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errs: Record<string, string> = {};

    const name = form.fullName.trim();
    if (!name) {
      errs.fullName = "Full name is required.";
    } else if (!/^[a-zA-Z\s.\-']{2,100}$/.test(name)) {
      errs.fullName = "Name should only contain letters, spaces, or hyphens (2–100 chars).";
    }

    const email = form.email.trim();
    if (!email) {
      errs.email = "Email is required.";
    } else if (!/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(email)) {
      errs.email = "Please enter a valid email address (e.g. you@yourbrand.com).";
    }

    const rawUrl = form.brandUrl.trim();
    if (!rawUrl) {
      errs.brandUrl = "Brand URL is required.";
    } else {
      const normalised = rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`;
      try { new URL(normalised); }
      catch { errs.brandUrl = "Please enter a valid URL (e.g. yourbrand.com)."; }
    }

    const digits = form.phone.replace(/\D/g, "");
    const phoneCore = digits.length === 12 && digits.startsWith("91") ? digits.slice(2) : digits;
    if (!digits) {
      errs.phone = "Phone number is required.";
    } else if (!/^[6-9]\d{9}$/.test(phoneCore)) {
      errs.phone = "Enter a valid 10-digit Indian mobile number starting with 6–9.";
    } else if (new Set(phoneCore.split("")).size < 4) {
      errs.phone = "Please enter a real mobile number.";
    }

    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSubmitting(true);
    try {
      const res = await fetch("/api/companies/shelf-index-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: name, email, brandUrl: rawUrl, phone: phoneCore }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok && data.errors) {
        setErrors(data.errors);
        setSubmitting(false);
        return;
      }
    } catch { /* fire-and-forget — still open report on network error */ }

    setSubmitting(false);
    setShowModal(false);
    window.open("/shelf-index.html", "_blank");
  };

  const line1 = ["Shelf", "Life:"];
  const line2 = ["The", "State", "of", "Indian", "D2C"];

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ backgroundColor: CREAM, fontFamily: "'DM Sans', sans-serif", color: NAVY }}>

      {/* ── NAV ── */}
      <nav ref={navRef as React.RefObject<HTMLElement>}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 lg:px-16 py-5"
      >
        {/* Blur lives on its own layer so the logo isn't affected */}
        <div
          className="absolute inset-0 -z-10 transition-all duration-400"
          style={{
            backgroundColor: navScrolled ? "rgba(245,240,232,0.92)" : "transparent",
            backdropFilter: navScrolled ? "blur(16px)" : "none",
            borderBottom: navScrolled ? `1px solid ${SAND}` : "none",
          }}
        />
        <Logo />

        <div className="hidden md:flex items-center gap-8">
          <a href="#benchmarks" className="text-[11px] tracking-[0.2em] uppercase font-medium transition-colors duration-200"
            style={{ color: "rgba(10,31,61,0.4)" }}
            onMouseEnter={e => (e.currentTarget.style.color = NAVY)}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(10,31,61,0.4)")}>
            Benchmarks
          </a>
          <a href="#contents" className="text-[11px] tracking-[0.2em] uppercase font-medium transition-colors duration-200"
            style={{ color: "rgba(10,31,61,0.4)" }}
            onMouseEnter={e => (e.currentTarget.style.color = NAVY)}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(10,31,61,0.4)")}>
            Contents
          </a>
          <Link to="/methodology"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-semibold tracking-wide transition-colors"
            style={{ backgroundColor: "#E6FAF9", border: `1px solid #A8DBD8`, color: TEAL }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: TEAL }} />
            HOW WE BENCHMARK
          </Link>
        </div>

        <motion.button
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-[11px] font-bold tracking-widest uppercase text-white cursor-pointer"
          style={{ backgroundColor: NAVY, boxShadow: `0 2px 12px rgba(10,31,61,0.2)` }}
          whileHover={{ scale: 1.04, boxShadow: `0 4px 20px rgba(10,31,61,0.3)` }}
          whileTap={{ scale: 0.97 }}
          onClick={openModal}
        >
          Unlock
          <ArrowRight className="w-3 h-3" />
        </motion.button>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-24 pb-16">
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: `radial-gradient(circle, rgba(10,31,61,0.07) 1.5px, transparent 1.5px)`, backgroundSize: "36px 36px" }} />
        <div className="absolute pointer-events-none"
          style={{ top: "-10%", right: "-8%", width: 700, height: 700, background: `radial-gradient(circle, ${TEAL}14 0%, transparent 65%)`, borderRadius: "50%" }} />
        <div className="absolute pointer-events-none"
          style={{ bottom: "-5%", left: "-5%", width: 500, height: 500, background: `radial-gradient(circle, ${GOLD}0d 0%, transparent 65%)`, borderRadius: "50%" }} />

        <div className="relative z-10 px-6 md:px-12 lg:px-16 max-w-[1300px] mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_420px] gap-14 xl:gap-20 items-center">

            {/* Left */}
            <div>
              <div ref={eyebrowRef}
                className="inline-flex flex-wrap items-center gap-2 mb-8 px-3 py-1.5 rounded-full border bg-white/60 backdrop-blur-sm shadow-sm"
                style={{ borderColor: "#DDD8CF" }}>
                <span className="text-[10px] tracking-[0.16em] uppercase font-semibold" style={{ color: "rgba(10,31,61,0.45)", fontFamily: "'DM Mono', monospace" }}>
                  The Shelf Index
                </span>
                <span style={{ color: "#DDD8CF" }}>·</span>
                <span className="text-[10px] tracking-[0.16em] uppercase font-semibold" style={{ color: TEAL, fontFamily: "'DM Mono', monospace" }}>
                  FY2025–26
                </span>
              </div>

              <h1 ref={headlineRef} className="mb-7"
                style={{ fontSize: "clamp(1.75rem, 5.5vw, 4rem)", lineHeight: 1.07, letterSpacing: "-0.02em", fontFamily: "'Playfair Display', serif", perspective: "600px" }}>
                <span className="block overflow-hidden pb-1.5">
                  {line1.map((word, i) => (
                    <span key={i} className="w inline-block mr-[0.22em]" style={{ color: NAVY }}>{word}</span>
                  ))}
                </span>
                <span className="block overflow-hidden pb-1.5">
                  {line2.map((word, i) => (
                    <span key={i} className="w inline-block mr-[0.22em]"
                      style={{ color: TEAL, fontStyle: "italic" }}>
                      {word}
                    </span>
                  ))}
                </span>
              </h1>

              <p ref={subRef} className="text-base md:text-lg leading-relaxed mb-10 max-w-xl"
                style={{ color: "rgba(10,31,61,0.52)", fontWeight: 300 }}>
                An analysis of how Indian D2C brands build retention infrastructure, lift AOV through
                onsite personalisation and turn repeat purchase into a real growth engine.
              </p>

              <div ref={ctaRef} className="flex flex-wrap items-center gap-4 mb-12">
                <MagneticBtn
                  className="inline-flex items-center gap-3 px-8 py-4 rounded-xl text-sm font-semibold text-white transition-shadow cursor-pointer"
                  style={{ backgroundColor: NAVY, boxShadow: "0 4px 20px rgba(10,31,61,0.2)" }}
                  onClick={openModal}
                >
                  Unlock The Shelf Index
                  <ArrowRight className="w-4 h-4" />
                </MagneticBtn>

                <motion.a href="#contents"
                  className="inline-flex items-center gap-2 text-sm font-medium transition-colors"
                  style={{ color: "rgba(10,31,61,0.38)" }}
                  whileHover={{ color: NAVY } as any}>
                  <ChevronDown className="w-4 h-4" />
                  See contents
                </motion.a>
              </div>

              <div ref={metaRef} className="flex items-center gap-5 md:gap-8 pt-8 border-t" style={{ borderColor: "rgba(10,31,61,0.08)" }}>
                {[
                  { val: cohortConfig.cohort_size, label: "Brands" },
                  { val: cohortConfig.data_window,  label: "Window" },
                  { val: "8",                        label: "Chapters" },
                ].map(({ val, label }) => (
                  <div key={label}>
                    <div className="text-lg font-semibold mb-0.5" style={{ color: NAVY, fontFamily: "'DM Mono', monospace" }}>{val}</div>
                    <div className="text-[10px] uppercase tracking-[0.2em] font-medium" style={{ color: "rgba(10,31,61,0.3)" }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — preview card */}
            <div ref={cardRef} className="hidden lg:block">
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 5.5, ease: "easeInOut", repeat: Infinity }} className="relative">
                <div className="absolute -inset-6 rounded-3xl pointer-events-none"
                  style={{ background: `radial-gradient(ellipse at 60% 40%, ${TEAL}18 0%, transparent 70%)` }} />
                <div className="relative rounded-2xl overflow-hidden border shadow-2xl"
                  style={{ backgroundColor: "#fff", borderColor: "#E8E3DA", boxShadow: "0 24px 60px rgba(10,31,61,0.10)" }}>
                  <div className="px-7 py-5 border-b"
                    style={{ borderColor: "#F0EDE8", background: `linear-gradient(135deg, ${NAVY} 0%, #152d52 100%)` }}>
                    <div className="text-[9px] tracking-[0.3em] uppercase font-semibold mb-2" style={{ color: TEAL, fontFamily: "'DM Mono', monospace" }}>
                      Anphonic · Shelf Index
                    </div>
                    <div className="text-base font-medium text-white leading-snug" style={{ fontFamily: "'Playfair Display', serif" }}>
                      India D2C Retention<br />Benchmark Report
                    </div>
                    <div className="text-[11px] mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>FY2025–26</div>
                  </div>
                  <div className="px-7 py-6 space-y-5">
                    {[
                      { label: "Repeat Purchase Rate", you: 29, median: 22, top: 38, color: TEAL },
                      { label: "Revenue from Repeats",  you: 41, median: 31, top: 54, color: GOLD },
                      { label: "21-day Conversion",     you: 62, median: 44, top: 78, color: TEAL },
                    ].map((m, i) => (
                      <div key={i}>
                        <div className="flex justify-between items-baseline mb-2">
                          <span className="text-[11px]" style={{ color: "rgba(10,31,61,0.45)" }}>{m.label}</span>
                          <span className="text-sm font-bold tabular-nums" style={{ color: m.color, fontFamily: "'DM Mono', monospace" }}>{m.you}%</span>
                        </div>
                        <div className="relative h-2 rounded-full overflow-hidden" style={{ backgroundColor: "#F3F0EB" }}>
                          <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${(m.median / m.top) * 100}%`, backgroundColor: "#D9D4CC" }} />
                          <motion.div className="absolute inset-y-0 left-0 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${(m.you / m.top) * 100}%` }}
                            transition={{ duration: 1.3, ease: "easeOut", delay: 0.9 + i * 0.15 } as any}
                            style={{ backgroundColor: m.color, opacity: 0.9 }} />
                        </div>
                        <div className="flex justify-between mt-1.5">
                          <span className="text-[10px]" style={{ color: "rgba(10,31,61,0.3)" }}>Median {m.median}%</span>
                          <span className="text-[10px]" style={{ color: "rgba(10,31,61,0.3)" }}>Top {m.top}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-7 py-4 flex items-center justify-between border-t"
                    style={{ borderColor: "#F0EDE8", backgroundColor: "#FAFAF8" }}>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: TEAL }} />
                      <span className="text-[10px]" style={{ color: "rgba(10,31,61,0.4)" }}>Above cohort median</span>
                    </div>
                    <span className="text-[10px] font-bold" style={{ color: TEAL }}>Top 30%</span>
                  </div>
                </div>
                <div className="absolute -top-4 -left-6 bg-white border rounded-2xl px-4 py-3 shadow-xl"
                  style={{ borderColor: "#E8E3DA", boxShadow: "0 8px 24px rgba(10,31,61,0.10)" }}>
                  <div className="text-[9px] uppercase tracking-wider mb-0.5" style={{ color: "rgba(10,31,61,0.35)" }}>Cohort</div>
                  <div className="text-lg font-bold" style={{ color: TEAL, fontFamily: "'DM Mono', monospace" }}>{cohortConfig.cohort_size}</div>
                </div>
                <div className="absolute -bottom-4 -right-4 bg-white border rounded-2xl px-4 py-3 shadow-xl"
                  style={{ borderColor: "#E8E3DA", boxShadow: "0 8px 24px rgba(10,31,61,0.10)" }}>
                  <div className="text-[9px] uppercase tracking-wider mb-0.5" style={{ color: "rgba(10,31,61,0.35)" }}>Top quartile</div>
                  <div className="text-lg font-bold" style={{ color: GOLD, fontFamily: "'DM Mono', monospace" }}>38%</div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
          <motion.div animate={{ y: [0, 8, 0], opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 2, repeat: Infinity }}>
            <ChevronDown className="w-5 h-5" style={{ color: "rgba(10,31,61,0.25)" }} />
          </motion.div>
        </div>
      </section>

      {/* ── TICKER ── */}
      <Ticker />

      {/* ── INTRO QUOTE ── */}
      <section className="px-6 md:px-12 lg:px-16 py-24 md:py-32" style={{ backgroundColor: "#fff" }}>
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-[180px_1fr] gap-10 lg:gap-20">
          <div>
            <div className="text-[10px] tracking-[0.28em] uppercase font-semibold lg:sticky lg:top-28"
              style={{ color: TEAL, fontFamily: "'DM Mono', monospace" }}>The Report</div>
          </div>
          <div ref={introRef}>
            <p className="intro-line text-2xl md:text-[2rem] font-light leading-[1.55] mb-6"
              style={{ color: NAVY, fontFamily: "'Playfair Display', serif" }}>
              Where the strongest operators are{" "}
              <em style={{ color: NAVY, fontStyle: "italic" }}>compounding</em>, where most brands
              are underusing the stack, and which benchmarks{" "}
              <em style={{ color: TEAL, fontStyle: "italic" }}>still haven't caught up</em>.
            </p>
            <p className="intro-line text-sm leading-relaxed max-w-2xl" style={{ color: "rgba(10,31,61,0.5)", fontWeight: 300 }}>
              An analysis across repeat purchase behaviour, cart-level uplift and the retention
              infrastructure separating top-quartile brands from the cohort median.
            </p>
          </div>
        </div>
      </section>

      {/* ── CONTENTS ── */}
      <section id="contents" className="px-6 md:px-12 lg:px-16 py-24 md:py-32"
        style={{ backgroundColor: CREAM, borderTop: `1px solid ${SAND}` }}>
        <div className="max-w-[1200px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div>
              <div className="text-[10px] tracking-[0.28em] uppercase font-semibold mb-3"
                style={{ color: TEAL, fontFamily: "'DM Mono', monospace" }}>Contents</div>
              <h2 className="text-3xl md:text-4xl font-light" style={{ color: NAVY, fontFamily: "'Playfair Display', serif" }}>8 Chapters</h2>
            </div>
            <p className="text-sm max-w-xs" style={{ color: "rgba(10,31,61,0.4)", fontWeight: 300 }}>
              Each section breaks down one part of the retention and personalisation stack.
            </p>
          </div>
          <div ref={chaptersRef}>
            {CHAPTERS.map((ch, i) => (
              <motion.div key={i} className="ch flex items-center gap-6 md:gap-10 py-5 border-b group cursor-default"
                style={{ borderColor: "rgba(10,31,61,0.08)" }}
                whileHover={{ x: 6 }} transition={{ duration: 0.2 }}>
                <span className="flex-shrink-0 text-[11px] tabular-nums w-8"
                  style={{ color: "rgba(10,31,61,0.25)", fontFamily: "'DM Mono', monospace" }}>{ch.n}</span>
                <span className="flex-1 text-base md:text-lg font-light transition-colors duration-200 group-hover:text-[#0a1f3d]"
                  style={{ color: "rgba(10,31,61,0.6)", fontFamily: "'Playfair Display', serif" }}>{ch.title}</span>
                <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="w-4 h-4" style={{ color: TEAL }} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section id="benchmarks" className="px-6 md:px-12 lg:px-16 py-24 md:py-32"
        style={{ backgroundColor: "#fff", borderTop: `1px solid ${SAND}` }}>
        <div className="max-w-[1200px] mx-auto">
          <div className="mb-14 max-w-lg">
            <div className="text-[10px] tracking-[0.28em] uppercase font-semibold mb-3"
              style={{ color: GOLD, fontFamily: "'DM Mono', monospace" }}>What the data says</div>
            <h2 className="text-3xl md:text-4xl font-light leading-tight" style={{ color: NAVY, fontFamily: "'Playfair Display', serif" }}>
              Three numbers that define <em style={{ color: TEAL, fontStyle: "italic" }}>the gap</em>.
            </h2>
          </div>
          <div ref={statsRef} className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {STATS.map((s, i) => (
              <motion.div key={i} className="sc relative rounded-2xl border p-8 group overflow-hidden cursor-default"
                style={{ backgroundColor: "#FAFAF8", borderColor: "#E8E3DA" }}
                whileHover={{ borderColor: s.color + "88", y: -3, boxShadow: `0 12px 32px rgba(10,31,61,0.08)` }}
                transition={{ duration: 0.25 }}>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"
                  style={{ background: `radial-gradient(ellipse at 30% 20%, ${s.color}10 0%, transparent 65%)` }} />
                <div className="relative">
                  <div className="text-[clamp(3.2rem,6vw,5rem)] font-light leading-none mb-3">
                    <Counter value={s.value} suffix={s.suffix} color={s.color} />
                  </div>
                  <div className="text-[10px] tracking-[0.22em] uppercase font-semibold mb-4"
                    style={{ color: "rgba(10,31,61,0.4)", fontFamily: "'DM Mono', monospace" }}>{s.label}</div>
                  <div className="h-px mb-4" style={{ backgroundColor: "rgba(10,31,61,0.06)" }} />
                  <p className="text-sm leading-relaxed" style={{ color: "rgba(10,31,61,0.5)", fontWeight: 300 }}>{s.context}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── REPORT CTA ── */}
      <section id="access" className="px-6 md:px-12 lg:px-16 py-24 md:py-32"
        style={{ backgroundColor: CREAM, borderTop: `1px solid ${SAND}` }}>
        <div className="max-w-[1200px] mx-auto">
          <div ref={reportRef} className="relative rounded-3xl overflow-hidden border"
            style={{ backgroundColor: NAVY, borderColor: "rgba(255,255,255,0.08)", boxShadow: "0 32px 80px rgba(10,31,61,0.18)" }}>
            <div className="absolute inset-0 pointer-events-none"
              style={{ backgroundImage: `radial-gradient(circle, rgba(20,184,166,0.12) 1px, transparent 1px)`, backgroundSize: "32px 32px" }} />
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: `radial-gradient(ellipse at 75% 50%, ${TEAL}18 0%, transparent 55%)` }} />
            <div className="relative px-5 sm:px-8 md:px-16 py-10 sm:py-14 md:py-20 grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-10 items-center">
              <div>
                <div className="text-[10px] tracking-[0.3em] uppercase font-semibold mb-4 flex items-center gap-3"
                  style={{ color: TEAL, fontFamily: "'DM Mono', monospace" }}>
                  <span className="w-5 h-px" style={{ backgroundColor: TEAL }} />FY2025–26
                </div>
                <h2 className="text-3xl md:text-5xl font-light leading-[1.08] mb-5"
                  style={{ color: "rgba(255,255,255,0.93)", fontFamily: "'Playfair Display', serif" }}>
                  The Shelf Index:<br />
                  <em style={{ color: TEAL, fontStyle: "italic" }}>India D2C Report</em>
                </h2>
                <p className="text-sm leading-relaxed mb-10 max-w-lg" style={{ color: "rgba(255,255,255,0.45)", fontWeight: 300 }}>
                  How India's top D2C brands retain customers, recover carts, and grow repeat revenue — benchmarks across {cohortConfig.cohort_size} brands.
                </p>
                <div className="flex flex-wrap items-center gap-5">
                  <MagneticBtn
                    className="inline-flex items-center gap-3 px-8 py-4 rounded-xl text-sm font-semibold text-white cursor-pointer"
                    style={{ backgroundColor: TEAL, boxShadow: `0 4px 24px ${TEAL}50` }}
                    onClick={() => navigate("/benchmark")}
                  >
                    Get Full Access
                    <ArrowRight className="w-4 h-4" />
                  </MagneticBtn>
                  <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.28)" }}>
                    Takes 30 seconds. We'll never share your details.
                  </p>
                </div>
              </div>
              <div className="hidden lg:flex flex-col gap-3">
                {[
                  { n: cohortConfig.cohort_size, label: "Brands analysed" },
                  { n: "8",                      label: "Report chapters" },
                  { n: cohortConfig.data_window, label: "Data window" },
                  { n: "3",                      label: "Key benchmarks" },
                ].map(({ n, label }) => (
                  <div key={label} className="flex items-center gap-4 px-5 py-3.5 rounded-xl border"
                    style={{ backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.08)" }}>
                    <span className="text-base font-semibold w-14" style={{ color: TEAL, fontFamily: "'DM Mono', monospace" }}>{n}</span>
                    <span className="text-sm" style={{ color: "rgba(255,255,255,0.38)" }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="px-6 md:px-12 lg:px-16 py-12 border-t" style={{ borderColor: SAND, backgroundColor: CREAM }}>
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <Logo size="sm" />
            <p className="text-xs mt-3" style={{ color: "rgba(10,31,61,0.3)" }}>© {new Date().getFullYear()} Anphonic AI. All rights reserved.</p>
          </div>
          <div className="flex flex-wrap gap-6 md:gap-8">
            {[
              { label: "Privacy Policy", to: "/privacy" },
              { label: "Methodology",   to: "/methodology" },
              { label: "Contact",       href: "mailto:merchants@anphonic.ai" },
            ].map((l) => l.href
              ? <a key={l.label} href={l.href} className="text-[11px] tracking-[0.15em] uppercase font-medium transition-colors"
                  style={{ color: "rgba(10,31,61,0.3)" }}
                  onMouseEnter={e => (e.currentTarget.style.color = NAVY)}
                  onMouseLeave={e => (e.currentTarget.style.color = "rgba(10,31,61,0.3)")}>{l.label}</a>
              : <Link key={l.label} to={l.to!} className="text-[11px] tracking-[0.15em] uppercase font-medium transition-colors"
                  style={{ color: "rgba(10,31,61,0.3)" }}
                  onMouseEnter={e => (e.currentTarget.style.color = NAVY)}
                  onMouseLeave={e => (e.currentTarget.style.color = "rgba(10,31,61,0.3)")}>{l.label}</Link>
            )}
          </div>
        </div>
      </footer>

      {/* ── MODAL ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(10,31,61,0.6)", backdropFilter: "blur(10px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="bg-white rounded-3xl w-full max-w-[560px] shadow-2xl p-5 sm:p-8 md:p-12 relative"
          >
            <button onClick={() => setShowModal(false)}
              className="cursor-pointer absolute top-5 right-5 w-8 h-8 rounded-full border border-[#E8E3DA] flex items-center justify-center text-[#9CA3AF] hover:text-[#0a1f3d] hover:border-[#0a1f3d] transition-colors">
              <X className="w-4 h-4" />
            </button>
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-5"
                style={{ backgroundColor: "#E6FAF9", border: `1px solid #A8DBD8` }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: TEAL }} />
                <span className="text-xs font-semibold tracking-wide" style={{ color: TEAL }}>FY2025–26 · The Shelf Index</span>
              </div>
              <h3 className="text-2xl md:text-3xl text-[#0a1f3d] mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
                Shelf Index Report
              </h3>
              <p className="text-[#6B7280] text-sm leading-relaxed">
                Enter your details to unlock the full report.<br />
                <span className="font-semibold text-[#0a1f3d]">Expect personalised insights from our team.</span>
              </p>
            </div>
            <form onSubmit={handleSubmit} noValidate>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-[#6B7280] tracking-[0.1em] uppercase mb-2">
                    <User className="w-3.5 h-3.5" /> Full Name <span className="text-red-400">*</span>
                  </label>
                  <input type="text" placeholder="Enter your full name" value={form.fullName}
                    onChange={(e) => setForm(p => ({ ...p, fullName: e.target.value }))} className={inputCls(errors.fullName)} />
                  {errors.fullName && <p className="text-red-400 text-xs mt-1">{errors.fullName}</p>}
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-[#6B7280] tracking-[0.1em] uppercase mb-2">
                    <Mail className="w-3.5 h-3.5" /> Email <span className="text-red-400">*</span>
                  </label>
                  <input type="email" placeholder="yourname@gmail.com" value={form.email}
                    onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))} className={inputCls(errors.email)} />
                  {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-[#6B7280] tracking-[0.1em] uppercase mb-2">
                    <Globe className="w-3.5 h-3.5" /> Brand URL <span className="text-red-400">*</span>
                  </label>
                  <input type="text" placeholder="www.yourbrand.com" value={form.brandUrl}
                    onChange={(e) => setForm(p => ({ ...p, brandUrl: e.target.value }))} className={inputCls(errors.brandUrl)} />
                  {errors.brandUrl && <p className="text-red-400 text-xs mt-1">{errors.brandUrl}</p>}
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-[#6B7280] tracking-[0.1em] uppercase mb-2">
                    <Phone className="w-3.5 h-3.5" /> Phone <span className="text-red-400">*</span>
                  </label>
                  <input type="text" inputMode="tel" placeholder="10-digit mobile number" value={form.phone}
                    onChange={(e) => setForm(p => ({ ...p, phone: e.target.value.replace(/[^\d+\s\-]/g, "").slice(0, 16) }))} className={inputCls(errors.phone)} />
                  {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
                </div>
              </div>
              <button type="submit" disabled={submitting}
                className="cursor-pointer w-full flex items-center justify-center gap-3 text-white px-8 py-4 rounded-full font-semibold text-sm tracking-[0.08em] uppercase transition-all duration-200 disabled:opacity-60"
                style={{ backgroundColor: NAVY, boxShadow: "0 4px 20px rgba(10,31,61,0.2)" }}>
                <span>{submitting ? "Opening Report…" : "Unlock the Report"}</span>
                {!submitting && <ChevronRight className="w-4 h-4" />}
              </button>
            </form>
          </motion.div>
        </div>
      )}

      <style>{`html{scrollbar-width:none;}html::-webkit-scrollbar{display:none;}`}</style>
    </div>
  );
}
