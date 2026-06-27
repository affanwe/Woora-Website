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

export async function POST(request) {
  try {
    const { email, code, purpose = 'register' } = await request.json();
    if (!email || !code) return Response.json({ error: 'Email and code are required' }, { status: 400 });

    const supabase = getSupabase();
    const now = new Date();

    const { data: otpRecord } = await supabase
      .from('otp_codes')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('purpose', purpose)
      .eq('verified', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!otpRecord) {
      return Response.json({ error: 'No OTP found. Please request a new one.' }, { status: 400 });
    }

    if (new Date(otpRecord.expires_at) < now) {
      return Response.json({ error: 'OTP has expired. Please request a new one.' }, { status: 400 });
    }

    // Increment attempt count
    const newAttempts = (otpRecord.attempt_count || 0) + 1;
    await supabase.from('otp_codes').update({ attempt_count: newAttempts }).eq('id', otpRecord.id);

    if (newAttempts > 5) {
      return Response.json({ error: 'Too many incorrect attempts. Please request a new OTP.' }, { status: 429 });
    }

    if (otpRecord.code !== code) {
      return Response.json({ error: 'Invalid OTP code. Please try again.', attemptsLeft: 5 - newAttempts }, { status: 400 });
    }

    // Mark as verified
    await supabase.from('otp_codes').update({ verified: true }).eq('id', otpRecord.id);

    return Response.json({ success: true, message: 'OTP verified successfully' });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
