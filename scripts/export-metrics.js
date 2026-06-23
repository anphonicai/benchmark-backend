#!/usr/bin/env node
// Exports benchmark form submissions to Excel.
// Runs the Cloud SQL proxy, queries the DB, writes exports/benchmark-metrics.xlsx, then exits.
//
// Usage:  node scripts/export-metrics.js
// Cron:   every 30 min — see crontab instructions at the bottom of this file

require('dotenv').config();
const { spawn }  = require('child_process');
const path       = require('path');
const { Pool }   = require('pg');
const ExcelJS    = require('exceljs');
const { google } = require('googleapis');

const SHEET_ID   = '1dSQdImQ299DiIEkTlzEKdbK2yycW_gx-GnoSQZmKkXE';
const KEY_FILE   = path.join(__dirname, '../exports/sheets-key.json');

const PROXY_BIN  = path.join(__dirname, '../google-cloud-sdk/bin/cloud-sql-proxy');
const INSTANCE   = 'daring-charmer-498305-e7:asia-south1:benchmark-db';
const PROXY_PORT = 5434; // separate port so it doesn't clash with dev proxy
const OUT_FILE   = path.join(__dirname, '../exports/benchmark-metrics.xlsx');

const NAVY = 'FF0A1F3D';
const TEAL = 'FF009689';
const WHITE = 'FFFFFFFF';
const LIGHT = 'FFF7F8FA';

// ── helpers ──────────────────────────────────────────────────────────────────

function startProxy() {
  return new Promise((resolve, reject) => {
    const proxy = spawn(PROXY_BIN, [`--port=${PROXY_PORT}`, INSTANCE], { stdio: ['ignore', 'pipe', 'pipe'] });
    const onData = (chunk) => {
      const msg = chunk.toString();
      if (msg.includes('ready for new connections')) { proxy.stdout.off('data', onData); resolve(proxy); }
      if (msg.includes('Error') || msg.includes('error'))  { proxy.kill(); reject(new Error(msg.trim())); }
    };
    proxy.stdout.on('data', onData);
    proxy.stderr.on('data', onData);
    setTimeout(() => reject(new Error('Proxy timed out after 15 s')), 15000);
  });
}

function makePool() {
  return new Pool({
    user: process.env.DB_USER,
    host: '127.0.0.1',
    port: PROXY_PORT,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
  });
}

function headerStyle(cell, bg = NAVY) {
  cell.font  = { bold: true, color: { argb: WHITE }, size: 10, name: 'Calibri' };
  cell.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
  cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: false };
  cell.border = {
    bottom: { style: 'thin', color: { argb: TEAL } },
  };
}

function dataStyle(cell, even) {
  cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: even ? LIGHT : WHITE } };
  cell.alignment = { vertical: 'middle', horizontal: 'left' };
  cell.font      = { size: 10, name: 'Calibri' };
}

function currencyStyle(cell, even) {
  dataStyle(cell, even);
  cell.numFmt = '₹#,##0.00';
  cell.alignment.horizontal = 'right';
}

function pctStyle(cell, even) {
  dataStyle(cell, even);
  cell.numFmt = '0.00"%"';
  cell.alignment.horizontal = 'right';
}

function scoreStyle(cell, even) {
  dataStyle(cell, even);
  cell.alignment.horizontal = 'center';
  const v = cell.value;
  if (typeof v === 'number') {
    cell.font = {
      ...cell.font,
      bold: true,
      color: { argb: v >= 70 ? 'FF009689' : v >= 40 ? 'FFFF8C00' : 'FFE53E3E' },
    };
  }
}

// ── queries ───────────────────────────────────────────────────────────────────

