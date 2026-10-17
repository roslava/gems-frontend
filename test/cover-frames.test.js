import test from 'node:test';
import assert from 'node:assert/strict';
import { loadCoverFrames, parseCoverFrames, playbackFrames, startCoverPlayback } from '../src/coverFrames.js';
import { imageUrl } from '../src/gemV2.js';

test('mineral hero, thumbnail and gallery retain storage key distinct from slug', () => {
  const images = { storage_key: 'bruneau_jasper', hero: { path: 'hero.webp' }, thumbnail: { path: 'thumbnail.webp' }, gallery: [{ path: 'gallery/01.webp' }] };
  for (const image of [images.hero, images.thumbnail, ...images.gallery]) {
    assert.equal(imageUrl(images, image, 'https://cdn.example'), `https://cdn.example/entities/bruneau_jasper/images/${image.path}`);
  }
});
test('frame API preserves URL order, historical URLs, language and caches requests/errors', async () => {
  const original = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async url => {
    calls.push(url);
    const lang = new URL(url).searchParams.get('lang');
    return { ok: true, json: async () => ({ frames: lang === 'ru' ? [{ index: 9, url: 'https://samotsvety-cdn.example/z.webp' }, { index: 1, url: 'https://cdn.example/a.webp' }] : [] }) };
  };
  try {
    const [a,b] = await Promise.all([loadCoverFrames('test/cover', 'ru'), loadCoverFrames('test/cover', 'ru')]);
    assert.deepEqual(a, ['https://samotsvety-cdn.example/z.webp', 'https://cdn.example/a.webp']);
    assert.equal(a,b);
    assert.equal(calls.length,1);
    assert.match(calls[0], /test%2Fcover\/cover-frames\?lang=ru/);
    assert.deepEqual(await loadCoverFrames('test/cover','en'), []);
    assert.equal(calls.length,2);
    globalThis.fetch = async () => { throw new Error('offline'); };
    assert.deepEqual(await loadCoverFrames('offline','ru'), []);
    assert.deepEqual(parseCoverFrames({ frames: [] }), []);
    assert.throws(() => parseCoverFrames({ frames: [{url:'javascript:bad'}] }));
    assert.throws(() => parseCoverFrames({}));
  } finally { globalThis.fetch = original; }
});
function clock() {
  let callback;
  return { schedule(fn, delay) { assert.equal(delay, 700); callback = fn; return 1; }, cancel() { callback = null; }, async tick() { const fn = callback; callback = null; await fn?.(); }, get running() { return !!callback; } };
}
test('hover playback loops in order, stops and ignores late image loads', async () => {
  const c = clock(); const shown = []; const loaded = [];
  const stop = startCoverPlayback(['a','b','c'], url => shown.push(url), { ...c, load: async url => { loaded.push(url); } });
  assert.deepEqual(loaded, ['b']);
  await c.tick(); await c.tick(); await c.tick();
  assert.deepEqual(shown,['b','c','a']);
  stop(); await c.tick(); assert.deepEqual(shown,['b','c','a']);
  let resolve;
  const late = clock();
  const cancel = startCoverPlayback(['a','b'], url => shown.push(url), { ...late, load: () => new Promise(r => { resolve = r; }) });
  const tick = late.tick(); cancel(); resolve(); await tick;
  assert.deepEqual(shown,['b','c','a']);
});
test('single frame creates no timer; broken frames are skipped without freezing', async () => {
  let timers = 0;
  startCoverPlayback(['a'], () => {}, { schedule: () => timers++ });
  assert.equal(timers,0);
  const c = clock(); const shown = [];
  const stop = startCoverPlayback(['a','broken','c'], url => shown.push(url), { ...c, load: async url => { if(url === 'broken') throw new Error(); } });
  await c.tick(); await c.tick(); assert.deepEqual(shown,['c','a']); stop();
});

test('legacy Article V2 slides animate in saved order only when endpoint has no frames', () => {
  const post = { i18n: { media: { slides: [{url:'https://cdn.example/z.webp'}, {url:'https://cdn.example/a.webp'}] } } };
  assert.deepEqual(playbackFrames([], post), ['https://cdn.example/z.webp', 'https://cdn.example/a.webp']);
  const localized = ['https://cdn.example/ru.webp'];
  assert.equal(playbackFrames(localized, post), localized);
  assert.deepEqual(playbackFrames([], {}), []);
});
