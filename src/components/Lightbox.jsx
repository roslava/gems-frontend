import { createPortal } from 'react-dom';
import { useEffect, useCallback, useRef, useState } from 'react';
import { useLang } from '../i18n/LangContext.jsx';

export default function Lightbox({ images, index, onClose, onPrev, onNext, onImageError }) {
  const { t } = useLang();
  const [portal] = useState(() => {
    const host = document.createElement('div');
    host.id = 'lightbox-portal';
    return host;
  });
  useEffect(() => { document.body.appendChild(portal); return () => portal.remove(); }, [portal]);
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const actions = useRef({ onClose, onPrev, onNext });
  actions.current = { onClose, onPrev, onNext };
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') { e.preventDefault(); actions.current.onClose(); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); actions.current.onPrev(); }
    if (e.key === 'ArrowRight') { e.preventDefault(); actions.current.onNext(); }
    if (e.key === 'Tab') {
      const controls = [...dialogRef.current.querySelectorAll('button:not([disabled]), [tabindex="0"]')];
      const first = controls[0], last = controls[controls.length - 1];
      if (e.shiftKey && (document.activeElement === first || !dialogRef.current.contains(document.activeElement))) {
        e.preventDefault(); last?.focus();
      } else if (!e.shiftKey && (document.activeElement === last || !dialogRef.current.contains(document.activeElement))) {
        e.preventDefault(); first?.focus();
      }
    }
  }, []);
  useEffect(() => {
    const trigger = document.activeElement;
    const prior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const siblings = [...document.body.children].filter((el) => el.id !== 'lightbox-portal');
    const inertBefore = siblings.map((el) => [el, el.inert]);
    siblings.forEach((el) => { el.inert = true; });
    closeRef.current?.focus();
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prior;
      inertBefore.forEach(([el, value]) => { el.inert = value; });
      if (trigger?.isConnected) trigger.focus();
    };
  }, [handleKeyDown]);
  const current = images[index];
  if (!current) return null;
  return createPortal(<div ref={dialogRef} role="dialog" aria-modal="true" aria-label={t('gallery_title')} className="lightbox-backdrop" onClick={onClose}>
    <button ref={closeRef} className="lightbox-close" onClick={onClose} aria-label={t('lightbox_close')}>✕</button>
    {images.length > 1 && <button className="lightbox-arrow lightbox-arrow-left" onClick={(e) => { e.stopPropagation(); onPrev(); }} aria-label={t('prev_page')}>‹</button>}
    <div className="lightbox-stage" onClick={(e) => e.stopPropagation()}><img key={current.url} className="lightbox-image" src={current.url} alt={current.caption || ''} onError={() => onImageError?.(current.url)} />{current.caption && <p className="lightbox-caption">{current.caption}</p>}<span className="lightbox-counter">{index + 1} / {images.length}</span></div>
    {images.length > 1 && <button className="lightbox-arrow lightbox-arrow-right" onClick={(e) => { e.stopPropagation(); onNext(); }} aria-label={t('next_page')}>›</button>}
  </div>, portal);
}
