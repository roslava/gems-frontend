import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { build } from 'esbuild';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { partitionMineralImages as partition } from '../src/mineralImages.js';

const partitionMineralImages = images => partition(images, 'https://cdn.example');

const ids = ['identification', 'safety', 'lore', 'esoteric'];
const illustration = (id, name = 'first') => ({
  type: `section:${id}`, path: `content/${id}-${name}.webp`,
  caption: { ru: 'Подпись', en: 'Caption' },
});

test('section images preserve order, captions and storage key without leaking into specimen gallery', () => {
  const specimen = { path: 'gallery/specimen.webp' };
  const images = { storage_key: 'agate_folder', gallery: [
    specimen, ...ids.map(id => illustration(id)), illustration('safety', 'second'),
    illustration('future-section'), { type: 'section:safety', path: '' },
  ] };
  const { gallery, sections } = partitionMineralImages(images);
  assert.deepEqual(gallery, [specimen]);
  for (const id of ids) {
    assert.match(sections[id][0].url, new RegExp(`entities/agate_folder/images/content/${id}-first.webp$`));
    assert.deepEqual(sections[id][0].caption, { ru: 'Подпись', en: 'Caption' });
  }
  assert.equal(sections.safety.length, 2);
  assert.match(sections.safety[1].url, /safety-second.webp$/);
  assert.equal(sections['future-section'].length, 1);
  assert.deepEqual(partitionMineralImages().gallery, []);
  assert.equal(Object.keys(partitionMineralImages().sections).length, 0);
});

test('all four sections share slider layout, localization, controls and empty behavior', async () => {
  const dir = await mkdtemp(join(process.cwd(), '.mineral-images-test-'));
  try {
    const outfile = join(dir, 'component.mjs');
    await build({ entryPoints: ['src/components/MineralSectionImages.jsx'], outfile,
      bundle: true, platform: 'node', format: 'esm', packages: 'external', jsx: 'automatic' });
    const { default: Component } = await import(outfile);
    const render = (slides, lang = 'en') => renderToStaticMarkup(React.createElement(Component, { slides, lang }));
    assert.equal(render([]), '');
    assert.equal(render(undefined), '');
    for (const id of ids) {
      const { sections } = partitionMineralImages({ storage_key: 'agate', gallery: [illustration(id), illustration(id, 'second')] });
      const markup = render(sections[id]);
      assert.match(markup, /class="mineral-section-images"/);
      assert.match(markup, /class="article-v2-slider"/);
      assert.match(markup, /class="article-v2-caption"[^>]*>Caption</);
      assert.match(markup, /Next image/);
      assert.match(render(sections[id], 'ru'), /Подпись/);
      assert.doesNotMatch(render(sections[id].slice(0, 1)), /article-v2-slider-controls/);
      assert.doesNotMatch(render([{ ...sections[id][0], caption: undefined }]), /figcaption/);
    }
  } finally { await rm(dir, { recursive: true, force: true }); }
});