const LATEST_SQL = `
  SELECT DISTINCT ON (c.id)
    c.id                                                   AS "Company ID",
    c.company_name                                         AS "Brand Name",
    c.contact_name                                         AS "Contact",
    c.contact_email                                        AS "Email",
    c.phone                                                AS "Phone",
    c.category                                             AS "Category",
    c.shopify_store_url                                    AS "Shopify URL",
    TO_CHAR(c.created_at AT TIME ZONE 'Asia/Kolkata', 'DD-Mon-YYYY HH12:MI AM')
                                                           AS "Signed Up (IST)",
    m.average_order_value                                  AS "Avg Order Value (₹)",
    m.orders_per_month                                     AS "Orders / Month",
    ROUND(m.add_to_cart_rate::numeric, 2)                  AS "Add to Cart Rate (%)",
    ROUND(m.repeat_revenue_pct::numeric, 2)                AS "Repeat Revenue Share (%)",
    ROUND(m.repeat_rate_90d_pct::numeric, 2)               AS "Repeat Rate 90d (%)",
    m.time_to_2nd_order_days                               AS "Time to 2nd Order (days)",
    ROUND(m.rebuy_revenue_share_pct::numeric, 2)           AS "Rebuy Revenue Share (%)",
    ROUND(m.personalisation_aov_lift_pct::numeric, 2)      AS "Personalisation AOV Lift (%)",
    m.loyalty                                              AS "Loyalty Tool",
    m.post_purchase_upsell                                 AS "Post-Purchase Upsell",
    m.whatsapp_tool                                        AS "WhatsApp Tool",
    m.shelf_score                                          AS "Shelf Score",
    m.cohort_percentile                                    AS "Cohort Percentile",
    TO_CHAR(m.created_at AT TIME ZONE 'Asia/Kolkata', 'DD-Mon-YYYY HH12:MI AM')
                                                           AS "Last Submission (IST)"
  FROM companies c
  INNER JOIN metrics m ON m.company_id = c.id
  ORDER BY c.id, m.created_at DESC;
`;

const SHELF_LEADS_SQL = `
  SELECT
    id                                                             AS "ID",
    full_name                                                      AS "Full Name",
    email                                                          AS "Email",
    brand_url                                                      AS "Brand URL",
    phone                                                          AS "Phone",
    source                                                         AS "Source",
    TO_CHAR(created_at AT TIME ZONE 'Asia/Kolkata', 'DD-Mon-YYYY HH12:MI AM')
                                                                   AS "Unlocked At (IST)"
  FROM shelf_index_leads
  ORDER BY created_at DESC;
`;

const ALL_SUBMISSIONS_SQL = `
  SELECT
    m.id                                                   AS "Row ID",
    c.id                                                   AS "Company ID",
    c.company_name                                         AS "Brand Name",
    c.contact_email                                        AS "Email",
    c.category                                             AS "Category",
    m.average_order_value                                  AS "Avg Order Value (₹)",
    m.orders_per_month                                     AS "Orders / Month",
    ROUND(m.add_to_cart_rate::numeric, 2)                  AS "Add to Cart Rate (%)",
    ROUND(m.repeat_revenue_pct::numeric, 2)                AS "Repeat Revenue Share (%)",
    ROUND(m.repeat_rate_90d_pct::numeric, 2)               AS "Repeat Rate 90d (%)",
    m.time_to_2nd_order_days                               AS "Time to 2nd Order (days)",
    ROUND(m.rebuy_revenue_share_pct::numeric, 2)           AS "Rebuy Revenue Share (%)",
    ROUND(m.personalisation_aov_lift_pct::numeric, 2)      AS "Personalisation AOV Lift (%)",
    m.loyalty                                              AS "Loyalty Tool",
    m.post_purchase_upsell                                 AS "Post-Purchase Upsell",
    m.whatsapp_tool                                        AS "WhatsApp Tool",
    m.shelf_score                                          AS "Shelf Score",
    m.cohort_percentile                                    AS "Cohort Percentile",
    TO_CHAR(m.created_at AT TIME ZONE 'Asia/Kolkata', 'DD-Mon-YYYY HH12:MI AM')
                                                           AS "Submitted (IST)"
  FROM metrics m
  INNER JOIN companies c ON c.id = m.company_id
  ORDER BY m.created_at DESC;
`;

// ── sheet builder ─────────────────────────────────────────────────────────────

function buildSheet(ws, rows, colWidths, currencyCols = [], pctCols = [], scoreCols = []) {
  if (!rows.length) { ws.addRow(['No data yet.']); return; }

  const headers = Object.keys(rows[0]);

  // Header row
  const hRow = ws.addRow(headers);
  hRow.height = 24;
  hRow.eachCell(cell => headerStyle(cell));

  // Freeze header
  ws.views = [{ state: 'frozen', ySplit: 1 }];

  // Data rows
  rows.forEach((rowObj, ri) => {
    const vals = headers.map(h => {
      const v = rowObj[h];
      // Try to coerce numeric strings
      if (typeof v === 'string' && v !== '' && !isNaN(Number(v))) return Number(v);
      return v ?? '';
    });
    const dr = ws.addRow(vals);
    dr.height = 20;
    dr.eachCell({ includeEmpty: true }, (cell, colNum) => {
      const hdr = headers[colNum - 1];
      if (scoreCols.includes(hdr))    scoreStyle(cell, ri % 2 === 1);
      else if (currencyCols.includes(hdr)) currencyStyle(cell, ri % 2 === 1);
      else if (pctCols.includes(hdr)) pctStyle(cell, ri % 2 === 1);
      else                            dataStyle(cell, ri % 2 === 1);
    });
  });

  // Auto-filter
  ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: headers.length } };

  // Column widths
  ws.columns = headers.map((h, i) => ({ width: colWidths[i] || 18 }));
}

