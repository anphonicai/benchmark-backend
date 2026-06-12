import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { AlertCircle, CheckCircle2, Loader2, XCircle } from "lucide-react";
import Logo from "../components/Logo";
import gsap from "gsap";

const inputClass = (error: string) =>
  `w-full px-4 py-3 bg-white border rounded-xl focus:outline-none transition-colors text-[#0a1f3d] placeholder:text-[#C4BFB8] ${
    error ? "border-red-300 focus:border-red-400" : "border-[#E8E3DA] focus:border-[#14b8a6]"
  }`;

export default function BrandInfoPage() {
  const navigate = useNavigate();
  const headerRef = useRef<HTMLElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);

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
  const [emailVerify, setEmailVerify] = useState('idle' as 'idle' | 'sending' | 'sent' | 'verifying' | 'verified');
  const [emailVerifyMsg, setEmailVerifyMsg] = useState('');
  const [otpCode, setOtpCode] = useState('');

  useEffect(() => {
    gsap.fromTo(headerRef.current, { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" });
    gsap.fromTo(mainRef.current, { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: 0.65, ease: "power2.out", delay: 0.2 });
  }, []);

  const sendEmailOtp = async (email: string) => {
    setEmailVerify('sending');
    setEmailVerifyMsg('');
    try {
      const res = await fetch('/api/companies/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setEmailVerify('sent');
      } else {
        setEmailVerify('idle');
        setEmailVerifyMsg(data.message || 'Failed to send code.');
      }
    } catch {
      setEmailVerify('idle');
      setEmailVerifyMsg('Could not send code. Check your connection.');
    }
  };

  const checkOtp = async (email: string, code: string) => {
    setEmailVerify('verifying');
    try {
      const res = await fetch('/api/companies/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (data.success) {
        setEmailVerify('verified');
        setEmailVerifyMsg('');
        setErrors((prev: Record<string, string>) => ({ ...prev, email: '' }));
      } else {
        setEmailVerify('sent');
        setEmailVerifyMsg(data.message || 'Incorrect code.');
      }
    } catch {
      setEmailVerify('sent');
      setEmailVerifyMsg('Could not verify. Try again.');
    }
  };

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
    } else if (emailVerify !== 'verified') {
      e.email = emailVerify === 'sending' || emailVerify === 'verifying'
        ? "Please wait…"
        : emailVerify === 'sent'
          ? "Please enter the 6-digit code sent to your email."
          : "Please verify your email to continue.";
    }

    const phoneDigits = formData.phone.replace(/\D/g, "");
    let phoneCore = phoneDigits;
    let phoneCountry = "";

    if (phoneDigits.length === 12 && phoneDigits.startsWith("91") && /^[6-9]/.test(phoneDigits.slice(2))) {
      phoneCore = phoneDigits.slice(2); phoneCountry = "IN";
    } else if (phoneDigits.length === 11 && phoneDigits.startsWith("0") && /^[6-9]/.test(phoneDigits.slice(1))) {
      phoneCore = phoneDigits.slice(1); phoneCountry = "IN";
    } else if (phoneDigits.length === 10 && /^[6-9]/.test(phoneDigits)) {
      phoneCore = phoneDigits; phoneCountry = "IN";
    }

    const indiaValid = phoneCountry === "IN" && /^[6-9]\d{9}$/.test(phoneCore);
    const notFake    = !/(\d)\1{3}/.test(phoneCore) && new Set(phoneCore.split("")).size >= 4;

    if (!phoneDigits) {
      e.phone = "Phone number is required.";
    } else if (!indiaValid) {
      e.phone = "Enter a valid Indian mobile number (10 digits).";
    } else if (!notFake) {
      e.phone = "Please enter a real mobile number.";
    }

    if (!formData.brandName.trim()) {
      e.brandName = "Brand name is required.";
    } else if (formData.brandName.trim().length < 2) {
      e.brandName = "Brand name must be at least 2 characters.";
    } else if (formData.brandName.trim().length > 100) {
      e.brandName = "Brand name is too long (max 100 characters).";
    } else if (!/[a-zA-Z]/.test(formData.brandName.trim())) {
      e.brandName = "Brand name must contain at least some letters.";
    }

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
    if (field === 'email') {
      const trimmed = formData.email.trim();
      const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
      if (trimmed && emailRegex.test(trimmed) && emailVerify === 'idle') {
        sendEmailOtp(trimmed);
        return;
      }
    }
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
          setErrors((prev) => ({ ...prev, [data.field]: data.message }));
        } else {
          navigate("/connect-or-manual");
        }
      })
      .catch(() => navigate("/connect-or-manual"));
  };

  return (
    <div className="min-h-screen bg-[#F5F3EF]">
      <header
        ref={headerRef}
        className="flex justify-between items-center px-6 py-5 md:px-16 md:py-6 border-b border-[#E8E3DA] bg-[#F5F3EF]/80 backdrop-blur-sm"
      >
        <Logo />
      </header>

      <main ref={mainRef} className="px-6 py-10 md:px-16 md:py-16 max-w-3xl mx-auto">
        {/* Step indicator */}
        <div className="inline-flex items-center gap-2 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-[#14b8a6]" />
          <span className="text-xs text-[#14b8a6] font-semibold tracking-[0.16em] uppercase">
            01 · Who are we benchmarking?
          </span>
        </div>

        <h1
          className="text-3xl md:text-5xl text-[#0a1f3d] mb-4 leading-tight"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Tell us about your brand.
        </h1>
        <p className="text-[#6B7280] text-base md:text-lg mb-10 leading-relaxed max-w-xl">
          We use this to send your benchmark report and connect you with the right
          person on our team if you want a deeper diagnostic.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {/* Card wrapper */}
          <div className="bg-white border border-[#E8E3DA] rounded-2xl p-6 md:p-8 space-y-6 shadow-sm">

            {/* Row 1 — Name + Role */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-[#6B7280] tracking-[0.12em] uppercase mb-2">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Rohan Kapoor"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  onBlur={() => handleBlur("fullName")}
                  className={inputClass(errors.fullName)}
                />
                {errors.fullName && <p className="text-red-400 text-xs mt-1.5">{errors.fullName}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#6B7280] tracking-[0.12em] uppercase mb-2">
                  Role <span className="text-red-400">*</span>
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
                {errors.role && <p className="text-red-400 text-xs mt-1.5">{errors.role}</p>}
              </div>
            </div>

            {/* Row 2 — Email + Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-[#6B7280] tracking-[0.12em] uppercase mb-2">
                  Work Email <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="rohan@yourbrand.com"
                    value={formData.email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setFormData((prev: typeof formData) => ({ ...prev, email: e.target.value }));
                      setEmailVerify('idle');
                      setOtpCode('');
                      setEmailVerifyMsg('');
                    }}
                    onBlur={() => handleBlur("email")}
                    className={inputClass(errors.email) + " pr-10"}
                  />
                  {emailVerify === 'sending' && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#14b8a6] animate-spin" />
                  )}
                  {emailVerify === 'verified' && (
                    <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#14b8a6]" />
                  )}
                </div>
                {emailVerify === 'sending' && (
                  <p className="text-xs text-[#9CA3AF] mt-1.5">Sending verification code…</p>
                )}
                {emailVerify === 'verified' && (
                  <p className="text-xs text-[#14b8a6] mt-1.5">Email verified.</p>
                )}
                {(emailVerify === 'sent' || emailVerify === 'verifying') && (
                  <div className="mt-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="Enter 6-digit code"
                      value={otpCode}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                        setOtpCode(val);
                        if (val.length === 6) checkOtp(formData.email.trim(), val);
                      }}
                      className={inputClass(emailVerifyMsg)}
                    />
                    {emailVerify === 'verifying' && (
                      <p className="text-xs text-[#9CA3AF] mt-1.5">Verifying…</p>
                    )}
                    {emailVerifyMsg && (
                      <p className="text-red-400 text-xs mt-1.5">{emailVerifyMsg}</p>
                    )}
                    <button
                      type="button"
                      onClick={() => { setOtpCode(''); setEmailVerifyMsg(''); sendEmailOtp(formData.email.trim()); }}
                      className="text-xs text-[#14b8a6] hover:underline mt-1.5"
                    >
                      Resend code
                    </button>
                  </div>
                )}
                {errors.email && emailVerify !== 'verified' && (
                  <p className="text-red-400 text-xs mt-1.5">{errors.email}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#6B7280] tracking-[0.12em] uppercase mb-2">
                  Phone <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  inputMode="tel"
                  placeholder="9876543210"
                  value={formData.phone}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^\d+\s\-]/g, "").slice(0, 16);
                    setFormData((prev) => ({ ...prev, phone: val }));
                  }}
                  onBlur={() => handleBlur("phone")}
                  className={inputClass(errors.phone)}
                />
                {errors.phone && <p className="text-red-400 text-xs mt-1.5">{errors.phone}</p>}
              </div>
            </div>

            {/* Brand Name */}
            <div>
              <label className="block text-xs font-semibold text-[#6B7280] tracking-[0.12em] uppercase mb-2">
                Brand Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                placeholder="Your D2C brand"
                value={formData.brandName}
                onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                onBlur={() => handleBlur("brandName")}
                className={inputClass(errors.brandName)}
              />
              {errors.brandName && <p className="text-red-400 text-xs mt-1.5">{errors.brandName}</p>}
            </div>

            {/* Shopify URL */}
            <div>
              <label className="block text-xs font-semibold text-[#6B7280] tracking-[0.12em] uppercase mb-2">
                Shopify Store URL <span className="text-red-400">*</span>
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
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#14b8a6] animate-spin" />
                )}
                {shopifyVerify === 'valid' && (
                  <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#14b8a6]" />
                )}
                {shopifyVerify === 'invalid' && (
                  <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-400" />
                )}
              </div>
              {shopifyVerify === 'checking' && (
                <p className="text-xs text-[#9CA3AF] mt-1.5">Verifying Shopify store...</p>
              )}
              {shopifyVerify === 'valid' && (
                <p className="text-xs text-[#14b8a6] mt-1.5">Shopify store verified.</p>
              )}
              {errors.shopifyUrl && <p className="text-red-400 text-xs mt-1.5">{errors.shopifyUrl}</p>}
            </div>

            {/* Category + Orders per month */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-[#6B7280] tracking-[0.12em] uppercase mb-2">
                  Category <span className="text-red-400">*</span>
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
                {errors.category && <p className="text-red-400 text-xs mt-1.5">{errors.category}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#6B7280] tracking-[0.12em] uppercase mb-2">
                  Orders Per Month <span className="text-red-400">*</span>
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
                {errors.ordersPerMonth && <p className="text-red-400 text-xs mt-1.5">{errors.ordersPerMonth}</p>}
              </div>
            </div>

          </div>

          {/* Privacy notice */}
          <div className="flex gap-3 p-4 bg-white border border-[#E8E3DA] rounded-xl">
            <AlertCircle className="w-4 h-4 text-[#14b8a6] flex-shrink-0 mt-0.5" />
            <p className="text-sm text-[#6B7280]">
              Your data stays anonymous in benchmarks. We never resell or expose individual brand metrics.
            </p>
          </div>

          <button
            type="submit"
            className="w-full bg-[#0a1f3d] text-white px-8 py-4 rounded-xl hover:bg-[#162d57] transition-all duration-200 font-medium tracking-wide shadow-lg shadow-black/10 hover:shadow-xl"
          >
            Continue
          </button>
        </form>
      </main>
    </div>
  );
}
