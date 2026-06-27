"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LogIn, Eye, EyeOff, Mail, Lock, Database, ArrowRight } from 'lucide-react';
import SplitHoverText from '../../components/SplitHoverText';
import ScrollReveal from '../../components/ScrollReveal';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, isDemoMode } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      return setError('Please fill in all fields.');
    }

    try {
      setError('');
      setLoading(true);
      await login(email, password);
      router.push('/dashboard');
    } catch (err) {
      console.error(err);
      if (isDemoMode) {
        setError(err.message || 'Login failed.');
      } else {
        setError('Invalid email or password. Please try again.');
      }
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
          <div className="auth-card-3d">
            {/* Glow border accent */}
            <div className="auth-card-3d__glow-border" />

            <div className="auth-header-3d">
              <div className="auth-logo-badge-3d">W</div>
              <h2 className="auth-header-3d__title">Investor Portal</h2>
              <p className="auth-header-3d__subtitle">
                Login to manage your shares and track investments
              </p>
            </div>

            {isDemoMode && (
              <div className="demo-info-box-3d">
                <span className="demo-info-title-3d">
                  <Database size={14} /> Demo Mode Enabled
                </span>
                <p>
                  To test the login, please register an investor account first,
                  or use any previously registered email.
                </p>
              </div>
            )}

            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleSubmit} className="auth-form-3d">
              <div className="form-group">
                <label className="form-label-3d" htmlFor="login-email">
                  Email Address
                </label>
                <div className="input-icon-wrapper-3d">
                  <Mail className="input-icon-3d" size={18} />
                  <input
                    id="login-email"
                    type="email"
                    className="form-control-3d"
                    placeholder="investor@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label-3d" htmlFor="login-password">
                  Password
                </label>
                <div className="input-icon-wrapper-3d">
                  <Lock className="input-icon-3d" size={18} />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    className="form-control-3d"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
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

              <div style={{ textAlign: 'right', marginTop: '-4px', marginBottom: '8px' }}>
                <Link href="/forgot-password" style={{ fontSize: '13px', color: '#00D09C', textDecoration: 'none', fontWeight: 500 }}>
                  Forgot Password?
                </Link>
              </div>

              <button
                type="submit"
                className="btn-auth-submit"
                disabled={loading}
              >
                {loading ? (
                  <span className="btn-auth-loading">
                    <span className="auth-spinner" />
                    Signing in...
                  </span>
                ) : (
                  <>
                    <LogIn size={18} />
                    <SplitHoverText>Sign In</SplitHoverText>
                  </>
                )}
              </button>
            </form>

            <div className="auth-divider-3d">
              <span>or</span>
            </div>

            <div className="auth-footer-3d">
              <p>
                New to WOORA Group?{' '}
                <Link href="/register" className="auth-link-3d">
                  <SplitHoverText>Create an Account</SplitHoverText>
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
