import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import Logo from "../components/Logo";

export default function ShopifyConnectionPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    accessToken: "",
    storeDomain: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate connection and navigate to benchmark report
    navigate("/benchmark-report");
  };

  return (
    <div className="min-h-screen bg-[#f8f6f3]">
      {/* Header */}
      <header className="px-4 py-4 md:px-12 md:py-6">
        <Logo />
      </header>

      {/* Main Content */}
      <main className="px-4 py-8 md:px-12 md:py-16 max-w-2xl mx-auto">
        {/* Title */}
        <h1 className="text-2xl md:text-4xl mb-4">Shopify Benchmark</h1>
        <p className="text-[#666] text-lg mb-12">
          Paste a Shopify access token and store domain to fetch benchmark metrics for one store.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm text-[#666] mb-2">
              Shopify access token <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="shpat_..."
              value={formData.accessToken}
              onChange={(e) => setFormData({ ...formData, accessToken: e.target.value })}
              className="w-full px-4 py-3 bg-white border border-[#d4d4d4] rounded-lg focus:outline-none focus:border-[#1a1a1a]"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-[#666] mb-2">
              Store domain or URL <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="yourbrand.myshopify.com"
              value={formData.storeDomain}
              onChange={(e) => setFormData({ ...formData, storeDomain: e.target.value })}
              className="w-full px-4 py-3 bg-white border border-[#d4d4d4] rounded-lg focus:outline-none focus:border-[#1a1a1a]"
              required
            />
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-[#666]">
              We'll fetch read-only data from your Shopify store to calculate your benchmark metrics.
              Your data is encrypted and never shared with third parties.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-[#1a1a1a] text-white px-8 py-4 rounded-lg hover:bg-[#333] transition-colors"
          >
            Connect & Calculate Benchmark
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
