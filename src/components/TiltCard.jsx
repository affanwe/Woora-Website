"use client";

import { useRef, useState, useCallback, useEffect } from 'react';

const MAX_TILT = 8; // degrees

export default function TiltCard({ children, className = '', ...rest }) {
  const cardRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [style, setStyle] = useState({});
  const [glowPos, setGlowPos] = useState({ x: 50, y: 50 });

  /* Detect mobile */
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const handleMouseMove = useCallback(
    (e) => {
      if (isMobile || !cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();

      // Normalised 0→1
      const nx = (e.clientX - rect.left) / rect.width;
      const ny = (e.clientY - rect.top) / rect.height;

      // Map to tilt angles (centered at 0)
      const rotateX = (0.5 - ny) * MAX_TILT * 2; // top = positive
      const rotateY = (nx - 0.5) * MAX_TILT * 2; // right = positive

      setStyle({
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`,
        transition: 'transform 0.1s ease-out',
      });

      // Glow position in percentage
      setGlowPos({ x: nx * 100, y: ny * 100 });
    },
    [isMobile],
  );

  const handleMouseLeave = useCallback(() => {
    setStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      transition: 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    });
    setGlowPos({ x: 50, y: 50 });
  }, []);

  const glowStyle = isMobile
    ? {}
    : {
        background: `radial-gradient(
          600px circle at ${glowPos.x}% ${glowPos.y}%,
          rgba(0, 208, 156, 0.12),
          transparent 40%
        )`,
      };

  return (
    <div
      ref={cardRef}
      className={`tilt-card ${className}`}
      style={style}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...rest}
    >
      {/* Glow overlay */}
      <div className="tilt-card__glow" style={glowStyle} />
      <div className="tilt-card__content">
        {children}
      </div>
    </div>
  );
}
