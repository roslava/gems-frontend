import { useRef, useState } from 'react';
import { nextSlideIndex, slideText } from '../articleV2.js';

const LABELS = {
  ru: { region: 'Изображения статьи', previous: 'Предыдущее изображение', next: 'Следующее изображение', failed: 'Изображение не загрузилось' },
  en: { region: 'Article images', previous: 'Previous image', next: 'Next image', failed: 'Image could not be loaded' },
};

export function ArticleSlideImage({ slide, lang, failed, onError, eager }) {
  const labels = LABELS[lang] || LABELS.ru;
  const { alt } = slideText(slide, lang);
  return (
    <div className="article-v2-image-frame">
      {failed
        ? <span className="article-v2-image-error" role="status">{labels.failed}</span>
        : <img src={slide.url} alt={alt} loading={eager ? 'eager' : 'lazy'} onError={onError} />}
    </div>
  );
}

export default function ArticleSlider({ slides, lang }) {
  const [index, setIndex] = useState(0);
  const [failedUrls, setFailedUrls] = useState(() => new Set());
  const touchStart = useRef(null);
  if (!slides?.length) return null;

  const activeIndex = Math.min(index, slides.length - 1);
  const slide = slides[activeIndex];
  const { caption } = slideText(slide, lang);
  const labels = LABELS[lang] || LABELS.ru;
  const multiple = slides.length > 1;
  const change = (direction) => setIndex((current) => nextSlideIndex(current, slides.length, direction));
  const onKeyDown = (event) => {
    if (!multiple) return;
    if (event.key === 'ArrowLeft') { event.preventDefault(); change(-1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); change(1); }
    if (event.key === 'Home') { event.preventDefault(); setIndex(0); }
    if (event.key === 'End') { event.preventDefault(); setIndex(slides.length - 1); }
  };
  const onTouchEnd = (event) => {
    if (!multiple || !touchStart.current) return;
    const end = event.changedTouches[0];
    const dx = end.clientX - touchStart.current.x;
    const dy = end.clientY - touchStart.current.y;
    touchStart.current = null;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.2) change(dx < 0 ? 1 : -1);
  };

  return (
    <section className="article-v2-slider" aria-label={labels.region} tabIndex={multiple ? 0 : undefined} onKeyDown={onKeyDown}
      onTouchStart={multiple ? (event) => { touchStart.current = { x: event.touches[0].clientX, y: event.touches[0].clientY }; } : undefined}
      onTouchEnd={multiple ? onTouchEnd : undefined}>
      <figure className="article-v2-figure">
        <ArticleSlideImage slide={slide} lang={lang} failed={failedUrls.has(slide.url)} eager={activeIndex === 0}
          onError={() => setFailedUrls((current) => new Set(current).add(slide.url))} />
        {caption && <figcaption className="article-v2-caption" aria-live="polite">{caption}</figcaption>}
      </figure>
      {multiple && (
        <div className="article-v2-slider-controls">
          <button type="button" onClick={() => change(-1)} aria-label={labels.previous}>←</button>
          <span aria-live="polite">{activeIndex + 1} / {slides.length}</span>
          <button type="button" onClick={() => change(1)} aria-label={labels.next}>→</button>
        </div>
      )}
    </section>
  );
}
