"use client";

import { useRef, useCallback } from 'react';

const DURATION = 300; // total scramble duration in ms
const FRAME_INTERVAL = 30; // ms between visual updates

function randomChar(char) {
  if (!char) return '';
  if (char === ' ') return ' ';
  if (/[A-Z]/.test(char)) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return chars[Math.floor(Math.random() * chars.length)];
  }
  if (/[a-z]/.test(char)) {
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    return chars[Math.floor(Math.random() * chars.length)];
  }
  if (/[0-9]/.test(char)) {
    const chars = '0123456789';
    return chars[Math.floor(Math.random() * chars.length)];
  }
  return char;
}

export default function TextShuffle({
  children,
  as: Tag = 'span',
  className = '',
  ...rest
}) {
  const elRef = useRef(null);
  const isAnimating = useRef(false);
  const originalText = typeof children === 'string' ? children : '';

  const scramble = useCallback(() => {
    if (isAnimating.current || !elRef.current) return;
    isAnimating.current = true;

    const text = originalText;
    const length = text.length;
    const startTime = performance.now();

    let lastFrame = 0;

    function tick(now) {
      const elapsed = now - startTime;

      if (elapsed >= DURATION) {
        elRef.current.textContent = text;
        isAnimating.current = false;
        return;
      }

      // Throttle DOM writes
      if (now - lastFrame < FRAME_INTERVAL) {
        requestAnimationFrame(tick);
        return;
      }
      lastFrame = now;

      const progress = elapsed / DURATION;

      // Number of characters that have "settled" (left to right reveal)
      const settled = Math.floor(progress * length);

      let result = '';
      for (let i = 0; i < length; i++) {
        if (i < settled) {
          result += text[i];
        } else {
          result += randomChar(text[i]);
        }
      }

      elRef.current.textContent = result;
      requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }, [originalText]);

  return (
    <Tag
      ref={elRef}
      className={`text-shuffle ${className}`}
      onMouseEnter={scramble}
      onTouchStart={scramble}
      {...rest}
    >
      {originalText}
    </Tag>
  );
}
