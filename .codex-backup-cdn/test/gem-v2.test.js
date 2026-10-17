import test from 'node:test';
import assert from 'node:assert/strict';
import { parseGemList, parseGemEntity, imageUrl, filterCatalog, paginate, formatRange, localized } from '../src/gemV2.js';
import { enumLabel } from '../src/gemLabels.js';
import { relatedEntityLinks } from '../src/relatedEntities.js';

const make = (slug, name, extra = {}) => ({ slug, type: 'mineral', scientific: {}, i18n: { ru: { name }, en: { name: slug } }, localities: [], ...extra });

test('V2 list and detail contract rejects malformed payloads', () => {
  const gem = make('quartz', 'Кварц');
  assert.deepEqual(parseGemList({ data: [gem], total: 1 }), [gem]);
  assert.throws(() => parseGemList({ data: [gem], total: 7 }));
  assert.throws(() => parseGemList([gem]));
  assert.equal(parseGemEntity(gem), gem);
  assert.throws(() => parseGemEntity({ slug: 'quartz' }));
});

test('CDN URL uses storage_key and encoded relative path safely', () => {
  const images = { storage_key: 'different_key' };
  assert.equal(imageUrl(images, { path: 'gallery/specimen 01.webp' }, 'https://cdn.example.org/root///'), 'https://cdn.example.org/root/different_key/gallery/specimen%2001.webp');
  assert.equal(imageUrl(images, { path: '../secret' }, 'https://cdn.example.org'), null);
  assert.equal(imageUrl(images, { path: '/hero.webp' }, 'https://cdn.example.org'), null);
  assert.equal(imageUrl(images, { path: 'different_key/hero.webp' }, 'https://cdn.example.org'), null);
  assert.equal(imageUrl(images, { path: 'hero.webp' }, ''), null);
  assert.equal(imageUrl(images, { path: 'hero.webp' }, 'javascript:alert(1)'), null);
});

test('search combines all filters and uses chosen language', () => {
  const items = [
    make('opal', 'Опал', { scientific: { rarity: 'rare', base_color: 'blue', chemical_formula: 'SiO2' }, localities: [{ country_code: 'RU' }], i18n: { ru: { name: 'Опал', synonyms: ['огненный'], lore: 'история' }, en: { name: 'Opal', color_description: 'blue flash' } } }),
    make('quartz', 'Кварц', { scientific: { rarity: 'rare', base_color: 'red' }, localities: [{ country_code: 'RU' }] }),
    make('opal-foreign', 'Опал зарубежный', { scientific: { rarity: 'rare', base_color: 'blue' } }),
  ];
  assert.deepEqual(filterCatalog(items, { query: 'огненный', rarity: 'rare', baseColor: 'blue', russianOnly: true, letter: 'О', lang: 'ru' }).map((v) => v.slug), ['opal']);
  assert.deepEqual(filterCatalog(items, { query: 'SiO2', baseColor: 'red' }), []);
  assert.deepEqual(filterCatalog(items, { query: 'blue flash', lang: 'en' }).map((v) => v.slug), ['opal']);
});

test('localized sorting happens before pagination', () => {
  const sorted = filterCatalog([make('z', 'Яшма'), make('a', 'Агат'), make('b', 'Берилл')], { lang: 'ru' });
  assert.deepEqual(paginate(sorted, 2, 2), { items: [sorted[2]], totalPages: 2, currentPage: 2 });
  assert.deepEqual(paginate([], 3, 20), { items: [], totalPages: 1, currentPage: 1 });
});

test('empty scientific data does not produce placeholder ranges or raw enums', () => {
  assert.equal(formatRange(null), null);
  assert.equal(formatRange({ min: 0, max: 0 }), null);
  assert.equal(formatRange({ min: 5, max: 5 }), '5');
  assert.equal(formatRange({ min: 2, max: 3.5 }), '2–3.5');
  assert.equal(enumLabel('luster', ['vitreous', 'pearly'], 'ru'), 'Стеклянный, Перламутровый');
  assert.equal(enumLabel('luster', 'invalid', 'en'), null);
});

test('localization and related links use chosen language', () => {
  assert.equal(localized(make('a', 'Агат'), 'ru').name, 'Агат');
  assert.equal(localized({ i18n: { ru: { name: 'Агат' } } }, 'en'), null);
  assert.deepEqual(relatedEntityLinks([{ slug: 'agate', name_ru: 'Агат', name_en: 'Agate', direction: 'reverse' }], 'en', 'opal').map((x) => x.label), ['Agate']);
});
