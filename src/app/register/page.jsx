"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import {
  UserPlus,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  CreditCard,
  Database,
  ArrowRight
} from 'lucide-react';
import TextShuffle from '../../components/TextShuffle';
import ScrollReveal from '../../components/ScrollReveal';

export default function Register() {
  return (
    <Suspense fallback={null}>
      <RegisterInner />
    </Suspense>
  );
}

function RegisterInner() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    nid: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [referredBy, setReferredBy] = useState('');

  const { register, isDemoMode } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) {
      setReferredBy(ref);
    }
  }, [searchParams]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, mobile, password, confirmPassword, nid } = formData;

    // Basic Validation
    if (!name || !email || !mobile || !password || !confirmPassword || !nid) {
      return setError('Please fill in all fields.');
    }
    if (password.length < 6) {
      return setError('Password must be at least 6 characters.');
    }
    if (password !== confirmPassword) {
      return setError('Passwords do not match.');
    }
    // NID simple validation: typically 10, 13, or 17 digits in Bangladesh
    const cleanNid = nid.trim();
    if (
      !/^\d+$/.test(cleanNid) ||
      (cleanNid.length !== 10 && cleanNid.length !== 13 && cleanNid.length !== 17)
    ) {
      return setError('NID must be a valid 10, 13, or 17-digit numeric code.');
    }
    // Mobile simple validation
    const cleanMobile = mobile.trim();
    if (!/^(?:\+88|88)?(01[3-9]\d{8})$/.test(cleanMobile)) {
      return setError('Please enter a valid Bangladeshi mobile number.');
    }

    try {
      setError('');
      setLoading(true);
      await register(name, email, cleanMobile, password, cleanNid, referredBy || null);
      router.push('/dashboard');
    } catch (err) {
      console.error(err);
      setError(
        err.message || 'Registration failed. Please check details and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-3d">

      {/* Ambient glow blobs */}
      <div className="auth-glow-blob auth-glow-blob--emerald" />
      <div className="auth-glow-blob auth-glow-blob--gold" />

      <div className="auth-content-wrapper">
        <ScrollReveal direction="up" delay={0.15}>
          <div className="auth-card-3d auth-card-3d--wide">
            {/* Glow border accent */}
            <div className="auth-card-3d__glow-border" />

            <div className="auth-header-3d">
              <div className="auth-logo-badge-3d">W</div>
              <h2 className="auth-header-3d__title">Create Investor Account</h2>
              <p className="auth-header-3d__subtitle">
                Join WOORA Group and start purchasing shares
              </p>
            </div>

            {isDemoMode && (
              <div className="demo-info-box-3d">
                <span className="demo-info-title-3d">
                  <Database size={14} /> Demo Mode Enabled
                </span>
                <p>
                  Your data will be securely stored in your browser's local
                  storage. This matches the exact behavior of Firebase Firestore.
                </p>
              </div>
            )}

            {referredBy && (
              <div className="demo-info-box-3d" style={{ borderColor: 'var(--clr-emerald, #10b981)' }}>
                <span className="demo-info-title-3d">
                  <UserPlus size={14} /> Referral Detected
                </span>
                <p>You were referred by Investor <strong>#{referredBy}</strong>. Both of you may earn bonus shares!</p>
              </div>
            )}

            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleSubmit} className="auth-form-3d">
              {/* Row 1: Name + Email */}
              <div className="auth-form-row">
                <div className="form-group">
                  <label className="form-label-3d" htmlFor="reg-name">
                    Full Name
                  </label>
                  <div className="input-icon-wrapper-3d">
                    <User className="input-icon-3d" size={18} />
                    <input
                      id="reg-name"
                      name="name"
                      type="text"
                      className="form-control-3d"
                      placeholder="Sadikul Haque"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      autoComplete="name"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label-3d" htmlFor="reg-email">
                    Email Address
                  </label>
                  <div className="input-icon-wrapper-3d">
                    <Mail className="input-icon-3d" size={18} />
                    <input
                      id="reg-email"
                      name="email"
                      type="email"
                      className="form-control-3d"
                      placeholder="investor@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: Mobile + NID */}
              <div className="auth-form-row">
                <div className="form-group">
                  <label className="form-label-3d" htmlFor="reg-mobile">
                    Mobile Number
                  </label>
                  <div className="input-icon-wrapper-3d">
                    <Phone className="input-icon-3d" size={18} />
                    <input
                      id="reg-mobile"
                      name="mobile"
                      type="tel"
                      className="form-control-3d"
                      placeholder="01712345678"
                      value={formData.mobile}
                      onChange={handleChange}
                      required
                      autoComplete="tel"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label-3d" htmlFor="reg-nid">
                    NID Card Number
                  </label>
                  <div className="input-icon-wrapper-3d">
                    <CreditCard className="input-icon-3d" size={18} />
                    <input
                      id="reg-nid"
                      name="nid"
                      type="text"
                      className="form-control-3d"
                      placeholder="e.g. 5501234567"
                      value={formData.nid}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Row 3: Password + Confirm */}
              <div className="auth-form-row">
                <div className="form-group">
                  <label className="form-label-3d" htmlFor="reg-password">
                    Password
                  </label>
                  <div className="input-icon-wrapper-3d">
                    <Lock className="input-icon-3d" size={18} />
                    <input
                      id="reg-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      className="form-control-3d"
                      placeholder="Min 6 characters"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="password-toggle-3d"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex="-1"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label-3d" htmlFor="reg-confirm">
                    Confirm Password
                  </label>
                  <div className="input-icon-wrapper-3d">
                    <Lock className="input-icon-3d" size={18} />
                    <input
                      id="reg-confirm"
                      name="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      className="form-control-3d"
                      placeholder="Re-enter password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      autoComplete="new-password"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="btn-auth-submit"
                disabled={loading}
              >
                {loading ? (
                  <span className="btn-auth-loading">
                    <span className="auth-spinner" />
                    Creating Account...
                  </span>
                ) : (
                  <>
                    <UserPlus size={18} />
                    <TextShuffle>Register as Investor</TextShuffle>
                  </>
                )}
              </button>
            </form>

            <div className="auth-divider-3d">
              <span>or</span>
            </div>

            <div className="auth-footer-3d">
              <p>
                Already have an account?{' '}
                <Link href="/login" className="auth-link-3d">
                  <TextShuffle>Login Here</TextShuffle>
                  <ArrowRight size={14} />
                </Link>
              </p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
