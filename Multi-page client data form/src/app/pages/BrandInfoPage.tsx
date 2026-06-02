import { useState } from "react";
import { useNavigate } from "react-router";
import { AlertCircle } from "lucide-react";
import Logo from "../components/Logo";

export default function BrandInfoPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    role: "",
    email: "",
    phone: "",
    brandName: "",
    shopifyUrl: "",
    category: "",
    ordersPerMonth: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // persist brand info to localStorage
    try {
      localStorage.setItem('brandInfo', JSON.stringify(formData));
    } catch (e) {
      console.warn('Failed to save brand info to localStorage', e);
    }

    // Send brand info to backend to store in database
    fetch('/api/companies/brand-info', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success) {
          console.log('Brand info saved to database:', data.companyId);
          // Store companyId in localStorage for later use
          try {
            localStorage.setItem('companyId', String(data.companyId));
          } catch (e) {
            console.warn('Failed to save companyId to localStorage', e);
          }
        } else {
          console.warn('Failed to save brand info to database:', data?.message);
        }
        // Navigate regardless of DB save success (localStorage was successful)
        navigate("/connect-or-manual");
      })
      .catch((err) => {
        console.error('Error posting brand info:', err);
        // Still navigate if localStorage was successful
        navigate("/connect-or-manual");
      });
  };

  return (
    <div className="min-h-screen bg-[#f8f6f3]">
      {/* Header */}
      <header className="px-12 py-6">
        <Logo />
      </header>

      {/* Main Content */}
      <main className="px-12 py-16 max-w-3xl mx-auto">
        {/* Step Indicator */}
        <div className="text-sm text-[#999] mb-6">01 · WHO ARE WE BENCHMARKING?</div>

        {/* Title */}
        <h1 className="text-5xl mb-4">Tell us about your brand.</h1>
        <p className="text-[#666] text-lg mb-12">
          We use this to send your benchmark report and connect you with the right
          <br />
          person on our team if you want a deeper diagnostic.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-[#666] mb-2">
                FULL NAME <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Rohan Kapoor"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-[#d4d4d4] rounded-lg focus:outline-none focus:border-[#1a1a1a]"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-[#666] mb-2">
                ROLE <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-[#d4d4d4] rounded-lg focus:outline-none focus:border-[#1a1a1a] appearance-none"
                required
              >
                <option value="">Select your role</option>
                <option value="Founder/CEO">Founder/CEO</option>
                <option value="Co-Founder">Co-Founder</option>
                <option value="Head Of Growth">Head Of Growth</option>
                <option value="Head of E-Commerce">Head of E-Commerce</option>
                <option value="Marketing Lead">Marketing Lead</option>
                <option value="Operational Lead">Operational Lead</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-[#666] mb-2">
                WORK EMAIL <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                placeholder="rohan@yourbrand.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-[#d4d4d4] rounded-lg focus:outline-none focus:border-[#1a1a1a]"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-[#666] mb-2">
                PHONE <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-[#d4d4d4] rounded-lg focus:outline-none focus:border-[#1a1a1a]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-[#666] mb-2">
              BRAND NAME <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Your D2C brand"
              value={formData.brandName}
              onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
              className="w-full px-4 py-3 bg-white border border-[#d4d4d4] rounded-lg focus:outline-none focus:border-[#1a1a1a]"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-[#666] mb-2">
              SHOPIFY STORE URL <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="yourbrand.myshopify.com or yourbrand.com"
              value={formData.shopifyUrl}
              onChange={(e) => setFormData({ ...formData, shopifyUrl: e.target.value })}
              className="w-full px-4 py-3 bg-white border border-[#d4d4d4] rounded-lg focus:outline-none focus:border-[#1a1a1a]"
              required
            />
            <p className="text-sm text-[#999] mt-2">
              We'll use this to fetch your real-only Shopify data in the next step.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-[#666] mb-2">
                CATEGORY <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-[#d4d4d4] rounded-lg focus:outline-none focus:border-[#1a1a1a] appearance-none"
                required
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
                ORDERS PER MONTH <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.ordersPerMonth}
                onChange={(e) => setFormData({ ...formData, ordersPerMonth: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-[#d4d4d4] rounded-lg focus:outline-none focus:border-[#1a1a1a] appearance-none"
                required
              >
                <option value="">Select range</option>
                <option value="Under 500">Under 500</option>
                <option value="500 to 2000">500 to 2,000</option>
                <option value="2000 to 5000">2,000 to 5,000</option>
                <option value="5000 to 15000">5,000 to 15,000</option>
                <option value="15000 to 50000">15,000 to 50,000</option>
                <option value="Over 50000">Over 50,000</option>
              </select>
            </div>
          </div>

          {/* Warning Message */}
          <div className="flex gap-3 p-4 bg-[#fff4e6] border border-[#ffd699] rounded-lg">
            <AlertCircle className="w-5 h-5 text-[#ff9800] flex-shrink-0 mt-0.5" />
            <p className="text-sm text-[#666]">
              Your data stays anonymous in benchmarks. We never resell or expose individual brand metrics.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-[#1a1a1a] text-white px-8 py-4 rounded-lg hover:bg-[#333] transition-colors"
          >
            Continue
          </button>
        </form>
      </main>
    </div>
  );
}
