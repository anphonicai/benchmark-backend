import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import Logo from "../components/Logo";
import Chatbot from "../components/Chatbot";
import gsap from "gsap";

export default function ManualDataEntryPage() {
  const navigate = useNavigate();
  const headerRef = useRef<HTMLElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    category: "",
    averageOrderValue: "",
    estimatedOrdersPerMonth: "",
    addToCartRate: "",
    repeatRevenueShare: "",
    timeTo2ndOrder: "",
    loyalty: "",
    postPurchaseUpsell: "",
    whatsappTool: "",
  });

  useEffect(() => {
    gsap.fromTo(headerRef.current, { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" });
    gsap.fromTo(mainRef.current, { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: 0.65, ease: "power2.out", delay: 0.2 });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const brandInfoRaw = localStorage.getItem('brandInfo');
    const brandInfo = brandInfoRaw ? JSON.parse(brandInfoRaw) : {};
    const existingCompanyId = localStorage.getItem('companyId');

    const payload = {
      company_name: brandInfo.brandName || brandInfo.company_name || 'Manual Brand',
      website: brandInfo.shopifyUrl || brandInfo.website || null,
      tier: null,
      contact_name: brandInfo.fullName || null,
      contact_email: brandInfo.email || null,
      phone: brandInfo.phone || null,
      cluster: null,
      category: formData.category || brandInfo.category || null,
      shopify_store_url: brandInfo.shopifyUrl || null,
      company_id: existingCompanyId ? Number(existingCompanyId) : undefined,
      repeat_rate_90d_pct: null,
      repeat_revenue_pct: Number(formData.repeatRevenueShare) || null,
      time_to_2nd_order_days_median: Number(formData.timeTo2ndOrder) || null,
      rebuy_revenue_share_pct: null,
      personalisation_aov_lift_pct: null,
      add_to_cart_rate: Number(formData.addToCartRate) || null,
      average_order_value: Number(formData.averageOrderValue) || null,
      orders_per_month: Number(formData.estimatedOrdersPerMonth) || null,
      loyalty: formData.loyalty || null,
      postPurchaseUpsell: formData.postPurchaseUpsell || null,
      whatsappTool: formData.whatsappTool || null,
    };

    fetch('/api/companies/benchmark/manual', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success) {
          try {
            if (data.companyId) localStorage.setItem('lastCompanyId', String(data.companyId));
            localStorage.setItem('lastReport', JSON.stringify(data));
          } catch (e) {
            console.warn('Failed to save report to localStorage', e);
          }
          navigate('/benchmark-report');
        } else {
          alert(data.message || 'Failed to calculate report');
        }
      })
      .catch((err) => {
        console.error('Error posting manual benchmark', err);
        alert('Error submitting data');
      });
  };

  const inputCls = "w-full px-4 py-3 bg-white border border-[#E8E3DA] rounded-xl focus:outline-none focus:border-[#14b8a6] transition-colors text-[#0a1f3d] placeholder:text-[#C4BFB8]";
  const selectCls = inputCls + " appearance-none";

  return (
    <div className="min-h-screen bg-[#F5F3EF]">
      <Chatbot />
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
            03 · Tell us your numbers
          </span>
        </div>

        <h1
          className="text-2xl md:text-4xl text-[#0a1f3d] mb-4 leading-tight"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Manual Benchmark
        </h1>
        <p className="text-[#6B7280] text-base md:text-lg mb-10 leading-relaxed max-w-xl">
          Six questions, three minutes. Use rough estimates if you don't have exact figures.
          We'll benchmark you directionally against the cohort.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white border border-[#E8E3DA] rounded-2xl p-6 md:p-8 shadow-sm space-y-6">

            {/* Section label */}
            <div className="text-[10px] text-[#C4BFB8] tracking-[0.2em] uppercase font-medium pb-2 border-b border-[#F3F0EB]">
              Store Metrics
            </div>

            {/* Row 1 — Category | AOV */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-[#6B7280] tracking-[0.12em] uppercase mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className={selectCls}
                >
                  <option value="">Select category</option>
                  <option value="Food & Beverage">Food & Beverage</option>
                  <option value="Wellness & Supplements">Wellness & Supplements</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#6B7280] tracking-[0.12em] uppercase mb-2">
                  Average Order Value (INR)
                </label>
                <input
                  type="number"
                  placeholder="e.g., 1200"
                  value={formData.averageOrderValue}
                  onChange={(e) => setFormData({ ...formData, averageOrderValue: e.target.value })}
                  className={inputCls}
                />
              </div>
            </div>

            {/* Row 2 — OPM | Add to Cart % */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-[#6B7280] tracking-[0.12em] uppercase mb-2">
                  Estimated Orders / Month
                </label>
                <input
                  type="number"
                  placeholder="e.g., 2500"
                  value={formData.estimatedOrdersPerMonth}
                  onChange={(e) => setFormData({ ...formData, estimatedOrdersPerMonth: e.target.value })}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#6B7280] tracking-[0.12em] uppercase mb-2">
                  Add to Cart Rate (%) <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g., 8"
                  value={formData.addToCartRate}
                  onChange={(e) => setFormData({ ...formData, addToCartRate: e.target.value })}
                  className={inputCls}
                  required
                />
              </div>
            </div>

            {/* Row 3 — Repeat Revenue | Time to 2nd */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-[#6B7280] tracking-[0.12em] uppercase mb-2">
                  Repeat Revenue Share (%) <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g., 31"
                  value={formData.repeatRevenueShare}
                  onChange={(e) => setFormData({ ...formData, repeatRevenueShare: e.target.value })}
                  className={inputCls}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#6B7280] tracking-[0.12em] uppercase mb-2">
                  Time to 2nd Order (days) <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  placeholder="e.g., 45"
                  value={formData.timeTo2ndOrder}
                  onChange={(e) => setFormData({ ...formData, timeTo2ndOrder: e.target.value })}
                  className={inputCls}
                  required
                />
              </div>
            </div>

            {/* Section label */}
            <div className="text-[10px] text-[#C4BFB8] tracking-[0.2em] uppercase font-medium pt-2 pb-2 border-b border-[#F3F0EB]">
              Retention Tools
            </div>

            {/* Row 4 — Tools */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-semibold text-[#6B7280] tracking-[0.12em] uppercase mb-2">
                  Loyalty
                </label>
                <select
                  value={formData.loyalty}
                  onChange={(e) => setFormData({ ...formData, loyalty: e.target.value })}
                  className={selectCls}
                >
                  <option value="">Select option</option>
                  <option value="Nector">Nector</option>
                  <option value="Pop Coin">Pop Coin</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#6B7280] tracking-[0.12em] uppercase mb-2">
                  Post-purchase Upsell
                </label>
                <select
                  value={formData.postPurchaseUpsell}
                  onChange={(e) => setFormData({ ...formData, postPurchaseUpsell: e.target.value })}
                  className={selectCls}
                >
                  <option value="">Select option</option>
                  <option value="Yes, fully implemented">Yes, fully implemented</option>
                  <option value="Partially implemented">Partially implemented</option>
                  <option value="None">None</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#6B7280] tracking-[0.12em] uppercase mb-2">
                  WhatsApp Tool
                </label>
                <select
                  value={formData.whatsappTool}
                  onChange={(e) => setFormData({ ...formData, whatsappTool: e.target.value })}
                  className={selectCls}
                >
                  <option value="">Select option</option>
                  <option value="Interakt">Interakt</option>
                  <option value="Wati">Wati</option>
                  <option value="Aisensy">Aisensy</option>
                  <option value="Bik/Doubletik">Bik/Doubletik</option>
                  <option value="Kwick Engage">Kwick Engage</option>
                  <option value="Bitespeed">Bitespeed</option>
                  <option value="None">None</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#0a1f3d] text-white px-8 py-4 rounded-xl hover:bg-[#162d57] transition-all duration-200 font-medium tracking-widest shadow-lg shadow-black/10 hover:shadow-xl"
          >
            CALCULATE SHELF SCORE
          </button>
        </form>

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
