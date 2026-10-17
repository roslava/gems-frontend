import { keepWordsTogether } from '../typography.js';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { articleSlides, articleTranslation, slideText } from '../articleV2.js';
import { useLang, pickI18n } from '../i18n/LangContext.jsx';

export default function ArticleCard({ post }) {
  const { lang, t } = useLang();
  const [hovered, setHovered] = useState(false);
  const [active, setActive] = useState(0);
  const [readyUrls, setReadyUrls] = useState(() => new Set());
  const [failedUrls, setFailedUrls] = useState(() => new Set());
  const [previewEnabled, setPreviewEnabled] = useState(false);
  const data = articleTranslation(pickI18n(post.i18n, lang));
  const slides = articleSlides(post);
  const slideUrls = JSON.stringify(slides.map(slide => slide.url));
  useEffect(() => {
    const media = window.matchMedia('(hover: hover) and (prefers-reduced-motion: no-preference)');
    const update = () => setPreviewEnabled(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    setActive(0);
    if (!hovered || !previewEnabled) return;
    const urls = JSON.parse(slideUrls);
    const timer = setInterval(() => {
      if (document.hidden) return;
      setActive(current => {
        for (let step = 1; step < urls.length; step++) {
          const next = (current + step) % urls.length;
          if (readyUrls.has(urls[next]) && !failedUrls.has(urls[next])) return next;
        }
        return current;
      });
    }, 1200);
    return () => clearInterval(timer);
  }, [hovered, previewEnabled, slideUrls, readyUrls, failedUrls]);
  const visibleIndex = failedUrls.has(slides[active]?.url)
    ? slides.findIndex(slide => !failedUrls.has(slide.url)) : active;
  const visibleSlide = slides[visibleIndex];

  return (
    <Link to={'/articles/' + encodeURIComponent(post.slug)} className="specimen-card collection-card article-card"
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div className="specimen-photo article-v2-card-photo">
        {visibleSlide
          ? slides.map((slide, index) => (index === 0 || (hovered && previewEnabled) || readyUrls.has(slide.url)) && !failedUrls.has(slide.url) && (
            <img key={slide.id || slide.url} src={slide.url}
              className={index === visibleIndex ? 'article-card-slide is-active' : 'article-card-slide'}
              alt={index === visibleIndex ? slideText(slide, lang).alt : ''}
              aria-hidden={index !== visibleIndex} loading={index === 0 ? 'lazy' : 'eager'}
              onLoad={() => setReadyUrls(current => current.has(slide.url) ? current : new Set(current).add(slide.url))}
              onError={() => setFailedUrls(current => new Set(current).add(slide.url))} />
          ))
          : <span role="status">{t('no_photo')}</span>}
      </div>
      <div className="specimen-body">
        <div className="specimen-name-row"><div className="specimen-name">{keepWordsTogether(data?.title || t('not_translated'), lang)}</div></div>
        {data?.excerpt && <p className="local-article-card-excerpt">{keepWordsTogether(data.excerpt, lang)}</p>}
      </div>
    </Link>
  );
}
