import { Link } from 'react-router-dom';
import { useLang } from '../i18n/LangContext.jsx';
import { TextScanner } from './ui/animated-text-10';

export default function HeroTitle({ paused = false }: { paused?: boolean }) {
  const { t } = useLang();
  return <div className="hero-title-overlay">
    <div className="hero-introduction">
    <h1 className="hero-title">
      {paused
        ? <span className="hero-title-static">Lithoteka</span>
        : <TextScanner text="Lithoteka" className="hero-title-scanner" inkColor="#f4eee2" accentColor="#ef946e" duration={3.6} />}
    </h1>
    <p className="hero-description">{t('footer_description')}</p>
    <Link className="hero-catalog-link" to="/catalog">{t('open_catalog')} <span aria-hidden="true">→</span></Link>
    </div>
  </div>;
}
