const fs = require('fs');
const path = require('path');

const baselinesPath = path.join(__dirname, 'cohort-baselines.json');
const baselines = JSON.parse(fs.readFileSync(baselinesPath, 'utf8'));

const normalizeCategory = (categoryStr) => {
  if (!categoryStr) return 'overall';
  const normalized = String(categoryStr).toLowerCase().trim();
  const map = {
    'food & beverage': 'food_beverage',
    'food and beverage': 'food_beverage',
    'food': 'food_beverage',
    'beverage': 'food_beverage',
    'beauty & personal care': 'beauty_personal_care',
    'beauty': 'beauty_personal_care',
    'wellness & supplements': 'wellness_supplements',
    'wellness': 'wellness_supplements',
    'supplements': 'wellness_supplements',
    'health & nutrition': 'health_nutrition',
    'health': 'health_nutrition',
    'nutrition': 'health_nutrition',
    'apparel & accessories': 'apparel_accessories',
    'apparel': 'apparel_accessories',
    'home & lifestyle': 'home_lifestyle',
    'home': 'home_lifestyle',
    'pet': 'pet',
  };

  let key = map[normalized] || 'overall';
  const cat = baselines[key];
  if (cat && cat._inherits_from) {
    return cat._inherits_from;
  }
  if (cat && cat._fallback_to) {
    return cat._fallback_to;
  }
  return key;
};

const getBaseline = (categoryKey, metric) => {
  const cat = baselines[categoryKey];
  if (!cat || !cat[metric]) {
    return baselines.overall[metric] || null;
  }
  return cat[metric];
};

const scoreMetric = (value, baseline, lowerIsBetter = false) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return 0;
  if (!baseline || baseline.median === undefined || baseline.median === null) return 0;

  const numericValue = Number(value);
  const median = Number(baseline.median);
  const topQ = Number(baseline.top_quartile || median * 1.5);

  if (lowerIsBetter) {
    if (numericValue <= topQ) return 100;
    if (numericValue >= median * 2) return 0;
    if (numericValue <= median) {
      return 100 - ((numericValue - topQ) / (median - topQ)) * 50;
    }
    return 50 - ((numericValue - median) / median) * 50;
  }

  if (numericValue >= topQ) return 100;
  if (numericValue <= 0) return 0;
  if (numericValue >= median) {
    return 50 + ((numericValue - median) / (topQ - median)) * 50;
  }
  return (numericValue / median) * 50;
};

const computeShelfScore = (metrics, categoryStr) => {
  const category = normalizeCategory(categoryStr);

  // Scoring only uses manually entered metrics (rebuy/personalisation removed)
  const scores = {
    repeat_revenue_pct: scoreMetric(
      metrics.repeat_revenue_pct,
      getBaseline(category, 'repeat_revenue_pct')
    ),
    time_to_2nd_order_days: scoreMetric(
      metrics.time_to_2nd_order_days_median,
      getBaseline(category, 'time_to_2nd_order_days'),
      true
    ),
  };

  const weights = { repeat_revenue_pct: 50, time_to_2nd_order_days: 50 };

  let composite = 0;
  let totalWeight = 0;
  for (const metric in weights) {
    const weight = Number(weights[metric] || 0);
    if (scores[metric] !== undefined) {
      composite += scores[metric] * weight;
      totalWeight += weight;
    }
  }

  const shelfScore = totalWeight > 0 ? Math.round(composite / totalWeight) : 0;

  return {
    shelf_score: shelfScore,
    metric_scores: Object.fromEntries(
      Object.entries(scores).map(([key, value]) => [key, Math.round(value)])
    ),
    category_used: category,
  };
};

const computePercentile = (shelfScore) => {
  if (shelfScore >= 90) return 95;
  if (shelfScore >= 75) return 85;
  if (shelfScore >= 60) return 70;
  if (shelfScore >= 50) return 55;
  if (shelfScore >= 40) return 40;
  if (shelfScore >= 30) return 25;
  if (shelfScore >= 20) return 15;
  return 5;
};

