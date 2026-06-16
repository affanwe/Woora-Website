"use client";

import React from 'react';
import Link from 'next/link';
import {
  Eye,
  Target,
  ShieldCheck,
  Lightbulb,
  Lock,
  Sprout,
  CalendarDays,
  Users,
  Wallet,
  FolderKanban,
  ArrowRight
} from 'lucide-react';
import ScrollReveal from '../../components/ScrollReveal';

const stats = [
  { icon: CalendarDays, label: 'Founded', value: '2023', color: 'emerald' },
  { icon: Users,        label: 'Investors', value: '15K+', color: 'gold' },
  { icon: Wallet,       label: 'Invested', value: '৳2.5B+', color: 'blue' },
  { icon: FolderKanban, label: 'Projects', value: '12+', color: 'emerald' },
];

const values = [
  {
    icon: ShieldCheck,
    title: 'Transparency',
    description:
      'Every investment decision, fund allocation, and project update is shared openly with our investor community. No hidden fees, no surprises.',
  },
  {
    icon: Lightbulb,
    title: 'Innovation',
    description:
      'We leverage cutting-edge fintech, blockchain verification, and AI-driven analytics to identify and manage the highest-potential investment opportunities.',
  },
  {
    icon: Lock,
    title: 'Security',
    description:
      'Enterprise-grade data encryption, multi-layer admin verification, and strict regulatory compliance protect every transaction and investor account.',
  },
  {
    icon: Sprout,
    title: 'Growth',
    description:
      'Our diversified portfolio strategy across multiple high-growth sectors ensures consistent, compounding returns for long-term wealth creation.',
  },
];

export default function About() {
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
              Connecting everyday investors with institutional-grade opportunities.
              Building wealth together through transparency, technology, and trust.
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
                  Democratizing Investment<br />
                  Access in <span className="gradient-text-gold">Bangladesh</span>
                </h2>
                <p className="about-story__paragraph">
                  Founded with a vision to democratize investment access in Bangladesh,
                  WOORA Group connects everyday investors with institutional-grade
                  opportunities across Real Estate, Technology, Agriculture, and
                  Renewable Energy sectors.
                </p>
                <p className="about-story__paragraph">
                  We believe that wealth creation shouldn't be reserved for the
                  privileged few. By fractionalizing ownership of premium assets into
                  affordable shares starting at just ৳500, we've opened the doors
                  for thousands of Bangladeshi citizens to participate in
                  institutional-quality investments that were previously inaccessible.
                </p>
                <p className="about-story__paragraph">
                  Our team comprises seasoned financial analysts, technology experts,
                  and industry veterans who work tirelessly to identify, vet, and
                  manage high-yield opportunities — so our investors can grow their
                  wealth with confidence.
                </p>
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
              {/* Mission Card */}
              <div className="about-mv-card">
                <div className="about-mv-card__icon-wrap about-mv-card__icon--emerald">
                  <Target size={24} />
                </div>
                <h3 className="about-mv-card__title">Our Mission</h3>
                <p className="about-mv-card__text">
                  To empower every citizen of Bangladesh with accessible, transparent,
                  and high-yield investment opportunities. We strive to break down
                  financial barriers and build a platform where anyone — regardless of
                  economic background — can participate in institutional-grade asset
                  ownership and create sustainable, generational wealth.
                </p>
              </div>

              {/* Vision Card */}
              <div className="about-mv-card">
                <div className="about-mv-card__icon-wrap about-mv-card__icon--gold">
                  <Eye size={24} />
                </div>
                <h3 className="about-mv-card__title">Our Vision</h3>
                <p className="about-mv-card__text">
                  To become South Asia's most trusted fractional investment platform
                  by 2030, managing over ৳50 Billion in diversified assets. We envision
                  a future where technology-driven financial inclusion eliminates
                  inequality and creates a thriving community of empowered investors
                  building wealth together.
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
                These principles guide every decision we make and every project we
                launch.
              </p>
            </div>
          </ScrollReveal>

          <div className="about-values__grid">
            {values.map((item, idx) => {
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
              <p className="about-cta__subtitle">
                Join 15,000+ investors already building wealth with WOORA Group.
              </p>
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
