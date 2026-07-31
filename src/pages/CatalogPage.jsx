import { useEffect, useState } from 'react';
import { getMinerals, searchMinerals, getFilters } from '../api.js';
import SpecimenCard from '../components/SpecimenCard.jsx';
import ColorSwatchFilter from '../components/ColorSwatchFilter.jsx';
import { useLang } from '../i18n/LangContext.jsx';

const RU_LETTERS = ['А','Б','В','Г','Д','Е','Ё','Ж','З','И','Й','К','Л','М','Н','О','П','Р','С','Т','У','Ф','Х','Ц','Ч','Ш','Щ','Э','Ю','Я'];
const EN_LETTERS = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];

export default function CatalogPage() {
  const { lang, t } = useLang();
  const [minerals, setMinerals] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [query, setQuery] = useState('');
  const [rarity, setRarity] = useState('');
  const [baseColor, setBaseColor] = useState('');
  const [availableBaseColors, setAvailableBaseColors] = useState(null);
  const [russianOnly, setRussianOnly] = useState(false);
  const [letter, setLetter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const activeFilterCount = [rarity, baseColor, russianOnly ? 'x' : ''].filter(Boolean).length;

  const ALPHABET = lang === 'en' ? EN_LETTERS : RU_LETTERS;

  const RARITIES = [
    { value: '', label: t('rarity_any') },
    { value: 'common', label: t('rarity_common') },
    { value: 'uncommon', label: t('rarity_uncommon') },
    { value: 'rare', label: t('rarity_rare') },
    { value: 'very_rare', label: t('rarity_very_rare') },
  ];

  // base_colors языконезависимы, но грузим вместе с lang для единообразия
  // с остальными вызовами getFilters — вреда нет, а код проще.
  useEffect(() => {
    let cancelled = false;

    getFilters({ lang })
      .then((fv) => {
        if (cancelled) return;
        setAvailableBaseColors(fv.base_colors || []);
      })
      .catch(() => {
        if (!cancelled) setAvailableBaseColors(null);
      });

    return () => {
      cancelled = true;
    };
  }, [lang]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const load = async () => {
      try {
        let result;
        if (query.trim()) {
          result = await searchMinerals(query.trim(), { lang });
        } else {
          result = await getMinerals({
            lang,
            page,
            limit,
            rarity: rarity || undefined,
            base_color: baseColor || undefined,
            russian_only: russianOnly || undefined,
            letter: letter || undefined,
          });
        }
        if (!cancelled) {
          setMinerals(result.data || []);
          setTotal(result.total ?? (result.data ? result.data.length : 0));
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [page, limit, rarity, baseColor, russianOnly, letter, query, lang]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="section">
      <span className="section-label">{t('nav_catalog')}</span>
      <h1 className="section-title">{t('catalog_title')}</h1>
      <p className="section-desc">{t('catalog_desc')}</p>

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

      <div className="filters-row" style={{ marginBottom: 16 }}>
        <input
          className="search-input"
          type="text"
          placeholder={t('search_placeholder')}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
        />
      </div>

      <div className="filter-bar">
        <button
          type="button"
          className={`filter-toggle${filtersOpen ? ' open' : ''}`}
          onClick={() => setFiltersOpen((v) => !v)}
        >
          <span>{t('filters_toggle')}</span>
          {activeFilterCount > 0 && <span className="count">{activeFilterCount}</span>}
          <span className="chev">▾</span>
        </button>

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
        {russianOnly && (
          <button type="button" className="active-chip" onClick={() => { setRussianOnly(false); setPage(1); }}>
            {t('russian_only')} ✕
          </button>
        )}
      </div>

      <div className={`filter-panel${filtersOpen ? ' open' : ''}`}>
        <div className="filter-panel-inner">
          <ColorSwatchFilter
            available={availableBaseColors}
            value={baseColor}
            onChange={(next) => {
              setBaseColor(next);
              setPage(1);
            }}
          />

          <div className="filters-row" style={{ marginBottom: 0, marginTop: 20 }}>
            <select
              value={rarity}
              onChange={(e) => {
                setRarity(e.target.value);
                setPage(1);
              }}
            >
              {RARITIES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
            <label className="checkbox-field">
              <input
                type="checkbox"
                checked={russianOnly}
                onChange={(e) => {
                  setRussianOnly(e.target.checked);
                  setPage(1);
                }}
              />
              {t('russian_only')}
            </label>
          </div>
        </div>
      </div>

      {loading && <p className="status-text">{t('loading')}</p>}
      {error && (
        <p className="status-text status-error">
          {t('error_prefix')} {error}
        </p>
      )}
      {!loading && !error && minerals.length === 0 && (
        <p className="status-text">{t('empty')}</p>
      )}

      <div className="cards-grid">
        {minerals.map((m) => (
          <SpecimenCard key={m.slug} mineral={m} />
        ))}
      </div>

      {!query && totalPages > 1 && (
        <div className="pagination">
          <button className="btn btn-outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            {t('prev_page')}
          </button>
          <span className="page-info">{t('page_info', page, totalPages)}</span>
          <button
            className="btn btn-outline"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            {t('next_page')}
          </button>
        </div>
      )}
    </div>
  );
}