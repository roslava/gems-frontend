import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getMineral } from '../api.js';

export default function MineralPage() {
  const { slug } = useParams();
  const [view, setView] = useState('normal');
  const [mineral, setMineral] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getMineral(slug, { view })
      .then((data) => {
        if (!cancelled) setMineral(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug, view]);

  if (loading) {
    return (
      <div className="section">
        <p className="status-text">Загрузка…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="section">
        <p className="status-text status-error">Не удалось загрузить образец: {error}</p>
        <Link className="btn btn-outline" to="/">
          ← К каталогу
        </Link>
      </div>
    );
  }

  if (!mineral) return null;

  const {
    scientific = {},
    i18n = {},
    localities = [],
    gallery = [],
    main_image_url,
    safety_notes,
    related_minerals = [],
  } = mineral;
  const ru = i18n.ru || {};
  const esoteric = ru.esoteric;

  return (
    <div className="section mineral-page">
      <Link className="btn btn-ghost" to="/">
        ← К каталогу
      </Link>

      <div className="mineral-header">
        <div>
          <span className="section-label">{scientific.mineral_group}</span>
          <h1 className="section-title">{ru.name}</h1>
          {ru.synonyms?.length > 0 && (
            <p className="section-desc">Также известен как: {ru.synonyms.join(', ')}</p>
          )}
        </div>
        <label className="view-toggle">
          <input
            type="checkbox"
            checked={view === 'esoteric'}
            onChange={(e) => setView(e.target.checked ? 'esoteric' : 'normal')}
          />
          С эзотерикой
        </label>
      </div>

      {main_image_url && <img className="mineral-hero-image" src={main_image_url} alt={ru.name} />}

      <div className="hero-visual mineral-data-card">
        <div className="data-row" style={{ borderTop: 'none' }}>
          <span>Формула</span>
          <span className="value">{scientific.chemical_formula}</span>
        </div>
        <div className="data-row">
          <span>Группа</span>
          <span className="value">{scientific.mineral_group}</span>
        </div>
        <div className="data-row">
          <span>Кристаллическая система</span>
          <span className="value">{scientific.crystal_system}</span>
        </div>
        <div className="data-row">
          <span>Твёрдость</span>
          <span className="value">
            {scientific.hardness?.min}–{scientific.hardness?.max}
          </span>
        </div>
        <div className="data-row">
          <span>Плотность</span>
          <span className="value">
            {scientific.specific_gravity?.min}–{scientific.specific_gravity?.max} г/см³
          </span>
        </div>
        <div className="data-row">
          <span>Блеск</span>
          <span className="value">{scientific.luster}</span>
        </div>
        <div className="data-row">
          <span>Прозрачность</span>
          <span className="value">{scientific.transparency}</span>
        </div>
        <div className="data-row">
          <span>Цвет черты</span>
          <span className="value">{scientific.streak}</span>
        </div>
        {scientific.rarity && (
          <div className="data-row">
            <span>Редкость</span>
            <span className="value">{scientific.rarity}</span>
          </div>
        )}
      </div>

      {ru.color_description && (
        <div className="mineral-block">
          <h3>Цвет</h3>
          <p>{ru.color_description}</p>
        </div>
      )}

      {ru.lore && (
        <div className="mineral-block">
          <h3>История и культура</h3>
          <p>{ru.lore}</p>
        </div>
      )}

      {esoteric && (
        <div className="mineral-block esoteric-block">
          <h3>Эзотерика</h3>
          {esoteric.metaphysical_properties?.length > 0 && (
            <p>
              <strong>Свойства:</strong> {esoteric.metaphysical_properties.join(', ')}
            </p>
          )}
          {esoteric.chakras?.length > 0 && (
            <p>
              <strong>Чакры:</strong> {esoteric.chakras.join(', ')}
            </p>
          )}
          {esoteric.zodiac?.length > 0 && (
            <p>
              <strong>Знаки зодиака:</strong> {esoteric.zodiac.join(', ')}
            </p>
          )}
          {esoteric.healing_interpretation && <p>{esoteric.healing_interpretation}</p>}
          {esoteric.energy_notes && <p>{esoteric.energy_notes}</p>}
          {esoteric.ritual_uses && <p>{esoteric.ritual_uses}</p>}
        </div>
      )}

      {localities.length > 0 && (
        <div className="mineral-block">
          <h3>Месторождения</h3>
          <ul className="locality-list">
            {localities.map((loc, i) => (
              <li key={i}>
                <strong>
                  {loc.country}
                  {loc.region ? `, ${loc.region}` : ''}
                </strong>
                {loc.locality ? ` — ${loc.locality}` : ''}
                {loc.is_russian && (
                  <span className="chip chip-active" style={{ marginLeft: 8 }}>
                    РФ
                  </span>
                )}
                {loc.description_ru && <p className="locality-desc">{loc.description_ru}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {gallery.length > 0 && (
        <div className="mineral-block">
          <h3>Галерея</h3>
          <div className="gallery-grid">
            {gallery.map((g, i) => (
              <img key={i} src={g.url} alt={g.description_ru || ru.name} />
            ))}
          </div>
        </div>
      )}

      {safety_notes && (
        <div className="mineral-block safety-note">
          <h3>Меры предосторожности</h3>
          <p>{safety_notes}</p>
        </div>
      )}

      {related_minerals.length > 0 && (
        <div className="mineral-block">
          <h3>Похожие минералы</h3>
          <div className="row">
            {related_minerals.map((relSlug) => (
              <Link key={relSlug} to={`/minerals/${relSlug}`} className="chip chip-active">
                {relSlug}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
