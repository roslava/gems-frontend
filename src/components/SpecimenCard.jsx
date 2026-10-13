import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../i18n/LangContext.jsx';
import { imageUrl, localized } from '../gemV2.js';

export default function SpecimenCard({ mineral }) {
  const { lang, t } = useLang();
  const [failed, setFailed] = useState(false);
  const data = localized(mineral, lang);
  const scientific = mineral.scientific || {};
  const image = imageUrl(mineral.images, mineral.images?.thumbnail) || imageUrl(mineral.images, mineral.images?.hero);
  return <Link to={`/minerals/${mineral.slug}`} className="specimen-card collection-card">
    <div className="specimen-photo">{image && !failed ? <img className="specimen-photo-img" src={image} alt={data?.name || mineral.slug} onError={() => setFailed(true)} /> : t('no_photo')}</div>
    <div className="specimen-body"><div className="specimen-name-row"><div className="specimen-name" title={data?.name || mineral.slug}>{data?.name || mineral.slug}</div></div>
      <div className="specimen-latin">{data ? t(`entity_${mineral.type}`) : t('not_translated')}</div>
      {scientific.rarity && <div className="rarity-row"><span className={`rarity-label rarity-badge${['rare', 'very_rare'].includes(scientific.rarity) ? ' rarity-badge-accent' : ''}`}>{t(`rarity_${scientific.rarity}`)}</span></div>}
    </div>
  </Link>;
}
