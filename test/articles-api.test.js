import test from 'node:test';
import assert from 'node:assert/strict';
import { getPosts, getPost, searchPosts } from '../src/api.js';

test('articles use API for published listing, detail and search with cancellation', async () => {
  const original = globalThis.fetch;
  const calls = [];
  const signal = new AbortController().signal;
  const payload = { data: [], total: 0 };
  globalThis.fetch = async (url, options) => {
    calls.push({ url: new URL(url), options });
    return { ok: true, json: async () => payload };
  };
  try {
    assert.equal(await getPosts({ lang: 'en', page: 2, limit: 12, signal }), payload);
    await getPost('stone/name', { lang: 'en', signal });
    await searchPosts('quartz', { lang: 'en', signal });
    assert.deepEqual(calls.map(c => c.url.pathname), ['/api/v1/posts', '/api/v1/posts/stone%2Fname', '/api/v1/search/posts']);
    assert.equal(calls[0].url.searchParams.get('published'), 'true');
    assert.equal(calls[0].url.searchParams.get('page'), '2');
    assert.equal(calls[2].url.searchParams.get('q'), 'quartz');
    for (const call of calls) {
      assert.equal(call.url.searchParams.get('lang'), 'en');
      assert.equal(call.options.signal, signal);
    }
  } finally { globalThis.fetch = original; }
});

test('missing API article is surfaced without local fallback', async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async () => ({ ok: false, status: 404 });
  try { await assert.rejects(getPost('why-stones-are-transparent'), err => err.status === 404); }
  finally { globalThis.fetch = original; }
});
