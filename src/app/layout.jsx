import React from 'react';
import ClientWrapper from '../components/ClientWrapper';
import { siteConfig } from '../lib/seo/config';
import { GoogleAnalytics } from '../components/analytics/GoogleAnalytics';
import { MicrosoftClarity } from '../components/analytics/MicrosoftClarity';
import { WebVitals } from '../components/analytics/WebVitals';
import { OrganizationJsonLd, WebsiteJsonLd } from '../components/seo/JsonLd';

// Import all styles globally in the root layout to avoid modifying all file classNames
import '../index.css';
import '../App.css';
import '../components/Navbar.css';
import '../components/Footer.css';
import '../components/ScrollReveal.css';
import '../components/TextShuffle.css';
import '../components/SplitHoverText.css';
import '../components/TiltCard.css';
import '../components/3d/GlobalBackground.css';
import '../pages/About.css';
import '../pages/Auth.css';
import '../pages/BuyShares.css';
import '../pages/Dashboard.css';
import '../pages/Home.css';
import '../pages/Projects.css';

export const metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — Institutional-Grade Investment Platform`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [{ name: siteConfig.name, url: siteConfig.url }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  applicationName: siteConfig.name,
  referrer: 'origin-when-cross-origin',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: siteConfig.locale,
    url: siteConfig.url,
    title: `${siteConfig.name} — Institutional-Grade Investment Platform`,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteConfig.name} — Institutional-Grade Investment Platform`,
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    ...(process.env.GOOGLE_SITE_VERIFICATION && {
      google: process.env.GOOGLE_SITE_VERIFICATION,
    }),
    ...(process.env.BING_SITE_VERIFICATION && {
      other: { 'msvalidate.01': process.env.BING_SITE_VERIFICATION },
    }),
  },
  alternates: {
    canonical: '/',
  },
  category: 'finance',
};

export const viewport = {
  themeColor: '#06090F',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <OrganizationJsonLd />
        <WebsiteJsonLd />
        <ClientWrapper>
          {children}
        </ClientWrapper>
        <GoogleAnalytics />
        <MicrosoftClarity />
        <WebVitals />
      </body>
    </html>
  );
}
