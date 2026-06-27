"use client";

import React from 'react';
import Link from 'next/link';
import SplitHoverText from './SplitHoverText';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container footer-top">
        <div className="footer-brand">
          <Link href="/" className="footer-logo">
            <span className="logo-mark">W</span>
            <span className="logo-text">WOORA GROUP</span>
          </Link>
          <p className="footer-desc">
            Connecting investors with institutional-grade opportunities across Real Estate, Technology, Agriculture, and Renewable Energy sectors.
          </p>
        </div>

        <div className="footer-links-col">
          <h4 className="footer-heading">Navigation</h4>
          <ul className="footer-link-list">
            <li><Link href="/"><SplitHoverText>Home</SplitHoverText></Link></li>
            <li><Link href="/projects"><SplitHoverText>Projects</SplitHoverText></Link></li>
            <li><Link href="/about"><SplitHoverText>About</SplitHoverText></Link></li>
            <li><Link href="/login"><SplitHoverText>Investor Login</SplitHoverText></Link></li>
          </ul>
        </div>

        <div className="footer-links-col">
          <h4 className="footer-heading">Contact</h4>
          <ul className="footer-contact-list">
            <li><Mail size={14} /> support@wooragroup.com</li>
            <li><Phone size={14} /> +880 1712-345678</li>
            <li><MapPin size={14} /> Gulshan 2, Dhaka</li>
          </ul>
        </div>
      </div>

      <div className="container footer-bottom">
        <p>&copy; {currentYear} WOORA Group. All Rights Reserved.</p>
        <div className="footer-legal-links">
          <a href="#privacy"><SplitHoverText>Privacy</SplitHoverText></a>
          <a href="#terms"><SplitHoverText>Terms</SplitHoverText></a>
          <span style={{ opacity: 0.5, fontSize: '0.75rem' }}>Powered by Woora Tech</span>
        </div>
      </div>
    </footer>
  );
}
