export interface BlogPost {
  slug: string;
  title: string;
  metaDescription: string;
  tag: string;
  date: string;
  excerpt: string;
  sections: Section[];
}

interface Section {
  heading?: string;
  paragraphs?: string[];
  table?: TableData;
  list?: ListData;
}

interface TableData {
  headers: string[];
  rows: string[][];
}

interface ListData {
  ordered: boolean;
  items: string[];
}

export const blogPosts: BlogPost[] = [
  {
    slug: "india-d2c-retention-benchmarks-2026",
    title: "India D2C Retention Benchmarks in 2026: What Top Brands Do Differently",
    metaDescription:
      "Discover the retention benchmarks shaping Indian D2C in 2026, including repeat purchase rates, cohort behavior, and the personalization tactics top brands use to grow profitably.",
    tag: "Retention",
    date: "June 2026",
    excerpt:
      "The real gap in Indian D2C is between brands that keep customers coming back and brands that keep paying to replace them. Here is what the benchmark data shows.",
    sections: [
      {
        paragraphs: [
          "Indian D2C brands are no longer competing only on acquisition. In 2026, the real gap is between brands that keep customers coming back and brands that keep paying to replace them.",
          "Retention has become one of the clearest signals of brand health because it directly affects repeat revenue, customer lifetime value, and payback period. Recent benchmark data shows repeat purchase rates vary widely by category, with top brands consistently outperforming the average through stronger post-purchase journeys and better re-engagement timing.",
          "The lesson is simple: if your retention curve is flat, you are likely leaving revenue on the table even if your top-of-funnel looks healthy.",
        ],
      },
      {
        heading: "What the benchmark data is showing",
        paragraphs: [
          "Across Indian D2C categories, the spread between average and top-performing brands is large.",
        ],
        table: {
          headers: ["Metric", "Average", "Top performers"],
          rows: [
            ["30-day repeat purchase rate", "12%", "22%"],
            ["90-day repeat purchase rate", "18%", "32%"],
            ["12-month customer lifetime value", "₹2,800", "₹6,500"],
          ],
        },
      },
      {
        paragraphs: [
          "That gap matters because it reflects how well a brand turns first-time buyers into repeat customers through post-purchase communication, personalization, and offer sequencing.",
        ],
      },
      {
        heading: "Why brands lose repeat sales",
        paragraphs: [
          "Most brands do not lose customers because of one bad campaign. They lose them because the post-purchase experience is too generic, too late, or not connected to the next best product recommendation.",
          "A common failure pattern looks like this:",
        ],
        list: {
          ordered: true,
          items: [
            "The first order is won with paid media.",
            "The customer gets a basic confirmation email.",
            "No meaningful follow-up happens within the first week.",
            "The next purchase opportunity is missed entirely.",
          ],
        },
      },
      {
        paragraphs: [
          "In other words, the brand spends to acquire attention but does not build a system to convert that attention into habit.",
        ],
      },
      {
        heading: "What top brands do differently",
        paragraphs: [
          "The strongest D2C brands use the first seven days after purchase as a retention window. They send useful order updates, ask for feedback, and introduce complementary products while the original purchase is still top of mind.",
          "They also track the right metrics — repeat purchase rate, days between purchases, cohort revenue curves, and reactivation rate. Those metrics show whether retention is actually compounding, instead of just looking good in a dashboard.",
          "Personalization matters here because one-size-fits-all retention flows usually underperform. Brands that segment by product type, category affinity, and timing can make post-purchase offers feel relevant rather than pushy.",
        ],
      },
    ],
  },
  {
    slug: "what-a-good-shelf-score-looks-like-2026",
    title: "What a Good Shelf Score Looks Like for Indian D2C Brands in 2026",
    metaDescription:
      "See how Indian D2C brands should interpret Shelf Score, which metrics matter most, and what separates average stores from top performers in 2026.",
    tag: "Benchmarks",
    date: "June 2026",
    excerpt:
      "A Shelf Score is only useful if you know what 'good' looks like. Here is how to read your score and what the benchmark data says about top performers.",
    sections: [
      {
        paragraphs: [
          "A Shelf Score is only useful if you know what 'good' looks like. For Indian D2C brands in 2026, the benchmark is not just about traffic or design quality — it is about how well a store converts visitors, retains buyers, and reduces friction across the shopper journey.",
          "That is why benchmark-driven scoring is valuable. It gives brands a single view of where they stand against leading Indian D2C stores, instead of forcing teams to guess based on isolated metrics.",
        ],
      },
      {
        heading: "Why Shelf Score matters",
        paragraphs: [
          "Most brands have analytics, but very few have a clear standard for judging performance. A Shelf Score solves that by translating conversion, retention, and CRO signals into one benchmark that can be tracked over time.",
          "This matters because Indian D2C performance gaps are often hidden inside the funnel. A store may have decent traffic, but still underperform due to weak product discovery, poor checkout flow, or low repeat purchase behavior.",
          "The benchmark approach helps separate cosmetic improvements from meaningful ones. A better homepage alone does not guarantee growth if shoppers still drop off before checkout or never come back.",
        ],
      },
      {
        heading: "What the benchmark should include",
        paragraphs: [
          "A strong Shelf Score should not rely on one metric. It should combine multiple signals that reflect both acquisition efficiency and customer quality.",
          "The most important inputs are:",
        ],
        list: {
          ordered: false,
          items: [
            "Conversion rate.",
            "Repeat purchase rate.",
            "Average order value.",
            "Cart and checkout friction.",
            "Email and WhatsApp engagement.",
            "Revenue per visitor or buyer.",
          ],
        },
      },
      {
        paragraphs: [
          "These metrics matter because they show whether the store is actually turning attention into revenue and revenue into repeat behavior.",
        ],
      },
      {
        heading: "What good looks like",
        paragraphs: [
          "Benchmark data suggests that top Indian D2C brands separate themselves most clearly in retention and repeat behavior. Average 30-day repeat purchase rate sits around 12%, while top performers reach 22%; at 90 days, the average is 18% and top performers reach 32%.",
          "Conversion benchmarks also matter. Industry discussions around Indian D2C continue to point to conversion rates around 1% for many brands, which means small improvements in the middle of the funnel can have a big impact.",
        ],
      },
      {
        heading: "How to read your score",
        paragraphs: [
          "A Shelf Score should be treated like a diagnostic tool, not a vanity metric. A lower score usually means the store has one or more bottlenecks in product discovery, checkout, trust, or retention.",
          "A practical way to interpret it is:",
        ],
        list: {
          ordered: false,
          items: [
            "Low score: the brand has major funnel leaks.",
            "Mid score: the brand converts some traffic but leaves revenue on the table.",
            "High score: the brand has a more balanced journey and stronger customer value.",
          ],
        },
      },
      {
        paragraphs: [
          "The goal is not to chase a perfect number. The goal is to understand which part of the experience is pulling the score down and what to fix first.",
        ],
      },
    ],
  },
];
