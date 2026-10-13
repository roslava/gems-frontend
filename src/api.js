import { parseGemList, parseGemPage, parseGemEntity } from './gemV2.js';

const API_BASE = (import.meta.env?.VITE_API_BASE_URL || '').replace(/\/+$/, '');

async function request(path, params = {}, { version = 'v1', signal, cache } = {}) {
  const url = new URL(`${API_BASE}/api/${version}${path}`, globalThis.location?.origin || 'http://localhost:5173');
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, value);
  });
  let res;
  try { res = await fetch(url.toString(), { signal, cache }); }
  catch (err) {
    if (err.name === 'AbortError') throw err;
    throw new Error('API недоступен. Проверьте подключение к серверу.');
  }
  if (!res.ok) {
    const error = new Error(`API вернул ошибку ${res.status}`);
    error.status = res.status;
    throw error;
  }
  return res.json();
}

export async function getGemEntities({ signal } = {}) {
  return parseGemList(await request('/gem-entities', {}, { version: 'v2', signal }));
}

export async function getGemEntity(slug, { signal } = {}) {
  return parseGemEntity(await request(`/gem-entities/${encodeURIComponent(slug)}`, {}, { version: 'v2', signal }));
}

export async function getRelatedGemEntities(slug, { signal } = {}) {
  const result = await request(`/gem-entities/${encodeURIComponent(slug)}/related`, {}, { version: 'v2', signal, cache: 'no-store' });
  if (!Array.isArray(result?.data)) throw new Error('Некорректный ответ API связанных камней');
  return result.data;
}

// Articles retain their independent V1 contract.
export function getPosts({ lang = 'ru', page = 1, limit = 20, signal, ...filters } = {}) {
  return request('/posts', { lang, page, limit, published: true, ...filters }, { signal });
}
export function getPost(slug, { lang = 'ru' } = {}) { return request(`/posts/${encodeURIComponent(slug)}`, { lang }); }
export function searchPosts(q, { lang = 'ru', limit = 20, signal } = {}) { return request('/search/posts', { q, lang, limit }, { signal }); }

export async function getGemPage({ page = 1, limit = 20, lang = 'ru', query = '', rarity = '', baseColor = '', russianOnly = false, letter = '', signal } = {}) {
  return parseGemPage(await request('/gem-entities', {
    page, limit, lang, q: query, rarity, base_color: baseColor,
    country_code: russianOnly ? 'RU' : '', letter,
  }, { version: 'v2', signal }));
}
