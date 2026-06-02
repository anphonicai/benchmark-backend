import { useNavigate } from "react-router";
import { ArrowRight } from "lucide-react";
import Logo from "../components/Logo";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f8f6f3]">
      {/* Header */}
      <header className="flex justify-between items-center px-12 py-6">
        <Logo />
        <div className="flex gap-8">
          <a href="#" className="text-[#666] hover:text-[#1a1a1a] transition-colors">BENCHMARKS</a>
          <a href="#" className="text-[#666] hover:text-[#1a1a1a] transition-colors">EDITION 01</a>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-12 py-24 max-w-7xl">
        {/* Badge */}
        <div className="inline-flex items-center gap-3 px-4 py-2 border border-[#d4d4d4] rounded-full mb-8">
          <span className="text-[#666] text-sm">THE SHELF INDEX</span>
          <span className="text-[#666]">·</span>
          <span className="text-[#666] text-sm">INDIA Q2C 2025</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-[5rem] leading-[1.1] mb-8 max-w-4xl">
          <span className="text-[#1a1a1a]">Where does your</span>
          <br />
          <span className="text-[#1a1a1a]">D2C brand </span>
          <span className="italic text-[#10b981]">actually</span>
          <span className="text-[#1a1a1a]"> stand?</span>
        </h1>

        {/* Subtitle */}
        <p className="text-[#666] text-lg mb-8 max-w-2xl">
          Benchmark your retention metrics against India's leading D2C brands.
          <br />
          Connect your Shopify store and get a verified diagnostic in 90 seconds.
        </p>

        {/* CTA Button */}
        <button
          onClick={() => navigate("/brand-info")}
          className="group bg-[#1a1a1a] text-white px-8 py-4 rounded-lg hover:bg-[#333] transition-colors flex items-center gap-2"
        >
          <span>Start free benchmark</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Features */}
        <div className="flex gap-4 mt-6 text-sm text-[#999]">
          <span>NO CREDIT CARD</span>
          <span>·</span>
          <span>90 SECONDS</span>
          <span>·</span>
          <span>READ-ONLY SHOPIFY ACCESS</span>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-3 gap-16 mt-32">
          <div>
            <div className="text-sm text-[#999] mb-2">01 · REPEAT PURCHASE RATE</div>
            <div className="flex justify-between items-end">
              <span className="text-[#666]">Cohort median</span>
              <span className="text-2xl">22%</span>
            </div>
            <div className="flex justify-between items-end mt-2">
              <span className="text-[#666]">Top quartile</span>
              <span className="text-2xl">38%</span>
            </div>
          </div>
          <div>
            <div className="text-sm text-[#999] mb-2">02 · ADD TO CART RATE</div>
            <div className="flex justify-between items-end">
              <span className="text-[#666]">Cohort median</span>
              <span className="text-2xl">6.4%</span>
            </div>
            <div className="flex justify-between items-end mt-2">
              <span className="text-[#666]">Top quartile</span>
              <span className="text-2xl">9.8%</span>
            </div>
          </div>
          <div>
            <div className="text-sm text-[#999] mb-2">03 · REVENUE FROM REPEATS</div>
            <div className="flex justify-between items-end">
              <span className="text-[#666]">Cohort median</span>
              <span className="text-2xl">31%</span>
            </div>
            <div className="flex justify-between items-end mt-2">
              <span className="text-[#666]">Top quartile</span>
              <span className="text-2xl">54%</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
