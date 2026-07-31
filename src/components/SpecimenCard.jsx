import { Link } from 'react-router-dom';
import { useLang, pickI18n } from '../i18n/LangContext.jsx';

function truncate(str, max = 60) {
  if (!str) return str;
  return str.length > max ? `${str.slice(0, max - 1)}…` : str;
}

export default function SpecimenCard({ mineral }) {
  const { lang, t } = useLang();
  const { slug, scientific = {}, i18n = {}, thumbnail_url, main_image_url } = mineral;
  const data = pickI18n(i18n, lang);
  const hardness = scientific.hardness || {};
  const image = thumbnail_url || main_image_url;

  return (
    <Link to={`/minerals/${slug}`} className="specimen-card facet-card">
<div className="specimen-photo">
  {image ? (
    <div className="specimen-photo-img" style={{ backgroundImage: `url(${image})` }} />
  ) : (
    t('no_photo')
  )}
</div>
      <div className="specimen-body">
        <div className="specimen-name-row">
          <div className="specimen-name">{data?.name || slug}</div>
        </div>
        <div className="specimen-latin">{data?.mineral_group || (!data ? t('not_translated') : '—')}</div>
        <div className="data-row">
          <span>{t('hardness')}</span>
          <span className="value">
            {hardness.min ?? '?'}–{hardness.max ?? '?'}
          </span>
        </div>
        <div className="data-row">
          <span>{t('formula')}</span>
          <span className="value" title={scientific.chemical_formula || ''}>
            {truncate(scientific.chemical_formula) || '—'}
          </span>
        </div>
        {scientific.rarity && (
          <div className="rarity-row">
            <span
              className="rarity-dot"
              style={{
                background:
                  scientific.rarity === 'rare' || scientific.rarity === 'very_rare'
                    ? 'var(--accent)'
                    : 'var(--text-muted-light)',
              }}
            />
            <span className="rarity-label">
              {t('rarity_label_prefix')} {t(`rarity_${scientific.rarity}`)}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
