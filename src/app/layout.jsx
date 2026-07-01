import React from 'react';
import ClientWrapper from '../components/ClientWrapper';

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
  title: 'WOORA GROUP - Institutional-Grade Investment Platform',
  description: "Be part of Bangladesh's next big ventures — transparent, healthy, and built to grow. Investment units start at ৳500 only.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ClientWrapper>
          {children}
        </ClientWrapper>
      </body>
    </html>
  );
}
