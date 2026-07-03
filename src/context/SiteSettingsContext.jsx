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
  heroSubtitle: "Be part of Bangladesh's next big ventures — transparent, healthy, and built to grow. Investment units start at ৳500 only.",
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
  storyHeading: "Building Bangladesh's Most Transparent Company",
  storyParagraphs: [
    "WOORA Group started from a simple frustration. In Bangladesh, if you want to invest in a real business, you usually need big connections, a lot of money, or blind trust in people you'll never meet. We wanted to change that.",
    "We're a multi-venture company — meaning we don't do just one thing. Our first live project is WOORA Healthy Dessert, a hygienic fruit dessert brand serving fresh, additive-free cups on the streets of Dhaka. More ventures are already on the way, across different industries.",
    "But here's what actually makes us different: every Investment Partner sees everything. Daily sales, daily profit, every business update — all shared openly. No hidden numbers, no vague quarterly reports, no \"just trust us.\"",
    'We believe a company should earn its Investment Partners\' trust every day, not only on payout day.',
  ],
  mission: 'To build a group of honest, hygienic, and profitable businesses in Bangladesh — and give ordinary people the chance to become Investment Partners from as little as ৳500 per Investment Unit. We want to prove that transparency, clean products, and shared growth aren\'t optional extras. They are the foundation.',
  vision: "To become Bangladesh's most trusted multi-venture company — where every Investment Partner knows exactly where their money is, how it's performing, and what it's earning, almost in real time. Wherever WOORA expands next — food, tech, or beyond — the promise stays the same: nothing hidden, nothing compromised on quality.",
  visionYear: '2030',
  visionTarget: '৳50 Billion',
  values: [
    { title: 'Transparency', description: 'Every daily sale, every taka of profit, every business decision is shared openly with our Investment Partners. You will never have to guess how your investment is doing. If we know it, you know it.' },
    { title: 'Purity', description: "No adulteration. No shortcuts. If we sell fruit, it's fresh. The day WOORA sells chicken, it'll be healthy, fresh chicken — never anything unsafe or low-grade. What goes on our shelf is what we'd feed our own families." },
    { title: 'Trust', description: "Your Investment Unit is protected by clear agreements, a Reserve Fund for buyback, and a strict lock-in and exit structure. We treat Investment Partner capital the way we'd want ours treated — carefully." },
    { title: 'Growth', description: "We're not building one shop. We're building a group. Every profitable venture funds the next one, and every Investment Partner grows with us as WOORA expands into new categories." },
  ],
};

const DEFAULT_FOOTER = {
  description: 'Connecting investors with institutional-grade opportunities across Real Estate, Technology, Agriculture, and Renewable Energy sectors.',
  email: 'support@wooragroup.com',
  phone: '+880 1712-345678',
  address: 'Gulshan 2, Dhaka',
  poweredBy: 'Powered by Woora Tech',
  siteTitle: 'WOORA GROUP - Institutional-Grade Investment Platform',
  metaDescription: "Be part of Bangladesh's next big ventures — transparent, healthy, and built to grow. Investment units start at ৳500 only.",
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
