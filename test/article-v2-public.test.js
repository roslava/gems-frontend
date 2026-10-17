import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server.js';
import { build } from 'esbuild';
import { marked } from 'marked';
import { getPost } from '../src/api.js';
import { articleSlides, articleTranslation, nextSlideIndex, slideText } from '../src/articleV2.js';
import { MARKDOWN_TAGS, renderArticleMarkdown } from '../src/articleMarkdown.js';

const slideA = {
  id: '64ac5e2c-943d-4b5c-b942-a80deee45a23',
  url: 'https://cdn.example/articles/question/slides/a.webp',
  caption: { ru: 'Первый', en: 'First' },
  alt: { ru: 'Кварц', en: 'Quartz' },
};
const slideB = {
  id: '71ac5e2c-943d-4b5c-b942-a80deee45a23',
  url: 'https://cdn.example/articles/question/slides/b.webp',
  caption: { ru: 'Второй', en: 'Second' },
  alt: { ru: 'Кристалл', en: 'Crystal' },
};
const post = {
  id: '7fd73b21-8c67-4d0f-a62e-f27afcb7c280',
  slug: 'question', type: 'guide',
  i18n: {
    ru: { title: 'Почему кварц прозрачный?', excerpt: 'Лид', content: '## Ответ\n\n**Кварц** прозрачен.' },
    en: { title: 'Why is quartz transparent?', excerpt: 'Lead', content: '## Answer\n\n**Quartz** is transparent.' },
    media: { schema_version: 2, slides: [slideA, slideB] },
  },
  author: 'Редакция', is_published: true,
  cover_image: 'https://legacy.example/cover.webp',
  content_blocks: [{ type: 'paragraph', i18n: { ru: { text: 'Legacy block' } } }],
};

test('Article V2 arrives from the public detail API and 404 stays a 404', async () => {
  const original = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => { calls++; return { ok: true, json: async () => post }; };
  try {
    const result = await getPost('question');
    assert.equal(result.i18n.media.schema_version, 2);
    assert.equal(articleSlides(result)[0].url, slideA.url);
    assert.equal(calls, 1);
    globalThis.fetch = async () => ({ ok: false, status: 404 });
    await assert.rejects(getPost('missing'), (error) => error.status === 404);
  } finally { globalThis.fetch = original; }
});

test('shared slide order, localized text, missing caption and no language fallback', () => {
  assert.equal(articleSlides(post), post.i18n.media.slides);
  assert.deepEqual(articleSlides(post).map((slide) => slide.id), [slideA.id, slideB.id]);
  assert.deepEqual(slideText(slideA, 'en'), { caption: 'First', alt: 'Quartz' });
  assert.deepEqual(slideText(slideA, 'ru'), { caption: 'Первый', alt: 'Кварц' });
  assert.deepEqual(slideText({ ...slideA, caption: undefined }, 'en'), { caption: '', alt: 'Quartz' });
  assert.equal(articleTranslation(post.i18n.en).title, 'Why is quartz transparent?');
  assert.equal(articleTranslation({ title: '', excerpt: '', content: '' }), null);
  assert.equal(nextSlideIndex(0, 2, 1), 1);
  assert.equal(nextSlideIndex(1, 2, 1), 1);
  assert.equal(nextSlideIndex(0, 2, -1), 0);
});

