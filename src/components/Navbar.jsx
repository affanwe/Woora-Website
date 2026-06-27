"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import SplitHoverText from './SplitHoverText';
import { Menu, X, LogOut, Database } from 'lucide-react';

export default function Navbar() {
  const { currentUser, userData, logout, isDemoMode } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const isActive = (path) => pathname === path;

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/projects', label: 'Projects' },
    { path: '/about', label: 'About' },
  ];

  const portalLinks = currentUser ? [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/buy-shares', label: 'Invest' },
  ] : [];

  const allLinks = [...navLinks, ...portalLinks];

  return (
    <>
      <nav className={`navbar ${scrolled ? 'is-scrolled' : ''} ${isOpen ? 'is-open' : ''}`}>
        <div className="navbar-inner container">
          <Link href="/" className="navbar-logo">
            <span className="logo-mark">W</span>
            <SplitHoverText className="logo-text">WOORA</SplitHoverText>
          </Link>

          {/* Desktop Nav */}
          <div className="navbar-center">
            {allLinks.map(link => (
              <Link
                key={link.path}
                href={link.path}
                className={`nav-link ${isActive(link.path) ? 'is-active' : ''}`}
              >
                <SplitHoverText>{link.label}</SplitHoverText>
              </Link>
            ))}
          </div>

          <div className="navbar-right">
            {currentUser ? (
              <button className="nav-link nav-logout" onClick={handleLogout}>
                <SplitHoverText>Logout</SplitHoverText>
              </button>
            ) : (
              <Link href="/login" className="btn btn-primary nav-cta">
                <SplitHoverText>Invest Now</SplitHoverText>
              </Link>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            className="nav-toggle"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Fullscreen Mobile Menu Overlay */}
      <div className={`mobile-menu-overlay ${isOpen ? 'is-active' : ''}`}>
        <div className="mobile-menu-content">
          <nav className="mobile-nav">
            {allLinks.map((link, i) => (
              <Link
                key={link.path}
                href={link.path}
                className={`mobile-nav-link ${isActive(link.path) ? 'is-active' : ''}`}
                style={{ transitionDelay: isOpen ? `${i * 0.06}s` : '0s' }}
                onClick={() => setIsOpen(false)}
              >
                <span className="mobile-nav-index">0{i + 1}</span>
                <span className="mobile-nav-label">{link.label}</span>
              </Link>
            ))}
          </nav>

          <div className="mobile-menu-footer">
            {currentUser ? (
              <div className="mobile-user-section">
                <div className="mobile-user-info">
                  <span className="mobile-user-name">{userData?.name || 'Investor'}</span>
                  <span className="mobile-user-id">ID: {userData?.id || '—'}</span>
                </div>
                <button className="btn btn-secondary" onClick={handleLogout}>
                  <LogOut size={16} /> Logout
                </button>
              </div>
            ) : (
              <div className="mobile-auth-buttons">
                <Link href="/login" className="btn btn-primary btn-block" onClick={() => setIsOpen(false)}>
                  Login
                </Link>
                <Link href="/register" className="btn btn-secondary btn-block" onClick={() => setIsOpen(false)}>
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
