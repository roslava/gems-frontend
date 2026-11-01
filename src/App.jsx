import { useEffect, useRef, useState } from 'react';
import { Routes, Route, Link, NavLink, useMatch } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import CatalogPage from './pages/CatalogPage.jsx';
import MineralPage from './pages/MineralPage.jsx';
import ArticlesPage from './pages/ArticlesPage.jsx';
import ArticlePage from './pages/ArticlePage.jsx';
import ThemeSwitcher from './components/ThemeSwitcher.jsx';
import Footer from './components/Footer.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import { useLang } from './i18n/LangContext.jsx';

function LangSwitcher() {
  const { lang, setLang } = useLang();
  return (
    <div className="lang-switch" role="group" aria-label="Language">
      <button
        type="button"
        className={lang === 'ru' ? 'active' : undefined}
        onClick={() => setLang('ru')}
        disabled={lang === 'ru'}
      >
        RU
      </button>
      <button
        type="button"
        className={lang === 'en' ? 'active' : undefined}
        onClick={() => setLang('en')}
        disabled={lang === 'en'}
      >
        EN
      </button>
    </div>
  );
}

function HeaderSettings() {
  const { lang } = useLang();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  useEffect(() => {
    if (!open) return;
    const outside = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const escape = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    const resize = () => { if (window.innerWidth > 720) setOpen(false); };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    window.addEventListener('resize', resize);
    return () => {
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('keydown', escape);
      window.removeEventListener('resize', resize);
    };
  }, [open]);
  return <div className="header-settings" ref={rootRef} onBlur={(event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
  }}>
    <button ref={triggerRef} type="button" className="header-settings-trigger" aria-label={lang === 'ru' ? 'Настройки' : 'Settings'} aria-expanded={open} aria-controls="header-settings-panel" onClick={() => setOpen((value) => !value)}>
      <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><g fill="none" stroke="currentColor" strokeWidth="2"><path d="M16.308 4.384c-.59 0-.886 0-1.155-.1l-.111-.046c-.261-.12-.47-.328-.888-.746c-.962-.962-1.443-1.443-2.034-1.488a2 2 0 0 0-.24 0c-.591.045-1.072.526-2.034 1.488c-.418.418-.627.627-.888.746l-.11.046c-.27.1-.565.1-1.156.1h-.11c-1.507 0-2.261 0-2.73.468s-.468 1.223-.468 2.73v.11c0 .59 0 .886-.1 1.155q-.022.057-.046.111c-.12.261-.328.47-.746.888c-.962.962-1.443 1.443-1.488 2.034a2 2 0 0 0 0 .24c.045.591.526 1.072 1.488 2.034c.418.418.627.627.746.888q.025.054.046.11c.1.27.1.565.1 1.156v.11c0 1.507 0 2.261.468 2.73s1.223.468 2.73.468h.11c.59 0 .886 0 1.155.1q.057.021.111.046c.261.12.47.328.888.746c.962.962 1.443 1.443 2.034 1.488q.12.009.24 0c.591-.045 1.072-.526 2.034-1.488c.418-.418.627-.626.888-.746q.054-.025.11-.046c.27-.1.565-.1 1.156-.1h.11c1.507 0 2.261 0 2.73-.468s.468-1.223.468-2.73v-.11c0-.59 0-.886.1-1.155q.021-.057.046-.111c.12-.261.328-.47.746-.888c.962-.962 1.443-1.443 1.488-2.034q.009-.12 0-.24c-.045-.591-.526-1.072-1.488-2.034c-.418-.418-.626-.627-.746-.888l-.046-.11c-.1-.27-.1-.565-.1-1.156v-.11c0-1.507 0-2.261-.468-2.73s-1.223-.468-2.73-.468z"/><path d="M15.5 12a3.5 3.5 0 1 1-7 0a3.5 3.5 0 0 1 7 0Z"/></g></svg>
    </button>
    <div id="header-settings-panel" className="header-settings-panel" data-open={open || undefined}>
      <div className="header-settings-row"><span className="header-settings-label">{lang === 'ru' ? 'Тема' : 'Theme'}</span><ThemeSwitcher /></div>
      <div className="header-settings-row"><span className="header-settings-label">{lang === 'ru' ? 'Язык' : 'Language'}</span><LangSwitcher /></div>
    </div>
  </div>;
}

export default function App() {
  const { t } = useLang();
  const entityRoute = useMatch('/minerals/:slug/:section?');
  const [entityHeaderTarget, setEntityHeaderTarget] = useState(null);
  const [entityMenuTarget, setEntityMenuTarget] = useState(null);
  return (
    <div className="app">
      <header className="site-header">
        <div className="site-brand">
        {entityRoute && <Link to="/catalog" className="mobile-catalog-back" aria-label={t('back_to_catalog').replace(/^←\s*/, '')}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 12H4m6-6-6 6 6 6" /></svg></Link>}
        <Link to="/" className="logo">
          Лито<span>тека</span>
        </Link>
        </div>
        {entityRoute ? <div className="site-entity-heading" ref={setEntityHeaderTarget} /> : <nav className="site-nav">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : undefined)}>
            {t('nav_home')}
          </NavLink>
          <NavLink to="/catalog" className={({ isActive }) => (isActive ? 'active' : undefined)}>
            {t('nav_catalog')}
          </NavLink>
          <NavLink to="/articles" className={({ isActive }) => (isActive ? 'active' : undefined)}>
            {t('nav_articles')}
          </NavLink>
        </nav>}
        <div className="site-header-right header-tools"><div className="entity-mobile-menu-host" ref={setEntityMenuTarget} /><HeaderSettings /></div>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/minerals/:slug/:section?" element={<MineralPage headerTarget={entityHeaderTarget} menuTarget={entityMenuTarget} />} />
          <Route path="/articles" element={<ArticlesPage />} />
          <Route path="/articles/:slug" element={<ArticlePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}