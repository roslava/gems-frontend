import { useEffect, useState } from 'react';
import { getMinerals, searchMinerals } from '../api.js';
import SpecimenCard from '../components/SpecimenCard.jsx';
import { useLang } from '../i18n/LangContext.jsx';

export default function CatalogPage() {
  const { lang, t } = useLang();
  const [minerals, setMinerals] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [query, setQuery] = useState('');
  const [rarity, setRarity] = useState('');
  const [russianOnly, setRussianOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const RARITIES = [
    { value: '', label: t('rarity_any') },
    { value: 'common', label: t('rarity_common') },
    { value: 'uncommon', label: t('rarity_uncommon') },
    { value: 'rare', label: t('rarity_rare') },
    { value: 'very_rare', label: t('rarity_very_rare') },
  ];

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
            russian_only: russianOnly || undefined,
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
  }, [page, limit, rarity, russianOnly, query, lang]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="section">
      <span className="section-label">{t('nav_catalog')}</span>
      <h1 className="section-title">{t('catalog_title')}</h1>
      <p className="section-desc">{t('catalog_desc')}</p>

      <div className="filters-row">
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