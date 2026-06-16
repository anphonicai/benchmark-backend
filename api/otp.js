const { Resend } = require('resend');
const { generateReportPdf, generateShelfIndexPdf } = require('./pdfGenerator');

const resend = new Resend(process.env.RESEND_API_KEY);

// In-memory store: email → { code, expiresAt }
// Fine for a single-instance Cloud Run service; swap for Redis if you scale horizontally.
const otpStore = new Map();

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes

const generateCode = () => String(Math.floor(100000 + Math.random() * 900000));

const sendOtp = async (email) => {
  const code = generateCode();
  otpStore.set(email.toLowerCase(), { code, expiresAt: Date.now() + OTP_TTL_MS });

  await resend.emails.send({
    from: 'Anphonic <noreply@anphonic.ai>',
    to: email,
    subject: 'Your Anphonic verification code',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
        <h2 style="margin:0 0 8px;font-size:22px;color:#1a1a1a">Your verification code</h2>
        <p style="color:#666;margin:0 0 24px">Enter this code on the Anphonic benchmark form to continue.</p>
        <div style="background:#f8f6f3;border-radius:8px;padding:24px;text-align:center;letter-spacing:8px;font-size:36px;font-weight:700;color:#1a1a1a">
          ${code}
        </div>
        <p style="color:#999;font-size:13px;margin:20px 0 0">This code expires in 10 minutes. If you didn't request this, you can safely ignore it.</p>
      </div>
    `,
  });
};

const verifyOtp = (email, code) => {
  const entry = otpStore.get(email.toLowerCase());
  if (!entry) return { valid: false, reason: 'No code sent to this email.' };
  if (Date.now() > entry.expiresAt) {
    otpStore.delete(email.toLowerCase());
    return { valid: false, reason: 'Code expired. Please request a new one.' };
  }
  if (entry.code !== String(code).trim()) {
    return { valid: false, reason: 'Incorrect code. Please try again.' };
  }
  otpStore.delete(email.toLowerCase());
  return { valid: true };
};

const buildScoreEmailHtml = (brandName, score, percentile, verdictHeadline) => `
  <div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#fafaf8;">

    <!-- Header -->
    <div style="background:#0a1f3d;padding:40px 40px 32px;border-radius:12px 12px 0 0;">
      <div style="font-size:16px;font-weight:700;color:#fff;letter-spacing:-0.01em;margin-bottom:32px;">Anphonic</div>
      <div style="font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.4);margin-bottom:10px;">Your Shelf Score</div>
      <div style="font-size:72px;font-weight:300;color:#fff;line-height:1;letter-spacing:-0.04em;">
        ${score}<span style="font-size:28px;color:#14b8a6;margin-left:4px;">/100</span>
      </div>
      <div style="height:4px;background:rgba(255,255,255,0.1);border-radius:2px;max-width:240px;margin:16px 0 8px;overflow:hidden;">
        <div style="height:100%;width:${score}%;background:linear-gradient(90deg,#14b8a6,#10b981);border-radius:2px;"></div>
      </div>
      <div style="font-size:13px;color:rgba(255,255,255,0.5);margin-bottom:20px;">${percentile}th percentile · ${brandName}</div>
      <div style="font-size:17px;color:#fff;font-style:italic;line-height:1.4;">"${verdictHeadline}"</div>
    </div>

    <!-- Body -->
    <div style="background:#fff;padding:32px 40px;">
      <p style="font-size:14px;color:#374151;line-height:1.75;margin:0 0 20px;">
        Hi ${brandName} team — your full benchmark report and a copy of <strong>The Shelf Index (Edition 01)</strong> are attached to this email as PDFs.
      </p>
      <p style="font-size:14px;color:#374151;line-height:1.75;margin:0 0 28px;">
        The report breaks down where you sit on each metric against the cohort and identifies the top revenue gaps to close.
      </p>

      <!-- CTA -->
      <div style="text-align:center;margin:28px 0;">
        <a href="https://calendar.app.google/2XQVSd57xK9B49Y68"
           style="display:inline-block;background:#0a1f3d;color:#fff;padding:14px 28px;border-radius:8px;font-size:14px;font-weight:600;text-decoration:none;letter-spacing:0.02em;">
          Book a free diagnostic call →
        </a>
        <div style="font-size:11px;color:#9CA3AF;margin-top:8px;">20 minutes · Free · No commitment</div>
      </div>
    </div>

    <!-- Footer -->
    <div style="background:#f8f6f3;padding:20px 40px;border-radius:0 0 12px 12px;border-top:1px solid #E8E3DA;">
      <p style="font-size:11px;color:#9CA3AF;margin:0;">Anphonic · <a href="mailto:merchants@anphonic.ai" style="color:#9CA3AF;">merchants@anphonic.ai</a> · <a href="https://anphonic.ai" style="color:#9CA3AF;">anphonic.ai</a></p>
      <p style="font-size:11px;color:#C4BFB8;margin:6px 0 0;">You received this because you completed the Anphonic D2C Benchmark. Reply to opt out of follow-up emails.</p>
    </div>

  </div>
`;

const sendScoreEmail = async (email, brandName, scoreResult, category) => {
  const score = scoreResult.shelf_score ?? 0;
  const percentile = scoreResult.percentile ?? 0;
  const verdictHeadline = scoreResult.verdict?.headline ?? 'Your benchmark is ready.';

  const [reportPdf, shelfPdf] = await Promise.all([
    generateReportPdf(scoreResult, brandName, category),
    generateShelfIndexPdf(),
  ]);

  await resend.emails.send({
    from: 'Anphonic <noreply@anphonic.ai>',
    to: email,
    subject: `Your Shelf Score: ${score}/100 — ${brandName}`,
    html: buildScoreEmailHtml(brandName, score, percentile, verdictHeadline),
    attachments: [
      {
        filename: 'Anphonic-Benchmark-Report.pdf',
        content: Buffer.from(reportPdf).toString('base64'),
      },
      {
        filename: 'The-Shelf-Index-Edition-01.pdf',
        content: Buffer.from(shelfPdf).toString('base64'),
      },
    ],
  });
  console.log(`Score email sent to ${email} — score ${score}, brand: ${brandName}`);
};

module.exports = { sendOtp, verifyOtp, sendScoreEmail };
