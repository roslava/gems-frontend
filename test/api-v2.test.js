import test from 'node:test';
import assert from 'node:assert/strict';
import { getGemEntities, getGemEntity } from '../src/api.js';

const gem = { slug: 'agate', type: 'gem_variety', scientific: {}, i18n: { ru: { name: 'Агат' }, en: { name: 'Agate' } }, localities: [], related_entities: [], sources: [] };

test('catalog and detail use public V2 routes', async () => {
  const original = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url) => {
    calls.push(new URL(url).pathname);
    return { ok: true, json: async () => calls.length === 1 ? { data: [gem], total: 1 } : calls.length === 2 ? gem : { data: [], total: 0 } };
  };
  try {
    assert.deepEqual(await getGemEntities(), [gem]);
    assert.equal((await getGemEntity('agate')).slug, 'agate');
    assert.deepEqual(calls, ['/api/v2/gem-entities', '/api/v2/gem-entities/agate']);
  } finally { globalThis.fetch = original; }
});

test('V2 failure is surfaced without V1 fallback', async () => {
  const original = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url) => { calls.push(url); return { ok: false, status: 503 }; };
  try { await assert.rejects(getGemEntities(), /503/); assert.equal(calls.length, 1); }
  finally { globalThis.fetch = original; }
});
