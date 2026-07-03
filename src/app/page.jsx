"use client";

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import SplitHoverText from '../components/SplitHoverText';
import ScrollReveal from '../components/ScrollReveal';
import { supabase } from '../lib/supabase';
import { ArrowRight, TrendingUp, Users, Wallet, ShieldCheck, Zap, BarChart3 } from 'lucide-react';
import { useSiteSettings } from '../context/SiteSettingsContext';

// Animated character reveal — each character appears one at a time, wrapping at word boundaries
function AnimatedText({ text, className = '', delay = 0 }) {
  const words = text.split(' ');
  let charIndex = 0; // Track overall index for continuous delay calculation

  return (
    <span className={`animated-text notranslate ${className}`} translate="no" aria-label={text}>
      {words.map((word, wIdx) => {
        const wordChars = word.split('');
        return (
          <span
            key={wIdx}
            className="animated-word"
            style={{ display: 'inline-block', whiteSpace: 'nowrap' }}
          >
            {wordChars.map((char, cIdx) => {
              const currentDelay = delay + charIndex * 0.05;
              charIndex++;
              return (
                <span
                  key={cIdx}
                  className="animated-char"
                  style={{ animationDelay: `${currentDelay}s` }}
                >
                  {char}
                </span>
              );
            })}
            {/* Add non-breaking space after each word except the last one */}
            {wIdx < words.length - 1 && (
              <span className="animated-space" style={{ display: 'inline-block' }}>
                &nbsp;
              </span>
            )}
          </span>
        );
      })}
    </span>
  );
}

