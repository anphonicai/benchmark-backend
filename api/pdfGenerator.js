const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

// Anphonic logo SVG — white text variant (no background rect, cls-2 flipped to #fff)
const LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 505.11 180" style="height:36px;width:auto;display:block;">
  <defs><style>
    .cls-1{fill:#4ad3d3}.cls-2{fill:#ffffff}.cls-3{fill:#1c9393}.cls-4{fill:#30b4b7}
  </style></defs>
  <g>
    <g>
      <g>
        <path class="cls-2" d="m163.72,97.04c0-8.18,6.95-11.51,15.34-11.51h9.12c0-6.15-3.26-8.76-7.82-8.76-4.12,0-7.45,1.81-8.18,5.86h-7.74c.65-7.74,8.03-12.3,15.99-12.3,10.42,0,15.49,6.3,15.49,14.98v21.78h-6.65s-.16-6.08-.16-6.08c-2.32,3.91-7.02,6.95-12.66,6.95-6.95,0-12.74-3.91-12.74-10.93Zm24.46-6.01v-.14h-8.54c-4.2,0-8.03,1.3-8.03,5.5,0,3.62,2.97,5.28,6.66,5.28,5.93,0,9.91-4.92,9.91-10.64Z"/>
        <path class="cls-2" d="m204.32,71.21h7.38l.14,5.28c2.39-3.98,7.02-6.15,11.87-6.15,8.39,0,14.11,5.28,14.11,15.7v21.06h-7.67v-20.12c0-6.44-2.97-10.13-8.68-10.13s-9.48,4.12-9.48,11v19.25h-7.67v-35.89Z"/>
        <path class="cls-2" d="m245.43,71.21h7.38l.29,5.43c2.53-3.62,6.8-6.3,12.59-6.3,10.64,0,17.22,8.25,17.22,18.74s-6.73,18.89-17.22,18.89c-6.01,0-10.42-2.82-12.59-6.37v21.42h-7.67v-51.81Zm29.67,17.87c0-7.24-4.56-12.08-11-12.08s-10.93,4.99-10.93,12.16,4.34,12.08,10.93,12.08,11-5.21,11-12.16Z"/>
        <path class="cls-2" d="m289.78,56.45h7.67v19.9c2.39-3.91,7.09-6.01,11.87-6.01,8.25,0,13.97,5.28,13.97,15.7v21.06h-7.6v-20.12c0-6.44-2.97-10.13-8.61-10.13s-9.62,4.12-9.62,11v19.25h-7.67v-50.66Z"/>
        <path class="cls-2" d="m329.51,89.08c0-11.58,8.18-18.74,18.67-18.74s18.67,7.09,18.67,18.74c0,11-7.89,18.89-18.96,18.89-10.42,0-18.38-7.24-18.38-18.89Zm29.53-.07c0-7.24-4.56-12.01-11-12.01-6.8,0-10.78,5.21-10.78,12.08,0,8.03,5.07,12.23,10.71,12.23,6.37,0,11.07-5.14,11.07-12.3Z"/>
        <path class="cls-2" d="m373.72,71.21h7.38l.14,5.28c2.39-3.98,7.02-6.15,11.87-6.15,8.39,0,14.11,5.28,14.11,15.7v21.06h-7.67v-20.12c0-6.44-2.97-10.13-8.68-10.13s-9.48,4.12-9.48,11v19.25h-7.67v-35.89Z"/>
        <path class="cls-2" d="m415.33,71.21h7.67v35.89h-7.67v-35.89Z"/>
        <path class="cls-2" d="m430.38,89.16c0-11,7.16-18.81,18.02-18.81,8.54,0,14.91,4.56,16.72,12.52h-8.1c-.87-3.55-4.2-6.01-8.68-6.01-6.8,0-10.13,5.72-10.13,12.3,0,6.95,3.76,12.3,10.13,12.3,4.34,0,7.67-2.1,8.68-6.08h8.1c-1.74,7.67-8.18,12.59-16.72,12.59-10.57,0-18.02-7.6-18.02-18.81Z"/>
      </g>
      <rect class="cls-2" x="414.75" y="54.75" width="8.84" height="8.84"/>
    </g>
    <g>
      <g>
        <path class="cls-3" d="m117.74,90c-3.68-1.61-7.14-3.63-10.34-5.98-4.4-3.23-8.32-7.12-11.57-11.5-2.35-3.15-4.37-6.57-5.99-10.21-3.07-6.81-4.77-14.37-4.77-22.32h-10.03c0,5.49.69,10.83,1.98,15.92,1.5,5.9,3.82,11.47,6.82,16.6,1.77,3.03,3.77,5.9,5.99,8.59,2.68,3.24,5.68,6.22,8.93,8.89,2.71,2.22,5.59,4.22,8.64,5.98,5.21,3.02,10.87,5.32,16.85,6.79,4.67,1.15,9.53,1.79,14.54,1.84v-10.02c-7.48-.12-14.59-1.74-21.06-4.59Z"/>
        <path class="cls-3" d="m109.39,40h-10.03c0,5.65,1.17,11.04,3.29,15.92,4.14,9.61,11.93,17.29,21.61,21.31,4.5,1.87,9.4,2.95,14.54,3.05v-10.02c-16.29-.46-29.4-13.85-29.4-30.26Z"/>
      </g>
      <g>
        <path class="cls-4" d="m94.61,40c0,7.94-1.7,15.5-4.77,22.32-1.64,3.63-3.65,7.05-6,10.21-3.26,4.38-7.17,8.27-11.58,11.5-3.2,2.35-6.66,4.37-10.34,5.98-6.71,2.95-14.12,4.6-21.92,4.6v10.03c5.31,0,10.47-.64,15.4-1.86,5.99-1.47,11.66-3.77,16.85-6.79,3.05-1.76,5.94-3.76,8.65-5.98,3.26-2.67,6.24-5.65,8.92-8.89,2.22-2.69,4.23-5.56,6-8.59,3-5.13,5.31-10.7,6.82-16.6,1.3-5.09,1.98-10.43,1.98-15.92h-10.03Z"/>
        <path class="cls-4" d="m70.28,40c0,16.69-13.58,30.27-30.28,30.27v10.03c5.45,0,10.65-1.09,15.4-3.06,9.68-4.02,17.47-11.7,21.61-21.31,2.11-4.88,3.29-10.27,3.29-15.92h-10.03Z"/>
      </g>
      <g>
        <path class="cls-4" d="m124.26,77.23c-5.99,1.47-11.65,3.77-16.85,6.79-3.05,1.76-5.93,3.76-8.64,5.98-3.26,2.66-6.25,5.64-8.93,8.89-2.22,2.68-4.23,5.56-5.99,8.59-3,5.12-5.31,10.7-6.82,16.6-1.3,5.09-1.98,10.43-1.98,15.92h10.03c0-7.95,1.7-15.5,4.77-22.32,1.63-3.63,3.64-7.05,5.99-10.21,3.26-4.38,7.17-8.27,11.57-11.5,3.2-2.35,6.66-4.37,10.34-5.98,6.46-2.85,13.58-4.47,21.06-4.59v-10.02c-5.01.05-9.87.69-14.54,1.84Z"/>
        <path class="cls-4" d="m124.26,102.77c-9.68,4.02-17.46,11.7-21.61,21.31-2.11,4.88-3.29,10.27-3.29,15.92h10.03c0-16.41,13.11-29.8,29.4-30.26v-10.02c-5.14.1-10.04,1.18-14.54,3.05Z"/>
      </g>
      <g>
        <path class="cls-1" d="m102.65,124.08c-1.5-5.9-3.82-11.48-6.82-16.6-1.77-3.03-3.78-5.91-6-8.59-2.68-3.25-5.67-6.22-8.92-8.89-2.71-2.22-5.6-4.22-8.65-5.98-5.2-3.02-10.87-5.32-16.85-6.79-4.94-1.22-10.1-1.86-15.4-1.86v10.03c7.8,0,15.21,1.64,21.92,4.6,3.68,1.61,7.14,3.63,10.34,5.98,4.41,3.23,8.32,7.12,11.58,11.5,2.35,3.15,4.37,6.57,6,10.21,3.06,6.81,4.77,14.37,4.77,22.32h10.03c0-5.49-.69-10.83-1.98-15.92Z"/>
        <path class="cls-1" d="m77.02,124.08c-4.14-9.61-11.93-17.3-21.61-21.31-4.75-1.97-9.95-3.06-15.4-3.06v10.03c16.69,0,30.28,13.58,30.28,30.27h10.03c0-5.65-1.17-11.04-3.29-15.92Z"/>
      </g>
    </g>
  </g>
</svg>`;

const getExecutablePath = () => {
  if (process.env.PUPPETEER_EXECUTABLE_PATH) return process.env.PUPPETEER_EXECUTABLE_PATH;
  if (process.platform === 'darwin') return '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  return '/usr/bin/chromium-browser';
};

const launchBrowser = () =>
  puppeteer.launch({
    executablePath: getExecutablePath(),
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--no-zygote',        // required for Cloud Run — disables the zygote process that fails in restricted containers
      '--single-process',   // required for Cloud Run — runs renderer in the main process instead of forking
    ],
    headless: true,
  });

// Cache the shelf index PDF per process lifetime (it's static content)
let shelfIndexCache = null;

const generateShelfIndexPdf = async () => {
  if (shelfIndexCache) return shelfIndexCache;

  // Read the SVG and prepare it for safe inline injection:
  // 1. Use the branded white-background version as requested
  // 2. Strip <?xml?> declaration (invalid inside HTML)
  // 3. Convert class-based fills → inline fill attributes so the page's own
  //    CSS (which may define .cls-1 etc. differently) can't override logo colours
  const logoSvgPath = path.join(__dirname, '../client/anphonic-logo-white-bg.svg');
  const logoSvgRaw = fs.readFileSync(logoSvgPath, 'utf8');
  const logoSvgContent = logoSvgRaw
    .replace(/<\?xml[^?]*\?>\s*/i, '')
    .replace(/<defs>[\s\S]*?<\/defs>/i, '')   // remove <defs><style>…</style></defs>
    .replace(/class="cls-1"/g, 'fill="#4ad3d3"')
    .replace(/class="cls-2"/g, 'fill="#080a0a"')
    .replace(/class="cls-3"/g, 'fill="#1c9393"')
    .replace(/class="cls-4"/g, 'fill="#30b4b7"')
    .replace(/class="cls-5"/g, 'fill="#ffffff"');

  const browser = await launchBrowser();
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });
    const filePath = path.join(__dirname, '../client/shelf-index.html');
    await page.goto(`file://${filePath}`, { waitUntil: 'networkidle2', timeout: 30000 });

    // Root-relative paths like /anphonic-logo.svg don't resolve under file://.
    // Replace every broken <img src="/anphonic-logo.svg"> with the inline SVG,
    // preserving the height/width styles from the original element.
    // NOTE: logoSvgContent already has class-based fills converted to inline fills
    // so the page's own CSS classes can't override the logo colours.
    await page.evaluate((svgContent) => {
      document.querySelectorAll('img[src="/anphonic-logo.svg"]').forEach((img) => {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = svgContent;
        const svg = wrapper.firstElementChild;
        if (!svg) return;
        svg.style.height = img.style.height || img.getAttribute('height') || '44px';
        svg.style.width = img.style.width || img.getAttribute('width') || 'auto';
        svg.style.display = 'block';
        svg.removeAttribute('id');
        img.parentNode.replaceChild(svg, img);
      });
    }, logoSvgContent);

    // Use screen media so the full document renders — the existing @media print CSS
    // hides everything except the scorecard overlay (used by the in-page Save as PDF button).
    await page.emulateMediaType('screen');

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });
    shelfIndexCache = pdf;
    return pdf;
  } finally {
    await browser.close();
  }
};

