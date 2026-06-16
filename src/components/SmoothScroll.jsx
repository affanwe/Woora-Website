"use client";

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import Lenis from '@studio-freight/lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/* ─── Context to share the Lenis instance ─── */
const LenisContext = createContext(null);

export function useLenis() {
  return useContext(LenisContext);
}

/* ─── SmoothScroll wrapper ─── */
export default function SmoothScroll({ children }) {
  const [lenis, setLenis] = useState(null);
  const reqRef = useRef(null);

  useEffect(() => {
    const instance = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.5,
    });

    // Sync Lenis scroll with GSAP ScrollTrigger
    instance.on('scroll', ScrollTrigger.update);

    // Tie GSAP ticker to Lenis
    gsap.ticker.add((time) => {
      instance.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    setLenis(instance);

    return () => {
      // Remove GSAP ticker callback (gsap.ticker.add returns the callback)
      gsap.ticker.remove(instance.raf);
      instance.destroy();
      setLenis(null);
    };
  }, []);

  return (
    <LenisContext.Provider value={lenis}>
      <div id="smooth-scroll-wrapper">
        {children}
      </div>
    </LenisContext.Provider>
  );
}
