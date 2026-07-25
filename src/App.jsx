import { Routes, Route, Link, NavLink } from 'react-router-dom';
import CatalogPage from './pages/CatalogPage.jsx';
import MineralPage from './pages/MineralPage.jsx';
import ArticlesPage from './pages/ArticlesPage.jsx';
import ArticlePage from './pages/ArticlePage.jsx';
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

export default function App() {
  const { t } = useLang();
  return (
    <div className="app">
      <header className="site-header">
        <Link to="/" className="logo">
          Лито<span>тека</span>
        </Link>
        <nav className="site-nav">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : undefined)}>
            {t('nav_catalog')}
          </NavLink>
          <NavLink to="/articles" className={({ isActive }) => (isActive ? 'active' : undefined)}>
            {t('nav_articles')}
          </NavLink>
        </nav>
        <div className="site-header-right">
          <span className="site-tag">{t('site_tag')}</span>
          <LangSwitcher />
        </div>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<CatalogPage />} />
          <Route path="/minerals/:slug" element={<MineralPage />} />
          <Route path="/articles" element={<ArticlesPage />} />
          <Route path="/articles/:slug" element={<ArticlePage />} />
        </Routes>
      </main>
    </div>
  );
}