const formatINR = (n) => {
  if (!n) return '₹0';
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  return `₹${n.toLocaleString('en-IN')}`;
};

const verdictColor = (score) => {
  if (score >= 70) return '#14b8a6';
  if (score >= 45) return '#D4A54A';
  return '#f87171';
};

const pillHtml = (verdict) => {
  if (verdict === 'top') {
    return `<span style="display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:20px;font-size:10px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;background:#e0f5f1;color:#14b8a6;border:1px solid #b6ece7;">
      <span style="width:6px;height:6px;border-radius:50%;background:#14b8a6;display:inline-block;"></span>Top Quartile</span>`;
  }
  if (verdict === 'above') {
    return `<span style="display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:20px;font-size:10px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;background:#e0f5f1;color:#14b8a6;border:1px solid #b6ece7;">
      <span style="width:6px;height:6px;border-radius:50%;background:#14b8a6;display:inline-block;"></span>Above Cohort</span>`;
  }
  return `<span style="display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:20px;font-size:10px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;background:#fef2f2;color:#f87171;border:1px solid #fecaca;">
    <span style="width:6px;height:6px;border-radius:50%;background:#f87171;display:inline-block;"></span>Below Cohort</span>`;
};

const buildReportHtml = ({ scoreResult, brandName, category, generatedDate }) => {
  const score = scoreResult.shelf_score ?? 0;
  const percentile = scoreResult.percentile ?? 0;
  const verdict = scoreResult.verdict ?? {};
  const gaps = (scoreResult.gaps ?? []).filter((g) => g.id !== 'underutilised_rebuy').slice(0, 3);
  const metrics = (scoreResult.metrics_vs_cohort ?? []).filter(
    (m) => !['rebuy_revenue_share_pct', 'personalisation_aov_lift_pct'].includes(m.key)
  );
  const totalRevenue = scoreResult.total_revenue_at_stake_inr ?? 0;
  const scoreColour = verdictColor(score);
  const cat = category || scoreResult.category_used || 'Overall';
  const date = generatedDate || new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase();

  const metricRows = metrics.map((m) => {
    if (m.you === null || m.you === undefined) return '';
    const you = Number(m.you);
    const median = Number(m.cohort_median ?? 0);
    const topQ = Number(m.top_quartile ?? 0);
    const lowerIsBetter = m.key === 'time_to_2nd_order_days';
    const unit = m.unit ?? '';

    let barYou, barMedian, barTopQ;
    if (lowerIsBetter) {
      const maxRef = Math.max(you, median) * 1.5 || 1;
      barYou = Math.round(((maxRef - you) / maxRef) * 100);
      barMedian = Math.round(((maxRef - median) / maxRef) * 100);
      barTopQ = Math.round(((maxRef - topQ) / maxRef) * 100);
    } else {
      const maxRef = topQ * 1.3 || 1;
      barYou = Math.round((you / maxRef) * 100);
      barMedian = Math.round((median / maxRef) * 100);
      barTopQ = Math.round((topQ / maxRef) * 100);
    }

    return `
    <tr style="border-top:1px solid #F0EDE8;">
      <td style="padding:16px 20px;vertical-align:middle;">
        <div style="font-weight:500;font-size:13px;color:#0a1f3d;">${m.label}</div>
        <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#9CA3AF;margin-top:2px;">${m.sublabel ?? ''}</div>
      </td>
      <td style="padding:16px 20px;text-align:center;vertical-align:middle;">
        <span style="font-size:20px;font-weight:700;color:#D4A54A;">${you}${unit}</span>
      </td>
      <td style="padding:16px 20px;vertical-align:middle;width:200px;">
        <div style="position:relative;height:8px;background:#f0ede8;border-radius:4px;overflow:hidden;">
          <div style="position:absolute;left:0;top:0;bottom:0;width:${Math.min(barYou, 92)}%;background:#D4A54A;border-radius:4px;"></div>
          <div style="position:absolute;left:${Math.min(barMedian, 88)}%;top:-2px;bottom:-2px;width:2px;background:#0a1f3d;opacity:0.3;"></div>
          <div style="position:absolute;left:${Math.min(barTopQ, 88)}%;top:-2px;bottom:-2px;width:2px;background:#14b8a6;opacity:0.6;"></div>
        </div>
        <div style="display:flex;justify-content:space-between;margin-top:4px;font-size:9px;color:#9CA3AF;">
          <span>Median ${median}${unit}</span>
          <span style="color:#14b8a6;">Top Q ${topQ}${unit}</span>
        </div>
      </td>
      <td style="padding:16px 20px;text-align:right;vertical-align:middle;">${pillHtml(m.verdict)}</td>
    </tr>`;
  }).join('');

  const gapCards = gaps.map((g) => {
    const revenue = g.revenue_at_stake_inr
      ? `₹${(g.revenue_at_stake_inr / 100000).toFixed(1)}L`
      : '';
    const action = {
      missing_reorder_page: 'Build a dedicated /reorder page or use Rebuy Smart Cart to capture returning customers.',
      missing_loyalty_program: 'Set up Nector or POPcoins — most brands go live in under 3 weeks with meaningful repeat rate uplift.',
      missing_post_purchase_upsell: 'Add a one-click thank-you page offer via Rebuy, Zipify, or AfterSell. Start with your top-selling SKU.',
      missing_whatsapp_optin: 'Launch a Day-21 WhatsApp Reorder URL flow via Interakt, Wati, or Kwick Engage. Single flow, big impact.',
    }[g.id] || '';

    return `
    <div style="border:1px solid #E8E3DA;border-radius:12px;padding:24px;background:#fff;margin-bottom:16px;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px;">
        <div style="font-size:14px;font-weight:600;color:#0a1f3d;max-width:75%;">${g.title}</div>
        ${revenue ? `<div style="font-size:18px;font-weight:700;color:#D4A54A;white-space:nowrap;">${revenue}</div>` : ''}
      </div>
      <p style="font-size:12px;color:#6B7280;line-height:1.7;margin:0 0 10px;">${g.comparison ?? g.description ?? ''}</p>
      ${g.cohort_data ? `<p style="font-size:11px;color:#9CA3AF;line-height:1.6;margin:0 0 12px;">${g.cohort_data}</p>` : ''}
      ${action ? `<div style="background:#f0fdf9;border-left:3px solid #14b8a6;padding:10px 14px;border-radius:0 6px 6px 0;font-size:11px;color:#0f766e;line-height:1.6;">${action}</div>` : ''}
    </div>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Anphonic Shelf Benchmark — ${brandName}</title>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;1,700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', sans-serif; background: #fafaf8; color: #1a1a2e; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .serif { font-family: 'Playfair Display', Georgia, serif; }
    table { border-collapse: collapse; width: 100%; }
  </style>
</head>
<body>

<!-- ── HERO ─────────────────────────────────────────────────────────────── -->
<div style="background:#0a1f3d;padding:56px 64px 48px;min-height:420px;position:relative;">

  <!-- Logo -->
  <div style="margin-bottom:48px;">${LOGO_SVG}</div>

  <!-- Label -->
  <div style="font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:rgba(255,255,255,0.4);margin-bottom:16px;font-weight:500;">
    Shelf Score · ${cat} · ${date}
  </div>

  <!-- Score + verdict grid -->
  <div style="display:flex;gap:80px;align-items:flex-start;margin-bottom:40px;">

    <!-- Score -->
    <div style="flex-shrink:0;">
      <div style="font-family:'Playfair Display',serif;font-size:100px;font-weight:300;color:#fff;line-height:1;letter-spacing:-0.04em;">
        ${score}<span style="font-size:40px;color:${scoreColour};margin-left:4px;">/100</span>
      </div>
      <!-- Bar -->
      <div style="position:relative;height:6px;background:rgba(255,255,255,0.1);border-radius:3px;max-width:280px;margin-top:16px;overflow:hidden;">
        <div style="position:absolute;left:0;top:0;bottom:0;width:${score}%;background:linear-gradient(90deg,#14b8a6,#10b981);border-radius:3px;"></div>
        <div style="position:absolute;left:50%;top:0;bottom:0;width:1px;background:rgba(255,255,255,0.3);"></div>
      </div>
      <div style="display:flex;justify-content:space-between;max-width:280px;margin-top:6px;font-size:9px;color:rgba(255,255,255,0.3);">
        <span>0</span><span>Median 50</span><span>100</span>
      </div>
    </div>

    <!-- Verdict -->
    <div style="padding-top:8px;max-width:380px;">
      <div class="serif" style="font-size:26px;color:#fff;font-weight:700;line-height:1.35;margin-bottom:12px;">
        ${verdict.headline ?? ''}
      </div>
      <p style="font-size:13px;color:rgba(255,255,255,0.55);line-height:1.75;">
        ${verdict.cohort_comparison ?? ''}
      </p>
    </div>

  </div>

  <!-- Percentile strip -->
  <div style="display:inline-flex;align-items:center;gap:12px;padding:10px 18px;border-radius:10px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.05);font-size:13px;">
    <span style="font-weight:600;color:${scoreColour};">${percentile}th percentile</span>
    <span style="color:rgba(255,255,255,0.2);">·</span>
    <span style="color:rgba(255,255,255,0.5);">${percentile < 50 ? 'below median' : percentile < 75 ? 'above median' : 'top quartile'}</span>
    <span style="color:rgba(255,255,255,0.2);">·</span>
    <span style="color:rgba(255,255,255,0.5);">${brandName}</span>
  </div>

</div>

<!-- ── METRICS ────────────────────────────────────────────────────────────── -->
<div style="padding:48px 64px;">

  <div style="margin-bottom:28px;">
    <div style="font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:#C4BFB8;font-weight:500;margin-bottom:8px;">Metric by metric</div>
    <div class="serif" style="font-size:28px;color:#0a1f3d;margin-bottom:6px;">Where you sit.</div>
    <p style="font-size:12px;color:#9CA3AF;">Anonymized cohort of 13 brands · 90-day rolling window · India D2C</p>
  </div>

  <!-- Legend -->
  <div style="display:flex;gap:20px;margin-bottom:20px;font-size:11px;color:#6B7280;">
    <span style="display:flex;align-items:center;gap:6px;"><span style="width:16px;height:8px;background:#D4A54A;border-radius:2px;display:inline-block;"></span>You</span>
    <span style="display:flex;align-items:center;gap:6px;"><span style="width:2px;height:16px;background:#0a1f3d;opacity:0.3;display:inline-block;"></span>Cohort median</span>
    <span style="display:flex;align-items:center;gap:6px;"><span style="width:2px;height:16px;background:#14b8a6;opacity:0.6;display:inline-block;"></span>Top quartile</span>
  </div>

  <div style="border:1px solid #E8E3DA;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.04);">
    <table>
      <thead>
        <tr style="background:#f8f6f3;">
          <th style="padding:12px 20px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#9CA3AF;font-weight:500;">Metric</th>
          <th style="padding:12px 20px;text-align:center;font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#9CA3AF;font-weight:500;">Your value</th>
          <th style="padding:12px 20px;font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#9CA3AF;font-weight:500;">vs Cohort</th>
          <th style="padding:12px 20px;text-align:right;font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#9CA3AF;font-weight:500;">Standing</th>
        </tr>
      </thead>
      <tbody>
        ${metricRows || '<tr><td colspan="4" style="padding:24px;text-align:center;color:#9CA3AF;font-size:13px;">No metric data available</td></tr>'}
      </tbody>
    </table>
  </div>

</div>

<!-- ── GAPS ───────────────────────────────────────────────────────────────── -->
<div style="padding:0 64px 56px;">

  <div style="margin-bottom:28px;">
    <div style="font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:#C4BFB8;font-weight:500;margin-bottom:8px;">Revenue at stake</div>
    <div style="display:flex;align-items:baseline;gap:12px;flex-wrap:wrap;">
      <div class="serif" style="font-size:28px;color:#0a1f3d;">Your top gaps.</div>
      ${totalRevenue ? `<div style="font-size:24px;font-weight:700;color:#D4A54A;">${formatINR(totalRevenue)} at stake</div>` : ''}
    </div>
    <p style="font-size:12px;color:#9CA3AF;margin-top:6px;">Estimated annual revenue impact of closing each gap, based on cohort benchmarks.</p>
  </div>

  ${gapCards || '<p style="color:#9CA3AF;font-size:13px;">No gaps identified.</p>'}

</div>

<!-- ── CTA ────────────────────────────────────────────────────────────────── -->
<div style="background:#0a1f3d;padding:48px 64px;text-align:center;">
  <div style="font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:rgba(255,255,255,0.4);margin-bottom:12px;font-weight:500;">Free · 20 minutes · No commitment</div>
  <div class="serif" style="font-size:26px;color:#fff;margin-bottom:12px;">Book your diagnostic call.</div>
  <p style="font-size:13px;color:rgba(255,255,255,0.5);margin-bottom:28px;max-width:400px;margin-left:auto;margin-right:auto;line-height:1.7;">
    We'll walk through your gaps and show how top quartile brands close them.
  </p>
  <a href="https://calendar.app.google/2XQVSd57xK9B49Y68"
     style="display:inline-block;background:#14b8a6;color:#fff;padding:16px 40px;border-radius:8px;font-weight:600;font-size:15px;letter-spacing:0.02em;text-decoration:none;">
    Book a slot →
  </a>
  <div style="margin-top:10px;font-size:11px;color:rgba(255,255,255,0.3);">Opens Google Calendar · 20 min</div>
  <div style="margin-top:32px;padding-top:24px;border-top:1px solid rgba(255,255,255,0.08);display:flex;justify-content:center;align-items:center;gap:24px;">
    <div style="opacity:0.4;">${LOGO_SVG.replace('height:36px', 'height:24px')}</div>
    <span style="font-size:11px;color:rgba(255,255,255,0.25);">merchants@anphonic.ai · Shelf Index Edition 01 · Cohort of 13 India D2C brands</span>
  </div>
</div>

</body>
</html>`;
};

const generateReportPdf = async (scoreResult, brandName, category) => {
  const html = buildReportHtml({ scoreResult, brandName, category });
  const browser = await launchBrowser();
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 900 });
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 });
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });
    return pdf;
  } finally {
    await browser.close();
  }
};

module.exports = { generateShelfIndexPdf, generateReportPdf, buildReportHtml };
