"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { UserPlus, Eye, EyeOff, Mail, Lock, Phone, ArrowRight, ShieldCheck } from 'lucide-react';
import SplitHoverText from '../../components/SplitHoverText';
import ScrollReveal from '../../components/ScrollReveal';

export default function Register() {
  return (
    <Suspense fallback={null}>
      <RegisterInner />
    </Suspense>
  );
}

function RegisterInner() {
  const [step, setStep] = useState(1); // 1=form, 2=otp
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [referredBy, setReferredBy] = useState('');

  // OTP states
  const [otpCode, setOtpCode] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [attemptsLeft, setAttemptsLeft] = useState(2);

  const { register } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) setReferredBy(ref);
  }, [searchParams]);

  // Resend countdown timer
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleSendOtp = async () => {
    if (!email) return setError('Please enter your email.');
    if (!mobile) return setError('Please enter your mobile number.');
    if (password.length < 6) return setError('Password must be at least 6 characters.');
    if (password !== confirmPassword) return setError('Passwords do not match.');
    const cleanMobile = mobile.trim();
    if (!/^(?:\+88|88)?(01[3-9]\d{8})$/.test(cleanMobile))
      return setError('Please enter a valid Bangladeshi mobile number.');

    try {
      setError('');
      setLoading(true);
      const res = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), purpose: 'register' }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        return;
      }
      setStep(2);
      setResendTimer(data.resendAfterSeconds || 150);
      setAttemptsLeft(data.attemptsLeft ?? 2);
      setSuccess('OTP sent to your email. Please check your inbox.');
    } catch (err) {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setError('');
      setOtpLoading(true);
      const res = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), purpose: 'register' }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        return;
      }
      setResendTimer(data.resendAfterSeconds || 180);
      setAttemptsLeft(data.attemptsLeft ?? 0);
      setSuccess('OTP resent successfully!');
    } catch (err) {
      setError('Failed to resend OTP.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.length !== 6) return setError('Please enter a valid 6-digit OTP.');

    try {
      setError('');
      setOtpLoading(true);

      // Verify OTP first
      const verifyRes = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), code: otpCode, purpose: 'register' }),
      });
      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) {
        setError(verifyData.error);
        return;
      }

      // OTP verified, now register
      await register(email.trim(), mobile.trim(), password, referredBy || null);
      router.push('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="auth-page-3d">
      <div className="auth-glow-blob auth-glow-blob--emerald" />
      <div className="auth-glow-blob auth-glow-blob--gold" />

      <div className="auth-content-wrapper">
        <ScrollReveal direction="up" delay={0.15}>
          <div className="auth-card-3d">
            <div className="auth-card-3d__glow-border" />

            <div className="auth-header-3d">
              <div className="auth-logo-badge-3d">W</div>
              <h2 className="auth-header-3d__title">
                {step === 1 ? 'Create Account' : 'Verify Email'}
              </h2>
              <p className="auth-header-3d__subtitle">
                {step === 1
                  ? 'Join WOORA Group as an Investment Partner'
                  : `Enter the OTP sent to ${email}`}
              </p>
            </div>

            {referredBy && step === 1 && (
              <div className="demo-info-box-3d" style={{ borderColor: '#00D09C' }}>
                <span className="demo-info-title-3d"><UserPlus size={14} /> Referral Detected</span>
                <p>You were referred by Investor <strong>#{referredBy}</strong>.</p>
              </div>
            )}

            {error && <div className="alert alert-error">{error}</div>}
            {success && !error && <div className="alert" style={{ backgroundColor: 'rgba(0,208,156,0.12)', color: '#00D09C', border: '1px solid rgba(0,208,156,0.2)', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', fontSize: '13px' }}>{success}</div>}

            {step === 1 ? (
              <form onSubmit={(e) => { e.preventDefault(); handleSendOtp(); }} className="auth-form-3d">
                <div className="form-group">
                  <label className="form-label-3d" htmlFor="reg-email">Email Address</label>
                  <div className="input-icon-wrapper-3d">
                    <Mail className="input-icon-3d" size={18} />
                    <input id="reg-email" type="email" className="form-control-3d" placeholder="investor@example.com"
                      value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label-3d" htmlFor="reg-mobile">Mobile Number</label>
                  <div className="input-icon-wrapper-3d">
                    <Phone className="input-icon-3d" size={18} />
                    <input id="reg-mobile" type="tel" className="form-control-3d" placeholder="01712345678"
                      value={mobile} onChange={e => setMobile(e.target.value)} required autoComplete="tel" />
                  </div>
                </div>

                <div className="auth-form-row">
                  <div className="form-group">
                    <label className="form-label-3d" htmlFor="reg-password">Password</label>
                    <div className="input-icon-wrapper-3d">
                      <Lock className="input-icon-3d" size={18} />
                      <input id="reg-password" type={showPassword ? 'text' : 'password'} className="form-control-3d"
                        placeholder="Min 6 characters" value={password} onChange={e => setPassword(e.target.value)}
                        required autoComplete="new-password" />
                      <button type="button" className="password-toggle-3d" onClick={() => setShowPassword(!showPassword)} tabIndex="-1">
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label-3d" htmlFor="reg-confirm">Confirm Password</label>
                    <div className="input-icon-wrapper-3d">
                      <Lock className="input-icon-3d" size={18} />
                      <input id="reg-confirm" type={showPassword ? 'text' : 'password'} className="form-control-3d"
                        placeholder="Re-enter password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                        required autoComplete="new-password" />
                    </div>
                  </div>
                </div>

                <button type="submit" className="btn-auth-submit" disabled={loading}>
                  {loading ? (
                    <span className="btn-auth-loading"><span className="auth-spinner" /> Sending OTP...</span>
                  ) : (
                    <><Mail size={18} /><SplitHoverText>Send OTP & Verify</SplitHoverText></>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyAndRegister} className="auth-form-3d">
                <div className="form-group">
                  <label className="form-label-3d" htmlFor="otp-input">Enter 6-digit OTP</label>
                  <div className="input-icon-wrapper-3d">
                    <ShieldCheck className="input-icon-3d" size={18} />
                    <input
                      id="otp-input"
                      type="text"
                      className="form-control-3d"
                      placeholder="000000"
                      value={otpCode}
                      onChange={e => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      required
                      autoComplete="one-time-code"
                      style={{ letterSpacing: '8px', fontSize: '20px', textAlign: 'center', fontWeight: 700 }}
                    />
                  </div>
                </div>

                <button type="submit" className="btn-auth-submit" disabled={otpLoading}>
                  {otpLoading ? (
                    <span className="btn-auth-loading"><span className="auth-spinner" /> Verifying...</span>
                  ) : (
                    <><ShieldCheck size={18} /><SplitHoverText>Verify & Create Account</SplitHoverText></>
                  )}
                </button>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                  <button
                    type="button"
                    onClick={() => { setStep(1); setError(''); setSuccess(''); setOtpCode(''); }}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted, #888)', fontSize: '13px', cursor: 'pointer' }}
                  >
                    ← Change email
                  </button>
                  {resendTimer > 0 ? (
                    <span style={{ fontSize: '13px', color: 'var(--text-muted, #888)' }}>
                      Resend in {formatTime(resendTimer)}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={otpLoading || attemptsLeft <= 0}
                      style={{
                        background: 'none', border: 'none', fontSize: '13px', cursor: 'pointer',
                        color: attemptsLeft > 0 ? '#00D09C' : 'var(--text-muted, #888)',
                        fontWeight: 600
                      }}
                    >
                      {attemptsLeft > 0 ? 'Resend OTP' : 'Max attempts reached'}
                    </button>
                  )}
                </div>
              </form>
            )}

            <div className="auth-divider-3d"><span>or</span></div>
            <div className="auth-footer-3d">
              <p>Already have an account?{' '}
                <Link href="/login" className="auth-link-3d">
                  <SplitHoverText>Login Here</SplitHoverText><ArrowRight size={14} />
                </Link>
              </p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
