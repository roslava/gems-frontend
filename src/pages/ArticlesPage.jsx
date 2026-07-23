import { useEffect, useState } from 'react';
import { getPosts, searchPosts } from '../api.js';
import ArticleCard, { POST_TYPE_LABELS } from '../components/ArticleCard.jsx';

const TYPES = [
  { value: '', label: 'Все типы' },
  ...Object.entries(POST_TYPE_LABELS).map(([value, label]) => ({ value, label })),
];

export default function ArticlesPage() {
  const [posts, setPosts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [query, setQuery] = useState('');
  const [type, setType] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const load = async () => {
      try {
        let result;
        if (query.trim()) {
          result = await searchPosts(query.trim());
        } else {
          result = await getPosts({
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
  }, [page, limit, type, query]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="section">
      <span className="section-label">Статьи</span>
      <h1 className="section-title">Блог и гиды о камнях</h1>
      <p className="section-desc">
        Истории, гиды по огранке и эзотерические заметки — тянутся напрямую из Samotsvety API.
      </p>

      <div className="filters-row">
        <input
          className="search-input"
          type="text"
          placeholder="Поиск по статьям…"
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
          {TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {loading && <p className="status-text">Загрузка…</p>}
      {error && (
        <p className="status-text status-error">Не удалось получить данные: {error}</p>
      )}
      {!loading && !error && posts.length === 0 && (
        <p className="status-text">Статей пока нет — база пуста или фильтр слишком строгий.</p>
      )}

      <div className="cards-grid articles-grid">
        {posts.map((p) => (
          <ArticleCard key={p.slug} post={p} />
        ))}
      </div>

      {!query && totalPages > 1 && (
        <div className="pagination">
          <button className="btn btn-outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            ← Назад
          </button>
          <span className="page-info">
            Стр. {page} из {totalPages}
          </span>
          <button
            className="btn btn-outline"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Вперёд →
          </button>
        </div>
      )}
    </div>
  );
}