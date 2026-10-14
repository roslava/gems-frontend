import test from 'node:test';
import assert from 'node:assert/strict';
import { articles, findArticle, listArticles } from '../src/articles/registry.js';
const sample = [
  { slug: 'quartz', i18n: { ru: { title: 'Кварц', excerpt: 'Горный хрусталь', tags: ['кристаллы'] }, en: { title: 'Quartz' } } },
  { slug: 'garnet', i18n: { ru: { title: 'Гранат' } } },
];
test('unpublished and removed article URLs do not resolve or call the API', () => {
  assert.ok(articles.every((article) => typeof article.load === 'function'));
  assert.equal(new Set(articles.map((article) => article.slug)).size, articles.length);
  assert.equal(findArticle('what-is-a-minerals'), null);
  assert.equal(findArticle('missing', sample), null);
  assert.equal(findArticle('quartz', sample), sample[0]);
});
test('local listing preserves editorial order and never substitutes another language', () => {
  assert.deepEqual(listArticles('ru', '', sample), sample);
  assert.deepEqual(listArticles('en', '', sample), [sample[0]]);
  assert.deepEqual(listArticles('en', 'гранат', sample), []);
});
test('local search matches title, excerpt and tags without loading article bodies', () => {
  assert.deepEqual(listArticles('ru', '  ХРУСТАЛЬ ', sample), [sample[0]]);
  assert.deepEqual(listArticles('ru', 'кристаллы', sample), [sample[0]]);
  assert.deepEqual(listArticles('ru', 'гранат', sample), [sample[1]]);
});
