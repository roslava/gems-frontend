import { useEffect, useRef } from 'react';
import { useLang } from '../i18n/LangContext.jsx';

export default function MineralDetailsDialog({ title, subtitle, children, onClose }) {
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const { t } = useLang();
  useEffect(() => {
    const dialog = dialogRef.current;
    const trigger = document.activeElement;
    const prior = document.body.style.overflow;
    dialog.showModal();
    closeRef.current?.focus();
    document.body.style.overflow = 'hidden';
    return () => {
      dialog.close();
      document.body.style.overflow = prior;
      if (trigger?.isConnected) trigger.focus({ preventScroll: true });
    };
  }, []);
  return <dialog ref={dialogRef} className="mineral-details-dialog" aria-labelledby="mineral-details-title"
    onCancel={(event) => { event.preventDefault(); onClose(); }}
    onClick={(event) => {
      if (event.target !== dialogRef.current) return;
      const rect = event.currentTarget.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose();
    }}>
    <div className="mineral-details-header">
      <div><p>{subtitle}</p><h2 id="mineral-details-title">{title}</h2></div>
      <button ref={closeRef} className="mineral-details-close" type="button" aria-label={t('lightbox_close')} onClick={onClose}>✕</button>
    </div>
    <div className="mineral-details-content">{children}</div>
  </dialog>;
}
