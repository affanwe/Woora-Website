import React from 'react';
import { Link } from 'react-router-dom';
import TextShuffle from './TextShuffle';
import { Mail, Phone, MapPin } from 'lucide-react';
import './Footer.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container footer-top">
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
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
            <li><Link to="/"><TextShuffle>Home</TextShuffle></Link></li>
            <li><Link to="/projects"><TextShuffle>Projects</TextShuffle></Link></li>
            <li><Link to="/about"><TextShuffle>About</TextShuffle></Link></li>
            <li><Link to="/login"><TextShuffle>Investor Login</TextShuffle></Link></li>
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
          <a href="#privacy"><TextShuffle>Privacy</TextShuffle></a>
          <a href="#terms"><TextShuffle>Terms</TextShuffle></a>
        </div>
      </div>
    </footer>
  );
}
