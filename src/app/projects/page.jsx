"use client";

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  TrendingUp,
  Clock,
  BarChart3,
  Building2,
  Leaf,
  Truck,
  Cpu,
  Factory,
  Sun
} from 'lucide-react';
import ScrollReveal from '../../components/ScrollReveal';
import TiltCard from '../../components/TiltCard';

const projects = [
  {
    id: 1,
    title: 'WOORA Heights',
    category: 'Real Estate',
    image: '/images/real_estate.png',
    roi: '15%',
    tenure: '24 Months',
    funded: 72,
    icon: Building2,
    description:
      'Premium residential development in prime Dhaka location. High capital appreciation with consistent rental yield for long-term portfolio growth.',
  },
  {
    id: 2,
    title: 'WOORA Green Agro-Tech',
    category: 'Agriculture',
    image: '/images/agro_tech.png',
    roi: '18%',
    tenure: '18 Months',
    funded: 48,
    icon: Leaf,
    description:
      'Automated vertical farming and smart greenhouse operations powered by hydroponic technology. Sustainable food production with strong margins.',
  },
  {
    id: 3,
    title: 'WOORA Smart Logistics',
    category: 'Infrastructure',
    image: '/images/logistics.png',
    roi: '16%',
    tenure: '36 Months',
    funded: 89,
    icon: Truck,
    description:
      "AI-driven fulfillment and supply chain network serving Bangladesh's booming e-commerce sector. Near full funding — limited availability.",
  },
  {
    id: 4,
    title: 'WOORA Digital Hub',
    category: 'Technology',
    image: '/images/real_estate.png',
    roi: '20%',
    tenure: '12 Months',
    funded: 35,
    icon: Cpu,
    description:
      'State-of-the-art co-working and tech incubation campus designed for startups and enterprise innovation labs in Banani, Dhaka.',
  },
  {
    id: 5,
    title: 'WOORA Textile Mills',
    category: 'Manufacturing',
    image: '/images/agro_tech.png',
    roi: '14%',
    tenure: '30 Months',
    funded: 62,
    icon: Factory,
    description:
      "Modern textile manufacturing facility with export-ready compliance. Steady returns backed by Bangladesh's dominant garment industry.",
  },
  {
    id: 6,
    title: 'WOORA Solar Energy',
    category: 'Renewable Energy',
    image: '/images/logistics.png',
    roi: '22%',
    tenure: '24 Months',
    funded: 25,
    icon: Sun,
    description:
      'Utility-scale solar farm project generating clean energy with government-backed power purchase agreements. Early-stage with maximum upside.',
  },
];

export default function Projects() {
  return (
    <div className="projects-page">

      {/* Hero Section */}
      <section className="projects-hero">
        <div className="container">
          <ScrollReveal direction="up" delay={0.1}>
            <span className="projects-hero__badge">
              <BarChart3 size={14} /> Investment Opportunities
            </span>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={0.2}>
            <h1 className="projects-hero__title">
              Our Investment{' '}
              <span className="gradient-text">Projects</span>
            </h1>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={0.3}>
            <p className="projects-hero__subtitle">
              Every project listed on WOORA Group undergoes rigorous due diligence,
              financial auditing, and risk assessment. Choose the opportunity that
              aligns with your financial goals.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="projects-grid-section section">
        <div className="container">
          <div className="projects-grid">
            {projects.map((project, index) => {
              const IconComponent = project.icon;
              return (
                <ScrollReveal
                  key={project.id}
                  direction="up"
                  delay={0.1 + index * 0.08}
                >
                  <TiltCard className="project-card-3d">
                    {/* Image Header */}
                    <div className="project-card__image-wrapper">
                      <img
                        src={project.image}
                        alt={project.title}
                        className="project-card__image"
                        loading="lazy"
                      />
                      <span className="project-card__category-badge">
                        <IconComponent size={12} />
                        {project.category}
                      </span>
                      <div className="project-card__image-overlay" />
                    </div>

                    {/* Card Body */}
                    <div className="project-card__body">
                      <h3 className="project-card__title">{project.title}</h3>
                      <p className="project-card__description">
                        {project.description}
                      </p>

                      {/* Metrics Row */}
                      <div className="project-card__metrics">
                        <div className="project-card__metric">
                          <TrendingUp size={14} className="metric-icon-green" />
                          <div>
                            <span className="metric-label">Target ROI</span>
                            <span className="metric-value">{project.roi} p.a.</span>
                          </div>
                        </div>
                        <div className="project-card__metric">
                          <Clock size={14} className="metric-icon-gold" />
                          <div>
                            <span className="metric-label">Tenure</span>
                            <span className="metric-value">{project.tenure}</span>
                          </div>
                        </div>
                      </div>

                      {/* Funding Progress */}
                      <div className="project-card__progress">
                        <div className="progress-header">
                          <span className="progress-label">Funded</span>
                          <span className="progress-percent">{project.funded}%</span>
                        </div>
                        <div className="progress-track">
                          <div
                            className="progress-fill"
                            style={{ width: `${project.funded}%` }}
                          />
                        </div>
                      </div>

                      {/* CTA */}
                      <Link href="/buy-shares" className="project-card__btn">
                        Learn More <ArrowRight size={16} />
                      </Link>
                    </div>
                  </TiltCard>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
