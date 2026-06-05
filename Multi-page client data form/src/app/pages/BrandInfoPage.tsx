import { useState } from "react";
import { useNavigate } from "react-router";
import { AlertCircle } from "lucide-react";
import Logo from "../components/Logo";

const inputClass = (error: string) =>
  `w-full px-4 py-3 bg-white border rounded-lg focus:outline-none transition-colors ${
    error ? "border-red-400 focus:border-red-500" : "border-[#d4d4d4] focus:border-[#1a1a1a]"
  }`;

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

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};

    // Full name: letters, spaces, dots, hyphens only — no numbers
    if (!formData.fullName.trim()) {
      e.fullName = "Full name is required.";
    } else if (!/^[a-zA-Z\s.\-']+$/.test(formData.fullName.trim())) {
      e.fullName = "Name should contain only letters, spaces, or hyphens.";
    }

    if (!formData.role) e.role = "Please select your role.";

    if (!formData.email.trim()) e.email = "Work email is required.";

    // Phone: required check only — format validation happens on the backend
    if (!formData.phone.trim()) {
      e.phone = "Phone number is required.";
    }

    if (!formData.brandName.trim()) e.brandName = "Brand name is required.";

    // Shopify URL: must start with https:// or www.
    const shopifyTrimmed = formData.shopifyUrl.trim();
    const validShopify = /^(https?:\/\/|www\.)\S+\.\S+/.test(shopifyTrimmed);
    if (!shopifyTrimmed) {
      e.shopifyUrl = "Shopify store URL is required.";
    } else if (!validShopify) {
      e.shopifyUrl = "Please enter a valid URL starting with https:// or www. (e.g. https://yourbrand.com)";
    }

    if (!formData.category) e.category = "Please select a category.";
    if (!formData.ordersPerMonth) e.ordersPerMonth = "Please select orders per month.";

    return e;
  };

  const handleBlur = (field: string) => {
    const result = validate();
    setErrors((prev) => ({ ...prev, [field]: result[field] || "" }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = validate();
    if (Object.keys(result).length > 0) {
      setErrors(result);
      return;
    }

    // Normalise phone to digits only before saving
    const cleanedPhone = formData.phone.replace(/\D/g, "");
    const cleanedData = { ...formData, phone: cleanedPhone };

    try {
      localStorage.setItem('brandInfo', JSON.stringify(cleanedData));
    } catch {
      console.warn('Failed to save brand info to localStorage');
    }

    fetch('/api/companies/brand-info', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cleanedData),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success) {
          try { localStorage.setItem('companyId', String(data.companyId)); } catch {}
          navigate("/connect-or-manual");
        } else if (data && data.field) {
          // Backend field-level error (e.g. invalid phone)
          setErrors((prev) => ({ ...prev, [data.field]: data.message }));
        } else {
          navigate("/connect-or-manual");
        }
      })
      .catch(() => navigate("/connect-or-manual"));
  };

  return (
    <div className="min-h-screen bg-[#f8f6f3]">
      <header className="px-4 py-4 md:px-12 md:py-6">
        <Logo />
      </header>

      <main className="px-4 py-8 md:px-12 md:py-16 max-w-3xl mx-auto">
        <div className="text-sm text-[#999] mb-6">01 · WHO ARE WE BENCHMARKING?</div>

        <h1 className="text-3xl md:text-5xl mb-4">Tell us about your brand.</h1>
        <p className="text-[#666] text-base md:text-lg mb-8 md:mb-12">
          We use this to send your benchmark report and connect you with the right
          <br />
          person on our team if you want a deeper diagnostic.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {/* Row 1 — Name + Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-[#666] mb-2">
                FULL NAME <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Rohan Kapoor"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                onBlur={() => handleBlur("fullName")}
                className={inputClass(errors.fullName)}
              />
              {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
            </div>
            <div>
              <label className="block text-sm text-[#666] mb-2">
                ROLE <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                onBlur={() => handleBlur("role")}
                className={inputClass(errors.role) + " appearance-none"}
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
              {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
            </div>
          </div>

          {/* Row 2 — Email + Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-[#666] mb-2">
                WORK EMAIL <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                placeholder="rohan@yourbrand.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                onBlur={() => handleBlur("email")}
                className={inputClass(errors.email)}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-sm text-[#666] mb-2">
                PHONE <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                placeholder="9876543210"
                maxLength={10}
                value={formData.phone}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^\d+\s\-]/g, "").slice(0, 15);
                  setFormData({ ...formData, phone: val });
                }}
                onBlur={() => handleBlur("phone")}
                className={inputClass(errors.phone)}
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>
          </div>

          {/* Brand Name */}
          <div>
            <label className="block text-sm text-[#666] mb-2">
              BRAND NAME <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Your D2C brand"
              value={formData.brandName}
              onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
              onBlur={() => handleBlur("brandName")}
              className={inputClass(errors.brandName)}
            />
            {errors.brandName && <p className="text-red-500 text-xs mt-1">{errors.brandName}</p>}
          </div>

          {/* Shopify URL */}
          <div>
            <label className="block text-sm text-[#666] mb-2">
              SHOPIFY STORE URL <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="https://yourbrand.com or www.yourbrand.com"
              value={formData.shopifyUrl}
              onChange={(e) => setFormData({ ...formData, shopifyUrl: e.target.value })}
              onBlur={() => handleBlur("shopifyUrl")}
              className={inputClass(errors.shopifyUrl)}
            />
            <p className="text-sm text-[#999] mt-2">
              Must start with https:// or www. — e.g. https://yourbrand.com
            </p>
            {errors.shopifyUrl && <p className="text-red-500 text-xs mt-1">{errors.shopifyUrl}</p>}
          </div>

          {/* Category + Orders per month */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-[#666] mb-2">
                CATEGORY <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                onBlur={() => handleBlur("category")}
                className={inputClass(errors.category) + " appearance-none"}
              >
                <option value="">Select category</option>
                <option value="Food & Beverage">Food & Beverage</option>
                <option value="Wellness & Supplements">Wellness & Supplements</option>
                <option value="Other">Other</option>
              </select>
              {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
            </div>
            <div>
              <label className="block text-sm text-[#666] mb-2">
                ORDERS PER MONTH <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.ordersPerMonth}
                onChange={(e) => setFormData({ ...formData, ordersPerMonth: e.target.value })}
                onBlur={() => handleBlur("ordersPerMonth")}
                className={inputClass(errors.ordersPerMonth) + " appearance-none"}
              >
                <option value="">Select range</option>
                <option value="Under 500">Under 500</option>
                <option value="500 to 2000">500 to 2,000</option>
                <option value="2000 to 5000">2,000 to 5,000</option>
                <option value="5000 to 15000">5,000 to 15,000</option>
                <option value="15000 to 50000">15,000 to 50,000</option>
                <option value="Over 50000">Over 50,000</option>
              </select>
              {errors.ordersPerMonth && <p className="text-red-500 text-xs mt-1">{errors.ordersPerMonth}</p>}
            </div>
          </div>

          {/* Warning */}
          <div className="flex gap-3 p-4 bg-[#fff4e6] border border-[#ffd699] rounded-lg">
            <AlertCircle className="w-5 h-5 text-[#ff9800] flex-shrink-0 mt-0.5" />
            <p className="text-sm text-[#666]">
              Your data stays anonymous in benchmarks. We never resell or expose individual brand metrics.
            </p>
          </div>

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
