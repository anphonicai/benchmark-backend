import { useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { ShoppingBag, FileText, ArrowLeft } from "lucide-react";
import Logo from "../components/Logo";
import gsap from "gsap";

export default function ConnectOrManualPage() {
  const navigate = useNavigate();
  const headerRef = useRef<HTMLElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.fromTo(headerRef.current, { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" });
    gsap.fromTo(mainRef.current, { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: 0.65, ease: "power2.out", delay: 0.2 });
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F3EF]">
      <header
        ref={headerRef}
        className="flex justify-between items-center px-6 py-5 md:px-16 md:py-6 border-b border-[#E8E3DA] bg-[#F5F3EF]/80 backdrop-blur-sm"
      >
        <Logo />
      </header>

      <main ref={mainRef} className="px-6 py-10 md:px-16 md:py-16 max-w-5xl mx-auto">
        {/* Step indicator */}
        <div className="inline-flex items-center gap-2 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-[#14b8a6]" />
          <span className="text-xs text-[#14b8a6] font-semibold tracking-[0.16em] uppercase">
            02 · How should we pull your data?
          </span>
        </div>

        <h1
          className="text-3xl md:text-5xl text-[#0a1f3d] mb-4 leading-tight"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Connect Shopify, or enter manually.
        </h1>
        <p className="text-[#6B7280] text-base md:text-lg mb-12 leading-relaxed max-w-xl">
          Connecting gives you a precise benchmark using real order and customer data.
          Manual entry takes 3 minutes and is less precise.
        </p>

        {/* Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-7">

          {/* Enter Manually — Recommended (first on mobile) */}
          <div
            onClick={() => navigate("/manual-entry")}
            className="relative bg-white border-2 border-[#14b8a6] rounded-2xl p-8 cursor-pointer hover:shadow-xl hover:shadow-[#14b8a6]/10 transition-all duration-200 shadow-sm order-first md:order-last"
          >
            <div className="absolute -top-3 left-7 bg-[#14b8a6] text-white text-[10px] font-semibold px-3 py-1 rounded-full tracking-wider uppercase">
              Recommended
            </div>
            <div className="w-12 h-12 bg-[#0a1f3d] rounded-xl flex items-center justify-center mb-6">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-[#0a1f3d] mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
              Enter manually
            </h2>
            <p className="text-[#6B7280] text-sm mb-8 leading-relaxed">
              Tell us your key metrics yourself. Useful if you'd rather not connect Shopify right now.
            </p>
            <div className="space-y-3">
              {[["TIME", "3 minutes"], ["PRECISION", "Estimate only"], ["OUTPUT", "Directional score"]].map(([k, v]) => (
                <div key={k} className="flex justify-between items-center">
                  <span className="text-xs text-[#C4BFB8] tracking-wider font-medium">{k}</span>
                  <span className="text-sm text-[#0a1f3d] font-medium">{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Connect Shopify — Coming Soon (second on mobile) */}
          <div className="relative bg-white border border-[#E8E3DA] rounded-2xl p-8 cursor-not-allowed opacity-50 shadow-sm order-last md:order-first">
            <div className="absolute -top-3 left-7 bg-[#9CA3AF] text-white text-[10px] font-semibold px-3 py-1 rounded-full tracking-wider uppercase">
              Coming Soon
            </div>
            <div className="w-12 h-12 bg-[#F3F0EB] rounded-xl flex items-center justify-center mb-6">
              <ShoppingBag className="w-5 h-5 text-[#9CA3AF]" />
            </div>
            <h2 className="text-xl font-semibold text-[#9CA3AF] mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
              Connect Shopify
            </h2>
            <p className="text-[#9CA3AF] text-sm mb-8 leading-relaxed">
              Read-only API token. We pull 90 days of order and customer data, compute your metrics, then disconnect.
            </p>
            <div className="space-y-3">
              {[["TIME", "60 seconds"], ["PRECISION", "High"], ["OUTPUT", "Verified benchmark"]].map(([k, v]) => (
                <div key={k} className="flex justify-between items-center">
                  <span className="text-xs text-[#C4BFB8] tracking-wider font-medium">{k}</span>
                  <span className="text-sm text-[#9CA3AF]">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Back */}
        <button
          onClick={() => navigate("/brand-info")}
          className="flex items-center gap-2 text-[#9CA3AF] hover:text-[#14b8a6] mt-12 transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
      </main>
    </div>
  );
}
