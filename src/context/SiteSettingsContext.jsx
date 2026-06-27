"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchSiteSettings } from '../lib/siteSettings';

const DEFAULT_PAYMENT_METHODS = [
  { name: 'bKash', type: 'MFS', number: '01712-345678', active: true },
  { name: 'Nagad', type: 'MFS', number: '01812-345678', active: true },
  { name: 'Rocket', type: 'MFS', number: '01912-345678-0', active: true },
  { name: 'Cash', type: 'Cash', number: '', active: true, address: 'Office — Gulshan 2, Dhaka' },
];

const DEFAULT_COMPANY = {
  name: 'WOORA Group',
  foundedYear: '2026',
  phone: '+880 1712-345678',
  email: 'support@wooragroup.com',
  address: 'Gulshan 2, Dhaka',
  officeAddress: 'Level 5, WOORA Tower, Road 12\nGulshan-2, Dhaka',
  description: 'Connecting investors with institutional-grade opportunities across Real Estate, Technology, Agriculture, and Renewable Energy sectors.',
  verificationTimeline: '1–4 hours',
};

const DEFAULT_HOME = {
  heroLine1: "Let's make",
  heroLine2: 'Your dream a reality',
  heroSubtitle: 'Access premium, vetted investment opportunities across Real Estate, Agriculture, and Technology. Start with just ৳500 per share.',
  sharePrice: 500,
  roiDisplay: 25,
  tiers: [
    { name: 'Bronze', shares: 50, cost: 25000 },
    { name: 'Silver', shares: 200, cost: 100000 },
    { name: 'Gold', shares: 1000, cost: 500000 },
  ],
  ctaTitle: 'Ready to Get Started?',
  ctaSubtitle: 'Create an account or explore our active projects to start investing today.',
};

const DEFAULT_ABOUT = {
  storyHeading: 'Democratizing Investment Access in Bangladesh',
  storyParagraphs: [
    'Founded with a vision to democratize investment access in Bangladesh, WOORA Group connects everyday investors with institutional-grade opportunities across Real Estate, Technology, Agriculture, and Renewable Energy sectors.',
    "We believe that wealth creation shouldn't be reserved for the privileged few. By fractionalizing ownership of premium assets into affordable shares starting at just ৳500, we've opened the doors for Bangladeshi citizens to participate in institutional-quality investments that were previously inaccessible.",
    'Our team comprises seasoned financial analysts, technology experts, and industry veterans who work tirelessly to identify, vet, and manage high-yield opportunities — so our investors can grow their wealth with confidence.',
  ],
  mission: 'To empower every citizen of Bangladesh with accessible, transparent, and high-yield investment opportunities. We strive to break down financial barriers and build a platform where anyone — regardless of economic background — can participate in institutional-grade asset ownership and create sustainable, generational wealth.',
  vision: "To become South Asia's most trusted fractional investment platform by 2030, managing over ৳50 Billion in diversified assets. We envision a future where technology-driven financial inclusion eliminates inequality and creates a thriving community of empowered investors building wealth together.",
  visionYear: '2030',
  visionTarget: '৳50 Billion',
  values: [
    { title: 'Transparency', description: 'Every investment decision, fund allocation, and project update is shared openly with our investor community. No hidden fees, no surprises.' },
    { title: 'Innovation', description: 'We leverage cutting-edge fintech, blockchain verification, and AI-driven analytics to identify and manage the highest-potential investment opportunities.' },
    { title: 'Security', description: 'Enterprise-grade data encryption, multi-layer admin verification, and strict regulatory compliance protect every transaction and investor account.' },
    { title: 'Growth', description: 'Our diversified portfolio strategy across multiple high-growth sectors ensures consistent, compounding returns for long-term wealth creation.' },
  ],
};

const DEFAULT_FOOTER = {
  description: 'Connecting investors with institutional-grade opportunities across Real Estate, Technology, Agriculture, and Renewable Energy sectors.',
  email: 'support@wooragroup.com',
  phone: '+880 1712-345678',
  address: 'Gulshan 2, Dhaka',
  poweredBy: 'Powered by Woora Tech',
  siteTitle: 'WOORA GROUP - Institutional-Grade Investment Platform',
  metaDescription: 'Access premium, vetted investment opportunities across Real Estate, Agriculture, and Technology. Start with just ৳500 per share.',
};

const SiteSettingsContext = createContext({
  paymentMethods: DEFAULT_PAYMENT_METHODS,
  company: DEFAULT_COMPANY,
  home: DEFAULT_HOME,
  about: DEFAULT_ABOUT,
  footer: DEFAULT_FOOTER,
  loaded: false,
});

export function SiteSettingsProvider({ children }) {
  const [settings, setSettings] = useState({
    paymentMethods: DEFAULT_PAYMENT_METHODS,
    company: DEFAULT_COMPANY,
    home: DEFAULT_HOME,
    about: DEFAULT_ABOUT,
    footer: DEFAULT_FOOTER,
    loaded: false,
  });

  useEffect(() => {
    const load = async () => {
      const [paymentMethods, company, home, about, footer] = await Promise.all([
        fetchSiteSettings('site_payment_methods', DEFAULT_PAYMENT_METHODS),
        fetchSiteSettings('site_company_info', DEFAULT_COMPANY),
        fetchSiteSettings('site_content_home', DEFAULT_HOME),
        fetchSiteSettings('site_content_about', DEFAULT_ABOUT),
        fetchSiteSettings('site_content_footer', DEFAULT_FOOTER),
      ]);
      setSettings({ paymentMethods, company, home, about, footer, loaded: true });
    };
    load();
  }, []);

  return (
    <SiteSettingsContext.Provider value={settings}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export const useSiteSettings = () => useContext(SiteSettingsContext);
