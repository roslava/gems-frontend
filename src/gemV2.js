export function parseGemList(payload) {
  if (!payload || !Array.isArray(payload.data) || !Number.isInteger(payload.total) || payload.total !== payload.data.length) {
    throw new Error('Invalid V2 gem entity list response');
  }
  if (payload.data.some((item) => !item || typeof item.slug !== 'string' || typeof item.i18n !== 'object' || !item.scientific)) {
    throw new Error('Invalid V2 gem entity');
  }
  return payload.data;
}

export function parseGemEntity(payload) {
  if (!payload || typeof payload.slug !== 'string' || !payload.scientific || !payload.i18n) {
    throw new Error('Invalid V2 gem entity response');
  }
  return payload;
}

export function imageUrl(images, image, cdnBase = import.meta.env?.VITE_CDN_BASE_URL) {
  const key = images?.storage_key;
  const path = image?.path;
  if (!cdnBase || typeof key !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(key) || typeof path !== 'string') return null;
  if (path.startsWith('/') || path.includes('\\') || path.split('/').some((part) => !part || part === '.' || part === '..') || path.split('/')[0] === key) return null;
  try {
    const base = new URL(cdnBase);
    if (!['http:', 'https:'].includes(base.protocol) || base.username || base.password || base.search || base.hash) return null;
    const prefix = base.href.replace(/\/+$/, '');
    return `${prefix}/entities/${encodeURIComponent(key)}/images/${path.split('/').map(encodeURIComponent).join('/')}`;
  } catch { return null; }
}

export function localized(entity, lang) {
  const data = entity?.i18n?.[lang];
  return data && typeof data.name === 'string' && data.name.trim() ? data : null;
}

export function filterCatalog(items, { query = '', rarity = '', baseColor = '', russianOnly = false, letter = '', lang = 'ru' } = {}) {
  const needle = query.trim().toLocaleLowerCase();
  return items.filter((item) => {
    const s = item.scientific || {};
    const d = localized(item, lang);
    const text = [item.slug, s.chemical_formula, d?.name, ...(d?.synonyms || []), d?.color_description, d?.lore, d?.identification_tips, d?.safety_notes, d?.scientific_notes?.hardness, d?.scientific_notes?.composition].filter((v) => typeof v === 'string').join(' ').toLocaleLowerCase();
    return (!needle || text.includes(needle)) && (!rarity || s.rarity === rarity) && (!baseColor || s.base_color === baseColor) && (!russianOnly || item.localities?.some((loc) => loc.country_code === 'RU')) && (!letter || d?.name?.toLocaleUpperCase().startsWith(letter));
  }).sort((a, b) => (localized(a, lang)?.name || a.slug).localeCompare(localized(b, lang)?.name || b.slug, lang));
}

export function paginate(items, page, limit) {
  const totalPages = Math.max(1, Math.ceil(items.length / limit));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  return { items: items.slice((currentPage - 1) * limit, currentPage * limit), totalPages, currentPage };
}

export function formatRange(range) {
  const min = range?.min; const max = range?.max;
  if (!Number.isFinite(min) || !Number.isFinite(max) || min <= 0 || max <= 0 || max < min) return null;
  return min === max ? String(min) : `${min}–${max}`;
}

export function parseGemPage(payload) {
  if (!payload || !Array.isArray(payload.data) || !Number.isInteger(payload.total) || payload.total < payload.data.length ||
      !Number.isInteger(payload.page) || payload.page < 1 || !Number.isInteger(payload.limit) || payload.limit < 1 ||
      payload.data.length > payload.limit || !Array.isArray(payload.base_colors) ||
      payload.base_colors.some((color) => typeof color !== 'string')) {
    throw new Error('Invalid V2 gem entity page response');
  }
  payload.data.forEach(parseGemEntity);
  return payload;
}
