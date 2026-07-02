import { Link } from 'react-router-dom';

const RARITY_LABELS = {
  common: 'Обычный',
  uncommon: 'Нечастый',
  rare: 'Редкий',
  very_rare: 'Очень редкий',
};

export default function SpecimenCard({ mineral }) {
  const { slug, scientific = {}, i18n = {}, thumbnail_url, main_image_url } = mineral;
  const ru = i18n.ru || {};
  const hardness = scientific.hardness || {};
  const image = thumbnail_url || main_image_url;

  return (
    <Link to={`/minerals/${slug}`} className="specimen-card facet-card">
      <div
        className="specimen-photo"
        style={image ? { backgroundImage: `url(${image})` } : undefined}
      >
        {!image && 'нет фото'}
      </div>
      <div className="specimen-body">
        <div className="specimen-name-row">
          <div className="specimen-name">{ru.name || slug}</div>
          {scientific.rarity && (
            <span className="stock-badge">
              {RARITY_LABELS[scientific.rarity] || scientific.rarity}
            </span>
          )}
        </div>
        <div className="specimen-latin">{scientific.mineral_group || '—'}</div>
        <div className="data-row">
          <span>Твёрдость</span>
          <span className="value">
            {hardness.min ?? '?'}–{hardness.max ?? '?'}
          </span>
        </div>
        <div className="data-row">
          <span>Формула</span>
          <span className="value">{scientific.chemical_formula || '—'}</span>
        </div>
      </div>
    </Link>
  );
}
