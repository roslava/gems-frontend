/** @typedef {{slug: string, type: string, name_ru?: string, name_en?: string, direction: 'direct' | 'reverse' | 'both'}} RelatedGemEntity */

/** Keeps the API order while preparing localized links for the catalog route. */
export function relatedEntityLinks(entities, lang, currentSlug) {
  if (!Array.isArray(entities)) return [];
  const seen = new Set();
  return entities.flatMap((entity) => {
    const slug = entity?.slug;
    if (typeof slug !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug === currentSlug || seen.has(slug)) return [];
    seen.add(slug);
    const ru = typeof entity.name_ru === 'string' ? entity.name_ru.trim() : '';
    const en = typeof entity.name_en === 'string' ? entity.name_en.trim() : '';
    const label = (lang === 'en' ? en || ru : ru || en) || slug;
    return [{ ...entity, label, href: `/minerals/${encodeURIComponent(slug)}` }];
  });
}
