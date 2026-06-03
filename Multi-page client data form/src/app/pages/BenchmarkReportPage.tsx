import { useState, useEffect } from "react";
import Logo from "../components/Logo";
import { ArrowUpRight, CheckCircle2, ArrowDown, Download } from "lucide-react";
import { BenchmarkData, loadBenchmarkData } from "../utils/benchmarkData";

const defaultBenchmarkData: BenchmarkData = {
  shelfScore: 49,
  percentile: "40th",
  verdictTitle: "Your retention engine is in second gear.",
  verdictDescription:
    "The cohort median runs in fourth. You are acquiring well, but customers aren't coming back at the rate top quartile brands manage.",
  gaps: [
    {
      title: "Rebuy Engine running well below configuration target.",
      revenueAtStake: "₹8.4L",
      description:
        "Target range for a well-configured Rebuy account is 12-18% of store revenue. Portfolio average is 15.8%. You are at 5%.",
      additionalInfo:
        "The range across the cohort is 3.8% to 28.5%. Configuration quality matters more than the tool itself.",
    },
    {
      title: "No Reorder Page live.",
      revenueAtStake: "₹9.6L",
      description:
        "Top quartile brands in your cohort run a dedicated reorder page that captures 3-4x the conversion of a generic home page. You currently route returning customers through the same flow as new visitors.",
      additionalInfo:
        "Reorder Page is the #1 priority gap across the entire Shelf Index cohort.",
    },
    {
      title: "Post-purchase upsell only partially live.",
      revenueAtStake: "₹12.0L",
      description:
        "Top quartile brands capture 14-22% of post-purchase visits with a one-click upsell or thank-you-page offer. You show a basic thank-you page.",
      additionalInfo:
        "Cohort data shows post-purchase AOV uplift averages 8-12% when implemented well.",
    },
  ],
  totalRevenueAtStake: "₹30.0L",
  metrics: [
    {
      name: "Repeat purchase rate",
      description: "90 day window",
      yourValue: "20%",
      cohortMedian: "15%",
      topQuartile: "15.6%",
      status: "up",
    },
    {
      name: "Revenue from repeat customers",
      description: "trailing 90 days",
      yourValue: "0%",
      cohortMedian: "48%",
      topQuartile: "61%",
      status: "down",
    },
    {
      name: "Time to second order",
      description: "median",
      yourValue: "0 days",
      cohortMedian: "21 days",
      topQuartile: "14 days",
      status: "up",
    },
    {
      name: "Rebuy revenue share",
      description: "personalisation revenue",
      yourValue: "5%",
      cohortMedian: "18.7%",
      topQuartile: "22.7%",
      status: "down",
    },
    {
      name: "Personalisation AOV lift",
      description: "on Rebuy orders",
      yourValue: "10%",
      cohortMedian: "56.5%",
      topQuartile: "92.8%",
      status: "down",
    },
  ],
  cohortSize: 13,
  window: "90 days",
};

