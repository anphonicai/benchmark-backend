import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import Logo from "../components/Logo";

export default function ManualDataEntryPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    category: "",
    repeatRate90d: "",
    repeatRevenueShare: "",
    timeTo2ndOrder: "",
    averageOrderValue: "",
    estimatedOrdersPerMonth: "",
    loyalty: "",
    postPurchaseUpsell: "",
    whatsappTool: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Load saved brand info from previous step
    const brandInfoRaw = localStorage.getItem('brandInfo');
    const brandInfo = brandInfoRaw ? JSON.parse(brandInfoRaw) : {};

    // Reuse companyId from BrandInfoPage if available (avoids duplicate company row)
    const existingCompanyId = localStorage.getItem('companyId');

    // Build payload expected by backend `/api/companies/benchmark/manual`
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
      // Manual metric fields
      repeat_rate_90d_pct: Number(formData.repeatRate90d) || null,
      repeat_revenue_pct: Number(formData.repeatRevenueShare) || null,
      time_to_2nd_order_days_median: Number(formData.timeTo2ndOrder) || null,
      rebuy_revenue_share_pct: null,
      personalisation_aov_lift_pct: null,
      average_order_value: Number(formData.averageOrderValue) || null,
      orders_per_month: Number(formData.estimatedOrdersPerMonth) || null,
      loyalty: formData.loyalty || null,
      postPurchaseUpsell: formData.postPurchaseUpsell || null,
      whatsappTool: formData.whatsappTool || null,
    };

    // Post to backend and save returned companyId/report
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
            // Save the entire response as the report (it includes shelf_score, gaps, metrics_vs_cohort, verdict, etc.)
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

  return (
    <div className="min-h-screen bg-[#f8f6f3]">
      {/* Header */}
      <header className="px-12 py-6">
        <Logo />
      </header>

      {/* Main Content */}
      <main className="px-12 py-16 max-w-5xl mx-auto">
        {/* Step Indicator */}
        <div className="text-sm text-[#999] mb-6">03 · TELL US YOUR NUMBERS</div>

        {/* Title */}
        <h1 className="text-4xl mb-4">Manual Benchmark</h1>
        <p className="text-[#666] text-lg mb-12">
          Four questions, two minutes.
          <br />
          Use rough estimates if you don't have exact figures. We'll benchmark you directionally against the cohort.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Grid Layout */}
          <div className="bg-white rounded-2xl p-8 space-y-6">
            {/* Row 1 */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-[#666] mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-[#d4d4d4] rounded-lg focus:outline-none focus:border-[#1a1a1a] appearance-none"
                >
                  <option value="">Select category</option>
                  <option value="Food & Beverage">Food & Beverage</option>
                  <option value="Beauty & Personal Care">Beauty & Personal Care</option>
                  <option value="Wellness & Supplements">Wellness & Supplements</option>
                  <option value="Apparel & Accessories">Apparel & Accessories</option>
                  <option value="Home & Lifestyle">Home & Lifestyle</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-[#666] mb-2">
                  Repeat rate 90d (%) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g., 22"
                  value={formData.repeatRate90d}
                  onChange={(e) => setFormData({ ...formData, repeatRate90d: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-[#d4d4d4] rounded-lg focus:outline-none focus:border-[#1a1a1a]"
                  required
                />
              </div>
            </div>

            {/* Row 2 */}
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
                  className="w-full px-4 py-3 bg-white border border-[#d4d4d4] rounded-lg focus:outline-none focus:border-[#1a1a1a]"
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
                  className="w-full px-4 py-3 bg-white border border-[#d4d4d4] rounded-lg focus:outline-none focus:border-[#1a1a1a]"
                  required
                />
              </div>
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-[#666] mb-2">Average order value (INR)</label>
                <input
                  type="number"
                  placeholder="e.g., 1200"
                  value={formData.averageOrderValue}
                  onChange={(e) => setFormData({ ...formData, averageOrderValue: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-[#d4d4d4] rounded-lg focus:outline-none focus:border-[#1a1a1a]"
                />
              </div>
              <div>
                <label className="block text-sm text-[#666] mb-2">Estimated orders / month</label>
                <input
                  type="number"
                  placeholder="e.g., 2500"
                  value={formData.estimatedOrdersPerMonth}
                  onChange={(e) => setFormData({ ...formData, estimatedOrdersPerMonth: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-[#d4d4d4] rounded-lg focus:outline-none focus:border-[#1a1a1a]"
                />
              </div>
            </div>

            {/* Row 5 - Dropdowns */}
            <div className="grid grid-cols-3 gap-6">
              <div>
                <label className="block text-sm text-[#666] mb-2">Loyalty</label>
                <select
                  value={formData.loyalty}
                  onChange={(e) => setFormData({ ...formData, loyalty: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-[#d4d4d4] rounded-lg focus:outline-none focus:border-[#1a1a1a] appearance-none"
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
                  className="w-full px-4 py-3 bg-white border border-[#d4d4d4] rounded-lg focus:outline-none focus:border-[#1a1a1a] appearance-none"
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
                  className="w-full px-4 py-3 bg-white border border-[#d4d4d4] rounded-lg focus:outline-none focus:border-[#1a1a1a] appearance-none"
                >
                  <option value="">Select option</option>
                  <option value="Interakt">Interakt</option>
                  <option value="Wati">Wati</option>
                  <option value="Aisensy">Aisensy</option>
                  <option value="Bik/Doubletik">Bik/Doubletik</option>
                  <option value="Quick engagement">Quick engagement</option>
                  <option value="Bitespeed">Bitespeed</option>
                  <option value="None">None</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-[#0066ff] text-white px-8 py-4 rounded-lg hover:bg-[#0052cc] transition-colors"
          >
            CALCULATE SHELF SCORE
          </button>
        </form>

        {/* Back Button */}
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
