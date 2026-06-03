import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import Logo from "../components/Logo";

export default function ManualDataEntryPage() {
  const navigate = useNavigate();
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

  const inputCls = "w-full px-4 py-3 bg-white border border-[#d4d4d4] rounded-lg focus:outline-none focus:border-[#1a1a1a]";

  return (
    <div className="min-h-screen bg-[#f8f6f3]">
      <header className="px-12 py-6">
        <Logo />
      </header>

      <main className="px-12 py-16 max-w-5xl mx-auto">
        <div className="text-sm text-[#999] mb-6">03 · TELL US YOUR NUMBERS</div>

        <h1 className="text-4xl mb-4">Manual Benchmark</h1>
        <p className="text-[#666] text-lg mb-12">
          Six questions, three minutes.
          <br />
          Use rough estimates if you don't have exact figures. We'll benchmark you directionally against the cohort.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-2xl p-8 space-y-6">

            {/* Row 1 — Category | AOV */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-[#666] mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className={inputCls + " appearance-none"}
                >
                  <option value="">Select category</option>
                  <option value="Food & Beverage">Food & Beverage</option>
                  <option value="Wellness & Supplements">Wellness & Supplements</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-[#666] mb-2">Average order value (INR)</label>
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
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-[#666] mb-2">Estimated orders / month</label>
                <input
                  type="number"
                  placeholder="e.g., 2500"
                  value={formData.estimatedOrdersPerMonth}
                  onChange={(e) => setFormData({ ...formData, estimatedOrdersPerMonth: e.target.value })}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-sm text-[#666] mb-2">
                  Add to cart rate (%) <span className="text-red-500">*</span>
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

            {/* Row 3 — Repeat Revenue Share % | Time to 2nd */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-[#666] mb-2">
                  Repeat revenue share (%) <span className="text-red-500">*</span>
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
                <label className="block text-sm text-[#666] mb-2">
                  Time to 2nd order (days) <span className="text-red-500">*</span>
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

            {/* Row 4 — Tools */}
            <div className="grid grid-cols-3 gap-6">
              <div>
                <label className="block text-sm text-[#666] mb-2">Loyalty</label>
                <select
                  value={formData.loyalty}
                  onChange={(e) => setFormData({ ...formData, loyalty: e.target.value })}
                  className={inputCls + " appearance-none"}
                >
                  <option value="">Select option</option>
                  <option value="Nector">Nector</option>
                  <option value="Pop Coin">Pop Coin</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-[#666] mb-2">Post-purchase upsell</label>
                <select
                  value={formData.postPurchaseUpsell}
                  onChange={(e) => setFormData({ ...formData, postPurchaseUpsell: e.target.value })}
                  className={inputCls + " appearance-none"}
                >
                  <option value="">Select option</option>
                  <option value="Yes, fully implemented">Yes, fully implemented</option>
                  <option value="Partially implemented">Partially implemented</option>
                  <option value="None">None</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-[#666] mb-2">WhatsApp tool</label>
                <select
                  value={formData.whatsappTool}
                  onChange={(e) => setFormData({ ...formData, whatsappTool: e.target.value })}
                  className={inputCls + " appearance-none"}
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
            className="w-full bg-[#0066ff] text-white px-8 py-4 rounded-lg hover:bg-[#0052cc] transition-colors"
          >
            CALCULATE SHELF SCORE
          </button>
        </form>

        <button
          onClick={() => navigate("/connect-or-manual")}
          className="flex items-center gap-2 text-[#666] hover:text-[#1a1a1a] mt-12 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
      </main>
    </div>
  );
}
