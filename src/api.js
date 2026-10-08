// Тонкий слой поверх fetch для Samotsvety API.
// Базовый адрес задаётся через VITE_API_BASE_URL (см. .env.example).

const API_BASE = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8080';

async function request(path, params = {}, { version = 'v1', cache } = {}) {
  const url = new URL(`${API_BASE}/api/${version}${path}`);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value);
    }
  });

  let res;
  try {
    res = await fetch(url.toString(), cache ? { cache } : undefined);
  } catch (err) {
    throw new Error(
      `Не удалось подключиться к API по адресу ${API_BASE}. Проверьте, что сервер запущен и CORS настроен.`
    );
  }

  if (!res.ok) {
    throw new Error(`API вернул ошибку ${res.status} для ${path}`);
  }

  return res.json();
}

export function getMinerals({ lang = 'ru', view = 'normal', page = 1, limit = 20, ...filters } = {}) {
  return request('/minerals', { lang, view, page, limit, ...filters });
}

export function getMineral(slug, { lang = 'ru', view = 'normal' } = {}) {
  return request(`/minerals/${slug}`, { lang, view });
}

export async function getRelatedGemEntities(slug) {
  const result = await request(`/gem-entities/${encodeURIComponent(slug)}/related`, {}, { version: 'v2', cache: 'no-store' });
  if (!Array.isArray(result?.data)) throw new Error('Некорректный ответ API связанных камней');
  return result.data;
}

export function searchMinerals(q, { lang = 'ru' } = {}) {
  return request('/search', { q, lang });
}

export function getFilters({ lang = 'ru' } = {}) {
  return request('/filters', { lang });
}

// === Статьи (posts) ===

export function getPosts({ lang = 'ru', page = 1, limit = 20, ...filters } = {}) {
  return request('/posts', { lang, page, limit, published: true, ...filters });
}

export function getPost(slug, { lang = 'ru' } = {}) {
  return request(`/posts/${slug}`, { lang });
}

export function searchPosts(q, { lang = 'ru', limit = 20 } = {}) {
  return request('/search/posts', { q, lang, limit });
}
