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

function buildRegistrationHtml(investorId) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f7;font-family:'Segoe UI',Roboto,Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:40px 0">
<tr><td align="center">
<table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.08)">

  <tr><td style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 100%);padding:36px 40px;text-align:center">
    <h1 style="margin:0;color:#ffffff;font-size:30px;font-weight:700;letter-spacing:3px">WOORA GROUP</h1>
    <div style="width:50px;height:3px;background:#00D09C;margin:12px auto 0"></div>
    <p style="margin:10px 0 0;color:rgba(255,255,255,0.7);font-size:13px;letter-spacing:1px">Institutional-Grade Investment Platform</p>
  </td></tr>

  <tr><td style="padding:40px 40px 0;text-align:center">
    <div style="width:70px;height:70px;border-radius:50%;background:linear-gradient(135deg,#00D09C,#00b386);display:inline-flex;align-items:center;justify-content:center;margin-bottom:20px">
      <span style="font-size:32px">🎉</span>
    </div>
    <h2 style="margin:0 0 8px;color:#1a1a2e;font-size:22px;font-weight:700">Thank You for Registering!</h2>
    <p style="margin:0;color:#888;font-size:13px">Investor ID: <strong style="color:#00D09C">#${investorId}</strong></p>
  </td></tr>

  <tr><td style="padding:28px 40px">
    <p style="margin:0 0 16px;color:#555;font-size:15px;line-height:1.7">Assalamu Alaikum,</p>
    <p style="margin:0 0 20px;color:#555;font-size:15px;line-height:1.7">
      Woora Group এ আপনাকে স্বাগতম! আপনার Account সফলভাবে তৈরি হয়েছে।
    </p>
    <div style="background:linear-gradient(135deg,#f0fff8,#e6fff5);border-left:4px solid #00D09C;border-radius:0 10px 10px 0;padding:20px 24px;margin:0 0 24px">
      <p style="margin:0;color:#1a1a2e;font-size:15px;font-weight:600;line-height:1.7">
        🌟 আপনার স্বপ্ন পূরণের যাত্রা শুরু করতে এখনই আপনার Account Activate করুন!
      </p>
      <p style="margin:10px 0 0;color:#666;font-size:13px;line-height:1.6">
        Account Activate করতে আপনার নাম, NID এবং ছবি দিয়ে Profile সম্পূর্ণ করুন।
      </p>
    </div>
    <div style="text-align:center;margin:28px 0">
      <a href="https://wooragroup.com/activate" style="display:inline-block;background:linear-gradient(135deg,#00D09C,#00b386);color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:8px;font-weight:700;font-size:15px;letter-spacing:0.5px;box-shadow:0 4px 12px rgba(0,208,156,0.3)">
        Account Activate করুন →
      </a>
    </div>
    <p style="margin:0;color:#999;font-size:13px;line-height:1.6;text-align:center">
      Woora Group এর সাথে আপনার স্বপ্ন পূরণ করুন।<br>আমরা আপনার পাশে আছি!
    </p>
  </td></tr>

  <tr><td style="background:#f8f9fb;padding:20px 40px;text-align:center;border-top:1px solid #eee">
    <p style="margin:0;color:#aaa;font-size:11px">&copy; ${new Date().getFullYear()} Woora Group. All rights reserved.</p>
  </td></tr>

