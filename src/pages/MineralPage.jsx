import { createPortal } from 'react-dom';
import MineralDetailsDialog from '../components/MineralDetailsDialog.jsx';
import MineralFactIcon from '../components/MineralFactIcon.jsx';
import { formatChemicalFormulasInText } from '../chemicalFormula.js';
import { keepWordsTogether } from '../typography.js';
import { useEffect, useRef, useState } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { getGemEntity, getRelatedGemEntities } from '../api.js';
import { imageUrl, localized, formatRange } from '../gemV2.js';
import { enumLabel } from '../gemLabels.js';
import ChemicalFormula from '../components/ChemicalFormula.jsx';
import Lightbox from '../components/Lightbox.jsx';
import MineralSectionImages from '../components/MineralSectionImages.jsx';
import { partitionMineralImages } from '../mineralImages.js';
import { useLang, pickField } from '../i18n/LangContext.jsx';
import { relatedEntityLinks } from '../relatedEntities.js';

function CountryFlag({ code }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [code]);
  if (failed || !/^[a-z]{2}$/i.test(code || '')) return null;
  return <img className="locality-flag" src={`https://flagcdn.com/${code.toLowerCase()}.svg`} width="24" height="18" alt="" loading="lazy" onError={() => setFailed(true)} />;
}

function Photo({ src, alt, className, onError }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  if (!src || failed) return null;
  return <img className={className} src={src} alt={alt} onError={() => { setFailed(true); onError?.(); }} />;
}

