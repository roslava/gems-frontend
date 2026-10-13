import { Link } from 'react-router-dom';
import { useLang } from '../i18n/LangContext.jsx';

export default function NotFoundPage() {
  const { t } = useLang();
  return <div className="section">
    <span className="section-label">404</span>
    <h1 className="section-title">{t('page_not_found')}</h1>
    <p className="section-desc">{t('page_not_found_desc')}</p>
    <Link className="btn btn-outline" to="/catalog">{t('back_to_catalog')}</Link>
  </div>;
}
