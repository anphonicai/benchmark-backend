import { useNavigate } from "react-router";
import { ShoppingBag, FileText, ArrowLeft } from "lucide-react";
import Logo from "../components/Logo";

export default function ConnectOrManualPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f8f6f3]">
      {/* Header */}
      <header className="px-12 py-6">
        <Logo />
      </header>

      {/* Main Content */}
      <main className="px-12 py-16 max-w-5xl mx-auto">
        {/* Step Indicator */}
        <div className="text-sm text-[#999] mb-6">02 · HOW SHOULD WE PULL YOUR DATA?</div>

        {/* Title */}
        <h1 className="text-5xl mb-4">Connect Shopify, or enter manually.</h1>
        <p className="text-[#666] text-lg mb-16">
          Connecting gives you a precise benchmark using real order and customer data.
          <br />
          Manual entry takes 3 minutes and is less precise.
        </p>

        {/* Options */}
        <div className="grid grid-cols-2 gap-8">
          {/* Connect Shopify Option — Coming Soon */}
          <div className="relative bg-white border-2 border-[#d4d4d4] rounded-2xl p-8 cursor-not-allowed opacity-60">
            {/* Coming Soon Badge */}
            <div className="absolute -top-3 left-8 bg-[#999] text-white text-xs px-3 py-1 rounded-full">
              COMING SOON
            </div>

            {/* Icon */}
            <div className="w-14 h-14 bg-[#ccc] rounded-xl flex items-center justify-center mb-6">
              <ShoppingBag className="w-7 h-7 text-white" />
            </div>

            {/* Title */}
            <h2 className="text-2xl mb-3 text-[#999]">Connect Shopify</h2>

            {/* Description */}
            <p className="text-[#666] mb-8">
              Read-only API token. We pull 90 days of order and customer data, compute your metrics, then disconnect.
            </p>

            {/* Metrics */}
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[#999]">TIME</span>
                <span className="text-[#1a1a1a]">60 seconds</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#999]">PRECISION</span>
                <span className="text-[#1a1a1a]">High</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#999]">OUTPUT</span>
                <span className="text-[#1a1a1a]">Verified benchmark</span>
              </div>
            </div>
          </div>

          {/* Enter Manually Option */}
          <div
            onClick={() => navigate("/manual-entry")}
            className="relative bg-white border-2 border-[#10b981] rounded-2xl p-8 cursor-pointer hover:shadow-lg transition-shadow"
          >
            {/* Recommended Badge */}
            <div className="absolute -top-3 left-8 bg-[#10b981] text-white text-xs px-3 py-1 rounded-full">
              RECOMMENDED
            </div>

            {/* Icon */}
            <div className="w-14 h-14 bg-[#1a1a1a] rounded-xl flex items-center justify-center mb-6">
              <FileText className="w-7 h-7 text-white" />
            </div>

            {/* Title */}
            <h2 className="text-2xl mb-3">Enter manually</h2>

            {/* Description */}
            <p className="text-[#666] mb-8">
              Tell us your key metrics yourself. Useful if you'd rather not connect Shopify right now.
            </p>

            {/* Metrics */}
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[#999]">TIME</span>
                <span className="text-[#1a1a1a]">3 minutes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#999]">PRECISION</span>
                <span className="text-[#1a1a1a]">Estimate only</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#999]">OUTPUT</span>
                <span className="text-[#1a1a1a]">Directional score</span>
              </div>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <button
          onClick={() => navigate("/brand-info")}
          className="flex items-center gap-2 text-[#666] hover:text-[#1a1a1a] mt-12 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
      </main>
    </div>
  );
}
