import { Link } from 'react-router-dom';
import { useLang } from '../i18n/LangContext.jsx';

// Add public pages here as they become available.
const SITE_LINKS = [
  { path: '/', label: 'nav_home' },
  { path: '/catalog', label: 'nav_catalog' },
  { path: '/articles', label: 'nav_articles' },
];

export default function Footer() {
  const { t } = useLang();
  return <footer className="site-footer">
    <div className="footer-content">
      <div className="footer-brand">
        <Link to="/" className="footer-logo">Литотека</Link>
        <p>{t('footer_description')}</p>
      </div>
      <nav className="footer-navigation" aria-label={t('sitemap_title')}>
        <h2>{t('sitemap_title')}</h2>
        <ul>{SITE_LINKS.map(({ path, label }) => <li key={path}><Link to={path}>{t(label)}</Link></li>)}</ul>
      </nav>
      <div className="footer-credits">
        <h2>{t('credits_title')}</h2>
        <p>© {new Date().getFullYear()} Литотека</p>
      </div>
    </div>
  </footer>;
}
