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

  // All 5 metrics with weights. Only metrics the user actually entered are scored —
  // nulls/undefineds are skipped entirely so they don't drag the score toward 0.
  const METRIC_CONFIG = [
    { scoreKey: 'repeat_revenue_pct',        metricsKey: 'repeat_revenue_pct',           weight: 30, lowerIsBetter: false },
    { scoreKey: 'repeat_rate_90d_pct',        metricsKey: 'repeat_rate_90d_pct',           weight: 25, lowerIsBetter: false },
    { scoreKey: 'time_to_2nd_order_days',     metricsKey: 'time_to_2nd_order_days_median', weight: 25, lowerIsBetter: true  },
    { scoreKey: 'rebuy_revenue_share_pct',    metricsKey: 'rebuy_revenue_share_pct',       weight: 15, lowerIsBetter: false },
    { scoreKey: 'personalisation_aov_lift_pct', metricsKey: 'personalisation_aov_lift_pct', weight: 5, lowerIsBetter: false },
  ];

  const scores = {};
  let composite = 0;
  let totalWeight = 0;

  for (const m of METRIC_CONFIG) {
    const value = metrics[m.metricsKey];
    if (value === null || value === undefined || Number.isNaN(Number(value))) continue;
    const baseline = getBaseline(category, m.scoreKey);
    const s = scoreMetric(value, baseline, m.lowerIsBetter);
    scores[m.scoreKey] = Math.round(s);
    composite += s * m.weight;
    totalWeight += m.weight;
  }

  const shelfScore = totalWeight > 0 ? Math.round(composite / totalWeight) : 0;

  return {
    shelf_score: shelfScore,
    metric_scores: scores,
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

// How far below median a metric is, as 0-100 (0 = at or above median).
// When value is missing we assume a moderate 50-point gap so the metric still
// factors into priority rather than being silently ignored.
const pctBelowMedian = (value, baseline, lowerIsBetter = false) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return 50;
  if (!baseline?.median) return 50;
  const v = Number(value);
  const m = Number(baseline.median);
  if (lowerIsBetter) return v <= m ? 0 : Math.min(100, ((v - m) / m) * 100);
  return v >= m ? 0 : Math.min(100, ((m - v) / m) * 100);
};

