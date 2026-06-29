"use client";

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import SplitHoverText from '../components/SplitHoverText';
import ScrollReveal from '../components/ScrollReveal';
import TiltCard from '../components/TiltCard';
import { supabase } from '../lib/supabase';
import { ArrowRight, TrendingUp, Users, Wallet, ShieldCheck, Zap, BarChart3 } from 'lucide-react';
import { useSiteSettings } from '../context/SiteSettingsContext';

// Animated character reveal — each character appears one at a time, wrapping at word boundaries
function AnimatedText({ text, className = '', delay = 0 }) {
  const words = text.split(' ');
  let charIndex = 0; // Track overall index for continuous delay calculation

  return (
    <span className={`animated-text ${className}`} aria-label={text}>
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

export default function Home() {
  const { currentUser } = useAuth();
  const { home: homeSettings } = useSiteSettings();
  const sharePrice = homeSettings?.sharePrice || 500;
  const [stats, setStats]       = useState({ active_investors: 0, total_capital: 0, active_projects: 0 });
  const [featuredProjects, setFeaturedProjects] = useState([]);

  useEffect(() => {
    supabase.rpc('get_public_stats').then(({ data }) => {
      if (data) setStats(data);
    });
    supabase.from('projects').select('id,name,category,tagline,images,status').order('created_at', { ascending: false }).limit(3)
      .then(({ data }) => { if (data) setFeaturedProjects(data); });
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
            {homeSettings?.heroSubtitle || `Access premium, vetted investment opportunities across Real Estate, Agriculture, and Technology. Start with just ৳${sharePrice.toLocaleString()} per investment unit.`}
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
                    key={stats.total_capital}
                    target={Math.round(stats.total_capital / 10000000)}
                    prefix="৳"
                    suffix={stats.total_capital >= 10000000 ? "Cr+" : ""}
                  />
                </div>
                <div className="stat-label">Total Capital Deployed</div>
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
                <div className="stat-label">Average Annual ROI</div>
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
            <TiltCard className="pricing-card glass-panel">
              <div className="pricing-card-inner">
                <h3 className="pricing-title">Investment Unit Pricing</h3>
                <div className="pricing-big">
                  <span className="pricing-currency">৳</span>
                  <span className="pricing-amount">{sharePrice.toLocaleString()}</span>
                  <span className="pricing-per">/ unit</span>
                </div>

                <div className="pricing-tiers">
                  {(homeSettings?.tiers || []).map((tier, idx) => (
                    <div key={idx} className={`tier${idx === 1 ? ' is-highlighted' : ''}`}>
                      <span className="tier-label">{tier.name}</span>
                      <span className="tier-shares">{tier.shares.toLocaleString()} Units</span>
                      <span className="tier-cost">৳{tier.cost.toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                <Link href={currentUser ? '/buy-shares' : '/register'} className="btn btn-primary btn-block">
                  <SplitHoverText>Start Investing</SplitHoverText>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </TiltCard>
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