export default function BenchmarkReportPage() {
  const [benchmarkData, setBenchmarkData] = useState<BenchmarkData>(defaultBenchmarkData);

  useEffect(() => {
    const savedData = loadBenchmarkData();
    if (savedData) {
      setBenchmarkData(savedData);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#f8f6f3]">
      {/* Header */}
      <header className="px-12 py-6">
        <Logo />
      </header>

      {/* Main Content */}
      <main className="px-12 py-16 max-w-6xl mx-auto">
        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-5xl mb-3">Benchmark Report</h1>
          <p className="text-[#666] mb-6">Your benchmark report is below.</p>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 bg-[#1a1a1a] text-white px-6 py-3 rounded-lg hover:bg-[#333] transition-colors print:hidden"
          >
            <Download className="w-4 h-4" />
            Download Report (PDF)
          </button>
        </div>

        {/* Score Card */}
        <div className="bg-white rounded-2xl p-12 mb-8 shadow-sm">
          <div className="grid grid-cols-2 gap-12">
            <div>
              <div className="text-sm text-[#999] mb-2">Shelf Score</div>
              <div className="flex items-end gap-2 mb-1">
                <span className="text-7xl">{benchmarkData.shelfScore}</span>
                <span className="text-2xl text-[#666] mb-2">out of 100</span>
              </div>
            </div>
            <div>
              <div className="text-sm text-[#999] mb-2">Percentile</div>
              <div className="mb-1">
                <span className="text-5xl">{benchmarkData.percentile}</span>
              </div>
              <div className="text-sm text-[#999]">Verdict</div>
              <div className="mt-2">
                <p className="text-lg">
                  <strong>{benchmarkData.verdictTitle}</strong>
                </p>
                <p className="text-[#666] mt-2">{benchmarkData.verdictDescription}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Top Gaps */}
        <div className="bg-white rounded-2xl p-12 mb-8 shadow-sm">
          <h2 className="text-3xl mb-8">Top Gaps</h2>
          <div className="space-y-6">
            {benchmarkData.gaps.map((gap, index) => (
              <div key={index} className="border-l-4 border-[#ff9800] pl-6 py-2">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg">{gap.title}</h3>
                  <div className="text-right">
                    <div className="text-sm text-[#999]">Revenue at stake</div>
                    <div className="text-2xl">{gap.revenueAtStake}</div>
                  </div>
                </div>
                <p className="text-[#666] mb-2">{gap.description}</p>
                <p className="text-sm text-[#999]">{gap.additionalInfo}</p>
              </div>
            ))}

            <div className="pt-4 border-t border-[#d4d4d4]">
              <div className="flex justify-between items-center">
                <div className="text-sm text-[#999]">Total Revenue at Stake</div>
                <div className="text-3xl">{benchmarkData.totalRevenueAtStake}</div>
              </div>
              <div className="text-right text-sm text-[#999] mt-1">annualized value</div>
            </div>
          </div>
        </div>

        {/* Metrics Table */}
        <div className="bg-white rounded-2xl p-12 mb-8 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl">Your Metrics vs Cohort</h2>
            <span className="text-sm text-[#999]">Annual opportunity</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#e5e5e5]">
                  <th className="text-left py-4 pr-8">Metric</th>
                  <th className="text-center py-4 px-4">You</th>
                  <th className="text-center py-4 px-4">Cohort Median</th>
                  <th className="text-center py-4 px-4">Top Quartile</th>
                  <th className="text-center py-4 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {benchmarkData.metrics.map((metric, index) => (
                  <tr
                    key={index}
                    className={`border-b border-[#f5f5f5] ${metric.status === 'down' ? 'bg-[#fff8f8]' : ''}`}
                  >
                    <td className="py-6 pr-8">
                      <div className="font-medium">{metric.name}</div>
                      <div className="text-sm text-[#999]">{metric.description}</div>
                    </td>
                    <td className="text-center py-6 px-4 text-lg">{metric.yourValue}</td>
                    <td className="text-center py-6 px-4 text-[#666]">{metric.cohortMedian}</td>
                    <td className="text-center py-6 px-4 text-[#666]">{metric.topQuartile}</td>
                    <td className="text-center py-6 px-4">
                      {metric.status === 'up' ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto" />
                      ) : (
                        <ArrowDown className="w-5 h-5 text-red-600 mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Methodology */}
        <div className="bg-white rounded-2xl p-12 mb-12 shadow-sm">
          <h3 className="text-xl mb-4">Methodology</h3>
          <div className="space-y-2 text-[#666]">
            <p>Cohort Size: {benchmarkData.cohortSize}</p>
            <p>Window: {benchmarkData.window}</p>
            <p className="text-sm text-[#999] mt-4">Source: The Shelf Index, Edition 01, Anphonic</p>
          </div>
        </div>

        {/* Download Shelf Index */}
        <div className="bg-[#1a1a1a] rounded-2xl p-10 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 print:hidden">
          <div>
            <h3 className="text-white text-2xl mb-1">Download the Shelf Index</h3>
            <p className="text-[#999] text-sm">Save your full benchmark report as a PDF to share with your team.</p>
          </div>
          <button
            onClick={() => window.print()}
            className="flex-shrink-0 inline-flex items-center gap-2 bg-white text-[#1a1a1a] px-8 py-4 rounded-lg hover:bg-[#f0f0f0] transition-colors font-medium text-lg"
          >
            ↓ Download Report
          </button>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-br from-[#0066ff] to-[#0052cc] rounded-2xl p-12 text-center text-white shadow-lg">
          <h2 className="text-4xl mb-4">Want to dive deeper?</h2>
          <p className="text-lg mb-8 opacity-90">
            Get in touch with Anphonic for a detailed diagnostic and personalized recommendations
            <br />
            to unlock your D2C brand's full potential.
          </p>
          <a
            href="https://www.anphonic.ai/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-[#0066ff] px-8 py-4 rounded-lg hover:bg-[#f0f0f0] transition-colors text-lg group"
          >
            <span>Get in touch with anphonic.ai</span>
            <ArrowUpRight className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>
        </div>
      </main>
    </div>
  );
}
