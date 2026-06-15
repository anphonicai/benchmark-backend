import { useEffect, useRef } from "react";
import { Link } from "react-router";
import Logo from "../components/Logo";
import gsap from "gsap";

const TEAL = "#14b8a6";
const NAVY = "#0a1f3d";
const CREAM = "#F5F3EF";

const sections = [
  {
    id: "information-we-collect",
    title: "Information We Collect",
    content: [
      {
        subtitle: "Information you provide directly",
        body: "When you use the Anphonic Benchmark, you provide us with your full name, business email address, and brand name. If you choose the Shopify connection path, you also provide your Shopify store domain and a read-only access token scoped to order and customer data.",
      },
      {
        subtitle: "Benchmark data",
        body: "To generate your Shelf Score, we collect business performance metrics including repeat purchase rate, average order value (AOV), revenue from repeat customers, time to second order, estimated monthly order volume, and information about tools you use (loyalty, WhatsApp, post-purchase upsell). This data is used solely to calculate your benchmark score and compare it against our D2C cohort.",
      },
      {
        subtitle: "Usage and analytics data",
        body: "We collect information about how you interact with the site — pages visited, time spent, scroll depth, and actions taken. This is collected through Google Analytics 4 and Microsoft Clarity, which may record session replays and heatmaps for product improvement purposes.",
      },
      {
        subtitle: "Technical data",
        body: "We automatically receive standard server log data including your IP address, browser type and version, operating system, referring URL, and timestamps. Cloudflare Turnstile processes a bot-detection signal when you submit forms — this does not store personally identifiable information on our end.",
      },
    ],
  },
  {
    id: "how-we-use-it",
    title: "How We Use Your Information",
    content: [
      {
        subtitle: "To deliver your benchmark report",
        body: "Your business metrics are processed to generate a personalised Shelf Score, cohort comparison, and gap analysis. This is the core product you signed up for.",
      },
      {
        subtitle: "To contact you about your report",
        body: "We use your email address to send your verification code and may follow up with insights or an invitation to a diagnostic call. You can opt out of follow-up communications at any time by replying to any email from us.",
      },
      {
        subtitle: "To improve the benchmark",
        body: "Anonymised and aggregated benchmark data helps us maintain and update the cohort baselines that power the Shelf Index. Individual brand data is never disclosed or used to identify your business in any published cohort.",
      },
      {
        subtitle: "To prevent abuse",
        body: "Form submissions are protected by Cloudflare Turnstile to prevent automated abuse. We may use IP and usage data to detect and block malicious activity.",
      },
    ],
  },
  {
    id: "data-sharing",
    title: "Data Sharing and Disclosure",
    content: [
      {
        subtitle: "We do not sell your data",
        body: "We do not sell, rent, or trade your personal information or business metrics to any third party, ever.",
      },
      {
        subtitle: "Service providers",
        body: "We share data with a limited set of trusted service providers who process it on our behalf: Google (Analytics, Cloud hosting in the asia-south1 Mumbai region), Microsoft (Clarity session analytics), Resend (transactional email delivery), and Cloudflare (bot protection). Each is bound by data processing agreements and their own privacy policies.",
      },
      {
        subtitle: "Legal requirements",
        body: "We may disclose information if required to do so by law, court order, or government authority, or to protect the rights, property, or safety of Anphonic, our users, or the public.",
      },
      {
        subtitle: "Business transfers",
        body: "If Anphonic is involved in a merger, acquisition, or asset sale, your data may be transferred as part of that transaction. We will notify you before your data is transferred and becomes subject to a different privacy policy.",
      },
    ],
  },
  {
    id: "data-storage",
    title: "Data Storage and Retention",
    content: [
      {
        subtitle: "Where your data is stored",
        body: "All benchmark data is stored in a Google Cloud SQL database hosted in the asia-south1 (Mumbai, India) region. Analytics data is processed by Google and Microsoft on their respective global infrastructure.",
      },
      {
        subtitle: "How long we keep it",
        body: "We retain your benchmark data for as long as necessary to provide the service and for a reasonable period thereafter to support your follow-up requests. You can request deletion of your data at any time by emailing us at merchants@anphonic.ai and we will action it within 30 days.",
      },
      {
        subtitle: "Shopify tokens",
        body: "If you provided a Shopify access token, it is used once to pull your store metrics and is not stored in our database after your benchmark is generated. Revoke it from your Shopify Admin → Apps → Manage private apps at any time.",
      },
    ],
  },
  {
    id: "your-rights",
    title: "Your Rights",
    content: [
      {
        subtitle: "Access and correction",
        body: "You have the right to request a copy of the personal information we hold about you and to ask us to correct any inaccuracies.",
      },
      {
        subtitle: "Deletion",
        body: "You can request that we delete your account data and benchmark records at any time. Email merchants@anphonic.ai with the subject line 'Delete my data' and include the email address you used to sign up. We will confirm deletion within 30 days.",
      },
      {
        subtitle: "Opt-out of analytics",
        body: "You can opt out of Google Analytics tracking by installing the Google Analytics Opt-out Browser Add-on. You can opt out of Microsoft Clarity by visiting clarity.microsoft.com/optout.",
      },
      {
        subtitle: "Withdraw consent",
        body: "Where we rely on your consent to process data, you can withdraw that consent at any time without affecting the lawfulness of processing carried out before withdrawal.",
      },
    ],
  },
  {
    id: "cookies",
    title: "Cookies and Tracking",
    content: [
      {
        subtitle: "What we use",
        body: "We use first-party session storage to maintain your benchmark state across pages (so you don't lose progress). Google Analytics and Microsoft Clarity set their own cookies for analytics. Cloudflare Turnstile uses cookies for bot detection.",
      },
      {
        subtitle: "Managing cookies",
        body: "You can control cookies through your browser settings. Disabling cookies may affect how the benchmark form functions, particularly the multi-step flow. Analytics cookies can be blocked without affecting core functionality.",
      },
    ],
  },
  {
    id: "security",
    title: "Security",
    content: [
      {
        subtitle: "How we protect your data",
        body: "All data is transmitted over HTTPS. Our database is hosted on Google Cloud with private connectivity — it is not publicly accessible from the internet. Access is restricted to authenticated services only. We use Cloudflare Turnstile to prevent automated form submissions.",
      },
      {
        subtitle: "No system is perfect",
        body: "While we take reasonable measures to protect your information, no method of transmission over the internet or electronic storage is 100% secure. If you believe your information has been compromised, please contact us immediately at merchants@anphonic.ai.",
      },
    ],
  },
  {
    id: "children",
    title: "Children's Privacy",
    content: [
      {
        subtitle: "",
        body: "The Anphonic Benchmark is intended for business owners and marketing professionals. We do not knowingly collect personal information from anyone under the age of 18. If you believe we have inadvertently collected such information, please contact us and we will delete it immediately.",
      },
    ],
  },
  {
    id: "changes",
    title: "Changes to This Policy",
    content: [
      {
        subtitle: "",
        body: "We may update this Privacy Policy from time to time. When we do, we will revise the 'Last updated' date at the top of the page. For material changes, we will notify you by email or by placing a prominent notice on the benchmark homepage. Continued use of the service after changes constitutes your acceptance of the updated policy.",
      },
    ],
  },
];

