import { useEffect, useState } from 'react';
import { getMinerals, searchMinerals } from '../api.js';
import SpecimenCard from '../components/SpecimenCard.jsx';

const RARITIES = [
  { value: '', label: 'Любая редкость' },
  { value: 'common', label: 'Обычный' },
  { value: 'uncommon', label: 'Нечастый' },
  { value: 'rare', label: 'Редкий' },
  { value: 'very_rare', label: 'Очень редкий' },
];

export default function CatalogPage() {
  const [minerals, setMinerals] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [query, setQuery] = useState('');
  const [rarity, setRarity] = useState('');
  const [russianOnly, setRussianOnly] = useState(false);
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
          result = await searchMinerals(query.trim());
        } else {
          result = await getMinerals({
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
  }, [page, limit, rarity, russianOnly, query]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="section">
      <span className="section-label">Каталог</span>
      <h1 className="section-title">Образцы в базе</h1>
      <p className="section-desc">
        Рабочая витрина для проверки наполнения — тянет данные напрямую из Samotsvety API.
      </p>

      <div className="filters-row">
        <input
          className="search-input"
          type="text"
          placeholder="Поиск по названию, формуле, lore…"
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
          Только российские месторождения
        </label>
      </div>

      {loading && <p className="status-text">Загрузка…</p>}
      {error && (
        <p className="status-text status-error">
          Не удалось получить данные: {error}
        </p>
      )}
      {!loading && !error && minerals.length === 0 && (
        <p className="status-text">Ничего не найдено — база пуста или фильтр слишком строгий.</p>
      )}

      <div className="cards-grid">
        {minerals.map((m) => (
          <SpecimenCard key={m.slug} mineral={m} />
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