const computeVerdict = (shelfScore) => {
  if (shelfScore >= 80) {
    return {
      headline: 'Your retention engine is firing.',
      gear: 'fifth gear',
      cohort_comparison: 'You are operating at top quartile across most dimensions. The cohort median runs in third.',
      tone: 'top_quartile',
    };
  }
  if (shelfScore >= 60) {
    return {
      headline: 'Your retention engine is running well.',
      gear: 'fourth gear',
      cohort_comparison: 'You are at or above cohort median. Top quartile is within reach with targeted moves.',
      tone: 'above_median',
    };
  }
  if (shelfScore >= 40) {
    return {
      headline: 'Your retention engine is in second gear.',
      gear: 'second gear',
      cohort_comparison: 'The cohort median runs in fourth. You are acquiring well, but customers aren\'t coming back at the rate top quartile brands manage.',
      tone: 'below_median',
    };
  }
  return {
    headline: 'Your retention engine has not been switched on.',
    gear: 'first gear',
    cohort_comparison: 'The cohort runs in fourth gear on average. The good news: every gap below is a documented, fixable pattern from the Shelf Index data.',
    tone: 'well_below',
  };
};

// ============================================================
// GAP IDENTIFICATION
// ============================================================

const identifyGaps = (metrics, manualInputs = {}, scoreResult, brandContext = {}) => {
  const gaps = [];
  const cat = scoreResult.category_used;
  const baselineRepeat = getBaseline(cat, 'repeat_rate_90d_pct');
  const baselineRepeatRev = getBaseline(cat, 'repeat_revenue_pct');
  const baselineRebuy = getBaseline(cat, 'rebuy_revenue_share_pct');

  // Estimate monthly revenue for revenue-at-stake calcs
  const aov = metrics.aov_inr || brandContext.aov_inr || 1000;
  const opmEstimate = metrics.orders_per_month_estimated || brandContext.orders_per_month_estimated || 1000;
  const monthlyRevenue = aov * opmEstimate;
  const annualRevenue = monthlyRevenue * 12;

  // ── GAP 1: Missing Reorder Page ──
  if (metrics.repeat_revenue_pct < (baselineRepeatRev?.median || 40)) {
    const gapData = baselines._gap_revenue_estimates?.missing_reorder_page || {};
    const uplift = gapData.estimated_uplift_pct || 18;
    const revenueAtStake = Math.round(annualRevenue * (uplift / 100));
    gaps.push({
      id: 'missing_reorder_page',
      rank_score: 90,
      title: 'No Reorder Page live.',
      comparison: 'Top quartile brands in your cohort run a dedicated /reorder page that captures 3-4x the conversion of a generic home page. You currently route returning customers through the same flow as new visitors.',
      cohort_data: 'Reorder Page is the #1 priority gap across the entire Shelf Index cohort.',
      revenue_at_stake_inr: revenueAtStake,
      revenue_period: 'annual',
    });
  }

  // ── GAP 2: No loyalty program ──
  if (!manualInputs.loyalty || manualInputs.loyalty === 'None' || manualInputs.loyalty === '') {
    const gapData = baselines._gap_revenue_estimates?.missing_loyalty_program || {};
    const upliftPoints = gapData.estimated_uplift_points || 7;
    const revenueAtStake = Math.round(annualRevenue * (upliftPoints / 100) * 1.5);
    gaps.push({
      id: 'missing_loyalty_program',
      rank_score: 85,
      title: 'No loyalty program live.',
      comparison: 'Top quartile brands in this cohort run Nector or POPcoins with redemption rates of 11-18%. Their 90-day repeat rate sits 14 points above cohort median. You have no loyalty system.',
      cohort_data: 'Cohort data shows loyalty programs lift repeat rate by ~7 points within 90 days of launch.',
      revenue_at_stake_inr: revenueAtStake,
      revenue_period: 'annual',
    });
  }

  // ── GAP 3: Missing post-purchase upsell ──
  if (!manualInputs.upsell || manualInputs.upsell === 'Not yet' || manualInputs.upsell === 'Partially implemented' || manualInputs.upsell === '') {
    const gapData = baselines._gap_revenue_estimates?.missing_post_purchase_upsell || {};
    const upliftPct = gapData.estimated_uplift_pct || 10;
    const revenueAtStake = Math.round(annualRevenue * (upliftPct / 100));
    gaps.push({
      id: 'missing_post_purchase_upsell',
      rank_score: 75,
      title: manualInputs.upsell === 'Partially implemented' ? 'Post-purchase upsell only partially live.' : 'No post-purchase upsell flow.',
      comparison: 'Top quartile brands capture 14-22% of post-purchase visits with a one-click upsell or thank-you-page offer. You show a static thank-you page.',
      cohort_data: 'Cohort data shows post-purchase AOV uplift averages 8-12% when implemented well.',
      revenue_at_stake_inr: revenueAtStake,
      revenue_period: 'annual',
    });
  }

  // ── GAP 4: WhatsApp opt-in below cohort ──
  if (!manualInputs.whatsapp || manualInputs.whatsapp === 'None' || manualInputs.whatsapp === '') {
    const gapData = baselines._gap_revenue_estimates?.missing_whatsapp_optin || {};
    const upliftPct = gapData.estimated_uplift_pct || 15;
    const revenueAtStake = Math.round(annualRevenue * (upliftPct / 100));
    gaps.push({
      id: 'missing_whatsapp_optin',
      rank_score: 80,
      title: 'No WhatsApp re-engagement live.',
      comparison: 'Top quartile brands run Day-21 WhatsApp Reorder URL flows that drive 12-22% of repeat revenue. WhatsApp read rates sit above 80% across all India geographies. You have no WhatsApp re-engagement layer.',
      cohort_data: 'Median time to second purchase is 21 days. Most brands trigger re-engagement at 60.',
      revenue_at_stake_inr: revenueAtStake,
      revenue_period: 'annual',
    });
  }

  // Sort by rank_score descending, take top 3
  gaps.sort((a, b) => b.rank_score - a.rank_score);
  return gaps.slice(0, 3);
};

