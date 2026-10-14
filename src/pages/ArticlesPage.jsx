import { useEffect, useState } from 'react';
import { getPosts, searchPosts } from '../api.js';
import useDebouncedValue from '../hooks/useDebouncedValue.js';
import ArticleCard from '../components/ArticleCard.jsx';
import { useLang } from '../i18n/LangContext.jsx';

export default function ArticlesPage() {
  const { t } = useLang();
  const [posts, setPosts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [query, setQuery] = useState('');
  const searchQuery = useDebouncedValue(query.trim());
  const searchPending = query.trim() !== searchQuery;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (searchPending) return;
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    setPosts([]);
    setTotal(0);

    const load = async () => {
      try {
        let result;
        if (searchQuery) {
          result = await searchPosts(searchQuery, { signal: controller.signal });
        } else {
          result = await getPosts({ page, limit, signal: controller.signal });
        }
        if (!controller.signal.aborted) {
          setPosts(result.data || []);
          setTotal(result.total ?? (result.data ? result.data.length : 0));
        }
      } catch (err) {
        if (!controller.signal.aborted) setError(err.message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    load();
    return () => {
      controller.abort();
    };
  }, [page, limit, searchQuery, searchPending]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="section catalog-section articles-section">
      <h1 className="visually-hidden">{t('articles_title')}</h1>

      <div className="filters-row catalog-search">
        <div className="catalog-search-field">
          <svg className="catalog-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
            <circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 4.5 4.5" />
          </svg>
        <input
          className="search-input"
          type="text"
          aria-label={t('search_articles_placeholder')}
          placeholder={t('search_articles_placeholder')}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
        />
        </div>
      </div>

      {(loading || searchPending) && <p className="status-text">{t('loading')}</p>}
      {error && (
        <p className="status-text status-error">
          {t('error_prefix')} {error}
        </p>
      )}
      {!loading && !searchPending && !error && posts.length === 0 && (
        <p className="status-text">{t('no_articles')}</p>
      )}

      <div className="cards-grid articles-grid">
        {!loading && !searchPending && !error && posts.map((p) => (
          <ArticleCard key={p.slug} post={p} />
        ))}
      </div>

      {!loading && !searchPending && !error && !query.trim() && totalPages > 1 && (
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
