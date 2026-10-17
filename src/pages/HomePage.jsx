import { useEffect, useState } from 'react';
import HeroCatalogCount from '../components/HeroCatalogCount.jsx';
import HeroTitle from '../components/HeroTitle.tsx';
import { useLang } from '../i18n/LangContext.jsx';

export default function HomePage() {
  const { t } = useLang();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [secondReady, setSecondReady] = useState(false);
  const [thirdReady, setThirdReady] = useState(false);
  const [fourthReady, setFourthReady] = useState(false);
  const cdnBase = (import.meta.env.VITE_CDN_BASE_URL || '').replace(/\/+$/, '');
  const slides = [
    { src: `${cdnBase}/common_immages/heros/litoteka_hero_001.webp`, alt: t('home_hero_alt') },
    { src: `${cdnBase}/common_immages/heros/litoteka_hero_002.webp`, alt: t('home_tanzania_alt') },
    { src: `${cdnBase}/common_immages/heros/litoteka_hero_003.webp`, alt: t('home_ural_alt') },
    { src: `${cdnBase}/common_immages/heros/litoteka_hero_004.webp`, alt: t('home_sea_alt') },
  ];
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    let timer;
    const update = () => {
      clearInterval(timer);
      if (!paused && secondReady && thirdReady && fourthReady && !media.matches && !document.hidden) {
        timer = setInterval(() => setActive((value) => (value + 1) % 4), 8000);
      }
    };
    update();
    media.addEventListener('change', update);
    document.addEventListener('visibilitychange', update);
    return () => {
      clearInterval(timer);
      media.removeEventListener('change', update);
      document.removeEventListener('visibilitychange', update);
    };
  }, [paused, secondReady, thirdReady, fourthReady]);
  return <div className="home-page">
    <section className="home-hero-carousel" aria-label={t('home_gallery')}>
      {slides.map((slide, index) => <img key={slide.src}
        className={`home-hero-slide${active === index ? ' active' : ''}`}
        src={slide.src} alt={slide.alt} aria-hidden={active !== index}
        fetchpriority={index === 0 ? 'high' : 'low'}
        onLoad={() => { if (index === 1) setSecondReady(true); if (index === 2) setThirdReady(true); if (index === 3) setFourthReady(true); }} />)}
      <HeroTitle paused={paused} />
      <HeroCatalogCount />
      <div className="home-hero-controls">
        {slides.map((_, index) => <button key={index} type="button"
          className={`home-hero-dot${active === index ? ' active' : ''}`}
          aria-label={t('hero_slide', index + 1)} aria-pressed={active === index}
          disabled={(index === 1 && !secondReady) || (index === 2 && !thirdReady) || (index === 3 && !fourthReady)}
          onClick={() => { setActive(index); setPaused(true); }} />)}
        <button type="button" className="home-hero-pause" aria-label={t(paused ? 'hero_play' : 'hero_pause')}
          onClick={() => setPaused((value) => !value)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            {paused ? <path d="m9 5 11 7-11 7V5Z" /> : <><path d="M8 5v14" /><path d="M16 5v14" /></>}
          </svg>
        </button>
      </div>
    </section>
  </div>;
}
