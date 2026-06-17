"use client";

import { useRef, useCallback } from 'react';

const DURATION = 300; // total scramble duration in ms
const FRAME_INTERVAL = 30; // ms between visual updates

function randomChar(char, originalText) {
  if (!char) return '';
  if (char === ' ') return ' ';
  
  const isUpper = /[A-Z]/.test(char);
  const isLower = /[a-z]/.test(char);
  const isDigit = /[0-9]/.test(char);
  
  let candidates = '';
  if (originalText) {
    for (let i = 0; i < originalText.length; i++) {
      const c = originalText[i];
      if (isUpper && /[A-Z]/.test(c)) candidates += c;
      else if (isLower && /[a-z]/.test(c)) candidates += c;
      else if (isDigit && /[0-9]/.test(c)) candidates += c;
    }
  }
  
  if (candidates.length > 0) {
    return candidates[Math.floor(Math.random() * candidates.length)];
  }
  
  if (isUpper) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return chars[Math.floor(Math.random() * chars.length)];
  }
  if (isLower) {
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    return chars[Math.floor(Math.random() * chars.length)];
  }
  if (isDigit) {
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
          result += randomChar(text[i], text);
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
