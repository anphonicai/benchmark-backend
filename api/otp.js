const { Resend } = require('resend');

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
    from: 'Anphonic <onboarding@resend.dev>',
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

module.exports = { sendOtp, verifyOtp };
