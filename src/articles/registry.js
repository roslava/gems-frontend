// Published articles in display order. Each load() imports a default React component.
// See README.md in this directory for the entry format.
export const articles = [{
  slug: 'why-stones-are-transparent',
  cover: 'https://images.openai.com/static-rsc-4/_4-WCIth5lJDuSZE22kXi1lMbZT5ykqtz5mhiYFfgRJAVwiB5qeUrcrH2EgR2HSiuXClOcUfQMCVz4A9gUAKGgJnUzXAAP7IjlJJE5ftFnuPfH-peQCiHxmTVhsLoar30TchJFB7YioAja4ECPsCAEisCMyBkLzGnZLwOHJYRbs?purpose=inline',
  i18n: {
    ru: {
      title: 'Почему одни камни прозрачные, а другие нет?',
      excerpt: 'Горный хрусталь прозрачен почти как стекло. Молочный кварц пропускает свет, но сквозь него трудно что-либо разглядеть. А яшма может быть совершенно непрозрачной. При этом основу всех трёх составляет одно и то же химическое соединение — диоксид кремния (SiO₂).',
      coverAlt: 'Кристалл горного хрусталя',
      tags: ['свет', 'прозрачность', 'кварц'],
    },
  },
  load: () => import('./stone-transparency/Content.jsx'),
}];

export function findArticle(slug, entries = articles) {
  return entries.find((article) => article.slug === slug) ?? null;
}

export function listArticles(lang, query = '', entries = articles) {
  const needle = query.trim().toLocaleLowerCase(lang);
  return entries.filter((article) => {
    const translation = article.i18n?.[lang];
    if (!translation?.title) return false;
    return !needle || [translation.title, translation.excerpt, ...(translation.tags || [])]
      .filter(Boolean).join(' ').toLocaleLowerCase(lang).includes(needle);
  });
}
