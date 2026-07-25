import { useEffect, useState } from 'react';
import { getPosts, searchPosts } from '../api.js';
import ArticleCard, { POST_TYPE_KEYS } from '../components/ArticleCard.jsx';
import { useLang } from '../i18n/LangContext.jsx';

export default function ArticlesPage() {
  const { lang, t } = useLang();
  const [posts, setPosts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [query, setQuery] = useState('');
  const [type, setType] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const TYPES = [
    { value: '', label: t('type_any') },
    ...Object.entries(POST_TYPE_KEYS).map(([value, key]) => ({ value, label: t(key) })),
  ];

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const load = async () => {
      try {
        let result;
        if (query.trim()) {
          result = await searchPosts(query.trim(), { lang });
        } else {
          result = await getPosts({
            lang,
            page,
            limit,
            type: type || undefined,
          });
        }
        if (!cancelled) {
          setPosts(result.data || []);
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
  }, [page, limit, type, query, lang]);

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
        <select
          value={type}
          onChange={(e) => {
            setType(e.target.value);
            setPage(1);
          }}
        >
          {TYPES.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {loading && <p className="status-text">{t('loading')}</p>}
      {error && (
        <p className="status-text status-error">
          {t('error_prefix')} {error}
        </p>
      )}
      {!loading && !error && posts.length === 0 && (
        <p className="status-text">{t('no_articles')}</p>
      )}

      <div className="cards-grid articles-grid">
        {posts.map((p) => (
          <ArticleCard key={p.slug} post={p} />
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