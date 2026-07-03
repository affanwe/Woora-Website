"use client";

import React, { useState, useEffect, useRef } from 'react';

const languages = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'bn', label: 'বাংলা', flag: '🇧🇩' },
  { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
];

export default function LanguageSwitcher() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState('en');
  const [ready, setReady] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (document.getElementById('google-translate-script')) {
      setReady(true);
      return;
    }

    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: 'en',
          includedLanguages: 'en,bn,hi,ar',
          autoDisplay: false,
        },
        'google_translate_element'
      );
      setReady(true);
    };

    const script = document.createElement('script');
    script.id = 'google-translate-script';
    script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    document.body.appendChild(script);

    return () => {};
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const changeLanguage = (langCode) => {
    setCurrent(langCode);
    setOpen(false);

    const select = document.querySelector('.goog-te-combo');
    if (select) {
      select.value = langCode;
      select.dispatchEvent(new Event('change'));
    }
  };

  const currentLang = languages.find(l => l.code === current) || languages[0];

  return (
    <>
      <div id="google_translate_element" style={{ display: 'none', position: 'absolute', visibility: 'hidden' }} />

      <div ref={ref} className="lang-switcher">
        <button
          type="button"
          className="lang-switcher-btn"
          onClick={() => setOpen(!open)}
          aria-label="Change language"
        >
          <span className="lang-flag">{currentLang.flag}</span>
        </button>

        {open && (
          <div className="lang-dropdown">
            {languages.map(lang => (
              <button
                key={lang.code}
                type="button"
                className={`lang-option ${current === lang.code ? 'lang-option--active' : ''}`}
                onClick={() => changeLanguage(lang.code)}
              >
                <span className="lang-flag">{lang.flag}</span>
                <span className="lang-option-label">{lang.label}</span>
                {current === lang.code && (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ marginLeft: 'auto' }}>
                    <path d="M2 7L5.5 10.5L12 3.5" stroke="#00D09C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .lang-switcher {
          position: fixed;
          bottom: 24px;
          left: 24px;
          z-index: 9999;
        }
        .lang-switcher-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          padding: 0;
          background: rgba(15, 15, 30, 0.85);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 50%;
          color: #fff;
          cursor: pointer;
          transition: all 0.25s ease;
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        }
        .lang-switcher-btn:hover {
          border-color: rgba(0,208,156,0.4);
          box-shadow: 0 4px 24px rgba(0,208,156,0.2);
          transform: scale(1.08);
        }
        .lang-switcher-btn .lang-flag {
          font-size: 24px;
          line-height: 1;
        }
        .lang-dropdown {
          position: absolute;
          bottom: calc(100% + 10px);
          left: 0;
          min-width: 170px;
          background: rgba(15, 15, 30, 0.96);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 14px;
          padding: 6px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.4);
          animation: langDropIn 0.2s ease;
        }
        @keyframes langDropIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .lang-option {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 10px 12px;
          background: none;
          border: none;
          border-radius: 10px;
          color: rgba(255,255,255,0.8);
          font-size: 14px;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .lang-option .lang-flag {
          font-size: 20px;
          line-height: 1;
        }
        .lang-option:hover {
          background: rgba(255,255,255,0.06);
          color: #fff;
        }
        .lang-option--active {
          background: rgba(0,208,156,0.1);
          color: #00D09C;
        }
        .lang-option-label { flex: 1; text-align: left; }

        .goog-te-banner-frame, .skiptranslate, #goog-gt-tt, .goog-te-balloon-frame {
          display: none !important;
        }
        body { top: 0 !important; }
        .goog-text-highlight { background: none !important; box-shadow: none !important; }

        @media (max-width: 768px) {
          .lang-switcher {
            bottom: 16px;
            left: 16px;
          }
          .lang-switcher-btn {
            width: 44px;
            height: 44px;
          }
          .lang-switcher-btn .lang-flag {
            font-size: 22px;
          }
        }
      `}</style>
    </>
  );
}
