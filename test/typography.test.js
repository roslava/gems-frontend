import test from 'node:test';
import assert from 'node:assert/strict';
import { keepWordsTogether } from '../src/typography.js';

test('Russian short words stay with the next word, including consecutive words', () => {
  assert.equal(keepWordsTogether('Камни и их свойства'), 'Камни и\u00a0их\u00a0свойства');
  assert.equal(keepWordsTogether('Что мы знаем о кварце?'), 'Что\u00a0мы\u00a0знаем о\u00a0кварце?');
  assert.equal(keepWordsTogether('В «мире» камней'), 'В\u00a0«мире» камней');
});
test('typography preserves paragraphs, English and already processed text', () => {
  assert.equal(keepWordsTogether('И\nновый абзац'), 'И\nновый абзац');
  assert.equal(keepWordsTogether('Stone and light', 'en'), 'Stone and light');
  const text = keepWordsTogether('Камни и их свойства');
  assert.equal(keepWordsTogether(text), text);
});

test('sentence dashes stay with the preceding word without joining paragraphs or ranges', () => {
  assert.equal(keepWordsTogether('Кварц — минерал'), 'Кварц\u00a0— минерал');
  assert.equal(keepWordsTogether('Камень – образец'), 'Камень\u00a0– образец');
  assert.equal(keepWordsTogether('Кварц\n— новый абзац'), 'Кварц\n— новый абзац');
  assert.equal(keepWordsTogether('6–7, 10-12'), '6–7, 10-12');
});