const identifyGaps = (metrics, manualInputs = {}, scoreResult, brandContext = {}) => {
  const cat = scoreResult.category_used;
  const baselineRepeatRev  = getBaseline(cat, 'repeat_revenue_pct');
  const baselineRepeatRate = getBaseline(cat, 'repeat_rate_90d_pct');
  const baselineTTO        = getBaseline(cat, 'time_to_2nd_order_days');

  const aov = metrics.aov_inr || brandContext.aov_inr || 1200;
  const opm = metrics.orders_per_month_estimated || brandContext.orders_per_month_estimated || 1000;
  const annualRevenue = aov * opm * 12;

  const revBelow     = pctBelowMedian(metrics.repeat_revenue_pct, baselineRepeatRev);
  const repeatBelow  = pctBelowMedian(metrics.repeat_rate_90d_pct, baselineRepeatRate);
  const ttoBelow     = pctBelowMedian(metrics.time_to_2nd_order_days_median, baselineTTO, true);

  const hasLoyalty   = !!(manualInputs.loyalty  && manualInputs.loyalty  !== 'None' && manualInputs.loyalty  !== '');
  const hasWhatsapp  = !!(manualInputs.whatsapp && manualInputs.whatsapp !== 'None' && manualInputs.whatsapp !== '');
  const upsellFull   = manualInputs.upsell && manualInputs.upsell !== 'Not yet' && manualInputs.upsell !== 'Partially implemented' && manualInputs.upsell !== '';
  const upsellPartial = manualInputs.upsell === 'Partially implemented';

  const upliftReorder = baselines._gap_revenue_estimates?.missing_reorder_page?.estimated_uplift_pct || 18;
  const upliftLoyalty = baselines._gap_revenue_estimates?.missing_loyalty_program?.estimated_uplift_points || 7;
  const upliftUpsell  = baselines._gap_revenue_estimates?.missing_post_purchase_upsell?.estimated_uplift_pct || 10;
  const upliftWA      = baselines._gap_revenue_estimates?.missing_whatsapp_optin?.estimated_uplift_pct || 15;

  // Pool of 6 candidates. rank_score is computed dynamically so the pool always
  // produces at least 3 meaningful items even when the brand has all tools live.
  const pool = [

    // ── 1. Reorder Page ────────────────────────────────────────────────────
    // rank: 50 base + up to 40 pts for how far repeat-revenue is below median
    {
      id: 'missing_reorder_page',
      rank_score: 50 + revBelow * 0.4,
      title: 'No Reorder Page live.',
      comparison: 'Top quartile brands in your cohort run a dedicated /reorder page that captures 3-4x the conversion of a generic home page. You currently route returning customers through the same flow as new visitors.',
      cohort_data: 'Reorder Page is the #1 priority gap across the entire Shelf Index cohort.',
      revenue_at_stake_inr: Math.round(annualRevenue * upliftReorder / 100),
      revenue_period: 'annual',
    },

    // ── 2. 90-day repeat rate ───────────────────────────────────────────────
    // rank: 45 base + up to 40 pts for how far repeat-rate is below median
    {
      id: 'low_repeat_rate',
      rank_score: 45 + repeatBelow * 0.4,
      title: '90-day repeat rate below cohort.',
      comparison: `Top quartile brands in your category achieve ${baselineRepeatRate?.top_quartile ?? 35}%+ repeat rate within 90 days. Cohort median is ${baselineRepeatRate?.median ?? 25}%. A Day-21 trigger sequence — across WhatsApp and email — is the single highest-leverage lever.`,
      cohort_data: '90-day repeat rate is the strongest leading indicator of LTV in the Shelf Index data.',
      revenue_at_stake_inr: Math.round(annualRevenue * 0.15),
      revenue_period: 'annual',
    },

    // ── 3. Loyalty program ─────────────────────────────────────────────────
    // rank: 85 if missing, 38 if live (still in the pool but deprioritised)
    {
      id: 'missing_loyalty_program',
      rank_score: hasLoyalty ? 38 : 85,
      title: hasLoyalty
        ? 'Loyalty program live — validate redemption rate.'
        : 'No loyalty program live.',
      comparison: hasLoyalty
        ? 'You have a loyalty program. Top quartile brands see 11-18% redemption rates and a 14-point lift in 90-day repeat rate. Confirm your redemption rate is tracking in that band.'
        : 'Top quartile brands in this cohort run Nector or POPcoins with redemption rates of 11-18%. Their 90-day repeat rate sits 14 points above cohort median. You have no loyalty system.',
      cohort_data: 'Cohort data shows loyalty programs lift repeat rate by ~7 points within 90 days of launch.',
      revenue_at_stake_inr: Math.round(annualRevenue * upliftLoyalty / 100 * 1.5),
      revenue_period: 'annual',
    },

    // ── 4. Post-purchase upsell ────────────────────────────────────────────
    // rank: 75 if missing, 62 if partial, 30 if fully live
    {
      id: 'missing_post_purchase_upsell',
      rank_score: upsellFull ? 30 : upsellPartial ? 62 : 75,
      title: upsellFull
        ? 'Post-purchase upsell live — benchmark AOV lift.'
        : upsellPartial
          ? 'Post-purchase upsell only partially live.'
          : 'No post-purchase upsell flow.',
      comparison: upsellFull
        ? 'Your post-purchase upsell is live. Top quartile brands capture 14-22% of post-purchase visits with a one-click offer. Track AOV uplift vs. a non-upsell control group.'
        : 'Top quartile brands capture 14-22% of post-purchase visits with a one-click upsell or thank-you-page offer. You show a static thank-you page.',
      cohort_data: 'Cohort data shows post-purchase AOV uplift averages 8-12% when implemented well.',
      revenue_at_stake_inr: Math.round(annualRevenue * upliftUpsell / 100),
      revenue_period: 'annual',
    },

    // ── 5. WhatsApp re-engagement ──────────────────────────────────────────
    // rank: 80 if missing, 32 if live
    {
      id: 'missing_whatsapp_optin',
      rank_score: hasWhatsapp ? 32 : 80,
      title: hasWhatsapp
        ? 'WhatsApp channel active — check trigger timing.'
        : 'No WhatsApp re-engagement live.',
      comparison: hasWhatsapp
        ? 'Your WhatsApp flow is live. Top quartile brands fire a Reorder URL at Day-21. Confirm your trigger window — most brands set it too late (Day-60+) and lose the reorder window.'
        : 'Top quartile brands run Day-21 WhatsApp Reorder URL flows that drive 12-22% of repeat revenue. WhatsApp read rates sit above 80% across all India geographies. You have no WhatsApp re-engagement layer.',
      cohort_data: 'Median time to second purchase is 21 days. Most brands trigger re-engagement at 60.',
      revenue_at_stake_inr: Math.round(annualRevenue * upliftWA / 100),
      revenue_period: 'annual',
    },

    // ── 6. Time to second order ────────────────────────────────────────────
    // rank: 35 base + up to 35 pts for how far TTO is above median
    {
      id: 'slow_time_to_second_order',
      rank_score: 35 + ttoBelow * 0.35,
      title: 'Time to second order above cohort.',
      comparison: `Cohort median for time to second purchase is ${baselineTTO?.median ?? 21} days. Top quartile brands see reorders within ${baselineTTO?.top_quartile ?? 14} days through trigger-based flows. Compressing this window by even 5 days meaningfully increases 12-month LTV.`,
      cohort_data: 'Faster second orders compound into significantly higher LTV at 12 months.',
      revenue_at_stake_inr: Math.round(annualRevenue * 0.12),
      revenue_period: 'annual',
    },
  ];

  // Sort by rank_score descending — top 3 always returned from a pool of 6
  pool.sort((a, b) => b.rank_score - a.rank_score);
  return pool.slice(0, 3);
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