</table>
</td></tr>
</table>
</body></html>`;
}

function buildActivationHtml(name, investorId) {
  const profileUrl = `https://wooragroup.com/dashboard`;
  const whatsappUrl = `https://wa.me/8801608468263?text=Assalamu%20Alaikum%2C%20I%20am%20${encodeURIComponent(name)}%20(ID%3A%20%23${investorId}).%20I%20want%20to%20invest.`;

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f7;font-family:'Segoe UI',Roboto,Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:40px 0">
<tr><td align="center">
<table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.08)">

  <tr><td style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 100%);padding:36px 40px;text-align:center">
    <h1 style="margin:0;color:#ffffff;font-size:30px;font-weight:700;letter-spacing:3px">WOORA GROUP</h1>
    <div style="width:50px;height:3px;background:#00D09C;margin:12px auto 0"></div>
    <p style="margin:10px 0 0;color:rgba(255,255,255,0.7);font-size:13px;letter-spacing:1px">Institutional-Grade Investment Platform</p>
  </td></tr>

  <tr><td style="padding:40px 40px 0;text-align:center">
    <div style="width:70px;height:70px;border-radius:50%;background:linear-gradient(135deg,#FFD700,#FFA500);display:inline-flex;align-items:center;justify-content:center;margin-bottom:20px">
      <span style="font-size:32px">🏆</span>
    </div>
    <h2 style="margin:0 0 8px;color:#1a1a2e;font-size:22px;font-weight:700">Congratulations, ${name}!</h2>
    <p style="margin:0;color:#888;font-size:13px">Investor ID: <strong style="color:#00D09C">#${investorId}</strong></p>
  </td></tr>

  <tr><td style="padding:28px 40px">
    <p style="margin:0 0 16px;color:#555;font-size:15px;line-height:1.7">Assalamu Alaikum,</p>
    <p style="margin:0 0 20px;color:#555;font-size:15px;line-height:1.7">
      আপনার Account সফলভাবে Activate হয়েছে! 🎉<br>
      আপনি এখন Woora Group এর একজন <strong style="color:#00D09C">Investment Partner</strong>।
    </p>

    <div style="background:linear-gradient(135deg,#f0fff8,#e6fff5);border:1px solid rgba(0,208,156,0.2);border-radius:10px;padding:24px;margin:0 0 24px">
      <p style="margin:0 0 12px;color:#1a1a2e;font-size:16px;font-weight:700;line-height:1.6">
        🌟 আপনি এখন আমাদের সাথে আপনার স্বপ্ন পূরণের জন্য প্রস্তুত!
      </p>
      <p style="margin:0;color:#555;font-size:14px;line-height:1.7">
        আপনি এখন আপনার Profile থেকে অথবা WhatsApp এর মাধ্যমে Investment Unit কিনতে পারবেন।
      </p>
    </div>

    <div style="display:flex;gap:12px;margin:0 0 28px">
      <table width="100%" cellpadding="0" cellspacing="0"><tr>
        <td width="48%" style="padding-right:6px">
          <a href="${profileUrl}" style="display:block;background:linear-gradient(135deg,#00D09C,#00b386);color:#ffffff;text-decoration:none;padding:14px 12px;border-radius:8px;font-weight:700;font-size:14px;text-align:center;box-shadow:0 4px 12px rgba(0,208,156,0.3)">
            🏠 Profile এ যান
          </a>
        </td>
        <td width="48%" style="padding-left:6px">
          <a href="${whatsappUrl}" style="display:block;background:linear-gradient(135deg,#25D366,#128C7E);color:#ffffff;text-decoration:none;padding:14px 12px;border-radius:8px;font-weight:700;font-size:14px;text-align:center;box-shadow:0 4px 12px rgba(37,211,102,0.3)">
            💬 WhatsApp এ যোগাযোগ
          </a>
        </td>
      </tr></table>
    </div>

    <p style="margin:0;color:#999;font-size:13px;line-height:1.6;text-align:center">
      Woora Group এ Invest করুন, Monthly Profit পান।<br>আমরা সবসময় আপনার পাশে আছি!
    </p>
  </td></tr>

  <tr><td style="background:#f8f9fb;padding:20px 40px;text-align:center;border-top:1px solid #eee">
    <p style="margin:0;color:#aaa;font-size:11px">&copy; ${new Date().getFullYear()} Woora Group. All rights reserved.</p>
  </td></tr>

</table>
</td></tr>
</table>
</body></html>`;
}

export async function POST(request) {
  try {
    const { type, email, investorId, name } = await request.json();
    if (!email || !type) return Response.json({ error: 'Missing required fields' }, { status: 400 });

    const apiKey = await getBrevoApiKey();
    if (!apiKey) return Response.json({ error: 'Email service not configured' }, { status: 500 });

    let subject, htmlContent;

    if (type === 'registration') {
      subject = 'Welcome to Woora Group — Account Created Successfully!';
      htmlContent = buildRegistrationHtml(investorId || '');
    } else if (type === 'activation') {
      subject = 'Congratulations! Your Woora Account is Now Active 🎉';
      htmlContent = buildActivationHtml(name || 'Investor', investorId || '');
    } else {
      return Response.json({ error: 'Invalid email type' }, { status: 400 });
    }

    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'accept': 'application/json', 'api-key': apiKey, 'content-type': 'application/json' },
      body: JSON.stringify({
        sender: { name: 'Woora Group', email: 'momsudul06@gmail.com' },
        to: [{ email: email.toLowerCase() }],
        subject,
        htmlContent,
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      console.error('Brevo error:', errData);
      return Response.json({ error: 'Failed to send email' }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Send welcome email error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
