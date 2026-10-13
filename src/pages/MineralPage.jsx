import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { getGemEntity, getRelatedGemEntities } from '../api.js';
import { imageUrl, localized, formatRange } from '../gemV2.js';
import { enumLabel } from '../gemLabels.js';
import ChemicalFormula from '../components/ChemicalFormula.jsx';
import Lightbox from '../components/Lightbox.jsx';
import { useLang, pickField } from '../i18n/LangContext.jsx';
import { relatedEntityLinks } from '../relatedEntities.js';

function Photo({ src, alt, className, onError }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  if (!src || failed) return null;
  return <img className={className} src={src} alt={alt} onError={() => { setFailed(true); onError?.(); }} />;
}

export default function MineralPage() {
  const { slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { lang, t } = useLang();
  const [mineral, setMineral] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [related, setRelated] = useState([]);
  const [relatedError, setRelatedError] = useState(null);
  const [failedImages, setFailedImages] = useState([]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError(null); setMineral(null); setRelated([]); setRelatedError(null); setLightboxIndex(null); setFailedImages([]);
    getGemEntity(slug, { signal: controller.signal })
      .then(setMineral)
      .catch((err) => { if (!controller.signal.aborted) setError(err); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    getRelatedGemEntities(slug, { signal: controller.signal })
      .then(setRelated)
      .catch((err) => { if (!controller.signal.aborted && err.status !== 404) setRelatedError(err.message); });
    return () => controller.abort();
  }, [slug]);

  if (loading) return <div className="section"><p className="status-text">{t('loading')}</p></div>;
  if (error) return <div className="section"><p className="status-text status-error">{error.status === 404 ? t('not_found') : `${t('mineral_load_error')} ${error.message}`}</p><Link className="btn btn-outline" to="/">{t('back_to_catalog')}</Link></div>;
  if (!mineral) return null;

  const s = mineral.scientific || {};
  const data = localized(mineral, lang);
  const hero = imageUrl(mineral.images, mineral.images?.hero);
  const gallery = (mineral.images?.gallery || []).map((g) => ({ url: imageUrl(mineral.images, g), caption: g.caption?.[lang] || '' })).filter((g) => g.url && !failedImages.includes(g.url));
  const linked = relatedEntityLinks(related, lang, slug);
  const facts = [
    ['formula', s.chemical_formula], ['hardness', formatRange(s.hardness)], ['density', formatRange(s.specific_gravity)],
    ['rarity', s.rarity ? t(`rarity_${s.rarity}`) : null], ['color_title', s.base_color ? t(`color_${s.base_color}`) : null],
    ['mineral_class', enumLabel('mineral_class', s.mineral_class, lang)], ['chemical_class', enumLabel('chemical_class', s.chemical_class, lang)],
    ['silicate_subclass', enumLabel('silicate_subclass', s.silicate_subclass, lang)], ['mineral_family', enumLabel('mineral_family', s.mineral_family, lang)],
    ['group', enumLabel('mineral_group', s.mineral_group, lang)], ['catalog_family', enumLabel('catalog_family', s.catalog_family, lang)],
    ['crystal_system', enumLabel('crystal_system', s.crystal_system, lang)], ['crystal_habit', enumLabel('crystal_habit', s.crystal_habit, lang)],
    ['luster', enumLabel('luster', s.luster, lang)], ['transparency', enumLabel('transparency', s.transparency, lang)],
    ['cleavage', [enumLabel('cleavage_degree', s.cleavage_degree, lang), s.cleavage_degree !== 'none' && s.cleavage_direction ? `${s.cleavage_direction} ${t('cleavage_directions')}` : null, s.cleavage_degree !== 'none' ? enumLabel('cleavage_type', s.cleavage_type, lang) : null].filter(Boolean).join(', ')],
    ['fracture', enumLabel('fracture', s.fracture, lang)], ['streak', enumLabel('streak', s.streak, lang)], ['tenacity', enumLabel('tenacity', s.tenacity, lang)],
    ['phenomena_title', enumLabel('phenomena', s.phenomena, lang)], ['ima_status', enumLabel('ima_status', s.ima_status, lang)], ['rock_type_title', enumLabel('rock_type', s.rock_type, lang)]
  ].filter(([, value]) => value);

  const groups = [
    ['composition_group', ['formula', 'mineral_class', 'chemical_class', 'silicate_subclass', 'mineral_family', 'group', 'catalog_family', 'rock_type_title', 'ima_status']],
    ['physical_group', ['hardness', 'density', 'crystal_system', 'crystal_habit', 'cleavage', 'fracture', 'tenacity']],
    ['optical_group', ['color_title', 'luster', 'transparency', 'streak', 'phenomena_title']],
  ];
  const description = data?.color_description || data?.scientific_notes?.composition;
  const intro = description?.match(/^[\s\S]*?[.!?](?:\s|$)/)?.[0]?.trim() || description;
  const navigation = [
    ['description', 'description_title', data?.color_description || data?.color?.length],
    ['characteristics', 'characteristics_title', facts.length || data?.scientific_notes?.composition || data?.scientific_notes?.hardness],
    ['identification', 'identification_tips_title', data?.identification_tips],
    ['care', 'care_title', data?.safety_notes],
    ['localities', 'localities_title', mineral.localities?.length],
    ['history', 'lore_title', data?.lore],
  ].filter(([, , exists]) => exists);
  const requestedTab = location.hash.slice(1);
  const activeTab = navigation.some(([id]) => id === requestedTab) ? requestedTab : navigation[0]?.[0];
  const selectTab = (id) => {
    navigate({ pathname: location.pathname, search: location.search, hash: '#' + id }, { preventScrollReset: true });
  };
  const handleTabKey = (event, index) => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % navigation.length;
    if (event.key === 'ArrowLeft') next = (index - 1 + navigation.length) % navigation.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = navigation.length - 1;
    if (next === undefined) return;
    event.preventDefault();
    const id = navigation[next][0];
    selectTab(id);
    document.getElementById('tab-' + id)?.focus({ preventScroll: true });
    document.getElementById('tab-' + id)?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  };
  const panelProps = (id) => ({
    id, role: 'tabpanel', 'aria-labelledby': 'tab-' + id,
    hidden: activeTab !== id, tabIndex: 0,
  });
  return <div className="section mineral-page mineral-editorial">
    <Link className="btn btn-ghost" to="/">{t('back_to_catalog')}</Link>
    <div className="mineral-intro-grid">
      <div className="mineral-media">
        {hero && <Photo className="mineral-cover" src={hero} alt={data?.name || slug} />}
        {gallery.length > 0 && <div className="mineral-thumbnails" aria-label={t('gallery_title')}>
          {gallery.map((g, i) => <button className="gallery-thumb" key={g.url} type="button" onClick={() => setLightboxIndex(i)} aria-label={g.caption || t('gallery_open_alt')}>
            <Photo src={g.url} alt={g.caption || data?.name || slug} onError={() => setFailedImages((old) => [...old, g.url])} />
          </button>)}
        </div>}
      </div>
      <div className="mineral-summary">
        <span className="section-label">{t(`entity_${mineral.type}`)}</span>
        <h1 className="section-title">{data?.name || slug}</h1>
        {data?.synonyms?.length > 0 && <p className="mineral-aliases">{t('synonyms_prefix')} {data.synonyms.join(', ')}</p>}
        {!data && <p className="status-text not-translated-banner">{t('not_translated_full')}</p>}
        {intro && <p className="mineral-lead">{intro}</p>}
        <dl className="mineral-quick-facts">
          {['formula', 'hardness', 'color_title', 'rarity'].map((key) => facts.find(([label]) => label === key)).filter(Boolean).map(([key, value]) => <div key={key} className={key === 'formula' ? 'quick-formula' : ''}>
            <dt>{t(key)}:</dt><dd>{key === 'formula' ? <ChemicalFormula formula={value} /> : value}</dd>
          </div>)}
        </dl>
      </div>
    </div>
    {navigation.length > 0 && <div className="mineral-section-nav mineral-tabs" role="tablist" aria-label={t('contents_title')}>
      {navigation.map(([id, label], index) => <button key={id} id={`tab-${id}`} type="button" role="tab"
        aria-selected={activeTab === id} aria-controls={id} tabIndex={activeTab === id ? 0 : -1}
        onClick={() => selectTab(id)} onKeyDown={(event) => handleTabKey(event, index)}>{t(label)}</button>)}
    </div>}
    <div className="mineral-reading">
      {(data?.color_description || data?.color?.length > 0) && <section {...panelProps('description')} className="mineral-block">
        <h2>{t('description_title')}</h2>
        {data?.color_description && <p>{data.color_description}</p>}
        {data?.color?.length > 0 && <p className="mineral-colors"><strong>{t('color_title')}: </strong>{data.color.join(', ')}</p>}
      </section>}
      {(facts.length > 0 || data?.scientific_notes?.composition || data?.scientific_notes?.hardness) && <section {...panelProps('characteristics')} className="mineral-block">
        <h2>{t('characteristics_title')}</h2>
        <div className="mineral-fact-groups">{groups.map(([heading, keys]) => {
          const entries = facts.filter(([key]) => keys.includes(key));
          return entries.length > 0 && <div className="mineral-fact-group" key={heading}>
            <h3>{t(heading)}</h3><dl>{entries.map(([key, value]) => <div key={key}><dt>{t(key)}</dt><dd>{key === 'formula' ? <ChemicalFormula formula={value} /> : value}</dd></div>)}</dl>
          </div>;
        })}</div>
        {data?.scientific_notes?.composition && <div className="mineral-note"><h3>{t('composition_title')}</h3><p>{data.scientific_notes.composition}</p></div>}
        {data?.scientific_notes?.hardness && <div className="mineral-note"><h3>{t('hardness_note')}</h3><p>{data.scientific_notes.hardness}</p></div>}
      </section>}
      {data?.identification_tips && <section {...panelProps('identification')} className="mineral-block"><h2>{t('identification_tips_title')}</h2><p>{data.identification_tips}</p></section>}
      {data?.safety_notes && <section {...panelProps('care')} className="mineral-block mineral-care"><h2>{t('care_title')}</h2><p>{data.safety_notes}</p></section>}
    {mineral.localities?.length > 0 && <section {...panelProps('localities')} className="mineral-block"><h3>{t('localities_title')}</h3><ul className="locality-list">{mineral.localities.map((loc, i) => { const place = [pickField(loc,'country',lang),pickField(loc,'region',lang),pickField(loc,'locality',lang)].filter(Boolean).join(', '); const desc = pickField(loc,'description',lang); return <li key={i}><strong>{place || t('not_translated')}</strong>{loc.country_code === 'RU' && <span className="chip chip-active" style={{ marginLeft: 8 }}>{t('russia_badge')}</span>}{desc && <p className="locality-desc">{desc}</p>}</li>; })}</ul></section>}

      {data?.lore && <section {...panelProps('history')} className="mineral-block"><h2>{t('lore_title')}</h2><p>{data.lore}</p></section>}
      {data?.esoteric && Object.values(data.esoteric).some((value) => value?.length) && <details className="mineral-block mineral-esoteric" key={slug + lang}><summary>{t('esoteric_title')}</summary>
        {[['esoteric_properties','metaphysical_properties'],['esoteric_chakras','chakras'],['esoteric_zodiac','zodiac']].map(([label, field]) => data.esoteric[field]?.length > 0 && <p key={field}><strong>{t(label)}</strong> {data.esoteric[field].join(', ')}</p>)}
        {['healing_interpretation','energy_notes','ritual_uses'].map((field) => data.esoteric[field] && <p key={field}>{data.esoteric[field]}</p>)}
      </details>}
    {relatedError && <p className="status-text status-error">{t('related_error')} {relatedError}</p>}
    {linked.length > 0 && <div className="mineral-block"><h3>{t('related_title')}</h3><div className="row">{linked.map((entity) => <Link key={entity.slug} to={entity.href} className="chip chip-active related-chip">{entity.label}</Link>)}</div></div>}
    {mineral.sources?.length > 0 && <div className="mineral-block"><h3>{t('sources_title')}</h3><ul>{mineral.sources.map((source, i) => <li key={i}>{source.url ? <a href={source.url} target="_blank" rel="noopener noreferrer">{source.title || source.url}</a> : source.title}{source.author && ` — ${source.author}`}</li>)}</ul></div>}
    </div>
    {lightboxIndex !== null && gallery.length > 0 && <Lightbox images={gallery} index={Math.min(lightboxIndex, gallery.length - 1)} onClose={() => setLightboxIndex(null)} onPrev={() => setLightboxIndex((i) => (i - 1 + gallery.length) % gallery.length)} onNext={() => setLightboxIndex((i) => (i + 1) % gallery.length)} onImageError={(url) => setFailedImages((old) => [...old, url])} />}
  </div>;
}
