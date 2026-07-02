"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';
import SplitHoverText from '../../components/SplitHoverText';
import ScrollReveal from '../../components/ScrollReveal';
import { supabase } from '../../lib/supabase';
import {
  TrendingUp, Award, Clock, DollarSign, CreditCard, Copy, Check,
  User, Phone, Mail, Hash, FileText, AlertCircle, Plus, Minus,
  BarChart3, ArrowUpRight, Hourglass, ShieldCheck, ArrowRight, X,
  Users, Gift, UserPlus, Wallet, Layers, Activity
} from 'lucide-react';
import { useSiteSettings } from '../../context/SiteSettingsContext';

/* ---- Lightweight SVG area chart (no external deps) ---- */
function ProfitChart({ data }) {
  // data: [{ label, value }]
  const W = 640, H = 220, PAD_X = 42, PAD_TOP = 30, PAD_BOT = 34;
  if (!data || data.length === 0) {
    return (
      <div className="chart-empty">
        <Activity size={28} />
        <p>Your profit trend will appear here after your first quarterly payout.</p>
      </div>
    );
  }
  const points = data.length === 1 ? [data[0], data[0]] : data;
  const max = Math.max(...points.map(d => d.value), 1);
  const stepX = (W - PAD_X * 2) / (points.length - 1);
  const y = v => PAD_TOP + (1 - v / max) * (H - PAD_TOP - PAD_BOT);
  const x = i => PAD_X + i * stepX;

  // Smooth path (catmull-rom -> bezier)
  const pts = points.map((d, i) => [x(i), y(d.value)]);
  let path = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    path += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2[0]} ${p2[1]}`;
  }
  const areaPath = `${path} L ${pts[pts.length - 1][0]} ${H - PAD_BOT} L ${pts[0][0]} ${H - PAD_BOT} Z`;

  const fmt = v => v >= 100000 ? `${(v / 100000).toFixed(1)}L` : v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v;

  return (
    <div className="chart-wrap">
      <svg viewBox={`0 0 ${W} ${H}`} className="profit-chart" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00D09C" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#00D09C" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="chartLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#00D09C" />
            <stop offset="100%" stopColor="#4F8BFF" />
          </linearGradient>
        </defs>
        {/* horizontal grid lines */}
        {[0.25, 0.5, 0.75, 1].map((t, i) => (
          <line key={i} x1={PAD_X} x2={W - PAD_X} y1={PAD_TOP + (1 - t) * (H - PAD_TOP - PAD_BOT)} y2={PAD_TOP + (1 - t) * (H - PAD_TOP - PAD_BOT)} stroke="rgba(148,163,199,0.08)" strokeWidth="1" />
        ))}
        <path d={areaPath} fill="url(#chartFill)" />
        <path d={path} fill="none" stroke="url(#chartLine)" strokeWidth="2.5" strokeLinecap="round" />
        {points.map((d, i) => (
          <g key={i}>
            <circle cx={x(i)} cy={y(d.value)} r="4.5" fill="#0C1220" stroke="#00D09C" strokeWidth="2.5" />
            <text x={x(i)} y={y(d.value) - 12} textAnchor="middle" className="chart-val">৳{fmt(d.value)}</text>
            <text x={x(i)} y={H - 10} textAnchor="middle" className="chart-lbl">{d.label}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

export default function Dashboard() {
  const { userData, profitData, returnPayments, shareRequests, requestSellShares } = useAuth();
  const { home: homeSettings } = useSiteSettings();
  const sharePrice = homeSettings?.sharePrice || 500;
  const [copied, setCopied] = useState(false);
  const [referralLink, setReferralLink] = useState('');
  const [referralCount, setReferralCount] = useState(0);
  const [referrerName, setReferrerName] = useState('');
  const [showSellModal, setShowSellModal] = useState(false);
  const [sellUnits, setSellUnits] = useState(1);
  const [sellLoading, setSellLoading] = useState(false);
  const [sellError, setSellError] = useState('');
  const [sellSuccess, setSellSuccess] = useState('');

  const totalUnits = (userData?.shares || 0) + (userData?.awardedFreeShares || 0);
  const investedAmount = (userData?.shares || 0) * sharePrice;
  const totalProfit = profitData?.totalProfit || 0;
  const pendingProfit = profitData?.pendingProfit || 0;
  const freeUnits = userData?.awardedFreeShares || 0;
  const hasActiveInvestment = userData?.investments?.some(inv => inv.status === 'Active');
  const accountStatus = hasActiveInvestment || (userData?.shares || 0) > 0 ? 'Active' : 'Pending';

  const profitHistory = (returnPayments || []).slice(0, 6);
  const pendingRequests = (shareRequests || []).filter(r => r.status === 'Pending');
  const recentRequests = (shareRequests || []).slice(0, 5);

  const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // This quarter's profit (returns are distributed quarterly)
  const thisQuarterProfit = useMemo(() => {
    const now = new Date();
    const q = Math.floor(now.getMonth() / 3);
    return (returnPayments || [])
      .filter(p => p.year === now.getFullYear() && Math.floor(((p.month || 1) - 1) / 3) === q)
      .reduce((s, p) => s + (p.amount || 0), 0);
  }, [returnPayments]);

  // Quarterly chart data (group payouts into quarters, ascending)
  const chartData = useMemo(() => {
    const map = new Map();
    (returnPayments || []).forEach(p => {
      const q = Math.floor(((p.month || 1) - 1) / 3) + 1;
      const key = `${p.year}-${q}`;
      map.set(key, (map.get(key) || 0) + (p.amount || 0));
    });
    return [...map.entries()]
      .map(([key, value]) => {
        const [yr, q] = key.split('-');
        return { year: +yr, q: +q, label: `Q${q} '${String(yr).slice(2)}`, value };
      })
      .sort((a, b) => a.year - b.year || a.q - b.q)
      .slice(-8);
  }, [returnPayments]);

  // Trend vs previous quarter
  const trendPct = useMemo(() => {
    if (chartData.length < 2) return null;
    const prev = chartData[chartData.length - 2].value;
    const cur = chartData[chartData.length - 1].value;
    if (!prev) return null;
    return Math.round(((cur - prev) / prev) * 100);
  }, [chartData]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setReferralLink(`${window.location.origin}/register?ref=${userData?.id || '1001'}`);
    }
  }, [userData]);

  // Real referral count + who referred this investor
  useEffect(() => {
    const id = userData?.id;
    if (!id || String(id).startsWith('pending_')) return;
    supabase
      .from('investors')
      .select('id', { count: 'exact', head: true })
      .eq('referred_by', id)
      .then(({ count }) => setReferralCount(count || 0));
    if (userData?.referredBy) {
      supabase
        .from('investors')
        .select('name')
        .eq('id', userData.referredBy)
        .maybeSingle()
        .then(({ data }) => setReferrerName(data?.name || `Investor #${userData.referredBy}`));
    }
  }, [userData]);

  const handleCopyLink = () => {
    if (referralLink) {
      navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSellRequest = async () => {
    if (sellUnits <= 0 || sellUnits > (userData?.shares || 0)) {
      setSellError('Invalid number of units.');
      return;
    }
    try {
      setSellError('');
      setSellLoading(true);
      await requestSellShares(sellUnits);
      setSellSuccess('Sell request submitted! Admin will review it shortly.');
      setSellUnits(1);
      setTimeout(() => { setShowSellModal(false); setSellSuccess(''); }, 3000);
    } catch (err) {
      setSellError(err.message || 'Failed to submit sell request.');
    } finally {
      setSellLoading(false);
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
              border: '1px solid rgba(0,208,156,0.25)',
              borderRadius: '20px',
              padding: '48px 40px',
              maxWidth: '520px',
              width: '100%',
              boxShadow: '0 0 60px rgba(0,208,156,0.08)'
            }}>
              <div style={{
                width: '72px', height: '72px', borderRadius: '50%',
                background: 'linear-gradient(135deg,#00D09C,#00B386)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 24px',
                boxShadow: '0 0 30px rgba(0,208,156,0.3)'
              }}>
                <ShieldCheck size={32} color="#fff" />
              </div>

              <h2 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '12px' }}>
                Welcome, <span className="gradient-text">{userData.email}</span>
              </h2>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: '8px', lineHeight: 1.6 }}>
                Your account has been created successfully.
              </p>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: '32px', lineHeight: 1.6 }}>
                To become an Investment Partner and access your dashboard, you need to complete your profile with your name, NID and photo.
              </p>

              {/* Step indicators */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px', justifyContent: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#00D09C' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#00D09C', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '13px' }}>✓</div>
                  <span>Account Created</span>
                </div>
                <div style={{ flex: 1, height: '2px', background: 'linear-gradient(90deg,#00D09C,var(--color-primary))', borderRadius: '2px', maxWidth: '60px' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--color-primary)' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--color-primary)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '13px' }}>2</div>
                  <span>Complete Profile</span>
                </div>
              </div>

              <Link href="/activate" style={{
                display: 'inline-flex', alignItems: 'center', gap: '10px',
                background: 'linear-gradient(135deg,#00D09C,#00B386)',
                color: '#fff', fontWeight: 700, fontSize: '1rem',
                padding: '14px 32px', borderRadius: '12px',
                textDecoration: 'none', transition: 'opacity 0.2s',
                boxShadow: '0 4px 20px rgba(0,208,156,0.3)'
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

  const metricCards = [
    { icon: Layers, tone: 'emerald', value: totalUnits.toLocaleString(), label: 'Total Investment Units', hint: freeUnits > 0 ? `incl. ${freeUnits} free` : null },
    { icon: Wallet, tone: 'gold', value: `৳${investedAmount.toLocaleString()}`, label: 'Capital Invested', hint: null },
    { icon: TrendingUp, tone: 'blue', value: `৳${totalProfit.toLocaleString()}`, label: 'Total Profit Earned', hint: trendPct !== null ? `${trendPct >= 0 ? '+' : ''}${trendPct}% vs last quarter` : null, hintTone: trendPct !== null && trendPct < 0 ? 'down' : 'up' },
    { icon: ShieldCheck, tone: accountStatus === 'Active' ? 'emerald' : 'warning', value: accountStatus, label: 'Account Status', isBadge: true },
  ];

  return (
    <div className="dashboard-page">
      <div className="container dashboard-content">
        {/* Header */}
        <ScrollReveal>
          <header className="dash-header">
            <div className="dash-header-id">
              <div className="dash-avatar">
                {userData?.image ? (
                  <img src={userData.image} alt={userData?.name || 'Investor'} className="dash-avatar-img" />
                ) : (
                  (userData?.name || 'I').charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <h1>Welcome, <span className="gradient-text">{userData?.name || 'Investor'}</span></h1>
                <p className="dash-sub">
                  Investor ID <span className="dash-id-chip">#{(userData?.id && !String(userData.id).startsWith('pending_')) ? userData.id : '—'}</span> · Your portfolio at a glance
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <Link href="/buy-shares" className="btn btn-primary">
                <Plus size={16} /> <SplitHoverText>Buy Investment Units</SplitHoverText>
              </Link>
              {(userData?.shares || 0) > 0 && (
                <button onClick={() => { setShowSellModal(true); setSellError(''); setSellSuccess(''); }} className="btn btn-secondary btn-sell">
                  <Minus size={16} /> <SplitHoverText>Sell Units</SplitHoverText>
                </button>
              )}
            </div>
          </header>
        </ScrollReveal>

        {/* Metrics */}
        <ScrollReveal delay={0.1}>
          <div className="metrics-row">
            {metricCards.map(({ icon: Icon, tone, value, label, hint, hintTone, isBadge }, i) => (
              <div className={`metric-tile glass-panel tone-${tone}`} key={i}>
                <div className="metric-tile-inner">
                  <div className="metric-top">
                    <span className={`metric-icon-chip chip-${tone}`}><Icon size={18} /></span>
                    {hint && <span className={`metric-hint ${hintTone === 'down' ? 'hint-down' : 'hint-up'}`}>{hint}</span>}
                  </div>
                  {isBadge ? (
                    <span className={`badge badge-${String(value).toLowerCase()} metric-badge`}>{value}</span>
                  ) : (
                    <span className="metric-val">{value}</span>
                  )}
                  <span className="metric-lbl">{label}</span>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* Profit Overview — chart + quick stats */}
        <ScrollReveal delay={0.15}>
          <div className="dash-card glass-panel" style={{ marginBottom: '1.5rem' }}>
            <div className="dash-card-header">
              <h3><span className="card-icon-chip"><BarChart3 size={16} /></span> Profit Overview</h3>
              {trendPct !== null && (
                <span className={`trend-pill ${trendPct < 0 ? 'trend-down' : 'trend-up'}`}>
                  <ArrowUpRight size={13} style={trendPct < 0 ? { transform: 'rotate(90deg)' } : undefined} />
                  {trendPct >= 0 ? '+' : ''}{trendPct}% this quarter
                </span>
              )}
            </div>
            <div className="profit-grid">
              <ProfitChart data={chartData} />
              <div className="profit-side-stats">
                <div className="pstat">
                  <span className="pstat-icon icon-emerald"><ArrowUpRight size={15} /></span>
                  <div>
                    <span className="pstat-val">৳{totalProfit.toLocaleString()}</span>
                    <span className="pstat-lbl">Total Earned</span>
                  </div>
                </div>
                <div className="pstat">
                  <span className="pstat-icon icon-blue"><BarChart3 size={15} /></span>
                  <div>
                    <span className="pstat-val">৳{thisQuarterProfit.toLocaleString()}</span>
                    <span className="pstat-lbl">This Quarter</span>
                  </div>
                </div>
                <div className="pstat">
                  <span className="pstat-icon icon-warning"><Hourglass size={15} /></span>
                  <div>
                    <span className="pstat-val">৳{pendingProfit.toLocaleString()}</span>
                    <span className="pstat-lbl">Pending Payout</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="table-wrap" style={{ marginTop: '18px' }}>
              {profitHistory.length > 0 ? (
                <table className="inv-table">
                  <thead>
                    <tr>
                      <th>Period</th>
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
                  <p style={{ margin: '0.5rem 0 0', opacity: 0.7 }}>No profit records yet. Returns are distributed quarterly.</p>
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
                <h3><span className="card-icon-chip"><Clock size={16} /></span> Investment Unit Request Status</h3>
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
                <h3><span className="card-icon-chip"><CreditCard size={16} /></span> My Investments</h3>
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
                          <td className="fw-700">৳{(inv.amount || inv.shares * sharePrice).toLocaleString()}</td>
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
            {/* Referral — redesigned */}
            <ScrollReveal delay={0.1}>
              <div className="dash-card glass-panel ref-card">
                <div className="dash-card-header">
                  <h3><span className="card-icon-chip chip-gold-bg"><Gift size={16} /></span> Referral Program</h3>
                </div>
                <p className="ref-tagline">Invite friends & earn free investment units when they join.</p>
                <div className="ref-stats">
                  <div className="ref-stat-box">
                    <Users size={16} className="ref-stat-icon" />
                    <span className="ref-num">{referralCount}</span>
                    <span className="ref-label">People Referred</span>
                  </div>
                  <div className="ref-stat-box">
                    <Gift size={16} className="ref-stat-icon gold" />
                    <span className="ref-num gold">{freeUnits}</span>
                    <span className="ref-label">Free Units Earned</span>
                  </div>
                </div>
                <div className="ref-link-row">
                  <input type="text" readOnly value={referralLink} className="form-control ref-input" />
                  <button className="btn btn-primary btn-copy" onClick={handleCopyLink}>
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
                {userData?.referredBy && (
                  <div className="ref-by-row">
                    <UserPlus size={14} />
                    <span>Referred by <strong>{referrerName || `Investor #${userData.referredBy}`}</strong></span>
                  </div>
                )}
              </div>
            </ScrollReveal>

            {/* Profile */}
            <ScrollReveal delay={0.2}>
              <div className="dash-card glass-panel">
                <div className="dash-card-header">
                  <h3><span className="card-icon-chip"><User size={16} /></span> Profile</h3>
                </div>
                <div className="profile-rows">
                  {[
                    { icon: Hash, label: 'Investor ID', value: (userData?.id && !String(userData.id).startsWith('pending_')) ? userData.id : 'Assigned on activation' },
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
          </div>
        </div>

        {/* Sell Modal */}
        {showSellModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }}>
            <div style={{ background: 'var(--color-surface, #1a1a2e)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '16px', padding: '32px', maxWidth: '420px', width: '100%', position: 'relative' }}>
              <button onClick={() => setShowSellModal(false)} style={{ position: 'absolute', top: '12px', right: '12px', background: 'none', border: 'none', color: 'var(--color-text-muted, #888)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px', color: '#EF4444' }}>Sell Investment Units</h3>
              <p style={{ color: 'var(--color-text-muted, #aaa)', fontSize: '14px', marginBottom: '20px' }}>
                Your request will be reviewed by the admin team.
              </p>
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted, #aaa)', marginBottom: '16px' }}>
                Available units: <strong style={{ color: '#fff' }}>{userData?.shares || 0}</strong>
              </p>
              {sellError && <div style={{ background: 'rgba(239,68,68,0.12)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '10px 14px', marginBottom: '12px', fontSize: '13px' }}>{sellError}</div>}
              {sellSuccess && <div style={{ background: 'rgba(0,208,156,0.12)', color: '#00D09C', border: '1px solid rgba(0,208,156,0.2)', borderRadius: '8px', padding: '10px 14px', marginBottom: '12px', fontSize: '13px' }}>{sellSuccess}</div>}
              <label style={{ display: 'block', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted, #888)', marginBottom: '6px' }}>Number of units to sell</label>
              <input
                type="number"
                min="1"
                max={userData?.shares || 0}
                value={sellUnits}
                onChange={e => setSellUnits(parseInt(e.target.value) || 0)}
                className="form-control"
                style={{ width: '100%', padding: '12px', fontSize: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: '#fff', marginBottom: '8px' }}
              />
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted, #aaa)', marginBottom: '20px' }}>
                Refund amount: <strong style={{ color: '#EF4444' }}>৳{(sellUnits * sharePrice).toLocaleString()}</strong>
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => setShowSellModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
                <button onClick={handleSellRequest} disabled={sellLoading || sellUnits <= 0 || sellUnits > (userData?.shares || 0)} className="btn" style={{ flex: 1, background: '#EF4444', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px', fontWeight: 600, cursor: 'pointer', opacity: sellLoading ? 0.6 : 1 }}>
                  {sellLoading ? 'Submitting...' : 'Submit Sell Request'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
