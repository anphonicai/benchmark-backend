import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import Logo from "../components/Logo";
import gsap from "gsap";

export default function ShopifyConnectionPage() {
  const navigate = useNavigate();
  const headerRef = useRef<HTMLElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    accessToken: "",
    storeDomain: "",
  });

  useEffect(() => {
    gsap.fromTo(headerRef.current, { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" });
    gsap.fromTo(mainRef.current, { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: 0.65, ease: "power2.out", delay: 0.2 });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/benchmark-report");
  };

  const inputCls = "w-full px-4 py-3 bg-white border border-[#E8E3DA] rounded-xl focus:outline-none focus:border-[#14b8a6] transition-colors text-[#0a1f3d] placeholder:text-[#C4BFB8]";

  return (
    <div className="min-h-screen bg-[#F5F3EF]">
      <header
        ref={headerRef}
        className="flex justify-between items-center px-6 py-5 md:px-16 md:py-6 border-b border-[#E8E3DA] bg-[#F5F3EF]/80 backdrop-blur-sm"
      >
        <Logo />
      </header>

      <main ref={mainRef} className="px-6 py-10 md:px-16 md:py-16 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-[#14b8a6]" />
          <span className="text-xs text-[#14b8a6] font-semibold tracking-[0.16em] uppercase">
            Shopify Connect
          </span>
        </div>

        <h1
          className="text-2xl md:text-4xl text-[#0a1f3d] mb-4 leading-tight"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Shopify Benchmark
        </h1>
        <p className="text-[#6B7280] text-base md:text-lg mb-10 leading-relaxed">
          Paste a Shopify access token and store domain to fetch benchmark metrics for one store.
        </p>

        <div className="bg-white border border-[#E8E3DA] rounded-2xl p-6 md:p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-[#6B7280] tracking-[0.12em] uppercase mb-2">
                Shopify Access Token <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                placeholder="shpat_..."
                value={formData.accessToken}
                onChange={(e) => setFormData({ ...formData, accessToken: e.target.value })}
                className={inputCls}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#6B7280] tracking-[0.12em] uppercase mb-2">
                Store Domain or URL <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                placeholder="yourbrand.myshopify.com"
                value={formData.storeDomain}
                onChange={(e) => setFormData({ ...formData, storeDomain: e.target.value })}
                className={inputCls}
                required
              />
            </div>

            <div className="flex gap-3 p-4 bg-[#e6faf9] border border-[#a8dbd8] rounded-xl">
              <span className="w-1.5 h-1.5 rounded-full bg-[#14b8a6] flex-shrink-0 mt-1" />
              <p className="text-sm text-[#6B7280] leading-relaxed">
                We'll fetch read-only data from your Shopify store to calculate your benchmark metrics.
                Your data is encrypted and never shared with third parties.
              </p>
            </div>

            <button
              type="submit"
              className="w-full bg-[#0a1f3d] text-white px-8 py-4 rounded-xl hover:bg-[#162d57] transition-all duration-200 font-medium tracking-wide shadow-lg shadow-black/10 hover:shadow-xl"
            >
              Connect & Calculate Benchmark
            </button>
          </form>
        </div>

        <button
          onClick={() => navigate("/connect-or-manual")}
          className="flex items-center gap-2 text-[#9CA3AF] hover:text-[#14b8a6] mt-10 transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
      </main>
    </div>
  );
}
