"use client";

import React from 'react';

export default function SplitHoverText({ children, as: Tag = 'span', className = '', ...rest }) {
  const text = typeof children === 'string' ? children : '';
  if (!text) return <Tag className={className} {...rest}>{children}</Tag>;

  return (
    <Tag className={`split-hover ${className}`} {...rest}>
      {text.split('').map((char, i) => {
        if (char === ' ') {
          return <span key={i} className="split-hover-space">&nbsp;</span>;
        }
        return (
          <span key={i} className="split-hover-char" style={{ '--i': i }}>
            <span className="split-hover-primary">{char}</span>
            <span className="split-hover-secondary">{char}</span>
          </span>
        );
      })}
    </Tag>
  );
}
