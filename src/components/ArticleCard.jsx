import { useState } from 'react';
import { Link } from 'react-router-dom';
import { articleSlides, articleTranslation, slideText } from '../articleV2.js';
import { useLang, pickI18n } from '../i18n/LangContext.jsx';

export default function ArticleCard({ post }) {
  const { lang, t } = useLang();
  const [failedUrl, setFailedUrl] = useState('');
  const data = articleTranslation(pickI18n(post.i18n, lang));
  const firstSlide = articleSlides(post)[0];
  const imageUrl = firstSlide?.url;
  const imageAvailable = imageUrl && failedUrl !== imageUrl;

  return (
    <Link to={'/articles/' + encodeURIComponent(post.slug)} className="specimen-card collection-card article-card">
      <div className="specimen-photo article-v2-card-photo">
        {imageAvailable
          ? <img src={imageUrl} alt={slideText(firstSlide, lang).alt} loading="lazy" onError={() => setFailedUrl(imageUrl)} />
          : <span role="status">{t('no_photo')}</span>}
      </div>
      <div className="specimen-body">
        <div className="specimen-name-row"><div className="specimen-name">{data?.title || t('not_translated')}</div></div>
        {data?.excerpt && <p className="local-article-card-excerpt">{data.excerpt}</p>}
      </div>
    </Link>
  );
}
