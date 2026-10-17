import { useEffect, useState } from 'react';
import { CornerFrame } from './ui/corner-frame';
import { getGemPage } from '../api.js';
import { useLang } from '../i18n/LangContext.jsx';

export default function HeroCatalogCount() {
  const { lang } = useLang();
  const [total, setTotal] = useState(null);
  const [value, setValue] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    getGemPage({ page: 1, limit: 1, signal: controller.signal })
      .then(result => { if (!controller.signal.aborted) setTotal(result.total); })
      .catch(() => { /* Keep the hero clean when the API is unavailable. */ });
    return () => controller.abort();
  }, []);
  useEffect(() => {
    if (total === null) return;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame;
    const start = performance.now();
    const update = now => {
      const progress = Math.min(1, (now - start) / 1400);
      setValue(Math.round(total * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) frame = requestAnimationFrame(update);
    };
    const stop = () => {
      if (media.matches) { cancelAnimationFrame(frame); setValue(total); }
    };
    if (media.matches) setValue(total);
    else frame = requestAnimationFrame(update);
    media.addEventListener('change', stop);
    return () => {
      cancelAnimationFrame(frame);
      media.removeEventListener('change', stop);
    };
  }, [total]);
  if (total === null) return null;
  const label = lang === 'en' ? 'names in the catalog' : 'наименований в каталоге';
  return <div className="hero-catalog-count"><CornerFrame className="hero-catalog-count-frame" size="14px" thickness="1px" color="rgba(244, 238, 226, .8)">
    <span className="visually-hidden">{total.toLocaleString(lang)} {label}</span>
    <span className="hero-catalog-count-number" aria-hidden="true">{value.toLocaleString(lang)}</span>
    <span className="hero-catalog-count-label" aria-hidden="true">{lang === 'en' ? <>names<br />in the catalog</> : <>наименований<br />в каталоге</>}</span>
  </CornerFrame></div>;
}
