import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getGemEntity } from '../api.js';
import { imageUrl, localized } from '../gemV2.js';
import { keepWordsTogether } from '../typography.js';

export default function ArticleRelatedGems({ slugs, lang }) {
  const [gems, setGems] = useState([]);
  const key = JSON.stringify([...new Set((slugs || []).filter(Boolean))]);
  useEffect(() => {
    const requested = JSON.parse(key);
    const controller = new AbortController();
    setGems([]);
    Promise.allSettled(requested.map(slug => getGemEntity(slug, { signal: controller.signal })))
      .then(results => {
        if (!controller.signal.aborted) setGems(results.filter(result => result.status === 'fulfilled').map(result => result.value));
      });
    return () => controller.abort();
  }, [key]);
  const items = gems.map(gem => ({ gem, data: localized(gem, lang) })).filter(item => item.data?.name);
  if (!items.length) return null;
  return <section className="article-related-gems" aria-labelledby="article-related-title">
    <h2 id="article-related-title">{lang === 'en' ? 'Stones in this article' : 'Камни из статьи'}</h2>
    <div className="article-related-grid">{items.map(({ gem, data }) => {
      const photo = imageUrl(gem.images, gem.images?.hero);
      return <Link className="article-related-card" key={gem.slug} to={'/minerals/' + encodeURIComponent(gem.slug)}>
        {photo && <img src={photo} alt="" loading="lazy" />}
        <span>{keepWordsTogether(data.name, lang)}</span>
      </Link>;
    })}</div>
  </section>;
}
