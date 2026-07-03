"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Eye,
  Target,
  ShieldCheck,
  Heart,
  Handshake,
  Sprout,
  CalendarDays,
  Users,
  Wallet,
  FolderKanban,
  ArrowRight
} from 'lucide-react';
import ScrollReveal from '../../components/ScrollReveal';
import { supabase } from '../../lib/supabase';
import { useSiteSettings } from '../../context/SiteSettingsContext';

function formatCapital(amount) {
  if (amount <= 0) return '৳0';
  if (amount >= 10_000_000_000) return `৳${(amount / 10_000_000_000).toFixed(1)}B+`;
  if (amount >= 10_000_000)     return `৳${(amount / 10_000_000).toFixed(1)}Cr+`;
  if (amount >= 100_000)        return `৳${(amount / 100_000).toFixed(1)}L+`;
  return `৳${amount.toLocaleString()}`;
}

function formatInvestors(count) {
  if (count <= 0) return '0';
  if (count >= 1000) return `${(count / 1000).toFixed(0)}K+`;
  return `${count}+`;
}

const VALUE_ICONS = [ShieldCheck, Heart, Handshake, Sprout];

export default function About() {
  const { about: aboutSettings, company } = useSiteSettings();
  const [statsData, setStatsData] = useState({ active_investors: 0, total_capital: 0, active_projects: 3 });

  useEffect(() => {
    supabase.rpc('get_public_stats').then(({ data }) => {
      if (data) setStatsData(data);
    });
  }, []);

  const dynamicValues = (aboutSettings?.values || []).map((v, i) => ({
    icon: VALUE_ICONS[i % VALUE_ICONS.length],
    title: v.title,
    description: v.description,
  }));

  const stats = [
    { icon: CalendarDays, label: 'Founded',   value: company?.foundedYear || '2026',            color: 'emerald' },
    { icon: Users,        label: 'Investors',  value: formatInvestors(statsData.active_investors), color: 'gold'    },
    { icon: Wallet,       label: 'Invested',   value: formatCapital(statsData.total_capital),     color: 'blue'    },
    { icon: FolderKanban, label: 'Projects',   value: `${statsData.active_projects}+`,            color: 'emerald' },
  ];

  const investorLabel = statsData.active_investors > 0
    ? `Join ${formatInvestors(statsData.active_investors)} investors already building wealth with WOORA Group.`
    : 'Be among the first to build wealth with WOORA Group.';

  return (
    <div className="about-page">

      {/* Hero Section */}
      <section className="about-hero">
        <div className="container">
          <ScrollReveal direction="up" delay={0.1}>
            <span className="about-hero__badge">
              <Eye size={14} /> Who We Are
            </span>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={0.2}>
            <h1 className="about-hero__title">
              About <span className="gradient-text">WOORA Group</span>
            </h1>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={0.3}>
            <p className="about-hero__subtitle">
              A multi-venture company from Bangladesh, building honest businesses that everyday people can invest in — and see exactly how their money is working, every single day.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Story + Stats Section */}
      <section className="about-story section">
        <div className="container">
          <div className="about-story__grid">
            {/* Left — Story */}
            <ScrollReveal direction="left" delay={0.1}>
              <div className="about-story__text-block">
                <span className="section-label">Our Story</span>
                <h2 className="about-story__heading">
                  {aboutSettings?.storyHeading || "Building Bangladesh's Most Transparent Company"}
                </h2>
                {(aboutSettings?.storyParagraphs || []).map((p, idx) => (
                  <p key={idx} className="about-story__paragraph">{p}</p>
                ))}
              </div>
            </ScrollReveal>

            {/* Right — Stats Grid */}
            <ScrollReveal direction="right" delay={0.2}>
              <div className="about-stats-grid">
                {stats.map((stat) => {
                  const IconComp = stat.icon;
                  return (
                    <div key={stat.label} className={`about-stat-card about-stat--${stat.color}`}>
                      <div className="about-stat__icon-wrap">
                        <IconComp size={22} />
                      </div>
                      <span className="about-stat__value">{stat.value}</span>
                      <span className="about-stat__label">{stat.label}</span>
                    </div>
                  );
                })}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="about-mv section">
        <div className="container">
          <ScrollReveal direction="up" delay={0.1}>
            <div className="about-mv__grid">
              <div className="about-mv-card">
                <div className="about-mv-card__icon-wrap about-mv-card__icon--emerald">
                  <Target size={24} />
                </div>
                <h3 className="about-mv-card__title">Our Mission</h3>
                <p className="about-mv-card__text">
                  {aboutSettings?.mission || 'To empower every citizen of Bangladesh with accessible, transparent, and high-yield investment opportunities.'}
                </p>
              </div>

              <div className="about-mv-card">
                <div className="about-mv-card__icon-wrap about-mv-card__icon--gold">
                  <Eye size={24} />
                </div>
                <h3 className="about-mv-card__title">Our Vision</h3>
                <p className="about-mv-card__text">
                  {aboutSettings?.vision || "To become South Asia's most trusted fractional investment platform."}
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Core Values */}
      <section className="about-values section">
        <div className="container">
          <ScrollReveal direction="up" delay={0.1}>
            <div className="about-values__header">
              <span className="section-label">What Drives Us</span>
              <h2 className="about-values__title">Our Core Values</h2>
              <p className="about-values__subtitle">
                Four principles that shape every decision we make — from what we sell, to how we treat the people who invest in us.
              </p>
            </div>
          </ScrollReveal>

          <div className="about-values__grid">
            {dynamicValues.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <ScrollReveal key={item.title} direction="up" delay={0.1 + idx * 0.1}>
                  <div className="about-value-card">
                    <div className="about-value-card__icon-wrap">
                      <IconComp size={22} />
                    </div>
                    <h4 className="about-value-card__title">{item.title}</h4>
                    <p className="about-value-card__desc">{item.description}</p>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="about-cta section">
        <div className="container">
          <ScrollReveal direction="up" delay={0.1}>
            <div className="about-cta__box">
              <h2 className="about-cta__title">
                Ready to Start Your<br />
                <span className="gradient-text">Investment Journey?</span>
              </h2>
              <p className="about-cta__subtitle">{investorLabel}</p>
              <div className="about-cta__actions">
                <Link href="/register" className="btn btn-primary">
                  Get Started <ArrowRight size={16} />
                </Link>
                <Link href="/projects" className="btn btn-secondary">
                  View Projects
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
