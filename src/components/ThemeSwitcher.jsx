import { useEffect, useState } from 'react';
import { useLang } from '../i18n/LangContext.jsx';

export default function ThemeSwitcher() {
  const { lang } = useLang();
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || 'light');
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = (next) => {
      document.documentElement.dataset.theme = next;
      setTheme(next);
    };
    const stored = () => {
      try { return localStorage.getItem('litoteka-theme'); } catch { return null; }
    };
    const followSystem = () => {
      if (!['light', 'dark'].includes(stored())) apply(media.matches ? 'dark' : 'light');
    };
    const sync = (event) => {
      if (event.key === 'litoteka-theme' || event.key === null) {
        const saved = stored();
        apply(['light', 'dark'].includes(saved) ? saved : media.matches ? 'dark' : 'light');
      }
    };
    media.addEventListener('change', followSystem);
    window.addEventListener('storage', sync);
    return () => {
      media.removeEventListener('change', followSystem);
      window.removeEventListener('storage', sync);
    };
  }, []);
  const dark = theme === 'dark';
  const label = lang === 'en'
    ? (dark ? 'Switch to light theme' : 'Switch to dark theme')
    : (dark ? 'Включить светлую тему' : 'Включить тёмную тему');
  return <button type="button" className="theme-toggle" aria-label={label} title={label} onClick={() => {
    const next = dark ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    setTheme(next);
    try { localStorage.setItem('litoteka-theme', next); } catch { /* Theme works without storage. */ }
  }}>
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {dark ? <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" /></>
        : <path d="M20.5 14A8.5 8.5 0 0 1 10 3.5 8.5 8.5 0 1 0 20.5 14Z" />}
    </svg>
  </button>;
}
