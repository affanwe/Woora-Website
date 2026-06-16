"use client";

import { useRef, useCallback } from 'react';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*';
const DURATION = 300; // total scramble duration in ms
const FRAME_INTERVAL = 30; // ms between visual updates

function randomChar() {
  return CHARS[Math.floor(Math.random() * CHARS.length)];
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

      // Throttle DOM writes
      if (now - lastFrame < FRAME_INTERVAL) {
        if (elapsed < DURATION) {
          requestAnimationFrame(tick);
        }
        return;
      }
      lastFrame = now;

      const progress = Math.min(elapsed / DURATION, 1);

      // Number of characters that have "settled" (left to right reveal)
      const settled = Math.floor(progress * length);

      let result = '';
      for (let i = 0; i < length; i++) {
        if (text[i] === ' ') {
          result += ' ';
        } else if (i < settled) {
          result += text[i];
        } else {
          result += randomChar();
        }
      }

      elRef.current.textContent = result;

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        // Ensure final state is exact
        elRef.current.textContent = text;
        isAnimating.current = false;
      }
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