test('Article V2 components render single/multiple slides, card and author', async () => {
  const dir = await mkdtemp(join(process.cwd(), '.article-v2-test-'));
  try {
    const entries = [
      ['slider', 'src/components/ArticleSlider.jsx'],
      ['page', 'src/pages/ArticlePage.jsx'],
    ];
    const modules = {};
    for (const [name, entry] of entries) {
      const outfile = join(dir, name + '.mjs');
      await build({ entryPoints: [entry], outfile, bundle: true, platform: 'node', format: 'esm', packages: 'external', jsx: 'automatic' });
      modules[name] = await import(outfile);
    }
    const cardFile = join(dir, 'card.mjs');
    await build({
      stdin: {
        contents: "export { default as ArticleCard } from './src/components/ArticleCard.jsx'; export { LangProvider } from './src/i18n/LangContext.jsx';",
        resolveDir: process.cwd(),
        sourcefile: 'article-v2-card-test.jsx',
        loader: 'jsx',
      },
      outfile: cardFile, bundle: true, platform: 'node', format: 'esm', packages: 'external', jsx: 'automatic',
    });
    modules.card = await import(cardFile);
    const renderSlider = (slides, lang) => renderToStaticMarkup(React.createElement(modules.slider.default, { slides, lang }));
    const single = renderSlider([slideA], 'ru');
    assert.match(single, /src="https:\/\/cdn.example\/articles\/question\/slides\/a.webp"/);
    assert.match(single, /alt="Кварц"/);
    assert.match(single, /Первый/);
    assert.doesNotMatch(single, /article-v2-slider-controls|Предыдущее изображение|1 \/ 1/);
    const multi = renderSlider([slideA, slideB], 'en');
    assert.match(multi, /First/);
    assert.match(multi, /alt="Quartz"/);
    assert.match(multi, /Previous image|Next image/);
    assert.match(multi, /1 \/ 2/);
    assert.doesNotMatch(multi, /alt="Кварц"/);
    assert.doesNotMatch(renderSlider([{ ...slideA, caption: {} }], 'en'), /<figcaption/);
    const imageError = renderToStaticMarkup(React.createElement(modules.slider.ArticleSlideImage, { slide: slideA, lang: 'en', failed: true }));
    assert.match(imageError, /Image could not be loaded/);
    assert.doesNotMatch(imageError, /<img/);
    const card = renderToStaticMarkup(
      React.createElement(StaticRouter, { location: '/articles' },
        React.createElement(modules.card.LangProvider, null,
          React.createElement(modules.card.ArticleCard, { post }))),
    );
    assert.match(card, /legacy.example\/cover.webp/);
    const legacyCard = renderToStaticMarkup(
      React.createElement(StaticRouter, { location: '/articles' },
        React.createElement(modules.card.LangProvider, null,
          React.createElement(modules.card.ArticleCard, { post: { ...post, cover_image: undefined } }))),
    );
    assert.match(legacyCard, /slides\/a.webp/);
    assert.doesNotMatch(legacyCard, /slides\/b.webp/);

    assert.match(card, /Почему кварц прозрачный\?/);
    assert.match(card, /Лид/);
    assert.match(card, /href="\/articles\/question"/);
    assert.doesNotMatch(card, /Legacy block|slides\/b.webp/);
    const noAvatar = renderToStaticMarkup(React.createElement(modules.page.ArticleAuthor, { name: 'Редакция' }));
    assert.match(noAvatar, /Редакция/);
    assert.doesNotMatch(noAvatar, /<img/);
    const avatar = renderToStaticMarkup(React.createElement(modules.page.ArticleAuthor, { name: 'Редакция', avatarUrl: 'https://cdn.example/avatar.webp' }));
    assert.match(avatar, /avatar.webp/);
    assert.match(avatar, /alt=""/);
    const body = renderToStaticMarkup(React.createElement(modules.page.ArticleBody, {
      post, data: post.i18n.ru, lang: 'ru', contentHtml: '<h2>Ответ</h2><p>Текст</p>',
    }));
    assert.ok(body.indexOf('article-v2-image-frame') < body.indexOf('<h1>'));
    assert.ok(body.indexOf('<h1>') < body.indexOf('article-v2-lead'));
    assert.ok(body.indexOf('article-v2-lead') < body.indexOf('article-v2-content'));
    assert.ok(body.indexOf('article-v2-content') < body.indexOf('article-v2-author'));
    assert.doesNotMatch(body, /Legacy block|article-tags|gem_slugs/);
    const t = (key) => ({ article_not_found: 'Статья не найдена', back_to_articles: 'К статьям', not_translated: 'Перевода нет', article_load_error: 'Ошибка:' })[key];
    const notFound = renderToStaticMarkup(React.createElement(StaticRouter, { location: '/articles/missing' },
      React.createElement(modules.page.ArticleFeedback, { kind: 'not_found', t })));
    assert.match(notFound, /Статья не найдена/);
    assert.match(notFound, /href="\/articles"/);
    const failed = renderToStaticMarkup(React.createElement(StaticRouter, { location: '/articles/question' },
      React.createElement(modules.page.ArticleFeedback, { kind: 'error', error: new Error('503'), t })));
    assert.match(failed, /Ошибка: 503/);
    assert.match(renderToStaticMarkup(React.createElement(StaticRouter, { location: '/articles/question' },
      React.createElement(modules.page.ArticleFeedback, { kind: 'translation', t }))), /Перевода нет/);
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test('Markdown syntax and responsive Article V2 layout are available', async () => {
  const html = marked.parse('## Heading\n\nA **bold** and *italic* [link](https://example.com).\n\n> Quote\n\n- One\n- Two');
  assert.match(html, /<h2>Heading<\/h2>/);
  assert.match(html, /<strong>bold<\/strong>/);
  assert.match(html, /<em>italic<\/em>/);
  assert.match(html, /<a href="https:\/\/example.com">link<\/a>/);
  assert.match(html, /<blockquote>/);
  assert.match(html, /<li>One<\/li>/);
  let inspected = false;
  const rendered = renderArticleMarkdown('## Heading\n\n<script>alert(1)</script> [bad](javascript:alert(1))', {
    sanitize(raw, options) {
      inspected = true;
      assert.match(raw, /<script>/);
      assert.ok(options.ALLOWED_TAGS.includes('h2'));
      assert.ok(options.ALLOWED_TAGS.includes('a'));
      assert.ok(!options.ALLOWED_TAGS.includes('script'));
      assert.ok(options.ALLOWED_TAGS.includes('img'));
      assert.deepEqual(options.ALLOWED_ATTR, ['href', 'title', 'src', 'alt']);
      return '<h2>Heading</h2>';
    },
  });
  assert.equal(inspected, true);
  assert.equal(rendered, '<h2>Heading</h2>');
  assert.ok(MARKDOWN_TAGS.includes('blockquote'));
  const css = await readFile('src/styles.css', 'utf8');
  assert.match(css, /\.article-v2-image-frame\s*\{[^}]*aspect-ratio:\s*16\s*\/\s*9/s);
  assert.match(css, /\.article-v2-image-frame img\s*\{[^}]*object-fit:\s*contain/s);
  assert.match(css, /@media\s*\(max-width:\s*600px\)\s*\{[^}]*\.article-v2-page/s);
});