// Animated number counter
function AnimatedCounter({ target, suffix = '', prefix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 2000;
          const startTime = performance.now();
          const step = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
}

// Animated company growth line chart (pure SVG, draws in on scroll)
function GrowthChart({ series, total }) {
  const [visible, setVisible] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.35 }
    );
    if (wrapRef.current) observer.observe(wrapRef.current);
    return () => observer.disconnect();
  }, []);

  const W = 560, H = 300, PAD_X = 30, PAD_TOP = 30, PAD_BOT = 42;

  // Real cumulative profit curve from admin PnL records; brand placeholder until data exists
  const hasData = Array.isArray(series) && series.length >= 2;
  let main, labels;
  if (hasData) {
    let running = 0;
    const cumulative = series.map(p => {
      running += Number(p.net_profit) || 0;
      return { label: `${String(p.month).slice(0, 3)} '${String(p.year).slice(2)}`, value: running };
    }).slice(-8);
    main = cumulative.map(p => p.value);
    labels = cumulative.map(p => p.label);
  } else {
    main = [12, 30, 24, 48, 42, 70, 96];
    labels = ["Jan '26", "Feb '26", "Mar '26", "Apr '26", "May '26", "Jun '26", "Jul '26"];
  }
  const base = main.map(v => v * 0.45);
  const max = Math.max(...main, 1) * 1.1;

  const toPts = (arr) => arr.map((v, i) => [
    PAD_X + (i * (W - PAD_X * 2)) / (arr.length - 1),
    PAD_TOP + (1 - v / max) * (H - PAD_TOP - PAD_BOT),
  ]);

  const smoothPath = (pts) => {
    let d = `M ${pts[0][0]} ${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] || p2;
      d += ` C ${p1[0] + (p2[0] - p0[0]) / 6} ${p1[1] + (p2[1] - p0[1]) / 6}, ${p2[0] - (p3[0] - p1[0]) / 6} ${p2[1] - (p3[1] - p1[1]) / 6}, ${p2[0]} ${p2[1]}`;
    }
    return d;
  };

  const mainPts = toPts(main);
  const basePts = toPts(base);
  const mainPath = smoothPath(mainPts);
  const areaPath = `${mainPath} L ${mainPts[mainPts.length - 1][0]} ${H - PAD_BOT} L ${mainPts[0][0]} ${H - PAD_BOT} Z`;

  return (
    <div ref={wrapRef} className={`growth-card glass-panel${visible ? ' is-visible' : ''}`}>
      <div className="growth-head">
        <div>
          <span className="growth-eyebrow">Company Growth</span>
          <div className="growth-big">
            <AnimatedCounter
              key={total}
              target={Math.round(total)}
              prefix="৳"
            />
          </div>
          <span className="growth-sub">Total Profit Earned</span>
        </div>
        <span className="growth-pill"><TrendingUp size={13} /> Growing</span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="growth-chart" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="gcLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#00D09C" />
            <stop offset="100%" stopColor="#4F8BFF" />
          </linearGradient>
          <linearGradient id="gcFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00D09C" stopOpacity="0.30" />
            <stop offset="100%" stopColor="#00D09C" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* grid lines */}
        {[0.25, 0.5, 0.75].map((t, i) => (
          <line
            key={i}
            x1={PAD_X} x2={W - PAD_X}
            y1={PAD_TOP + (1 - t) * (H - PAD_TOP - PAD_BOT)}
            y2={PAD_TOP + (1 - t) * (H - PAD_TOP - PAD_BOT)}
            stroke="rgba(148,163,199,0.08)"
          />
        ))}

        {/* dashed baseline (last period) */}
        <path d={smoothPath(basePts)} className="gc-baseline" fill="none" />

        {/* gradient area + main line */}
        <path d={areaPath} className="gc-area" fill="url(#gcFill)" />
        <path d={mainPath} className="gc-line" fill="none" stroke="url(#gcLine)" strokeWidth="3" strokeLinecap="round" />

        {/* dots */}
        {mainPts.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="5" className="gc-dot" style={{ transitionDelay: `${1.1 + i * 0.12}s` }} />
        ))}

        {/* month labels */}
        {mainPts.map(([x], i) => (
          <text key={i} x={x} y={H - 14} textAnchor="middle" className="gc-label">{labels[i]}</text>
        ))}
      </svg>

    </div>
  );
}

export default function Home() {
  const { currentUser } = useAuth();
  const { home: homeSettings } = useSiteSettings();
  const sharePrice = homeSettings?.sharePrice || 500;
  const [stats, setStats]       = useState({ active_investors: 0, total_capital: 0, active_projects: 0, total_profit_distributed: 0 });
  const [featuredProjects, setFeaturedProjects] = useState([]);
  const [profitSeries, setProfitSeries] = useState({ series: [], total: 0 });

  useEffect(() => {
    supabase.rpc('get_public_stats').then(({ data }) => {
      if (data) setStats(prev => ({ ...prev, ...data }));
    });
    supabase.from('investors').select('profit_received').then(({ data }) => {
      if (data) {
        const total = data.reduce((sum, inv) => sum + (inv.profit_received || 0), 0);
        setStats(prev => ({ ...prev, total_profit_distributed: total }));
      }
    });
    supabase.from('projects').select('id,name,category,tagline,images,status').order('created_at', { ascending: false }).limit(3)
      .then(({ data }) => { if (data) setFeaturedProjects(data); });

    // Company profit series (total profit earned) + realtime updates from admin PnL
    const fetchProfitSeries = () => {
      supabase.from('public_profit_series').select('series,total').eq('id', 'main').maybeSingle()
        .then(({ data }) => {
          if (data) setProfitSeries({ series: data.series || [], total: Number(data.total) || 0 });
        });
    };
    fetchProfitSeries();
    const channel = supabase
      .channel('public-profit-series')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'public_profit_series' }, fetchProfitSeries)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <div className="home-page">
      {/* ======== HERO SECTION ======== */}
      <section className="hero">
        <div className="hero-overlay" />
        <div className="container hero-content">
          <h1 className="hero-title">
            <span className="hero-line hero-line-1">
              <AnimatedText text={homeSettings?.heroLine1 || "Let's make"} delay={0.5} />
            </span>
            <span className="hero-line hero-line-2 gradient-text">
              <AnimatedText text={homeSettings?.heroLine2 || 'Your dream a reality'} delay={1.1} className="gradient-text-chars" />
            </span>
          </h1>
          <p className="hero-subtitle hero-animate-in" style={{ animationDelay: '2.3s' }}>
            {homeSettings?.heroSubtitle || `Be part of Bangladesh's next big ventures — transparent, healthy, and built to grow. Investment units start at ৳${sharePrice.toLocaleString()} only.`}
          </p>
        </div>

        <div className="hero-scroll-indicator hero-animate-in" style={{ animationDelay: '3s' }}>
          <div className="scroll-line" />
        </div>
      </section>

      {/* ======== STATS SECTION ======== */}
      <section className="stats-section">
        <div className="container">
          <ScrollReveal>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon"><Wallet size={24} /></div>
                <div className="stat-value">
                  <AnimatedCounter
                    key={stats.total_profit_distributed}
                    target={stats.total_profit_distributed >= 10000000 ? Math.round(stats.total_profit_distributed / 10000000) : Math.round(stats.total_profit_distributed / 100000)}
                    prefix="৳"
                    suffix={stats.total_profit_distributed >= 10000000 ? "Cr+" : stats.total_profit_distributed >= 100000 ? "L+" : ""}
                  />
                </div>
                <div className="stat-label">Total Profit Distributed</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon text-gold"><Users size={24} /></div>
                <div className="stat-value">
                  <AnimatedCounter key={stats.active_investors} target={stats.active_investors} suffix="+" />
                </div>
                <div className="stat-label">Active Investors</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon text-blue"><TrendingUp size={24} /></div>
                <div className="stat-value"><AnimatedCounter target={homeSettings?.roiDisplay || 25} suffix="%" /></div>
                <div className="stat-label">Net Profit Distributed</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon text-purple"><BarChart3 size={24} /></div>
                <div className="stat-value">
                  <AnimatedCounter key={stats.active_projects} target={Number(stats.active_projects)} suffix="+" />
                </div>
                <div className="stat-label">Active Projects</div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ======== FEATURED PROJECTS ======== */}
      <section className="section featured-section">
        <div className="container">
          <ScrollReveal>
            <div className="section-eyebrow">Active Opportunities</div>
            <h2 className="section-title">Featured Projects</h2>
          </ScrollReveal>

          {featuredProjects.length > 0 ? (
            <div className="featured-list">
              {featuredProjects.map((project, i) => (
                <ScrollReveal key={project.id} delay={i * 0.1}>
                  <Link href={`/projects/${project.id}`} className="featured-item">
                    <div className="featured-item-inner">
                      <span className="featured-index">0{i + 1}</span>
                      <div className="featured-text">
                        <h3 className="featured-name">
                          <SplitHoverText>{project.name}</SplitHoverText>
                        </h3>
                        <div className="featured-meta">
                          <span className="featured-category">{project.category}</span>
                          <span className="featured-category">{project.status}</span>
                        </div>
                      </div>
                      {project.images && project.images[0] && (
                        <div className="featured-image-preview">
                          <img src={project.images[0]} alt={project.name} />
                        </div>
                      )}
                      <ArrowRight size={20} className="featured-arrow" />
                    </div>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)', opacity: 0.6 }}>
              Projects coming soon.
            </div>
          )}

          <ScrollReveal>
            <div className="text-center" style={{ marginTop: '48px' }}>
              <Link href="/projects" className="btn btn-secondary">
                <SplitHoverText>View All Projects</SplitHoverText>
                <ArrowRight size={16} />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ======== SHARE PRICING ======== */}
      <section className="section share-section">
        <div className="container grid-2 share-grid">
          <ScrollReveal>
            <div className="share-text-col">
              <div className="section-eyebrow">Investment Access</div>
              <h2 className="section-title">Fractional Investment Unit Ownership</h2>
              <p className="section-subtitle" style={{ maxWidth: 'none', marginBottom: '32px' }}>
                We fractionalize premium assets into affordable investment units so that anyone can invest. No complex paperwork — just choose your unit count, pay, and let your money grow.
              </p>

              <div className="features-stack">
                <div className="feature-row">
                  <div className="feature-icon-circle"><ShieldCheck size={18} /></div>
                  <div>
                    <h4>৳{sharePrice.toLocaleString()} Per Investment Unit</h4>
                    <p>Start investing with as little as one investment unit. Build your portfolio over time.</p>
                  </div>
                </div>
                <div className="feature-row">
                  <div className="feature-icon-circle"><ShieldCheck size={18} /></div>
                  <div>
                    <h4>Mobile Banking Payments</h4>
                    <p>Pay via bKash, Nagad, Rocket, or cash deposit. Quick request submission.</p>
                  </div>
                </div>
                <div className="feature-row">
                  <div className="feature-icon-circle"><ShieldCheck size={18} /></div>
                  <div>
                    <h4>Admin-Verified Transactions</h4>
                    <p>Every purchase is audited and verified by our finance team before activation.</p>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <GrowthChart
              series={profitSeries.series}
              total={profitSeries.total}
            />
          </ScrollReveal>
        </div>
      </section>

      {/* ======== BOTTOM CTA SECTION ======== */}
      <section className="section bottom-cta-section text-center" style={{ borderTop: '1px solid var(--border-color)', padding: '60px 0' }}>
        <div className="container">
          <ScrollReveal>
            <h2 className="section-title" style={{ marginBottom: '16px' }}>{homeSettings?.ctaTitle || 'Ready to Get Started?'}</h2>
            <p className="section-subtitle" style={{ marginBottom: '40px', marginLeft: 'auto', marginRight: 'auto' }}>
              {homeSettings?.ctaSubtitle || 'Create an account or explore our active projects to start investing today.'}
            </p>
            <div className="hero-actions">
              <Link href={currentUser ? '/dashboard' : '/register'} className="btn btn-primary btn-lg hero-btn-glow">
                <SplitHoverText>Get Started</SplitHoverText>
                <ArrowRight size={18} />
              </Link>
              <Link href="/projects" className="btn btn-secondary btn-lg">
                <SplitHoverText>View Projects</SplitHoverText>
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