export default function MineralPage({ headerTarget, menuTarget }) {
  const { slug, section } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { lang, t: translate } = useLang();
  const text = (value) => keepWordsTogether(value, lang);
  const t = (...args) => text(translate(...args));
  const formatTexts = (value) => {
    if (typeof value === 'string') return text(value);
    if (Array.isArray(value)) return value.map(formatTexts);
    if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, formatTexts(item)]));
    return value;
  };
  const [mineral, setMineral] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const introRef = useRef(null);
  const stageRef = useRef(null);
  const galleryRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  useEffect(() => {
    const dialog = mobileMenuRef.current;
    if (!dialog || !mobileMenuOpen) return;
    dialog.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const resize = () => { if (window.innerWidth > 720) setMobileMenuOpen(false); };
    window.addEventListener('resize', resize);
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('resize', resize);
    };
  }, [mobileMenuOpen]);
  useEffect(() => setMobileMenuOpen(false), [slug, section]);
  const [galleryIndex, setGalleryIndex] = useState(0);
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

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [slug, section]);

  // Map document scrolling to the bounded gallery while the product stage is pinned.
  useEffect(() => {
    const wrapper = stageRef.current;
    const block = introRef.current;
    const strip = galleryRef.current;
    if (!wrapper || !block || !strip) return;
    setGalleryIndex(0);
    const summary = block.querySelector('.mineral-summary');
    const navigation = document.querySelector('.mineral-screen-navigation');
    let frame = 0;
    let travel = 0;
    let top = 0;
    const sync = () => {
      frame = 0;
      if (!wrapper.hasAttribute('data-pinned')) return;
      const progress = Math.max(0, Math.min(travel, top - wrapper.getBoundingClientRect().top));
      strip.scrollTop = progress;
      summary.scrollTop = progress;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(sync);
    };
    const measure = () => {
      const navStyle = navigation && getComputedStyle(navigation);
      top = navigation ? parseFloat(navStyle.top) + navigation.offsetHeight + 28 : 28;
      const height = Math.floor(window.innerHeight - top - 24);
      const canPin = window.innerWidth > 720 && height > 0;
      if (!canPin) {
        wrapper.removeAttribute('data-pinned');
        wrapper.style.height = '';
        strip.scrollTop = 0;
        summary.scrollTop = 0;
        return;
      }
      wrapper.style.setProperty('--mineral-stage-top', top + 'px');
      wrapper.style.setProperty('--mineral-stage-height', height + 'px');
      wrapper.setAttribute('data-pinned', '');
      travel = Math.max(0, strip.scrollHeight - strip.clientHeight, summary.scrollHeight - summary.clientHeight);
      wrapper.style.height = (height + travel) + 'px';
      sync();
    };
    const observer = new ResizeObserver(measure);
    observer.observe(summary);
    if (navigation) observer.observe(navigation);
    strip.querySelectorAll('img').forEach((image) => observer.observe(image));
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', measure);
    strip.addEventListener('load', measure, true);
    measure();
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', measure);
      strip.removeEventListener('load', measure, true);
      cancelAnimationFrame(frame);
      wrapper.removeAttribute('data-pinned');
      wrapper.style.height = '';
    };
  }, [mineral, section, lang, failedImages]);

  // Preserve links to sections shared before sections had their own routes.
  useEffect(() => {
    const legacy = location.hash.slice(1);
    if (['description', 'identification', 'care', 'history', 'esoteric'].includes(legacy)) {
      navigate({ pathname: `/minerals/${slug}` + (legacy === 'description' ? '' : `/${legacy}`), search: location.search }, { replace: true });
    }
  }, [slug, location.hash, location.search, navigate]);

  if (loading) return <div className="section"><p className="status-text">{t('loading')}</p></div>;
  if (error) return <div className="section"><p className="status-text status-error">{error.status === 404 ? t('not_found') : `${t('mineral_load_error')} ${error.message}`}</p><Link className="btn btn-outline" to="/catalog">{t('back_to_catalog')}</Link></div>;
  if (!mineral) return null;

  const s = mineral.scientific || {};
  const data = formatTexts(localized(mineral, lang));
  const hero = imageUrl(mineral.images, mineral.images?.hero);
  const { gallery: galleryImages, sections: sectionSlides } = partitionMineralImages(mineral.images);
  const galleryPhotos = galleryImages.map((g) => ({ url: imageUrl(mineral.images, g), caption: text(g.caption?.[lang] || '') })).filter((g) => g.url);
  const gallery = (galleryPhotos.length ? galleryPhotos : [{ url: hero, caption: text(mineral.images?.hero?.caption?.[lang] || '') }])
    .filter((g, index, all) => g.url && !failedImages.includes(g.url) && all.findIndex((item) => item.url === g.url) === index);
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
  const sectionPhotos = (id) => sectionSlides[id] || [];
  const sectionImages = (id) => <MineralSectionImages
    key={slug + ':' + lang + ':' + id}
    slides={sectionPhotos(id)}
    lang={lang}
  />;
  const introduction = data?.lore || data?.color_description || data?.scientific_notes?.composition;
  const sentences = introduction?.match(/[^.!?]+[.!?]+(?:\s|$)|[^.!?]+$/g);
  const intro = sentences ? sentences.slice(0, data?.lore ? 2 : 1).join('').trim() : introduction;
  const navigation = [
    ['description', 'description_title', true],
    ['identification', 'identification_tips_title', data?.identification_tips || sectionPhotos('identification').length],
    ['care', 'care_title', data?.safety_notes || sectionPhotos('safety').length],
    ['history', 'lore_title', data?.lore || sectionPhotos('lore').length],
    ['esoteric', 'esoteric_title', sectionPhotos('esoteric').length || (data?.esoteric && Object.values(data.esoteric).some((value) => value?.length))],
  ].filter(([, , exists]) => exists);
  const details = [
    ['characteristics', 'characteristics_title', facts.length || data?.scientific_notes?.composition || data?.scientific_notes?.hardness],
    ['localities', 'localities_title', mineral.localities?.length],
  ].filter(([, , exists]) => exists);
  const requestedTab = location.hash.slice(1);
  const activeDetails = details.some(([id]) => id === requestedTab) ? requestedTab : null;
  const activeTab = section || 'description';
  const sectionPath = (id) => `/minerals/${slug}` + (id === 'description' ? '' : `/${id}`);
  const selectTab = (id) => {
    navigate({ pathname: sectionPath(activeTab), search: location.search, hash: id ? '#' + id : '' }, { preventScrollReset: true });
  };
  const labels = lang === 'ru'
    ? { description: 'Обзор', identification: 'Как отличить', care: 'Уход', history: 'История', esoteric: 'Эзотерика' }
    : { description: 'Overview', identification: 'Identification', care: 'Care', history: 'History', esoteric: 'Esoteric' };
  const panelProps = (id) => ({ id, hidden: activeTab !== id });
  if (!navigation.some(([id]) => id === activeTab)) return <div className="section"><p>{t('not_found')}</p><Link to={sectionPath('description')}>{lang === 'ru' ? 'К обзору камня' : 'Back to overview'}</Link></div>;
  return <div className="section mineral-page mineral-editorial">
    {menuTarget && createPortal(<div className="mineral-mobile-menu">
      <button className="mineral-menu-trigger" type="button" aria-label={lang === 'ru' ? 'Разделы камня' : 'Stone sections'} aria-haspopup="dialog" aria-expanded={mobileMenuOpen} onClick={() => setMobileMenuOpen(true)}><svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"/></svg></button>
    </div>, menuTarget)}
    {createPortal(<dialog className="mineral-section-drawer" ref={mobileMenuRef} aria-labelledby="mineral-section-drawer-title" onCancel={() => setMobileMenuOpen(false)} onClose={() => setMobileMenuOpen(false)} onClick={(event) => {
      if (event.target === event.currentTarget) {
        const rect = event.currentTarget.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) setMobileMenuOpen(false);
      }
    }}>
      <div className="mineral-section-drawer-heading">
        <span id="mineral-section-drawer-title">{data?.name || slug}</span>
        <button type="button" autoFocus aria-label={lang === 'ru' ? 'Закрыть меню' : 'Close menu'} onClick={() => setMobileMenuOpen(false)}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m6 6 12 12M6 18 18 6" /></svg></button>
      </div>
      <nav className="mineral-section-drawer-links" aria-label={t('contents_title')}>
        {navigation.map(([id]) => <Link key={id} to={{ pathname: sectionPath(id), search: location.search }} aria-current={activeTab === id ? 'page' : undefined} onClick={() => setMobileMenuOpen(false)}>{labels[id]}</Link>)}
      </nav>
    </dialog>, document.body)}
    <div className="mineral-screen-navigation">
      {headerTarget && createPortal(<h1><Link to={{ pathname: sectionPath('description'), search: location.search }}>{data?.name || slug}</Link></h1>, headerTarget)}
      <Link className="mineral-catalog-back" to="/catalog"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 12H4m6-6-6 6 6 6" /></svg><span>{t('back_to_catalog').replace(/^←\s*/, '')}</span></Link>
      <nav className="mineral-screen-links" aria-label={t('contents_title')}>
        {navigation.map(([id]) => <Link key={id} to={{ pathname: sectionPath(id), search: location.search }} aria-current={activeTab === id ? 'page' : undefined}>{labels[id]}</Link>)}
      </nav>
    </div>
    {activeTab === 'description' && <div className="mineral-product-stage" ref={stageRef}><div className="mineral-intro-grid" ref={introRef}>
      <div className="mineral-gallery">
      <div className="mineral-media mineral-photo-strip" ref={galleryRef} tabIndex={0} role="region" aria-label={t('gallery_title')} onScroll={(event) => {
        const strip = event.currentTarget;
        if (window.innerWidth <= 720) setGalleryIndex(Math.round(strip.scrollLeft / (strip.clientWidth + 16)));
      }}>
        {gallery.map((g, i) => <button className="mineral-cover-button" key={g.url} type="button" aria-label={(lang === 'ru' ? 'Открыть фото ' : 'Open photo ') + (i + 1) + (g.caption ? ': ' + g.caption : '')} aria-haspopup="dialog" onClick={() => setLightboxIndex(i)}>
          <Photo className="mineral-cover" src={g.url} alt={g.caption || data?.name || slug} onError={() => setFailedImages((old) => [...old, g.url])} />
        </button>)}
      </div>
      {gallery.length > 1 && <div className="mineral-gallery-pagination" aria-label={t('gallery_title')}>
        {gallery.map((g, i) => <button key={g.url} type="button" className="mineral-gallery-dot" aria-label={(lang === 'ru' ? 'Фото ' : 'Photo ') + (i + 1)} aria-current={galleryIndex === i ? 'true' : undefined} onClick={() => galleryRef.current?.scrollTo({ left: i * (galleryRef.current.clientWidth + 16), behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })} />)}
      </div>}
      </div>
      <div className="mineral-summary">
        <h2 className="mineral-overview-title">{data?.name || slug}</h2>
        {(data?.color_description || intro) && <p className="mineral-overview-description">{data?.color_description || intro}</p>}
        {!data && <p className="status-text not-translated-banner">{t('not_translated_full')}</p>}
        <div className="mineral-overview-table-wrap">
          <table className="mineral-overview-table" aria-label={t('characteristics_title')}>
            <tbody>
              {data?.synonyms?.length > 0 && <tr><th scope="row">{t('synonyms_prefix').replace(/:\s*$/, '')}</th><td>{data.synonyms.join(', ')}</td></tr>}
              <tr><th scope="row">{lang === 'ru' ? 'Разновидность' : 'Type'}</th><td>{t(`entity_${mineral.type}`)}</td></tr>
              {['formula', 'hardness', 'color_title', 'rarity'].map((key) => facts.find(([label]) => label === key)).filter(Boolean).map(([key, value]) => (
              <tr key={key}><th scope="row">{t(key)}</th><td>{key === 'formula' ? <ChemicalFormula formula={value} /> : key === 'color_title' && data?.color?.length ? data.color.join(', ') : text(value)}</td></tr>
            ))}</tbody>
          </table>
        </div>
        {details.length > 0 && <div className="mineral-details-actions">
          {details.map(([id, label]) => <button key={id} type="button" className="btn btn-outline" aria-haspopup="dialog" onClick={() => selectTab(id)}>
            <span className="mineral-details-action-label">{id === 'characteristics' ? (lang === 'ru' ? 'Все характеристики' : 'All characteristics') : t(label)}</span>
            <svg className="mineral-details-action-arrow" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" focusable="false"><g><path d="M6.5418 15.3034L13.7131 8.13207V14.72L15.3807 14.7141V5.28595H5.95254V6.94766L12.5346 6.95355L5.36328 14.1248L6.5418 15.3034Z" fill="currentColor" /></g></svg>
          </button>)}
        </div>}
        {linked.length > 0 && <nav className="mineral-related-tags" aria-label={t('related_title')}>
          {linked.map((entity) => <Link key={entity.slug} to={entity.href} className="mineral-related-tag">{text(entity.label)}</Link>)}
        </nav>}
      </div>
    </div></div>}
    <div className={`mineral-reading mineral-screen-content ${activeTab === 'description' ? 'is-overview' : ''}`}>
      {activeTab !== 'description' && <p className="mineral-screen-kicker">{data?.name || slug}</p>}
      {activeDetails === 'characteristics' && <MineralDetailsDialog title={t('characteristics_title')} subtitle={data?.name || slug} onClose={() => selectTab('')}>
        <section className="mineral-block">
        <div className="mineral-fact-groups">{groups.map(([heading, keys]) => {
          const entries = facts.filter(([key]) => keys.includes(key));
          return entries.length > 0 && <div className="mineral-fact-group" key={heading}>
            <h3>{t(heading)}</h3><dl>{entries.map(([key, value]) => <div key={key}><dt><MineralFactIcon name={key} /><span>{t(key)}</span></dt><dd>{key === 'formula' ? <ChemicalFormula formula={value} /> : text(value)}</dd></div>)}</dl>
          </div>;
        })}</div>
        {data?.scientific_notes?.composition && <div className="mineral-note"><h3>{t('composition_title')}</h3><p>{formatChemicalFormulasInText(data.scientific_notes.composition)}</p></div>}
        {data?.scientific_notes?.hardness && <div className="mineral-note"><h3>{t('hardness_note')}</h3><p>{data.scientific_notes.hardness}</p></div>}
      </section></MineralDetailsDialog>}
      {(data?.identification_tips || sectionPhotos('identification').length > 0) && <section {...panelProps('identification')} className="mineral-block"><h2>{t('identification_tips_title')}</h2>{data?.identification_tips && <p>{data.identification_tips}</p>}{sectionImages('identification')}</section>}
      {(data?.safety_notes || sectionPhotos('safety').length > 0) && <section {...panelProps('care')} className="mineral-block mineral-care"><h2>{t('care_title')}</h2>{data?.safety_notes && <p>{data.safety_notes}</p>}{sectionImages('safety')}</section>}
    {activeDetails === 'localities' && <MineralDetailsDialog title={t('localities_title')} subtitle={data?.name || slug} onClose={() => selectTab('')}><section className="mineral-block"><ul className="locality-list">{mineral.localities.map((loc, i) => { const place = [pickField(loc,'country',lang),pickField(loc,'region',lang),pickField(loc,'locality',lang)].filter(Boolean).join(', '); const desc = pickField(loc,'description',lang); return <li key={i}><strong className="locality-place"><CountryFlag code={loc.country_code} /><span>{text(place) || t('not_translated')}</span></strong>{loc.country_code === 'RU' && <span className="chip chip-active" style={{ marginLeft: 8 }}>{t('russia_badge')}</span>}{desc && <p className="locality-desc">{text(desc)}</p>}</li>; })}</ul></section></MineralDetailsDialog>}

      {(data?.lore || sectionPhotos('lore').length > 0) && <section {...panelProps('history')} className="mineral-block"><h2>{t('lore_title')}</h2>{data?.lore && <p>{data.lore}</p>}{sectionImages('lore')}</section>}
      {(sectionPhotos('esoteric').length > 0 || (data?.esoteric && Object.values(data.esoteric).some((value) => value?.length))) && <section {...panelProps('esoteric')} className="mineral-block mineral-esoteric"><h2>{t('esoteric_title')}</h2>
        {[
          ['esoteric_properties', 'metaphysical_properties', 'properties'],
          ['esoteric_chakras', 'chakras', 'chakras'],
          ['esoteric_zodiac', 'zodiac', 'signs_of_the_zodiac'],
        ].map(([label, field, icon]) => data?.esoteric?.[field]?.length > 0 && <p key={field} className="mineral-esoteric-item">
          <img className="mineral-esoteric-icon" src={`https://storage.yandexcloud.net/lithoteka-cdn/common_immages/icons/${icon}.png`} width="24" height="24" alt="" aria-hidden="true" loading="lazy" />
          <span><strong>{t(label)}</strong> {data.esoteric[field].join(', ')}</span>
        </p>)}
        {['healing_interpretation','energy_notes','ritual_uses'].map((field) => data?.esoteric?.[field] && <p key={field}>{data?.esoteric?.[field]}</p>)}
        {sectionImages('esoteric')}
      </section>}
    {activeTab === 'description' && <>
    {relatedError && <p className="status-text status-error">{t('related_error')} {relatedError}</p>}

    {mineral.sources?.length > 0 && <div className="mineral-block"><h3>{t('sources_title')}</h3><ul className="mineral-sources-list">{mineral.sources.map((source, i) => <li key={i}><svg className="mineral-source-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7 .1l3-3a5 5 0 0 0-7.1-7.1l-1.7 1.7M14 11a5 5 0 0 0-7-.1l-3 3a5 5 0 0 0 7.1 7.1l1.7-1.7" /></svg><span>{source.url ? <a href={source.url} target="_blank" rel="noopener noreferrer">{text(source.title) || source.url}</a> : text(source.title)}{source.author && ` — ${source.author}`}</span></li>)}</ul></div>}
    </>}
    </div>
    {lightboxIndex !== null && gallery.length > 0 && <Lightbox images={gallery} index={Math.min(lightboxIndex, gallery.length - 1)} onClose={() => setLightboxIndex(null)} onPrev={() => setLightboxIndex((i) => (i - 1 + gallery.length) % gallery.length)} onNext={() => setLightboxIndex((i) => (i + 1) % gallery.length)} onImageError={(url) => setFailedImages((old) => [...old, url])} />}
  </div>;
}
