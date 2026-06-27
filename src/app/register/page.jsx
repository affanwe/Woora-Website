"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { UserPlus, Eye, EyeOff, Mail, Lock, Phone, ArrowRight } from 'lucide-react';
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
  const [email, setEmail]                   = useState('');
  const [mobile, setMobile]                 = useState('');
  const [password, setPassword]             = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword]     = useState(false);
  const [error, setError]                   = useState('');
  const [loading, setLoading]               = useState(false);
  const [referredBy, setReferredBy]         = useState('');

  const { register } = useAuth();
  const router       = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) setReferredBy(ref);
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !mobile || !password || !confirmPassword)
      return setError('Please fill in all fields.');
    if (password.length < 6)
      return setError('Password must be at least 6 characters.');
    if (password !== confirmPassword)
      return setError('Passwords do not match.');
    const cleanMobile = mobile.trim();
    if (!/^(?:\+88|88)?(01[3-9]\d{8})$/.test(cleanMobile))
      return setError('Please enter a valid Bangladeshi mobile number.');

    try {
      setError('');
      setLoading(true);
      await register(email.trim(), cleanMobile, password, referredBy || null);
      router.push('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
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
              <h2 className="auth-header-3d__title">Create Account</h2>
              <p className="auth-header-3d__subtitle">
                Join WOORA Group as an Investment Partner
              </p>
            </div>

            {referredBy && (
              <div className="demo-info-box-3d" style={{ borderColor: '#10b981' }}>
                <span className="demo-info-title-3d"><UserPlus size={14} /> Referral Detected</span>
                <p>You were referred by Investor <strong>#{referredBy}</strong>.</p>
              </div>
            )}

            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleSubmit} className="auth-form-3d">
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
                  <span className="btn-auth-loading"><span className="auth-spinner" /> Creating Account...</span>
                ) : (
                  <><UserPlus size={18} /><SplitHoverText>Create Account</SplitHoverText></>
                )}
              </button>
            </form>

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
