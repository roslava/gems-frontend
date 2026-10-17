import { useCoverFrames, loadCoverImage } from '../useCoverFrames.js';
import { keepWordsTogether, keepHtmlWordsTogether } from '../typography.js';
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getPost } from '../api.js';
import { articleSlides, articleTranslation } from '../articleV2.js';
import { renderArticleMarkdown } from '../articleMarkdown.js';
import ArticleRelatedGems from '../components/ArticleRelatedGems.jsx';
import ArticleSlider from '../components/ArticleSlider.jsx';
import { pickI18n, useLang } from '../i18n/LangContext.jsx';

export function ArticleAuthor({ name, avatarUrl }) {
  const [imageFailed, setImageFailed] = useState(false);
  if (!name) return null;
  return (
    <footer className="article-v2-author">
      {avatarUrl && !imageFailed && <img src={avatarUrl} alt="" onError={() => setImageFailed(true)} />}
      <span>{name}</span>
    </footer>
  );
}

export function ArticleBody({ post, data, lang, contentHtml }) {
  const frames = useCoverFrames(post.slug, lang);
  const [ready, setReady] = useState(null);
  const [failed, setFailed] = useState(null);
  const first = frames[0];
  useEffect(() => {
    let disposed = false;
    if (first) loadCoverImage(first).then(() => { if (!disposed) setReady(first); }).catch(() => {});
    return () => { disposed = true; };
  }, [first]);
  const cover = ready === first ? first : post.cover_image;
  return (
    <article className="section article-v2-page">
      {cover && cover !== failed
        ? <div className="article-v2-image-frame"><img src={cover} alt={data.title} onError={() => setFailed(cover)} /></div>
        : <ArticleSlider key={post.slug} slides={articleSlides(post)} lang={lang} />}
      <div className="article-v2-copy">
        <h1>{keepWordsTogether(data.title, lang)}</h1>
        <p className="article-v2-lead">{keepWordsTogether(data.excerpt, lang)}</p>
        <div className="article-v2-content" dangerouslySetInnerHTML={{ __html: contentHtml }} />
        <ArticleAuthor key={post.slug} name={post.author} avatarUrl={post.i18n?.media?.author_avatar_url} />
        <ArticleRelatedGems key={post.slug + JSON.stringify(post.gem_slugs || [])} slugs={post.gem_slugs} lang={lang} />
      </div>
    </article>
  );
}

export function ArticleFeedback({ kind, error, t }) {
  const message = kind === 'loading' ? t('loading')
    : kind === 'not_found' ? t('article_not_found')
      : kind === 'translation' ? t('not_translated')
        : t('article_load_error') + ' ' + (error?.message || '');
  return (
    <div className="section">
      <p className={'status-text' + (kind === 'error' ? ' status-error' : '')}>{message}</p>
      {kind !== 'loading' && <Link to="/articles">{t('back_to_articles')}</Link>}
    </div>
  );
}

export default function ArticlePage() {
  const { slug } = useParams();
  const { lang, t } = useLang();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    setPost(null);
    setLoading(true);
    setError(null);
    getPost(slug, { signal: controller.signal })
      .then((data) => { if (!controller.signal.aborted) setPost(data); })
      .catch((err) => { if (!controller.signal.aborted) setError(err); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [slug]);

  const data = articleTranslation(post ? pickI18n(post.i18n, lang) : null);
  const contentHtml = useMemo(() => keepHtmlWordsTogether(renderArticleMarkdown(data?.content), lang), [data?.content, lang]);

  if (loading) return <ArticleFeedback kind="loading" t={t} />;
  if (error?.status === 404 || !post && !error) return <ArticleFeedback kind="not_found" t={t} />;
  if (error) return <ArticleFeedback kind="error" error={error} t={t} />;
  if (!data) return <ArticleFeedback kind="translation" t={t} />;

  return <ArticleBody key={JSON.stringify([post.slug, lang])} post={post} data={data} lang={lang} contentHtml={contentHtml} />;
}
