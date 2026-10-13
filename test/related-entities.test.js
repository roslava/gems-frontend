import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { getRelatedGemEntities } from '../src/api.js';
import { relatedEntityLinks } from '../src/relatedEntities.js';

const originalFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = originalFetch; });

const entities = [
  { slug: 'red-jasper', type: 'rock', name_ru: 'Яшма красная', name_en: 'Red Jasper', direction: 'reverse' },
  { slug: 'landscape-jasper', type: 'rock', name_ru: 'Яшма пейзажная', name_en: 'Landscape Jasper', direction: 'direct' },
];

test('localized links keep API order, direction, and catalog routes', () => {
  const ru = relatedEntityLinks(entities, 'ru', 'current-stone');
  const en = relatedEntityLinks(entities, 'en', 'current-stone');
  assert.deepEqual(ru.map(({ label }) => label), ['Яшма красная', 'Яшма пейзажная']);
  assert.deepEqual(en.map(({ label }) => label), ['Red Jasper', 'Landscape Jasper']);
  assert.deepEqual(ru.map(({ href }) => href), ['/minerals/red-jasper', '/minerals/landscape-jasper']);
  assert.deepEqual(ru.map(({ direction }) => direction), ['reverse', 'direct']);
});

test('missing translation is explicitly marked', () => {
  const names = [
    { slug: 'one', name_ru: '  ', name_en: 'One', direction: 'direct' },
    { slug: 'two', name_ru: 'Два', name_en: '', direction: 'reverse' },
    { slug: 'three', name_ru: '', name_en: '', direction: 'direct' },
  ];
  assert.deepEqual(relatedEntityLinks(names, 'ru', 'current').map(({ label }) => label), ['one (перевод пока не готов)', 'Два', 'three (перевод пока не готов)']);
  assert.deepEqual(relatedEntityLinks(names, 'en', 'current').map(({ label }) => label), ['One', 'two (translation pending)', 'three (translation pending)']);
});

test('empty, duplicate, unavailable, and self links never produce a block', () => {
  assert.deepEqual(relatedEntityLinks([], 'ru', 'current'), []);
  assert.deepEqual(relatedEntityLinks(null, 'ru', 'current'), []);
  assert.deepEqual(relatedEntityLinks([{ slug: 'current' }, { slug: 'missing slug' }], 'ru', 'current'), []);
  assert.deepEqual(relatedEntityLinks([entities[0], entities[0]], 'ru', 'current-stone').map(({ slug }) => slug), ['red-jasper']);
});

test('V2 related endpoint is requested once, without cached or per-card requests', async () => {
  const calls = [];
  globalThis.fetch = async (url, options) => {
    calls.push({ url, options });
    return { ok: true, json: async () => ({ data: entities }) };
  };
  assert.deepEqual(await getRelatedGemEntities('current-stone'), entities);
  assert.equal(calls.length, 1);
  assert.equal(new URL(calls[0].url).pathname, '/api/v2/gem-entities/current-stone/related');
  assert.equal(calls[0].options.cache, 'no-store');
});

test('API errors reject the related request and allow the page to keep an empty list', async () => {
  globalThis.fetch = async () => ({ ok: false, status: 503 });
  await assert.rejects(getRelatedGemEntities('current-stone'), /503/);
  globalThis.fetch = async () => ({ ok: true, json: async () => ({ data: null }) });
  await assert.rejects(getRelatedGemEntities('current-stone'), /Некорректный ответ/);
});
