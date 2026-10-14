import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getPost } from '../api.js';
import { articleSlides, articleTranslation } from '../articleV2.js';
import { renderArticleMarkdown } from '../articleMarkdown.js';
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
  return (
    <article className="section article-v2-page">
      <ArticleSlider key={post.slug} slides={articleSlides(post)} lang={lang} />
      <div className="article-v2-copy">
        <h1>{data.title}</h1>
        <p className="article-v2-lead">{data.excerpt}</p>
        <div className="article-v2-content" dangerouslySetInnerHTML={{ __html: contentHtml }} />
        <ArticleAuthor key={post.slug} name={post.author} avatarUrl={post.i18n?.media?.author_avatar_url} />
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
  const contentHtml = useMemo(() => renderArticleMarkdown(data?.content), [data?.content]);

  if (loading) return <ArticleFeedback kind="loading" t={t} />;
  if (error?.status === 404 || !post && !error) return <ArticleFeedback kind="not_found" t={t} />;
  if (error) return <ArticleFeedback kind="error" error={error} t={t} />;
  if (!data) return <ArticleFeedback kind="translation" t={t} />;

  return <ArticleBody post={post} data={data} lang={lang} contentHtml={contentHtml} />;
}
