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
    const { email, newPassword } = await request.json();
    if (!email || !newPassword) return Response.json({ error: 'Email and new password are required' }, { status: 400 });
    if (newPassword.length < 6) return Response.json({ error: 'Password must be at least 6 characters' }, { status: 400 });

    const supabase = getSupabase();

    // Verify that OTP was recently verified for this email
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
    const { data: verifiedOtp } = await supabase
      .from('otp_codes')
      .select('id')
      .eq('email', email.toLowerCase())
      .eq('purpose', 'forgot')
      .eq('verified', true)
      .gte('created_at', fiveMinAgo.toISOString())
      .limit(1)
      .maybeSingle();

    if (!verifiedOtp) {
      return Response.json({ error: 'Please verify your OTP first.' }, { status: 403 });
    }

    // Reset password via database function (SECURITY DEFINER — no service_role key needed)
    const { data: result, error: rpcError } = await supabase.rpc('reset_user_password', {
      user_email: email.toLowerCase(),
      new_password: newPassword
    });

    if (rpcError) {
      console.error('Password reset RPC error:', rpcError);
      return Response.json({ error: 'Password reset failed. Please contact support.' }, { status: 500 });
    }

    if (result && !result.success) {
      return Response.json({ error: result.error || 'Account not found.' }, { status: 404 });
    }

    // Clean up used OTPs
    await supabase.from('otp_codes').delete()
      .eq('email', email.toLowerCase())
      .eq('purpose', 'forgot');

    return Response.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
