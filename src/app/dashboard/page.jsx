"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';
import SplitHoverText from '../../components/SplitHoverText';
import ScrollReveal from '../../components/ScrollReveal';
import TiltCard from '../../components/TiltCard';
import {
  TrendingUp, Award, Clock, DollarSign, CreditCard, Copy, Check,
  User, Phone, Mail, Hash, FileText, AlertCircle, Plus,
  BarChart3, Calendar, ArrowUpRight, Hourglass, ShieldCheck, ArrowRight
} from 'lucide-react';

export default function Dashboard() {
  const { userData, profitData, returnPayments, shareRequests } = useAuth();
  const [copied, setCopied] = useState(false);
  const [referralLink, setReferralLink] = useState('');

  const totalUnits = (userData?.shares || 0) + (userData?.awardedFreeShares || 0);
  const investedAmount = (userData?.shares || 0) * 500;
  const totalProfit = profitData?.totalProfit || 0;
  const pendingProfit = profitData?.pendingProfit || 0;
  const thisMonthProfit = profitData?.thisMonthProfit || 0;
  const freeUnits = userData?.awardedFreeShares || 0;
  const hasActiveInvestment = userData?.investments?.some(inv => inv.status === 'Active');
  const accountStatus = hasActiveInvestment || (userData?.shares || 0) > 0 ? 'Active' : 'Pending';

  const profitHistory = (returnPayments || []).slice(0, 6);
  const pendingRequests = (shareRequests || []).filter(r => r.status === 'Pending');
  const recentRequests = (shareRequests || []).slice(0, 5);

  const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setReferralLink(`${window.location.origin}/register?ref=${userData?.id || '1001'}`);
    }
  }, [userData]);

  const handleCopyLink = () => {
    if (referralLink) {
      navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Non-activated users see activation CTA
  if (userData && !userData.isActivated) {
    return (
      <div className="dashboard-page">
        <div className="container" style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '60px 20px' }}>
          <ScrollReveal direction="up">
            <div style={{
              background: 'var(--color-surface)',
              border: '1px solid rgba(16,185,129,0.25)',
              borderRadius: '20px',
              padding: '48px 40px',
              maxWidth: '520px',
              width: '100%',
              boxShadow: '0 0 60px rgba(16,185,129,0.08)'
            }}>
              <div style={{
                width: '72px', height: '72px', borderRadius: '50%',
                background: 'linear-gradient(135deg,#10b981,#059669)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 24px',
                boxShadow: '0 0 30px rgba(16,185,129,0.3)'
              }}>
                <ShieldCheck size={32} color="#fff" />
              </div>

              <h2 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '12px' }}>
                Welcome, <span className="gradient-text">{userData.email}</span>
              </h2>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: '8px', lineHeight: 1.6 }}>
                Your account has been created with Investor ID <strong style={{ color: 'var(--color-primary)' }}>#{userData.id}</strong>.
              </p>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: '32px', lineHeight: 1.6 }}>
                To become an Investment Partner and access your dashboard, you need to complete your profile with your name, NID and photo.
              </p>

              {/* Step indicators */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px', justifyContent: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#10b981' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#10b981', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '13px' }}>✓</div>
                  <span>Account Created</span>
                </div>
                <div style={{ flex: 1, height: '2px', background: 'linear-gradient(90deg,#10b981,var(--color-primary))', borderRadius: '2px', maxWidth: '60px' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--color-primary)' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--color-primary)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '13px' }}>2</div>
                  <span>Complete Profile</span>
                </div>
              </div>

              <Link href="/activate" style={{
                display: 'inline-flex', alignItems: 'center', gap: '10px',
                background: 'linear-gradient(135deg,#10b981,#059669)',
                color: '#fff', fontWeight: 700, fontSize: '1rem',
                padding: '14px 32px', borderRadius: '12px',
                textDecoration: 'none', transition: 'opacity 0.2s',
                boxShadow: '0 4px 20px rgba(16,185,129,0.3)'
              }}>
                <ShieldCheck size={20} />
                Activate Your Account
                <ArrowRight size={18} />
              </Link>

              <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '20px' }}>
                Takes less than 2 minutes · Required to start investing
              </p>
            </div>
          </ScrollReveal>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="container dashboard-content">
        {/* Header */}
        <ScrollReveal>
          <header className="dash-header">
            <div>
              <h1>Welcome, <span className="gradient-text">{userData?.name || 'Investor'}</span></h1>
              <p className="dash-sub">Your investment overview and portfolio tracker.</p>
            </div>
            <Link href="/buy-shares" className="btn btn-primary">
              <Plus size={16} /> <SplitHoverText>Buy Investment Units</SplitHoverText>
            </Link>
          </header>
        </ScrollReveal>

        {/* Metrics */}
        <ScrollReveal delay={0.1}>
          <div className="metrics-row">
            <TiltCard className="metric-tile">
              <div className="metric-tile-inner">
                <TrendingUp size={20} className="metric-icon text-emerald" />
                <span className="metric-val">{totalUnits}</span>
                <span className="metric-lbl">Total Investment Units</span>
              </div>
            </TiltCard>
            <TiltCard className="metric-tile">
              <div className="metric-tile-inner">
                <DollarSign size={20} className="metric-icon text-gold" />
                <span className="metric-val">৳{investedAmount.toLocaleString()}</span>
                <span className="metric-lbl">Capital Invested</span>
              </div>
            </TiltCard>
            <TiltCard className="metric-tile">
              <div className="metric-tile-inner">
                <Award size={20} className="metric-icon text-blue" />
                <span className="metric-val">৳{totalProfit.toLocaleString()}</span>
                <span className="metric-lbl">Total Profit Earned</span>
              </div>
            </TiltCard>
            <TiltCard className="metric-tile">
              <div className="metric-tile-inner">
                <Clock size={20} className="metric-icon text-warning" />
                <span className={`badge badge-${accountStatus.toLowerCase()}`}>{accountStatus}</span>
                <span className="metric-lbl">Account Status</span>
              </div>
            </TiltCard>
          </div>
        </ScrollReveal>

        {/* Profit Section */}
        <ScrollReveal delay={0.15}>
          <div className="dash-card glass-panel" style={{ marginBottom: '1.5rem' }}>
            <div className="dash-card-header">
              <h3><BarChart3 size={18} /> Profit Overview</h3>
            </div>
            <div className="metrics-row" style={{ marginBottom: '1rem' }}>
              <div className="metric-mini">
                <ArrowUpRight size={16} className="text-emerald" />
                <div>
                  <span className="metric-mini-val">৳{totalProfit.toLocaleString()}</span>
                  <span className="metric-mini-lbl">Total Earned</span>
                </div>
              </div>
              <div className="metric-mini">
                <Calendar size={16} className="text-blue" />
                <div>
                  <span className="metric-mini-val">৳{thisMonthProfit.toLocaleString()}</span>
                  <span className="metric-mini-lbl">This Month</span>
                </div>
              </div>
              <div className="metric-mini">
                <Hourglass size={16} className="text-warning" />
                <div>
                  <span className="metric-mini-val">৳{pendingProfit.toLocaleString()}</span>
                  <span className="metric-mini-lbl">Pending</span>
                </div>
              </div>
            </div>
            <div className="table-wrap">
              {profitHistory.length > 0 ? (
                <table className="inv-table">
                  <thead>
                    <tr>
                      <th>Month</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profitHistory.map((p, idx) => (
                      <tr key={idx}>
                        <td>{monthNames[p.month] || p.month} {p.year}</td>
                        <td className="fw-700">৳{(p.amount || 0).toLocaleString()}</td>
                        <td>
                          <span className={`badge badge-${(p.status || 'paid').toLowerCase()}`}>
                            {p.status || 'Paid'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="empty-box text-center" style={{ padding: '1.5rem' }}>
                  <DollarSign size={28} />
                  <p style={{ margin: '0.5rem 0 0', opacity: 0.7 }}>No profit records yet. Returns are distributed monthly.</p>
                </div>
              )}
            </div>
          </div>
        </ScrollReveal>

        {/* Investment Unit Request Status */}
        {recentRequests.length > 0 && (
          <ScrollReveal delay={0.2}>
            <div className="dash-card glass-panel" style={{ marginBottom: '1.5rem' }}>
              <div className="dash-card-header">
                <h3><Clock size={18} /> Investment Unit Request Status</h3>
                {pendingRequests.length > 0 && (
                  <span className="badge badge-pending">{pendingRequests.length} Pending</span>
                )}
              </div>
              <div className="table-wrap">
                <table className="inv-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Units</th>
                      <th>Amount</th>
                      <th>Payment</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentRequests.map((req, idx) => (
                      <tr key={idx}>
                        <td>{req.dateRequested ? new Date(req.dateRequested).toLocaleDateString() : 'N/A'}</td>
                        <td className="fw-600">{req.sharesCount}</td>
                        <td className="fw-700">৳{(req.amount || 0).toLocaleString()}</td>
                        <td>{req.paymentMethod || 'N/A'}</td>
                        <td>
                          <span className={`badge badge-${(req.status || 'pending').toLowerCase()}`}>
                            {req.status || 'Pending'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </ScrollReveal>
        )}

        {/* Content Grid */}
        <div className="dash-grid">
          {/* Investments Table */}
          <ScrollReveal>
            <div className="dash-card glass-panel">
              <div className="dash-card-header">
                <h3><CreditCard size={18} /> My Investments</h3>
              </div>
              <div className="table-wrap">
                {userData?.investments?.length > 0 ? (
                  <table className="inv-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Units</th>
                        <th>Amount</th>
                        <th>TrxID</th>
                        <th>Status</th>
                        <th>Activated</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userData.investments.map((inv, idx) => (
                        <tr key={idx}>
                          <td>{inv.joiningDate || 'N/A'}</td>
                          <td className="fw-600">{inv.shares}</td>
                          <td className="fw-700">৳{(inv.amount || inv.shares * 500).toLocaleString()}</td>
                          <td><code className="trx-code">{inv.trxId || 'N/A'}</code></td>
                          <td>
                            <span className={`badge badge-${inv.status?.toLowerCase() || 'pending'}`}>
                              {inv.status || 'Pending'}
                            </span>
                          </td>
                          <td>{inv.activationDate || (inv.status === 'Active' ? inv.joiningDate : '-')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="empty-box text-center">
                    <AlertCircle size={36} />
                    <h4>No Investments Yet</h4>
                    <p>Submit your first investment unit purchase request to get started.</p>
                    <Link href="/buy-shares" className="btn btn-secondary">Buy Investment Units</Link>
                  </div>
                )}
              </div>
            </div>
          </ScrollReveal>

          {/* Side Column */}
          <div className="dash-side">
            {/* Profile */}
            <ScrollReveal delay={0.1}>
              <div className="dash-card glass-panel">
                <div className="dash-card-header">
                  <h3><User size={18} /> Profile</h3>
                </div>
                <div className="profile-rows">
                  {[
                    { icon: Hash, label: 'Investor ID', value: userData?.id || 'Pending' },
                    { icon: User, label: 'Name', value: userData?.name || 'N/A' },
                    { icon: Mail, label: 'Email', value: userData?.email || 'N/A' },
                    { icon: Phone, label: 'Mobile', value: userData?.mobile || 'N/A' },
                    { icon: FileText, label: 'NID', value: userData?.nid || 'N/A' },
                  ].map(({ icon: Icon, label, value }, i) => (
                    <div className="profile-row" key={i}>
                      <Icon size={14} className="profile-row-icon" />
                      <div>
                        <span className="profile-row-label">{label}</span>
                        <span className="profile-row-value">{value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            {/* Referral */}
            <ScrollReveal delay={0.2}>
              <div className="dash-card glass-panel">
                <div className="dash-card-header">
                  <h3><Award size={18} className="text-gold" /> Referrals</h3>
                </div>
                <div className="ref-stats">
                  <div className="ref-stat-box">
                    <span className="ref-num">{userData?.referralCount || 0}</span>
                    <span className="ref-label">Referred</span>
                  </div>
                  <div className="ref-stat-box">
                    <span className="ref-num">{freeUnits}</span>
                    <span className="ref-label">Free Units</span>
                  </div>
                </div>
                <div className="ref-link-row">
                  <input type="text" readOnly value={referralLink} className="form-control ref-input" />
                  <button className="btn btn-primary btn-copy" onClick={handleCopyLink}>
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </div>
  );
}
