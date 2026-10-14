import test from 'node:test';
import assert from 'node:assert/strict';
import { getGemPage } from '../src/api.js';
import { parseGemPage } from '../src/gemV2.js';

const entity = { slug: 'agate', scientific: {}, i18n: { ru: { name: 'Агат' } } };
test('catalog pages preserve total beyond page length and reject the old unpaged contract', () => {
  const page = { data: [entity], total: 71, page: 2, limit: 20, base_colors: ['blue'] };
  assert.equal(parseGemPage(page), page);
  assert.throws(() => parseGemPage({ data: [entity], total: 71 }));
  assert.throws(() => parseGemPage({ ...page, total: 0 }));
  assert.throws(() => parseGemPage({ ...page, limit: 0 }));
});
test('catalog sends pagination and combined filters; requests can be aborted', async () => {
  const previous = globalThis.fetch;
  const controller = new AbortController();
  const calls = [];
  globalThis.fetch = async (url, options) => {
    calls.push({ url: new URL(url), options });
    return { ok: true, json: async () => ({ data: [], total: 0, page: 1, limit: 20, base_colors: [] }) };
  };
  try {
    await getGemPage({ page: 2, lang: 'en', query: 'blue flash', rarity: 'rare', baseColor: 'blue', russianOnly: true, letter: 'O', signal: controller.signal });
    assert.deepEqual(Object.fromEntries(calls[0].url.searchParams), { page: '2', limit: '20', lang: 'en', q: 'blue flash', rarity: 'rare', base_color: 'blue', country_code: 'RU', letter: 'O' });
    assert.equal(calls[0].options.signal, controller.signal);
    for (const call of calls) {
      assert.equal(call.options.signal, controller.signal);
      assert.equal(call.url.searchParams.has('signal'), false);
    }
  } finally { globalThis.fetch = previous; }
});