export default function PrivacyPolicyPage() {
  const headerRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(headerRef.current,
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" }
      );
      gsap.fromTo(heroRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: "power2.out", delay: 0.15 }
      );
      if (contentRef.current) {
        const items = contentRef.current.querySelectorAll(".policy-section");
        gsap.fromTo(items,
          { y: 24, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.55, stagger: 0.08, ease: "power2.out", delay: 0.3 }
        );
      }
    });
    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen" style={{ background: CREAM }}>

      {/* Header */}
      <header
        ref={headerRef}
        className="flex justify-between items-center px-6 py-5 md:px-16 md:py-6 border-b border-[#E8E3DA] bg-[#F5F3EF]/80 backdrop-blur-sm sticky top-0 z-20"
      >
        <Link to="/">
          <Logo />
        </Link>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#DDD8CF] text-xs font-semibold text-[#6B7280] tracking-wide hover:border-[#14b8a6] hover:text-[#14b8a6] transition-colors bg-white/60"
        >
          ← Back to benchmark
        </Link>
      </header>

      {/* Hero */}
      <div ref={heroRef} className="px-6 md:px-16 pt-14 pb-10 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#DDD8CF] bg-white/70 mb-6">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: TEAL }} />
          <span className="text-[10px] font-semibold tracking-[0.18em] text-[#999]">LEGAL</span>
        </div>

        <h1
          className="text-4xl md:text-5xl font-normal leading-tight mb-4"
          style={{ fontFamily: "'Playfair Display', serif", color: NAVY }}
        >
          Privacy Policy
        </h1>
        <p className="text-sm text-[#9CA3AF] mb-2">
          Last updated: 15 June 2026
        </p>
        <p className="text-base text-[#6B7280] max-w-2xl leading-relaxed mt-4">
          Anphonic AI ("<strong>Anphonic</strong>", "<strong>we</strong>", "<strong>our</strong>") operates the D2C Shelf Benchmark at{" "}
          <span style={{ color: TEAL }}>benchmark.anphonic.ai</span>. This policy explains what data we collect, how we use it, and what rights you have over it.
          <br /><br />
          By using the benchmark, you agree to the practices described here.
        </p>

        {/* Table of contents */}
        <nav className="mt-10 p-5 rounded-2xl border border-[#E8E3DA] bg-white/60">
          <p className="text-[10px] font-semibold tracking-[0.18em] text-[#C0BAB0] uppercase mb-4">Contents</p>
          <ol className="space-y-2">
            {sections.map((s, i) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="text-sm hover:underline transition-colors"
                  style={{ color: TEAL }}
                >
                  {i + 1}. {s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </div>

      {/* Policy sections */}
      <div ref={contentRef} className="px-6 md:px-16 pb-24 max-w-4xl mx-auto space-y-12">
        {sections.map((section, i) => (
          <div key={section.id} id={section.id} className="policy-section scroll-mt-24">
            <div className="flex items-center gap-4 mb-6">
              <span
                className="text-[11px] font-bold tracking-[0.2em] w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-white"
                style={{ background: TEAL }}
              >
                {i + 1}
              </span>
              <h2
                className="text-2xl md:text-3xl font-normal"
                style={{ fontFamily: "'Playfair Display', serif", color: NAVY }}
              >
                {section.title}
              </h2>
            </div>

            <div className="ml-11 space-y-6">
              {section.content.map((block, j) => (
                <div key={j}>
                  {block.subtitle && (
                    <h3 className="text-sm font-semibold mb-2" style={{ color: NAVY }}>
                      {block.subtitle}
                    </h3>
                  )}
                  <p className="text-[15px] text-[#6B7280] leading-relaxed">{block.body}</p>
                </div>
              ))}
            </div>

            {i < sections.length - 1 && (
              <div className="mt-12 border-t border-[#E8E3DA]" />
            )}
          </div>
        ))}

        {/* Contact section */}
        <div className="policy-section mt-4 p-8 rounded-2xl border border-[#E8E3DA] bg-white/70">
          <h2
            className="text-2xl font-normal mb-3"
            style={{ fontFamily: "'Playfair Display', serif", color: NAVY }}
          >
            Contact Us
          </h2>
          <p className="text-[15px] text-[#6B7280] leading-relaxed mb-6">
            If you have questions about this Privacy Policy, want to exercise your data rights, or need to report a concern, contact us at:
          </p>
          <div className="space-y-2 text-sm">
            <p><span className="font-semibold text-[#0a1f3d]">Company:</span> <span className="text-[#6B7280]">Anphonic AI</span></p>
            <p>
              <span className="font-semibold text-[#0a1f3d]">Email:</span>{" "}
              <a href="mailto:merchants@anphonic.ai" className="hover:underline" style={{ color: TEAL }}>
                merchants@anphonic.ai
              </a>
            </p>
            <p><span className="font-semibold text-[#0a1f3d]">Website:</span> <span className="text-[#6B7280]">benchmark.anphonic.ai</span></p>
          </div>
          <p className="text-xs text-[#C0BAB0] mt-6">
            We aim to respond to all privacy-related requests within 14 business days.
          </p>
        </div>

        {/* Footer nav */}
        <div className="flex items-center justify-between pt-4 border-t border-[#E8E3DA]">
          <Link to="/" className="text-sm hover:underline" style={{ color: TEAL }}>
            ← Back to benchmark
          </Link>
          <Link to="/methodology" className="text-sm text-[#9CA3AF] hover:text-[#14b8a6] transition-colors">
            How we benchmark →
          </Link>
        </div>
      </div>
    </div>
  );
}
