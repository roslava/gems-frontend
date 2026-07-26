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
    related_minerals = [],
  } = mineral;

  // pickI18n РІРѕР·РІСЂР°С‰Р°РµС‚ null, РµСЃР»Рё РґР»СЏ СЌС‚РѕРіРѕ СЏР·С‹РєР° РІРѕРѕР±С‰Рµ РЅРµС‚ РїРµСЂРµРІРѕРґР° вЂ”
  // С‚РѕРіРґР° С‡РµСЃС‚РЅРѕ РїРѕРєР°Р·С‹РІР°РµРј Р·Р°РіР»СѓС€РєСѓ, Р° РЅРµ СЂСѓСЃСЃРєРёР№ С‚РµРєСЃС‚ РёСЃРїРѕРґС‚РёС€РєР°.
  const data = pickI18n(i18n, lang);
  const esoteric = data?.esoteric;

  return (
    <div className="section mineral-page">
      <Link className="btn btn-ghost" to="/">
        {t('back_to_catalog')}
      </Link>

      <div className="mineral-header">
        <div>
          <span className="section-label">{data?.mineral_group || scientific.chemical_formula}</span>
          <h1 className="section-title">{data?.name || slug}</h1>
          {data?.synonyms?.length > 0 && (
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

      {!data && (
        <p className="status-text not-translated-banner">{t('not_translated_full')}</p>
      )}

      {main_image_url && <img className="mineral-hero-image" src={main_image_url} alt={data?.name || slug} />}

      {/* Р¤РѕСЂРјСѓР»Р°, С‚РІС‘СЂРґРѕСЃС‚СЊ, РїР»РѕС‚РЅРѕСЃС‚СЊ, СЂРµРґРєРѕСЃС‚СЊ вЂ” СѓРЅРёРІРµСЂСЃР°Р»СЊРЅС‹ РґР»СЏ Р»СЋР±РѕРіРѕ СЏР·С‹РєР° */}
      <div className="hero-visual mineral-data-card">
        <div className="data-row" style={{ borderTop: 'none' }}>
          <span>{t('formula')}</span>
          <span className="value">{scientific.chemical_formula}</span>
        </div>
        {data?.mineral_group && (
          <div className="data-row">
            <span>{t('group')}</span>
            <span className="value">{data.mineral_group}</span>
          </div>
        )}
        {data?.crystal_system && (
          <div className="data-row">
            <span>{t('crystal_system')}</span>
            <span className="value">{data.crystal_system}</span>
          </div>
        )}
        {data?.crystal_habit && (
          <div className="data-row">
            <span>{t('crystal_habit')}</span>
            <span className="value">{data.crystal_habit}</span>
          </div>
        )}
        <div className="data-row">
          <span>{t('hardness')}</span>
          <span className="value">
            {scientific.hardness?.min}вЂ“{scientific.hardness?.max}
            {data?.hardness_note ? ` (${data.hardness_note})` : ''}
          </span>
        </div>
        <div className="data-row">
          <span>{t('density')}</span>
          <span className="value">
            {scientific.specific_gravity?.min}вЂ“{scientific.specific_gravity?.max} Рі/СЃРјВі
          </span>
        </div>
        {data?.luster && (
          <div className="data-row">
            <span>{t('luster')}</span>
            <span className="value">{data.luster}</span>
          </div>
        )}
        {data?.transparency && (
          <div className="data-row">
            <span>{t('transparency')}</span>
            <span className="value">{data.transparency}</span>
          </div>
        )}
        {data?.streak && (
          <div className="data-row">
            <span>{t('streak')}</span>
            <span className="value">{data.streak}</span>
          </div>
        )}
        {data?.cleavage && (
          <div className="data-row">
            <span>{t('cleavage')}</span>
            <span className="value">{data.cleavage}</span>
          </div>
        )}
        {data?.fracture && (
          <div className="data-row">
            <span>{t('fracture')}</span>
            <span className="value">{data.fracture}</span>
          </div>
        )}
        {data?.tenacity && (
          <div className="data-row">
            <span>{t('tenacity')}</span>
            <span className="value">{data.tenacity}</span>
          </div>
        )}
        {data?.ima_status && (
          <div className="data-row">
            <span>{t('ima_status')}</span>
            <span className="value">{data.ima_status}</span>
          </div>
        )}
        {scientific.rarity && (
          <div className="data-row">
            <span>{t('rarity')}</span>
            <span className="value">{t(`rarity_${scientific.rarity}`)}</span>
          </div>
        )}
      </div>

      {data?.color_description && (
        <div className="mineral-block">
          <h3>{t('color_title')}</h3>
          <p>{data.color_description}</p>
        </div>
      )}

      {data?.lore && (
        <div className="mineral-block">
          <h3>{t('lore_title')}</h3>
          <p>{data.lore}</p>
        </div>
      )}

      {data?.identification_tips && (
        <div className="mineral-block">
          <h3>{t('identification_tips_title')}</h3>
          <p>{data.identification_tips}</p>
        </div>
      )}

      {data?.composition && (
        <div className="mineral-block">
          <h3>{t('composition_title')}</h3>
          <p>{data.composition}</p>
        </div>
      )}

      {data?.rock_type && (
        <div className="mineral-block">
          <h3>{t('rock_type_title')}</h3>
          <p>{data.rock_type}</p>
        </div>
      )}

      {data?.phenomena?.length > 0 && (
        <div className="mineral-block">
          <h3>{t('phenomena_title')}</h3>
          <div className="row">
            {data.phenomena.map((ph) => (
              <span key={ph} className="chip chip-active">
                {ph}
              </span>
            ))}
          </div>
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
              const country = pickField(loc, 'country', lang);
              const region = pickField(loc, 'region', lang);
              const localityName = pickField(loc, 'locality', lang);
              const desc = pickField(loc, 'description', lang);

              // Р•СЃР»Рё РґР»СЏ СЌС‚РѕР№ Р»РѕРєР°С†РёРё РЅРµС‚ РїРµСЂРµРІРѕРґР° РІРѕРѕР±С‰Рµ РЅРё РЅР° РѕРґРЅРѕ РїРѕР»Рµ вЂ” РїСЂРѕРїСѓСЃРєР°РµРј,
              // Р° РЅРµ РїРѕРєР°Р·С‹РІР°РµРј СЂСѓСЃСЃРєРёР№ С‚РµРєСЃС‚ РїРѕРґ РІРёРґРѕРј Р°РЅРіР»РёР№СЃРєРѕРіРѕ.
              if (!country && !region && !localityName && !desc) return null;

              return (
                <li key={i}>
                  <strong>
                    {country}
                    {region ? `, ${region}` : ''}
                  </strong>
                  {localityName ? ` вЂ” ${localityName}` : ''}
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
                <img src={g.url} alt={pickField(g, 'description', lang) || data?.name || slug} />
                <span className="gallery-thumb-zoom">рџ”Ќ</span>
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

      {data?.safety_notes && (
        <div className="mineral-block safety-note">
          <h3>{t('safety_title')}</h3>
          <p>{data.safety_notes}</p>
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
