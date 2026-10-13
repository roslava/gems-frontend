import { useEffect, useState } from 'react';
import { getGemPage } from '../api.js';
import useDebouncedValue from '../hooks/useDebouncedValue.js';
import SpecimenCard from '../components/SpecimenCard.jsx';
import FilterDrawer from '../components/FilterDrawer.jsx';
import ColorSwatchFilter from '../components/ColorSwatchFilter.jsx';
import { useLang } from '../i18n/LangContext.jsx';

const RU_LETTERS = ['А','Б','В','Г','Д','Е','Ё','Ж','З','И','Й','К','Л','М','Н','О','П','Р','С','Т','У','Ф','Х','Ц','Ч','Ш','Щ','Э','Ю','Я'];
const EN_LETTERS = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];

export default function CatalogPage() {
  const { lang, t } = useLang();
  const [minerals, setMinerals] = useState([]);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [catalogRevision, setCatalogRevision] = useState(0);
  const [total, setTotal] = useState(0);
  const [availableBaseColors, setAvailableBaseColors] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [query, setQuery] = useState('');
  const searchQuery = useDebouncedValue(query.trim());
  const searchPending = query.trim() !== searchQuery;
  const [rarity, setRarity] = useState('');
  const [baseColor, setBaseColor] = useState('');
  const [letter, setLetter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [mobileFilters, setMobileFilters] = useState(() => window.matchMedia('(max-width: 600px)').matches);
  useEffect(() => {
    const media = window.matchMedia('(max-width: 600px)');
    const update = () => setMobileFilters(media.matches);
    media.addEventListener('change', update);
  return () => media.removeEventListener('change', update);
  }, []);

  const activeFilterCount = [rarity, baseColor].filter(Boolean).length;

  const ALPHABET = lang === 'en' ? EN_LETTERS : RU_LETTERS;

  const RARITIES = [
    { value: '', label: t('rarity_any') },
    { value: 'common', label: t('rarity_common') },
    { value: 'uncommon', label: t('rarity_uncommon') },
    { value: 'rare', label: t('rarity_rare') },
    { value: 'very_rare', label: t('rarity_very_rare') },
  ];

  useEffect(() => {
    if (searchPending) return;
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    getGemPage({ page, limit, lang, query: searchQuery, rarity, baseColor, letter, signal: controller.signal })
      .then((result) => {
        if (controller.signal.aborted) return;
        setCatalogRevision((revision) => revision + 1);
        setMinerals(result.data); setTotal(result.total); setAvailableBaseColors(result.base_colors);
        if (result.page !== page) setPage(result.page);
      })
      .catch((err) => { if (!controller.signal.aborted) { setMinerals([]); setError(err.message); } })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [page, limit, lang, searchQuery, searchPending, rarity, baseColor, letter]);

  const items = minerals;
  useEffect(() => {
    if (!loading || error) {
      setShowSkeleton(false);
      return;
    }
    const timer = setTimeout(() => setShowSkeleton(true), 180);
    return () => clearTimeout(timer);
  }, [loading, error]);

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const currentPage = page;
  const goToPage = (nextPage) => {
    if (nextPage === page) return;
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };


  useEffect(() => { setLetter(''); }, [lang]);

    const resetFilters = () => { setBaseColor(''); setRarity(''); setPage(1); };
  const filterControls = (
        <div className="filter-panel-inner catalog-filter-layout">
          <ColorSwatchFilter
            available={availableBaseColors}
            value={baseColor}
            onChange={(next) => {
              setBaseColor(next);
              setPage(1);
            }}
          />

          <div className="rarity-filter">
            <span className="color-filter-label" id="rarity-filter-label">{t('rarity')}</span>
            <div className="rarity-options" role="group" aria-labelledby="rarity-filter-label">
              {RARITIES.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`rarity-option${rarity === option.value ? ' active' : ''}`}
                  aria-pressed={rarity === option.value}
                  onClick={() => { setRarity(option.value); setPage(1); }}
                >
                  {option.value ? option.label : t('alphabet_all')}
                </button>
              ))}
            </div>
          </div>
        </div>
  );

  return (
    <div className="section catalog-section">
      <h1 className="visually-hidden">{t('catalog_title')}</h1>

      <div className="filters-row catalog-search">
        <div className="catalog-search-field">
          <svg className="catalog-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
            <circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 4.5 4.5" />
          </svg>
        <input
          className="search-input"
          type="text"
          aria-label={t('search_placeholder')}
          placeholder={t('search_placeholder')}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
        />
        </div>
        <button
          type="button"
          className={`filter-toggle${filtersOpen ? ' open' : ''}${activeFilterCount ? ' has-filters' : ''}`}
          aria-expanded={filtersOpen}
          aria-controls="catalog-filters"
          onClick={() => setFiltersOpen((v) => !v)}
        >
          <svg className="filter-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
            <path d="M4 7h4m4 0h8M4 17h10m4 0h2" />
            <circle cx="10" cy="7" r="2" /><circle cx="16" cy="17" r="2" />
          </svg>
          <span>{t(filtersOpen ? 'close_filters' : 'filters_toggle')}</span>
          {activeFilterCount > 0 && <span className="count">· {activeFilterCount}</span>}
          <svg className="chev" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m3 4.5 3 3 3-3" /></svg>
        </button>
      </div>

      {filtersOpen && (mobileFilters
        ? <FilterDrawer onClose={() => setFiltersOpen(false)} onReset={resetFilters}
            busy={loading || searchPending || Boolean(error)} hasFilters={activeFilterCount > 0}
            resultLabel={loading || searchPending ? t('loading') : error ? t('results_unavailable') : t('show_results', total)}>
            {filterControls}
          </FilterDrawer>
        : <div id="catalog-filters" className="catalog-inline-filters">
            <button type="button" className="inline-filter-close" title={t('close_filters')} aria-label={t('close_filters')} onClick={() => setFiltersOpen(false)}>✕</button>
            {filterControls}
            <button type="button" className="inline-filter-reset" disabled={!activeFilterCount} onClick={resetFilters}>{t('reset_filters')}</button>
          </div>
      )}

      <div className="alphabet-bar">
        <button
          className={`alphabet-btn${letter === '' ? ' active' : ''}`}
          onClick={() => {
            setLetter('');
            setPage(1);
          }}
        >
          {t('alphabet_all')}
        </button>
        {ALPHABET.map((l) => (
          <button
            key={l}
            className={`alphabet-btn${letter === l ? ' active' : ''}`}
            onClick={() => {
              setLetter((prev) => (prev === l ? '' : l));
              setPage(1);
            }}
          >
            {l}
          </button>
        ))}
      </div>

      <div className="filter-bar catalog-toolbar">
        <span className="catalog-count" role="status">{!loading && !searchPending && !error ? t(query.trim() || letter || activeFilterCount ? 'results_count' : 'catalog_count', total) : t('loading')}</span>


        {rarity && (
          <button type="button" className="active-chip" onClick={() => { setRarity(''); setPage(1); }}>
            {RARITIES.find((r) => r.value === rarity)?.label} ✕
          </button>
        )}
        {baseColor && (
          <button type="button" className="active-chip" onClick={() => { setBaseColor(''); setPage(1); }}>
            {t(`color_${baseColor}`)} ✕
          </button>
        )}

      </div>



      {(loading || searchPending) && items.length === 0 && !showSkeleton && <p className="status-text">{t('loading')}</p>}
      {error && (
        <p className="status-text status-error">
          {t('error_prefix')} {error}
        </p>
      )}
      {!loading && !searchPending && !error && items.length === 0 && (
        <p className="status-text">{t('empty')}</p>
      )}

      <div key={catalogRevision} className={`cards-grid catalog-page-transition${loading || searchPending ? ' is-loading' : ''}${showSkeleton && loading ? ' has-skeleton' : ''}`} aria-busy={loading || searchPending} inert={loading || searchPending ? '' : undefined}>
        {showSkeleton && loading && !error && Array.from({ length: limit }, (_, index) => (
          <div className="catalog-skeleton" key={`skeleton-${index}`} aria-hidden="true">
            <div className="skeleton-photo" />
            <div className="skeleton-caption">
              <div className="skeleton-line skeleton-name" />
              <div className="skeleton-line skeleton-type" />
              <div className="skeleton-line skeleton-rarity" />
            </div>
          </div>
        ))}
        {!(showSkeleton && loading) && !error && items.map((m) => (
          <SpecimenCard key={m.slug} mineral={m} />
        ))}
      </div>

      {!loading && !searchPending && !error && totalPages > 1 && (
        <nav className="catalog-pagination" aria-label={t('pagination_label')}>
          <button type="button" className="pagination-arrow" disabled={page <= 1}
            aria-label={t('prev_page')} onClick={() => goToPage(page - 1)}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 12H4m6-6-6 6 6 6" /></svg>
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((number) => totalPages <= 7 || number === 1 || number === totalPages || Math.abs(number - currentPage) <= 1)
            .map((number, index, numbers) => <span className="pagination-item" key={number}>
              {index > 0 && number - numbers[index - 1] > 1 && <span className="pagination-ellipsis" aria-hidden="true">…</span>}
              <button type="button" className="pagination-number" aria-label={t('page_label', number)}
                aria-current={number === currentPage ? 'page' : undefined} onClick={() => goToPage(number)}>{number}</button>
            </span>)}
          <button type="button" className="pagination-arrow" disabled={page >= totalPages}
            aria-label={t('next_page')} onClick={() => goToPage(page + 1)}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12h16m-6-6 6 6-6 6" /></svg>
          </button>
        </nav>
      )}
    </div>
  );
}
