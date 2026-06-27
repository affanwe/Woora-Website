"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ShieldCheck, ArrowRight, Eye, EyeOff, KeyRound } from 'lucide-react';
import SplitHoverText from '../../components/SplitHoverText';
import ScrollReveal from '../../components/ScrollReveal';

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1=email, 2=otp, 3=new password
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [attemptsLeft, setAttemptsLeft] = useState(2);

  const router = useRouter();

  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => setResendTimer(prev => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) return setError('Please enter your email.');

    try {
      setError('');
      setLoading(true);
      const res = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), purpose: 'forgot' }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setStep(2);
      setResendTimer(data.resendAfterSeconds || 150);
      setAttemptsLeft(data.attemptsLeft ?? 2);
      setSuccess('OTP sent to your email.');
    } catch (err) {
      setError('Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.length !== 6) return setError('Please enter a valid 6-digit OTP.');

    try {
      setError('');
      setLoading(true);
      const res = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), code: otpCode, purpose: 'forgot' }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setStep(3);
      setSuccess('OTP verified! Set your new password.');
    } catch (err) {
      setError('Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) return setError('Password must be at least 6 characters.');
    if (newPassword !== confirmPassword) return setError('Passwords do not match.');

    try {
      setError('');
      setLoading(true);
      const res = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), newPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setSuccess('Password reset successfully! Redirecting to login...');
      setTimeout(() => router.push('/login'), 2000);
    } catch (err) {
      setError('Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setError('');
      setLoading(true);
      const res = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), purpose: 'forgot' }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setResendTimer(data.resendAfterSeconds || 180);
      setAttemptsLeft(data.attemptsLeft ?? 0);
      setSuccess('OTP resent!');
    } catch (err) {
      setError('Failed to resend OTP.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (sec) => `${Math.floor(sec / 60)}:${(sec % 60).toString().padStart(2, '0')}`;

  const titles = {
    1: { title: 'Forgot Password', subtitle: 'Enter your email to receive a verification code' },
    2: { title: 'Verify OTP', subtitle: `Enter the OTP sent to ${email}` },
    3: { title: 'New Password', subtitle: 'Set a new password for your account' },
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
              <h2 className="auth-header-3d__title">{titles[step].title}</h2>
              <p className="auth-header-3d__subtitle">{titles[step].subtitle}</p>
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {success && !error && (
              <div className="alert" style={{ backgroundColor: 'rgba(0,208,156,0.12)', color: '#00D09C', border: '1px solid rgba(0,208,156,0.2)', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', fontSize: '13px' }}>
                {success}
              </div>
            )}

            {step === 1 && (
              <form onSubmit={handleSendOtp} className="auth-form-3d">
                <div className="form-group">
                  <label className="form-label-3d" htmlFor="forgot-email">Email Address</label>
                  <div className="input-icon-wrapper-3d">
                    <Mail className="input-icon-3d" size={18} />
                    <input id="forgot-email" type="email" className="form-control-3d" placeholder="investor@example.com"
                      value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
                  </div>
                </div>
                <button type="submit" className="btn-auth-submit" disabled={loading}>
                  {loading ? (
                    <span className="btn-auth-loading"><span className="auth-spinner" /> Sending OTP...</span>
                  ) : (
                    <><Mail size={18} /><SplitHoverText>Send OTP</SplitHoverText></>
                  )}
                </button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleVerifyOtp} className="auth-form-3d">
                <div className="form-group">
                  <label className="form-label-3d" htmlFor="forgot-otp">Enter 6-digit OTP</label>
                  <div className="input-icon-wrapper-3d">
                    <ShieldCheck className="input-icon-3d" size={18} />
                    <input id="forgot-otp" type="text" className="form-control-3d" placeholder="000000"
                      value={otpCode} onChange={e => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      required autoComplete="one-time-code"
                      style={{ letterSpacing: '8px', fontSize: '20px', textAlign: 'center', fontWeight: 700 }} />
                  </div>
                </div>
                <button type="submit" className="btn-auth-submit" disabled={loading}>
                  {loading ? (
                    <span className="btn-auth-loading"><span className="auth-spinner" /> Verifying...</span>
                  ) : (
                    <><ShieldCheck size={18} /><SplitHoverText>Verify OTP</SplitHoverText></>
                  )}
                </button>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                  <button type="button" onClick={() => { setStep(1); setError(''); setSuccess(''); setOtpCode(''); }}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted, #888)', fontSize: '13px', cursor: 'pointer' }}>
                    ← Change email
                  </button>
                  {resendTimer > 0 ? (
                    <span style={{ fontSize: '13px', color: 'var(--text-muted, #888)' }}>Resend in {formatTime(resendTimer)}</span>
                  ) : (
                    <button type="button" onClick={handleResendOtp} disabled={loading || attemptsLeft <= 0}
                      style={{ background: 'none', border: 'none', fontSize: '13px', cursor: 'pointer',
                        color: attemptsLeft > 0 ? '#00D09C' : 'var(--text-muted, #888)', fontWeight: 600 }}>
                      {attemptsLeft > 0 ? 'Resend OTP' : 'Max attempts reached'}
                    </button>
                  )}
                </div>
              </form>
            )}

            {step === 3 && (
              <form onSubmit={handleResetPassword} className="auth-form-3d">
                <div className="form-group">
                  <label className="form-label-3d" htmlFor="new-pass">New Password</label>
                  <div className="input-icon-wrapper-3d">
                    <Lock className="input-icon-3d" size={18} />
                    <input id="new-pass" type={showPassword ? 'text' : 'password'} className="form-control-3d"
                      placeholder="Min 6 characters" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                      required autoComplete="new-password" />
                    <button type="button" className="password-toggle-3d" onClick={() => setShowPassword(!showPassword)} tabIndex="-1">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label-3d" htmlFor="confirm-new-pass">Confirm New Password</label>
                  <div className="input-icon-wrapper-3d">
                    <Lock className="input-icon-3d" size={18} />
                    <input id="confirm-new-pass" type={showPassword ? 'text' : 'password'} className="form-control-3d"
                      placeholder="Re-enter password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                      required autoComplete="new-password" />
                  </div>
                </div>
                <button type="submit" className="btn-auth-submit" disabled={loading}>
                  {loading ? (
                    <span className="btn-auth-loading"><span className="auth-spinner" /> Resetting...</span>
                  ) : (
                    <><KeyRound size={18} /><SplitHoverText>Reset Password</SplitHoverText></>
                  )}
                </button>
              </form>
            )}

            <div className="auth-divider-3d"><span>or</span></div>
            <div className="auth-footer-3d">
              <p>Remember your password?{' '}
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
