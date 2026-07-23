import { useEffect, useCallback } from 'react';

export default function Lightbox({ images, index, onClose, onPrev, onNext }) {
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    },
    [onClose, onPrev, onNext]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);

  const current = images[index];
  if (!current) return null;

  return (
    <div className="lightbox-backdrop" onClick={onClose}>
      <button className="lightbox-close" onClick={onClose} aria-label="Закрыть">
        ✕
      </button>

      {images.length > 1 && (
        <button
          className="lightbox-arrow lightbox-arrow-left"
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
          aria-label="Предыдущее фото"
        >
          ‹
        </button>
      )}

      <div className="lightbox-stage" onClick={(e) => e.stopPropagation()}>
        <img
          key={current.url}
          className="lightbox-image"
          src={current.url}
          alt={current.description_ru || ''}
        />
        {current.description_ru && <p className="lightbox-caption">{current.description_ru}</p>}
        <span className="lightbox-counter">
          {index + 1} / {images.length}
        </span>
      </div>

      {images.length > 1 && (
        <button
          className="lightbox-arrow lightbox-arrow-right"
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          aria-label="Следующее фото"
        >
          ›
        </button>
      )}
    </div>
  );
}
