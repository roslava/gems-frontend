import { keepWordsTogether } from '../typography.js';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { articleSlides, articleTranslation } from '../articleV2.js';
import { playbackFrames, startCoverPlayback } from '../coverFrames.js';
import { useCoverFrames, loadCoverImage } from '../useCoverFrames.js';
import { useLang, pickI18n } from '../i18n/LangContext.jsx';

export default function ArticleCard({ post }) {
  const { lang, t } = useLang();
  return <CoverCard key={JSON.stringify([post.slug, lang])} post={post} lang={lang} t={t} />;
}

function CoverCard({ post, lang, t }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [previewEnabled, setPreviewEnabled] = useState(false);
  const [activeUrl, setActiveUrl] = useState(null);
  const [firstReady, setFirstReady] = useState(null);
  const [failed, setFailed] = useState(() => new Set());
  const sequence = useCoverFrames(post.slug, lang, visible);
  const frames = useMemo(() => playbackFrames(sequence, post), [sequence, post]);
  const data = articleTranslation(pickI18n(post.i18n, lang));
  const first = frames[0];
  const fallback = [post.cover_image, ...articleSlides(post).map(slide => slide.url)]
    .find(url => typeof url === 'string' && url && !failed.has(url)) || null;
  const poster = (firstReady && !failed.has(firstReady) ? firstReady : null) || (failed.has(fallback) ? null : fallback);
  useEffect(() => {
    if (!globalThis.IntersectionObserver) { setVisible(true); return; }
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { setVisible(true); observer.disconnect(); }
    }, { rootMargin: '200px' });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const media = window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
    const update = () => setPreviewEnabled(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    let disposed = false;
    if (visible && first) loadCoverImage(first).then(() => { if (!disposed) setFirstReady(first); }).catch(() => {});
    return () => { disposed = true; };
  }, [first, visible]);
  useEffect(() => {
    setActiveUrl(null);
    if (!hovered || !previewEnabled || frames.length < 2) return;
    return startCoverPlayback(frames, setActiveUrl, { load: loadCoverImage });
  }, [frames, hovered, previewEnabled, firstReady]);
  const url = hovered && previewEnabled && activeUrl && !failed.has(activeUrl) ? activeUrl : poster;
  return (
    <Link ref={ref} to={'/articles/' + encodeURIComponent(post.slug)} className="specimen-card collection-card article-card"
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div className="specimen-photo article-v2-card-photo">
        {url ? <img src={url} className="article-card-slide is-active" alt={data?.title || ''} loading="lazy"
          onError={() => setFailed(current => new Set(current).add(url))} /> : <span role="status">{t('no_photo')}</span>}
      </div>
      <div className="specimen-body">
        <div className="specimen-name-row"><div className="specimen-name">{keepWordsTogether(data?.title || t('not_translated'), lang)}</div></div>
        {data?.excerpt && <p className="local-article-card-excerpt">{keepWordsTogether(data.excerpt, lang)}</p>}
      </div>
    </Link>
  );
}
