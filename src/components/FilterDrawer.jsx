import { useEffect, useRef } from 'react';
import { useLang } from '../i18n/LangContext.jsx';

export default function FilterDrawer({ children, onClose, onReset, resultLabel, busy, hasFilters }) {
  const { t } = useLang();
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  useEffect(() => {
    const trigger = document.activeElement;
    const prior = document.body.style.overflow;
    dialogRef.current.showModal();
    closeRef.current?.focus();
    document.body.style.overflow = 'hidden';
    return () => {
      dialogRef.current?.close();
      document.body.style.overflow = prior;
      if (trigger?.isConnected) trigger.focus();
    };
  }, []);
  return <dialog ref={dialogRef} id="catalog-filters" className="filter-drawer"
    aria-labelledby="filter-drawer-title"
    onCancel={(event) => { event.preventDefault(); onClose(); }}
    onClick={(event) => {
      if (event.target !== dialogRef.current) return;
      const rect = dialogRef.current.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose();
    }}>
    <div className="filter-drawer-header">
      <h2 id="filter-drawer-title">{t('filters_toggle')}</h2>
      <button ref={closeRef} type="button" className="filter-drawer-close" aria-label={t('lightbox_close')} onClick={onClose}>✕</button>
    </div>
    <div className="filter-drawer-content">{children}</div>
    <div className="filter-drawer-footer">
      <button type="button" className="drawer-show-results" disabled={busy} onClick={onClose}>{resultLabel}</button>
      <button type="button" className="drawer-reset" disabled={!hasFilters} onClick={onReset}>{t('reset_filters')}</button>
    </div>
  </dialog>;
}
