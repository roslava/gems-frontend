import { useEffect, useState } from 'react';
import { getPosts, searchPosts } from '../api.js';
import useDebouncedValue from '../hooks/useDebouncedValue.js';
import ArticleCard from '../components/ArticleCard.jsx';
import { useLang } from '../i18n/LangContext.jsx';

export default function ArticlesPage() {
  const { lang, t } = useLang();
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
          result = await searchPosts(searchQuery, { lang, signal: controller.signal });
        } else {
          result = await getPosts({ lang, page, limit, signal: controller.signal });
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
  }, [page, limit, searchQuery, searchPending, lang]);

  useEffect(() => setPage(1), [lang]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="section">
      <span className="section-label">{t('nav_articles')}</span>
      <h1 className="section-title">{t('articles_title')}</h1>
      <p className="section-desc">{t('articles_desc')}</p>

      <div className="filters-row">
        <input
          className="search-input"
          type="text"
          placeholder={t('search_articles_placeholder')}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
        />
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