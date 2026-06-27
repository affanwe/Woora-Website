import { createClient } from '@supabase/supabase-js';

let _supabase;
function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://iskwvbwowfzhdbniwncd.supabase.co',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlza3d2Yndvd2Z6aGRibml3bmNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyODg0ODksImV4cCI6MjA5NTg2NDQ4OX0.EZWKUrqjdBaDJInDpYmjhDYJfFPN0t5fCFKhK8gmbDc'
    );
  }
  return _supabase;
}

async function getBrevoApiKey() {
  const { data } = await getSupabase().from('metadata').select('value').eq('key', 'brevo').maybeSingle();
  return data?.value?.apiKey || process.env.BREVO_API_KEY || '';
}

function buildOtpHtml(otpCode) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f7;font-family:'Segoe UI',Roboto,Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:40px 0">
<tr><td align="center">
<table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06)">
  <tr><td style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 100%);padding:32px 40px;text-align:center">
    <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:2px">WOORA</h1>
    <div style="width:50px;height:3px;background:#00D09C;margin:12px auto 0"></div>
  </td></tr>
  <tr><td style="padding:40px">
    <p style="margin:0 0 8px;color:#555;font-size:15px">Assalamu Alaikum,</p>
    <p style="margin:0 0 24px;color:#666;font-size:15px;line-height:1.6">
      Use the following OTP to verify your email. This code is valid for <strong>15 minutes</strong>.
    </p>
    <div style="background:#f0fff8;border:2px dashed #00D09C;border-radius:10px;padding:24px;text-align:center;margin:0 0 24px">
      <span style="font-size:36px;font-weight:700;letter-spacing:8px;color:#1a1a2e">${otpCode}</span>
    </div>
    <p style="margin:0;color:#999;font-size:13px;line-height:1.5">
      If you didn't request this code, please ignore this email. Do not share this code with anyone.
    </p>
  </td></tr>
  <tr><td style="background:#f8f9fb;padding:20px 40px;text-align:center;border-top:1px solid #eee">
    <p style="margin:0;color:#aaa;font-size:12px">&copy; ${new Date().getFullYear()} Woora Group. All rights reserved.</p>
  </td></tr>
</table>
</td></tr>
</table>
</body></html>`;
}

export async function POST(request) {
  try {
    const { email, purpose = 'register' } = await request.json();
    if (!email) return Response.json({ error: 'Email is required' }, { status: 400 });

    const supabase = getSupabase();
    const now = new Date();

    // Check if blocked (max 3 OTPs, then 12hr cooldown)
    const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000);
    const { data: recentOtps } = await supabase
      .from('otp_codes')
      .select('id, created_at, blocked_until')
      .eq('email', email.toLowerCase())
      .eq('purpose', purpose)
      .gte('created_at', twelveHoursAgo.toISOString())
      .order('created_at', { ascending: false });

    // Check if currently blocked
    if (recentOtps?.length > 0 && recentOtps[0].blocked_until) {
      const blockedUntil = new Date(recentOtps[0].blocked_until);
      if (blockedUntil > now) {
        const remainingMs = blockedUntil - now;
        const remainingHrs = Math.ceil(remainingMs / (60 * 60 * 1000));
        return Response.json({
          error: `Too many OTP attempts. Please try again after ${remainingHrs} hour(s).`,
          blocked: true,
          blockedUntil: blockedUntil.toISOString()
        }, { status: 429 });
      }
    }

    const otpCount = recentOtps?.length || 0;

    // Block after 3 OTPs in 12 hours
    if (otpCount >= 3) {
      const blockedUntil = new Date(now.getTime() + 12 * 60 * 60 * 1000);
      await supabase.from('otp_codes').update({ blocked_until: blockedUntil.toISOString() })
        .eq('id', recentOtps[0].id);
      return Response.json({
        error: 'Maximum OTP limit reached. Please try again after 12 hours.',
        blocked: true,
        blockedUntil: blockedUntil.toISOString()
      }, { status: 429 });
    }

    // Check resend cooldown: 1st resend after 2:30 min, 2nd after 3 min
    if (otpCount > 0) {
      const lastOtp = recentOtps[0];
      const lastSentAt = new Date(lastOtp.created_at);
      const cooldownMs = otpCount === 1 ? 150000 : 180000; // 2:30 or 3:00 min
      const canResendAt = new Date(lastSentAt.getTime() + cooldownMs);
      if (now < canResendAt) {
        const waitSec = Math.ceil((canResendAt - now) / 1000);
        return Response.json({
          error: `Please wait ${waitSec} seconds before requesting another OTP.`,
          waitSeconds: waitSec
        }, { status: 429 });
      }
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP
    await supabase.from('otp_codes').insert({
      email: email.toLowerCase(),
      code: otpCode,
      purpose,
      expires_at: new Date(now.getTime() + 15 * 60 * 1000).toISOString()
    });

    // Send via Brevo
    const apiKey = await getBrevoApiKey();
    if (!apiKey) return Response.json({ error: 'Email service not configured' }, { status: 500 });

    const subject = purpose === 'register'
      ? 'Verify your Woora account'
      : 'Reset your Woora password';

    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'accept': 'application/json', 'api-key': apiKey, 'content-type': 'application/json' },
      body: JSON.stringify({
        sender: { name: 'Woora Group', email: 'momsudul06@gmail.com' },
        to: [{ email: email.toLowerCase() }],
        subject,
        htmlContent: buildOtpHtml(otpCode),
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return Response.json({ error: 'Failed to send OTP email' }, { status: 500 });
    }

    // Calculate next resend time
    const nextCooldownMs = otpCount === 0 ? 150000 : 180000;

    return Response.json({
      success: true,
      message: 'OTP sent successfully',
      resendAfterSeconds: Math.ceil(nextCooldownMs / 1000),
      attemptsLeft: 2 - otpCount
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
