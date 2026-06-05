import { useNavigate, Link } from "react-router";
import { ArrowRight } from "lucide-react";
import Logo from "../components/Logo";
import cohortConfig from "../utils/cohortConfig";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f8f6f3]">
      {/* Header */}
      <header className="flex justify-between items-center px-4 py-4 md:px-12 md:py-6 gap-4">
        <Logo />
        <div className="flex items-center gap-4 md:gap-8 flex-wrap justify-end">
          <a href="#" className="text-[#666] hover:text-[#1a1a1a] transition-colors text-sm hidden sm:block">BENCHMARKS</a>
          <Link
            to="/methodology"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 md:px-4 bg-[#F0FAFA] border border-[#CCE8E8] rounded-full text-xs font-semibold text-[#1C9393] tracking-wide hover:bg-[#CCE8E8] transition-colors"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#30B4B7]" />
            HOW WE BENCHMARK
          </Link>
        </div>
      </header>

      <main className="px-4 py-12 md:px-12 md:py-24 max-w-7xl">
        {/* Badge */}
        <div className="inline-flex items-center gap-3 px-4 py-2 border border-[#d4d4d4] rounded-full mb-8">
          <span className="text-[#666] text-sm">THE SHELF INDEX</span>
          <span className="text-[#666]">·</span>
          <span className="text-[#666] text-sm">INDIA D2C {cohortConfig.data_window_year}</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl md:text-[5rem] leading-[1.1] mb-6 md:mb-8 max-w-4xl">
          <span className="text-[#1a1a1a]">Where does your</span>
          <br />
          <span className="text-[#1a1a1a]">D2C brand </span>
          <span className="italic text-[#10b981]">actually</span>
          <span className="text-[#1a1a1a]"> stand?</span>
        </h1>

        {/* Subtitle */}
        <p className="text-[#666] text-base md:text-lg mb-8 max-w-2xl">
          Benchmark your retention metrics against India's leading D2C brands.
          <br className="hidden sm:block" />
          Connect your Shopify store and get a verified diagnostic in 90 seconds.
        </p>

        {/* CTA */}
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

        {/* Cohort Credential Strip */}
        <div className="mt-10 md:mt-16 max-w-2xl mx-auto bg-white border border-[#E8EAED] rounded-2xl px-4 py-6 md:px-8 md:py-7">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 text-center">
              <div className="text-3xl font-semibold text-[#1C9393] tracking-tight leading-tight mb-1">
                {cohortConfig.cohort_size}
              </div>
              <div className="text-xs text-[#6B7280] uppercase tracking-wider leading-snug">
                Leading Indian<br />D2C brands
              </div>
            </div>
            <div className="w-px h-10 bg-[#E8EAED] flex-shrink-0" />
            <div className="flex-1 text-center">
              <div className="text-3xl font-semibold text-[#1C9393] tracking-tight leading-tight mb-1">
                {cohortConfig.tracked_value}
              </div>
              <div className="text-xs text-[#6B7280] uppercase tracking-wider leading-snug">
                Tracked<br />transactions
              </div>
            </div>
            <div className="w-px h-10 bg-[#E8EAED] flex-shrink-0" />
            <div className="flex-1 text-center">
              <div className="text-3xl font-semibold text-[#1C9393] tracking-tight leading-tight mb-1">
                {cohortConfig.data_window}
              </div>
              <div className="text-xs text-[#6B7280] uppercase tracking-wider leading-snug">
                {cohortConfig.data_window_year} data<br />window
              </div>
            </div>
          </div>
          <p className="mt-5 text-center text-sm text-[#6B7280]">
            Your brand is benchmarked against this cohort.{" "}
            <Link to="/methodology" className="text-[#1C9393] font-medium hover:underline">
              How this works →
            </Link>
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-16 mt-16 md:mt-24">
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