// ============================================================
// METRICS VS COHORT COMPARISON
// ============================================================

const buildComparisonTable = (metrics, categoryKey) => {
  const comparisons = [];

  const metricMap = [
    { key: 'repeat_revenue_pct', label: 'Revenue from repeat customers', unit: '%', sublabel: 'trailing 90 days' },
    { key: 'time_to_2nd_order_days', label: 'Time to second order', unit: ' days', sublabel: 'median', lowerIsBetter: true, metricsKey: 'time_to_2nd_order_days_median' },
  ];

  for (const m of metricMap) {
    const baseline = getBaseline(categoryKey, m.key);
    if (!baseline) continue;

    const userValue = metrics[m.metricsKey || m.key];
    let verdict = 'no_data';

    if (userValue !== undefined && userValue !== null) {
      if (m.lowerIsBetter) {
        if (userValue <= baseline.top_quartile) verdict = 'top';
        else if (userValue <= baseline.median) verdict = 'above';
        else if (userValue <= baseline.median * 1.3) verdict = 'at';
        else verdict = 'below';
      } else {
        if (userValue >= baseline.top_quartile) verdict = 'top';
        else if (userValue >= baseline.median) verdict = 'above';
        else if (userValue >= baseline.median * 0.7) verdict = 'at';
        else verdict = 'below';
      }
    }

    comparisons.push({
      key: m.key,
      label: m.label,
      sublabel: m.sublabel,
      unit: m.unit,
      you: userValue,
      cohort_median: baseline.median,
      top_quartile: baseline.top_quartile,
      verdict,
    });
  }

  return comparisons;
};

// ============================================================
// MAIN ENTRY POINT
// ============================================================

const scoreBrand = ({ metrics, manualInputs, category, brandContext }) => {
  const scoreResult = computeShelfScore(metrics, category);
  const percentile = computePercentile(scoreResult.shelf_score);
  const verdict = computeVerdict(scoreResult.shelf_score);
  const gaps = identifyGaps(metrics, manualInputs || {}, scoreResult, brandContext || {});
  const comparisons = buildComparisonTable(metrics, scoreResult.category_used);

  const totalRevenueAtStake = gaps.reduce((sum, g) => sum + (g.revenue_at_stake_inr || 0), 0);

  return {
    shelf_score: scoreResult.shelf_score,
    percentile,
    verdict,
    category_used: scoreResult.category_used,
    metric_scores: scoreResult.metric_scores,
    metrics_vs_cohort: comparisons,
    gaps,
    total_revenue_at_stake_inr: totalRevenueAtStake,
    methodology: {
      cohort_size: 13,
      window_days: 90,
      source: 'The Shelf Index, Edition 01, Anphonic',
    },
  };
};

module.exports = {
  computeShelfScore,
  computePercentile,
  computeVerdict,
  identifyGaps,
  buildComparisonTable,
  scoreBrand,
};
