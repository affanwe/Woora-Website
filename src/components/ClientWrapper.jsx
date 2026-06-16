"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import { AuthProvider } from '../context/AuthContext';
import Navbar from './Navbar';
import Footer from './Footer';

// Dynamic imports with SSR disabled for browser-dependent components
const SmoothScroll = dynamic(() => import('./SmoothScroll'), { ssr: false });
const GlobalBackground = dynamic(() => import('./3d/GlobalBackground'), { ssr: false });

export default function ClientWrapper({ children }) {
  return (
    <AuthProvider>
      <SmoothScroll>
        <div className="app-wrapper">
          <GlobalBackground />
          <Navbar />
          <main className="main-content">
            {children}
          </main>
          <Footer />
        </div>
      </SmoothScroll>
    </AuthProvider>
  );
}
