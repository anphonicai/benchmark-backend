import Logo from "../components/Logo";
import cohortConfig from "../utils/cohortConfig";

export default function MethodologyPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <header className="px-12 py-6">
        <Logo />
      </header>

      <main className="max-w-3xl mx-auto px-6 py-20">

        {/* Header */}
        <div className="mb-14">
          <p className="text-xs font-semibold tracking-widest text-[#1C9393] mb-4 uppercase">
            Methodology
          </p>
          <h1 className="text-5xl font-semibold leading-tight tracking-tight text-[#1A1A1A] mb-6">
            How your benchmark is calculated
          </h1>
          <p className="text-lg leading-relaxed text-[#4B5563] max-w-2xl">
            Your Shelf Score compares your retention performance against a cohort
            of {cohortConfig.cohort_size} leading Indian D2C brands. Here's exactly how that cohort was
            built, what data we use, and how we protect every brand's identity.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-14">
          <div className="bg-white border border-[#E8EAED] rounded-xl p-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#6B7280] mb-2">Cohort size</p>
            <p className="text-2xl font-semibold text-[#1C9393] mb-3">{cohortConfig.cohort_size} brands</p>
            <p className="text-sm leading-relaxed text-[#4B5563]">
              All India-based D2C brands operating on Shopify, with active
              retention infrastructure (Rebuy Engine installed for at least 3 months).
            </p>
          </div>

          <div className="bg-white border border-[#E8EAED] rounded-xl p-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#6B7280] mb-2">Data window</p>
            <p className="text-2xl font-semibold text-[#1C9393] mb-3">{cohortConfig.data_window_full}</p>
            <p className="text-sm leading-relaxed text-[#4B5563]">
              Four months of order and customer data, captured from each brand's
              Shopify backend. Updated quarterly as new cohorts are admitted.
            </p>
          </div>

          <div className="bg-white border border-[#E8EAED] rounded-xl p-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#6B7280] mb-2">Tracked transactions</p>
            <p className="text-2xl font-semibold text-[#1C9393] mb-3">{cohortConfig.tracked_value}</p>
            <p className="text-sm leading-relaxed text-[#4B5563]">
              Total gross transaction value across the cohort during the data
              window. Represents a meaningful slice of India's D2C retention economy.
            </p>
          </div>

          <div className="bg-white border border-[#E8EAED] rounded-xl p-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#6B7280] mb-2">Categories represented</p>
            <p className="text-lg font-semibold text-[#1C9393] mb-3 leading-snug">{cohortConfig.categories}</p>
            <p className="text-sm leading-relaxed text-[#4B5563]">
              We benchmark you against your category peers where the sample is
              statistically meaningful, and against the full cohort otherwise.
            </p>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-10">

          <div>
            <h2 className="text-xl font-semibold text-[#1A1A1A] mb-4">What we measure</h2>
            <p className="text-sm leading-relaxed text-[#374151] mb-3">
              We compute five retention metrics from your Shopify order history:
              average order value, repeat purchase rate, time to second order,
              revenue from repeat customers, and orders per month. Each metric is
              scored against the cohort median and the cohort top quartile.
            </p>
            <p className="text-sm leading-relaxed text-[#374151]">
              We also score your retention infrastructure (loyalty, WhatsApp,
              post-purchase, reviews) based on what you've told us or what we
              detect from your store.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-[#1A1A1A] mb-4">How we protect cohort brands</h2>
            <p className="text-sm leading-relaxed text-[#374151] mb-3">
              No individual brand in the cohort is identified by name in your
              benchmark, our published reports, or any external communication.
              Before any data is aggregated, we apply per-brand statistical
              adjustment so that no published metric can be reverse-engineered
              back to any specific brand.
            </p>
            <p className="text-sm leading-relaxed text-[#374151]">
              Cohort brands have signed formal data usage agreements with us and
              retain the right to opt out of any publication with 30 days' notice.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-[#1A1A1A] mb-4">How we aggregate</h2>
            <p className="text-sm leading-relaxed text-[#374151] mb-3">
              We use median-of-brand-medians as our standard aggregation. This
              prevents any single large brand from skewing the benchmark, and
              means a small ₹1 Cr brand and a large ₹50 Cr brand contribute equally
              to the cohort median.
            </p>
            <p className="text-sm leading-relaxed text-[#374151]">
              For each metric, we publish the cohort median and the top quartile.
              Your score is your position relative to both.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="mt-14 pt-8 border-t border-[#E8EAED] text-sm text-[#6B7280]">
          <p>
            Source: {cohortConfig.source}, {cohortConfig.edition}.{" "}
            <a href="https://www.anphonic.ai/" target="_blank" rel="noopener noreferrer"
              className="text-[#1C9393] font-medium hover:underline">
              Learn more about Anphonic →
            </a>
          </p>
        </div>

      </main>
    </div>
  );
}
