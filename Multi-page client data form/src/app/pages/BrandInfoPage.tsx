import { useState } from "react";
import { useNavigate } from "react-router";
import { AlertCircle, CheckCircle2, Loader2, XCircle } from "lucide-react";
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
  const [shopifyVerify, setShopifyVerify] = useState('idle' as 'idle' | 'checking' | 'valid' | 'invalid');
  const [shopifyVerifyMsg, setShopifyVerifyMsg] = useState('');

  const verifyShopifyUrl = async (url: string) => {
    setShopifyVerify('checking');
    setShopifyVerifyMsg('');
    try {
      const res = await fetch(`/api/companies/validate-shopify-url?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      if (data.isShopify) {
        setShopifyVerify('valid');
        setShopifyVerifyMsg('');
        setErrors((prev: Record<string, string>) => ({ ...prev, shopifyUrl: '' }));
      } else {
        setShopifyVerify('invalid');
        setShopifyVerifyMsg(data.message || 'This does not appear to be a Shopify store.');
      }
    } catch {
      setShopifyVerify('invalid');
      setShopifyVerifyMsg('Could not verify the URL. Please check your connection.');
    }
  };

  const validate = () => {
    const e: Record<string, string> = {};

    // Full name: letters, spaces, dots, hyphens only — no numbers
    if (!formData.fullName.trim()) {
      e.fullName = "Full name is required.";
    } else if (!/^[a-zA-Z\s.\-']+$/.test(formData.fullName.trim())) {
      e.fullName = "Name should contain only letters, spaces, or hyphens.";
    }

    if (!formData.role) e.role = "Please select your role.";

    if (!formData.email.trim()) {
      e.email = "Work email is required.";
    } else if (!/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(formData.email.trim())) {
      e.email = "Please enter a valid email address (e.g. rohan@yourbrand.com).";
    }

    // Phone: India or UAE, strip country code then validate core
    const phoneDigits = formData.phone.replace(/\D/g, "");
    let phoneCore = phoneDigits;
    let phoneCountry = "";

    // India: +91XXXXXXXXXX (12), 0XXXXXXXXXX (11), XXXXXXXXXX (10)
    if (phoneDigits.length === 12 && phoneDigits.startsWith("91") && /^[6-9]/.test(phoneDigits.slice(2))) {
      phoneCore = phoneDigits.slice(2); phoneCountry = "IN";
    } else if (phoneDigits.length === 11 && phoneDigits.startsWith("0") && /^[6-9]/.test(phoneDigits.slice(1))) {
      phoneCore = phoneDigits.slice(1); phoneCountry = "IN";
    } else if (phoneDigits.length === 10 && /^[6-9]/.test(phoneDigits)) {
      phoneCore = phoneDigits; phoneCountry = "IN";
    // UAE: +971XXXXXXXXX (12), 0XXXXXXXXX (10 with leading 0), XXXXXXXXX (9)
    } else if (phoneDigits.length === 12 && phoneDigits.startsWith("971") && phoneDigits[3] === "5") {
      phoneCore = phoneDigits.slice(3); phoneCountry = "AE";
    } else if (phoneDigits.length === 10 && phoneDigits.startsWith("05")) {
      phoneCore = phoneDigits.slice(1); phoneCountry = "AE";
    } else if (phoneDigits.length === 9 && phoneDigits.startsWith("5")) {
      phoneCore = phoneDigits; phoneCountry = "AE";
    }

    const indiaValid = phoneCountry === "IN" && /^[6-9]\d{9}$/.test(phoneCore);
    const uaeValid   = phoneCountry === "AE" && /^5\d{8}$/.test(phoneCore);
    const notFake    = !/(\d)\1{3}/.test(phoneCore) && new Set(phoneCore.split("")).size >= 4;

    if (!phoneDigits) {
      e.phone = "Phone number is required.";
    } else if (!indiaValid && !uaeValid) {
      e.phone = "Enter a valid Indian (10-digit) or UAE (+971 / 05X) mobile number.";
    } else if (!notFake) {
      e.phone = "Please enter a real mobile number.";
    }

    // Brand name: must contain letters, 2–100 chars
    if (!formData.brandName.trim()) {
      e.brandName = "Brand name is required.";
    } else if (formData.brandName.trim().length < 2) {
      e.brandName = "Brand name must be at least 2 characters.";
    } else if (formData.brandName.trim().length > 100) {
      e.brandName = "Brand name is too long (max 100 characters).";
    } else if (!/[a-zA-Z]/.test(formData.brandName.trim())) {
      e.brandName = "Brand name must contain at least some letters.";
    }

    // Shopify URL: must start with https://, valid domain, max 200 chars
    const shopifyTrimmed = formData.shopifyUrl.trim();
    const domainRegex = /^https:\/\/(([a-zA-Z0-9][a-zA-Z0-9\-]*\.)+[a-zA-Z]{2,})(\/[^\s]{0,200})?$/;
    if (!shopifyTrimmed) {
      e.shopifyUrl = "Shopify store URL is required.";
    } else if (shopifyTrimmed.length > 200) {
      e.shopifyUrl = "URL is too long. Please enter your store's main domain (e.g. https://yourbrand.com).";
    } else if (!domainRegex.test(shopifyTrimmed)) {
      e.shopifyUrl = "Please enter a valid URL starting with https:// (e.g. https://yourbrand.com).";
    } else if (shopifyVerify === 'invalid') {
      e.shopifyUrl = shopifyVerifyMsg || "This does not appear to be a Shopify store.";
    } else if (shopifyVerify === 'idle' || shopifyVerify === 'checking') {
      e.shopifyUrl = "Please wait — verifying your Shopify store URL.";
    }

    if (!formData.category) e.category = "Please select a category.";
    if (!formData.ordersPerMonth) e.ordersPerMonth = "Please select orders per month.";

    return e;
  };

  const handleBlur = (field: string) => {
    if (field === 'shopifyUrl') {
      const trimmed = formData.shopifyUrl.trim();
      const domainRegex = /^https:\/\/(([a-zA-Z0-9][a-zA-Z0-9\-]*\.)+[a-zA-Z]{2,})(\/[^\s]{0,200})?$/;
      if (trimmed && domainRegex.test(trimmed) && shopifyVerify === 'idle') {
        verifyShopifyUrl(trimmed);
        return;
      }
    }
    const result = validate();
    setErrors((prev) => ({ ...prev, [field]: result[field] || "" }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (shopifyVerify === 'checking') {
      setErrors((prev: Record<string, string>) => ({ ...prev, shopifyUrl: "Please wait — verifying your Shopify store URL." }));
      return;
    }
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
                type="text"
                inputMode="tel"
                placeholder="9876543210 or +971 501234567"
                value={formData.phone}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^\d+\s\-]/g, "").slice(0, 16);
                  setFormData((prev) => ({ ...prev, phone: val }));
                }}
                onBlur={() => handleBlur("phone")}
                className={inputClass(errors.phone)}
              />
              <p className="text-xs text-[#999] mt-1">India or UAE numbers accepted</p>
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
            <div className="relative">
              <input
                type="text"
                placeholder="https://yourbrand.com"
                value={formData.shopifyUrl}
                onChange={(e) => {
                  setFormData({ ...formData, shopifyUrl: e.target.value });
                  setShopifyVerify('idle');
                  setShopifyVerifyMsg('');
                }}
                onBlur={() => handleBlur("shopifyUrl")}
                className={inputClass(errors.shopifyUrl) + " pr-10"}
              />
              {shopifyVerify === 'checking' && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999] animate-spin" />
              )}
              {shopifyVerify === 'valid' && (
                <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
              )}
              {shopifyVerify === 'invalid' && (
                <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
              )}
            </div>
            {shopifyVerify === 'checking' && (
              <p className="text-xs text-[#999] mt-1">Verifying Shopify store...</p>
            )}
            {shopifyVerify === 'valid' && (
              <p className="text-xs text-green-600 mt-1">Shopify store verified.</p>
            )}
            {shopifyVerify !== 'checking' && shopifyVerify !== 'valid' && (
              <p className="text-sm text-[#999] mt-2">Must start with https:// — e.g. https://yourbrand.com</p>
            )}
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
