"use client";

import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function ScrollReveal({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.8,
  stagger = 0.1,
  once = true,
  className = '',
  as: Tag = 'div',
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // If the container has multiple direct children we animate each;
    // otherwise animate the container itself.
    const targets =
      el.children.length > 1 ? Array.from(el.children) : el;

    const fromVars = {
      opacity: 0,
      ...(direction === 'up' && { y: 60 }),
      ...(direction === 'left' && { x: -60 }),
      ...(direction === 'right' && { x: 60 }),
    };

    const ctx = gsap.context(() => {
      gsap.from(targets, {
        ...fromVars,
        duration,
        delay,
        stagger: Array.isArray(targets) ? stagger : 0,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: once
            ? 'play none none none'
            : 'play none none reverse',
        },
      });
    }, el);

    return () => ctx.revert(); // cleans up all GSAP/ScrollTrigger instances
  }, [direction, delay, duration, stagger, once]);

  return (
    <Tag ref={containerRef} className={`scroll-reveal ${className}`}>
      {children}
    </Tag>
  );
}
