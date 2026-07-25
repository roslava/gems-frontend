import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getMineral } from '../api.js';
import Lightbox from '../components/Lightbox.jsx';
import { useLang, pickI18n, pickField } from '../i18n/LangContext.jsx';

export default function MineralPage() {
  const { slug } = useParams();
  const { lang, t } = useLang();
  const [view, setView] = useState('normal');
  const [mineral, setMineral] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getMineral(slug, { view, lang })
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
  }, [slug, view, lang]);

  if (loading) {
    return (
      <div className="section">
        <p className="status-text">{t('loading')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="section">
        <p className="status-text status-error">
          {t('mineral_load_error')} {error}
        </p>
        <Link className="btn btn-outline" to="/">
          {t('back_to_catalog')}
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
  const data = pickI18n(i18n, lang);
  const esoteric = data.esoteric;

  return (
    <div className="section mineral-page">
      <Link className="btn btn-ghost" to="/">
        {t('back_to_catalog')}
      </Link>

      <div className="mineral-header">
        <div>
          <span className="section-label">{scientific.mineral_group}</span>
          <h1 className="section-title">{data.name}</h1>
          {data.synonyms?.length > 0 && (
            <p className="section-desc">
              {t('synonyms_prefix')} {data.synonyms.join(', ')}
            </p>
          )}
        </div>
        <label className="view-toggle">
          <input
            type="checkbox"
            checked={view === 'esoteric'}
            onChange={(e) => setView(e.target.checked ? 'esoteric' : 'normal')}
          />
          {t('esoteric_toggle')}
        </label>
      </div>

      {main_image_url && <img className="mineral-hero-image" src={main_image_url} alt={data.name} />}

      <div className="hero-visual mineral-data-card">
        <div className="data-row" style={{ borderTop: 'none' }}>
          <span>{t('formula')}</span>
          <span className="value">{scientific.chemical_formula}</span>
        </div>
        <div className="data-row">
          <span>{t('group')}</span>
          <span className="value">{scientific.mineral_group}</span>
        </div>
        <div className="data-row">
          <span>{t('crystal_system')}</span>
          <span className="value">{scientific.crystal_system}</span>
        </div>
        <div className="data-row">
          <span>{t('hardness')}</span>
          <span className="value">
            {scientific.hardness?.min}–{scientific.hardness?.max}
          </span>
        </div>
        <div className="data-row">
          <span>{t('density')}</span>
          <span className="value">
            {scientific.specific_gravity?.min}–{scientific.specific_gravity?.max} г/см³
          </span>
        </div>
        <div className="data-row">
          <span>{t('luster')}</span>
          <span className="value">{scientific.luster}</span>
        </div>
        <div className="data-row">
          <span>{t('transparency')}</span>
          <span className="value">{scientific.transparency}</span>
        </div>
        <div className="data-row">
          <span>{t('streak')}</span>
          <span className="value">{scientific.streak}</span>
        </div>
        {scientific.rarity && (
          <div className="data-row">
            <span>{t('rarity')}</span>
            <span className="value">{t(`rarity_${scientific.rarity}`)}</span>
          </div>
        )}
      </div>

      {data.color_description && (
        <div className="mineral-block">
          <h3>{t('color_title')}</h3>
          <p>{data.color_description}</p>
        </div>
      )}

      {data.lore && (
        <div className="mineral-block">
          <h3>{t('lore_title')}</h3>
          <p>{data.lore}</p>
        </div>
      )}

      {esoteric && (
        <div className="mineral-block esoteric-block">
          <h3>{t('esoteric_title')}</h3>
          {esoteric.metaphysical_properties?.length > 0 && (
            <p>
              <strong>{t('esoteric_properties')}</strong> {esoteric.metaphysical_properties.join(', ')}
            </p>
          )}
          {esoteric.chakras?.length > 0 && (
            <p>
              <strong>{t('esoteric_chakras')}</strong> {esoteric.chakras.join(', ')}
            </p>
          )}
          {esoteric.zodiac?.length > 0 && (
            <p>
              <strong>{t('esoteric_zodiac')}</strong> {esoteric.zodiac.join(', ')}
            </p>
          )}
          {esoteric.healing_interpretation && <p>{esoteric.healing_interpretation}</p>}
          {esoteric.energy_notes && <p>{esoteric.energy_notes}</p>}
          {esoteric.ritual_uses && <p>{esoteric.ritual_uses}</p>}
        </div>
      )}

      {localities.length > 0 && (
        <div className="mineral-block">
          <h3>{t('localities_title')}</h3>
          <ul className="locality-list">
            {localities.map((loc, i) => {
              const desc = pickField(loc, 'description', lang);
              return (
                <li key={i}>
                  <strong>
                    {loc.country}
                    {loc.region ? `, ${loc.region}` : ''}
                  </strong>
                  {loc.locality ? ` — ${loc.locality}` : ''}
                  {loc.is_russian && (
                    <span className="chip chip-active" style={{ marginLeft: 8 }}>
                      {t('russia_badge')}
                    </span>
                  )}
                  {desc && <p className="locality-desc">{desc}</p>}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {gallery.length > 0 && (
        <div className="mineral-block">
          <h3>{t('gallery_title')}</h3>
          <div className="gallery-grid">
            {gallery.map((g, i) => (
              <button
                key={i}
                type="button"
                className="gallery-thumb"
                onClick={() => setLightboxIndex(i)}
                aria-label={t('gallery_open_alt')}
              >
                <img src={g.url} alt={pickField(g, 'description', lang) || data.name} />
                <span className="gallery-thumb-zoom">🔍</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {lightboxIndex !== null && (
        <Lightbox
          images={gallery}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onPrev={() => setLightboxIndex((i) => (i - 1 + gallery.length) % gallery.length)}
          onNext={() => setLightboxIndex((i) => (i + 1) % gallery.length)}
        />
      )}

      {safety_notes && (
        <div className="mineral-block safety-note">
          <h3>{t('safety_title')}</h3>
          <p>{safety_notes}</p>
        </div>
      )}

      {related_minerals.length > 0 && (
        <div className="mineral-block">
          <h3>{t('related_title')}</h3>
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