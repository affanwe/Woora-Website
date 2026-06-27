import { createClient } from '@supabase/supabase-js';

let _supabase;
function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://iskwvbwowfzhdbniwncd.supabase.co',
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
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

    // Find the user by email in investors table to get their uid
    const { data: investor } = await supabase
      .from('investors')
      .select('uid')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (!investor?.uid) {
      return Response.json({ error: 'Account not found.' }, { status: 404 });
    }

    // Update password via Supabase Auth admin API
    // Note: This requires service_role key for admin operations
    // If service_role is not available, we use a workaround
    const { error } = await supabase.auth.admin.updateUserById(investor.uid, {
      password: newPassword
    });

    if (error) {
      // Fallback: try with regular auth if admin fails
      console.error('Admin password reset failed:', error);
      return Response.json({ error: 'Password reset failed. Please contact support.' }, { status: 500 });
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