// ── Google Sheets push ────────────────────────────────────────────────────────

async function pushToSheets(latestRows, allRows, shelfLeadRows) {
  const auth   = new google.auth.GoogleAuth({ keyFile: KEY_FILE, scopes: ['https://www.googleapis.com/auth/spreadsheets'] });
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  const NAVY  = { red: 0.039, green: 0.122, blue: 0.239 };
  const TEAL  = { red: 0,     green: 0.588, blue: 0.537 };
  const WHITE = { red: 1,     green: 1,     blue: 1 };
  const LIGHT = { red: 0.969, green: 0.973, blue: 0.980 };

  // Get existing sheet IDs
  const meta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
  const existingSheets = meta.data.sheets.map(s => ({ title: s.properties.title, id: s.properties.sheetId }));

  const findSheet = title => existingSheets.find(s => s.title === title);

  // Helper: ensure a sheet exists, returns its sheetId
  async function ensureSheet(title) {
    const found = findSheet(title);
    if (found) return found.id;
    const res = await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: { requests: [{ addSheet: { properties: { title } } }] },
    });
    return res.data.replies[0].addSheet.properties.sheetId;
  }

  // Helper: write data + format a sheet
  async function writeSheet(title, headerRow, dataRows, currencyCols = [], pctCols = [], scoreCols = []) {
    const sheetId = await ensureSheet(title);
    const total   = dataRows.length + 1;
    const cols    = headerRow.length;

    // 1 — Clear
    await sheets.spreadsheets.values.clear({ spreadsheetId: SHEET_ID, range: `${title}!A1:Z10000` });

    // 2 — Write values
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${title}!A1`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [headerRow, ...dataRows] },
    });

    // 3 — Formatting requests
    const requests = [];

    // Header style
    requests.push({
      repeatCell: {
        range: { sheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: cols },
        cell: {
          userEnteredFormat: {
            backgroundColor: NAVY,
            textFormat: { foregroundColor: WHITE, bold: true, fontSize: 10 },
            horizontalAlignment: 'CENTER',
            verticalAlignment: 'MIDDLE',
          },
        },
        fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)',
      },
    });

    // Freeze header + enable filter
    requests.push({ updateSheetProperties: { properties: { sheetId, gridProperties: { frozenRowCount: 1 } }, fields: 'gridProperties.frozenRowCount' } });
    requests.push({ setBasicFilter: { filter: { range: { sheetId, startRowIndex: 0, endRowIndex: total, startColumnIndex: 0, endColumnIndex: cols } } } });

    // Alternating row colours
    for (let i = 0; i < dataRows.length; i++) {
      requests.push({
        repeatCell: {
          range: { sheetId, startRowIndex: i + 1, endRowIndex: i + 2, startColumnIndex: 0, endColumnIndex: cols },
          cell: { userEnteredFormat: { backgroundColor: i % 2 === 0 ? WHITE : LIGHT } },
          fields: 'userEnteredFormat.backgroundColor',
        },
      });
    }

    // Currency format
    currencyCols.forEach(col => {
      requests.push({
        repeatCell: {
          range: { sheetId, startRowIndex: 1, endRowIndex: total, startColumnIndex: col, endColumnIndex: col + 1 },
          cell: { userEnteredFormat: { numberFormat: { type: 'CURRENCY', pattern: '₹#,##0.00' } } },
          fields: 'userEnteredFormat.numberFormat',
        },
      });
    });

    // Percent format
    pctCols.forEach(col => {
      requests.push({
        repeatCell: {
          range: { sheetId, startRowIndex: 1, endRowIndex: total, startColumnIndex: col, endColumnIndex: col + 1 },
          cell: { userEnteredFormat: { numberFormat: { type: 'NUMBER', pattern: '0.00"%"' } } },
          fields: 'userEnteredFormat.numberFormat',
        },
      });
    });

    // Shelf score colour coding (green ≥70, orange ≥40, red <40)
    scoreCols.forEach(col => {
      dataRows.forEach((row, i) => {
        const v = Number(row[col]);
        const fg = v >= 70 ? TEAL : v >= 40 ? { red: 1, green: 0.549, blue: 0 } : { red: 0.898, green: 0.243, blue: 0.243 };
        requests.push({
          repeatCell: {
            range: { sheetId, startRowIndex: i + 1, endRowIndex: i + 2, startColumnIndex: col, endColumnIndex: col + 1 },
            cell: { userEnteredFormat: { textFormat: { bold: true, foregroundColor: fg } } },
            fields: 'userEnteredFormat.textFormat',
          },
        });
      });
    });

    // Auto-resize all columns
    requests.push({ autoResizeDimensions: { dimensions: { sheetId, dimension: 'COLUMNS', startIndex: 0, endIndex: cols } } });

    await sheets.spreadsheets.batchUpdate({ spreadsheetId: SHEET_ID, requestBody: { requests } });
  }

  // ── Sheet 1: Brands (Latest) ──────────────────────────────────────────────
  const h1 = ['Company ID','Brand Name','Contact','Email','Phone','Category','Shopify URL','Signed Up (IST)','Avg Order Value (₹)','Orders / Month','Add to Cart Rate (%)','Repeat Revenue Share (%)','Repeat Rate 90d (%)','Time to 2nd Order (days)','Rebuy Revenue Share (%)','Personalisation AOV Lift (%)','Loyalty Tool','Post-Purchase Upsell','WhatsApp Tool','Shelf Score','Cohort Percentile','Last Submission (IST)'];
  const d1 = latestRows.map(r => h1.map(h => r[h] ?? ''));
  await writeSheet('Brands (Latest)', h1, d1, [8], [10, 11, 12, 14, 15], [19]);

  // ── Sheet 2: All Submissions ──────────────────────────────────────────────
  const h2 = ['Row ID','Company ID','Brand Name','Email','Category','Avg Order Value (₹)','Orders / Month','Add to Cart Rate (%)','Repeat Revenue Share (%)','Repeat Rate 90d (%)','Time to 2nd Order (days)','Rebuy Revenue Share (%)','Personalisation AOV Lift (%)','Loyalty Tool','Post-Purchase Upsell','WhatsApp Tool','Shelf Score','Cohort Percentile','Submitted (IST)'];
  const d2 = allRows.map(r => h2.map(h => r[h] ?? ''));
  await writeSheet('All Submissions', h2, d2, [5], [7, 8, 9, 11, 12], [16]);

  // ── Sheet 3: Shelf Index Leads ────────────────────────────────────────────
  const h3 = ['ID', 'Full Name', 'Email', 'Brand URL', 'Phone', 'Source', 'Unlocked At (IST)'];
  const d3 = shelfLeadRows.map(r => h3.map(h => r[h] ?? ''));
  await writeSheet('Shelf Index Leads', h3, d3);

  // ── Sheet 4: Summary ──────────────────────────────────────────────────────
  const summaryId = await ensureSheet('Summary');
  const ts  = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  const lr  = latestRows;
  const n   = lr.length || 1;
  const avgAOV    = (lr.reduce((s, r) => s + (Number(r['Avg Order Value (₹)']) || 0), 0) / n).toFixed(0);
  const avgRepeat = (lr.reduce((s, r) => s + (Number(r['Repeat Rate (%)'])     || 0), 0) / n).toFixed(1);
  const avgScore  = (lr.reduce((s, r) => s + (Number(r['Shelf Score'])          || 0), 0) / n).toFixed(1);

  await sheets.spreadsheets.values.clear({ spreadsheetId: SHEET_ID, range: 'Summary!A1:B20' });
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID, range: 'Summary!A1', valueInputOption: 'USER_ENTERED',
    requestBody: { values: [
      ['Anphonic Benchmark — Summary', ''],
      [`Last updated: ${ts} IST`, ''],
      ['', ''],
      ['Total Brands',           lr.length],
      ['Total Submissions',      allRows.length],
      ['Shelf Index Leads',      shelfLeadRows.length],
      ['Avg Order Value (₹)',    Number(avgAOV)],
      ['Avg Repeat Rate (%)',    Number(avgRepeat)],
      ['Avg Shelf Score',        Number(avgScore)],
    ]},
  });
}

// ── main ──────────────────────────────────────────────────────────────────────

async function main() {
  const ts = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  console.log(`[${ts}] Starting export…`);

  let proxy, pool;
  try {
    proxy = await startProxy();
    console.log('  ✓ Cloud SQL proxy ready');

    pool = makePool();
    const [latestRes, allRes, shelfLeadsRes] = await Promise.all([
      pool.query(LATEST_SQL),
      pool.query(ALL_SUBMISSIONS_SQL),
      pool.query(SHELF_LEADS_SQL),
    ]);
    console.log(`  ✓ Fetched ${latestRes.rowCount} brands, ${allRes.rowCount} submissions, ${shelfLeadsRes.rowCount} shelf index leads`);

    const wb = new ExcelJS.Workbook();
    wb.creator = 'Anphonic Benchmark';
    wb.created = new Date();
    wb.modified = new Date();

    // ── Sheet 1: Latest per brand ─────────────────────────────────────────────
    const ws1 = wb.addWorksheet('Brands (Latest)', { tabColor: { argb: TEAL } });
    buildSheet(
      ws1, latestRes.rows,
      [10, 20, 18, 26, 14, 18, 30, 22, 18, 18, 12, 14, 14, 16, 14, 12, 16, 22],
      ['Avg Order Value (₹)', 'Total Revenue (₹)'],
      ['Repeat Rate (%)', 'Add to Cart Rate (%)'],
      ['Shelf Score', 'Cohort Percentile'],
    );

    // ── Sheet 2: All submissions ──────────────────────────────────────────────
    const ws2 = wb.addWorksheet('All Submissions', { tabColor: { argb: NAVY } });
    buildSheet(
      ws2, allRes.rows,
      [8, 10, 20, 26, 16, 18, 18, 12, 14, 14, 16, 18, 12, 16, 22],
      ['Avg Order Value (₹)', 'Total Revenue (₹)'],
      ['Repeat Rate (%)', 'Add to Cart Rate (%)'],
      ['Shelf Score', 'Cohort Percentile'],
    );

    // ── Sheet 3: Shelf Index Leads ────────────────────────────────────────────
    const ws3 = wb.addWorksheet('Shelf Index Leads', { tabColor: { argb: TEAL } });
    buildSheet(
      ws3, shelfLeadsRes.rows,
      [8, 22, 28, 32, 14, 20, 22],
    );

    // ── Sheet 4: Summary ──────────────────────────────────────────────────────
    const ws4 = wb.addWorksheet('Summary', { tabColor: { argb: 'FFFF8C00' } });
    ws4.views = [];
    const addStat = (label, value) => {
      const r = ws4.addRow([label, value]);
      r.height = 22;
      r.getCell(1).font = { bold: true, size: 11, name: 'Calibri', color: { argb: NAVY } };
      r.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: LIGHT } };
      r.getCell(2).font = { size: 11, name: 'Calibri', bold: true, color: { argb: TEAL } };
      r.getCell(2).alignment = { horizontal: 'right' };
    };

    // Compute summary stats from latest rows
    const lr = latestRes.rows;
    const numBrands = lr.length;
    const avgAOV   = lr.reduce((s, r) => s + (Number(r['Avg Order Value (₹)']) || 0), 0) / (numBrands || 1);
    const avgRepeat = lr.reduce((s, r) => s + (Number(r['Repeat Rate (%)']) || 0), 0) / (numBrands || 1);
    const avgScore = lr.reduce((s, r) => s + (Number(r['Shelf Score']) || 0), 0) / (numBrands || 1);

    ws4.addRow(['Anphonic Benchmark — Summary']).getCell(1).font = {
      bold: true, size: 14, color: { argb: NAVY }, name: 'Calibri'
    };
    ws4.addRow([`Last updated: ${ts} IST`]).getCell(1).font = { italic: true, color: { argb: '666666' }, size: 10 };
    ws4.addRow([]);
    addStat('Total Brands',                numBrands);
    addStat('Total Submissions',           allRes.rowCount);
    addStat('Shelf Index Leads',           shelfLeadsRes.rowCount);
    addStat('Avg Order Value (₹)',          Math.round(avgAOV));
    addStat('Avg Repeat Rate (%)',          avgRepeat.toFixed(1));
    addStat('Avg Shelf Score',              avgScore.toFixed(1));
    ws4.getColumn(1).width = 28;
    ws4.getColumn(2).width = 18;

    await wb.xlsx.writeFile(OUT_FILE);
    console.log(`  ✓ Excel saved → ${OUT_FILE}`);

    await pushToSheets(latestRes.rows, allRes.rows, shelfLeadsRes.rows);
    console.log(`  ✓ Google Sheet updated → https://docs.google.com/spreadsheets/d/${SHEET_ID}`);

  } finally {
    if (pool) await pool.end().catch(() => {});
    if (proxy) proxy.kill();
    console.log('  ✓ Done.\n');
  }
}

main().catch(err => { console.error('Export failed:', err.message); process.exit(1); });
