import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { getPost } from '../api.js';
import { POST_TYPE_KEYS } from '../components/ArticleCard.jsx';
import { useLang, pickI18n } from '../i18n/LangContext.jsx';

function formatDate(iso, locale) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return null;
  }
}

export default function ArticlePage() {
  const { slug } = useParams();
  const { lang, t } = useLang();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getPost(slug, { lang })
      .then((data) => {
        if (!cancelled) setPost(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug, lang]);

  const data = post ? pickI18n(post.i18n, lang) : {};

  const contentHtml = useMemo(() => {
    if (!data.content) return '';
    return DOMPurify.sanitize(marked.parse(data.content));
  }, [data.content]);

  if (loading) {
    return (
      <div className="section">
        <p className="status-text">{t('loading')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="section">
        <p className="status-text status-error">
          {t('article_load_error')} {error}
        </p>
        <Link className="btn btn-outline" to="/articles">
          {t('back_to_articles')}
        </Link>
      </div>
    );
  }

  if (!post) return null;

  const {
    type,
    cover_image: coverImage,
    published_at: publishedAt,
    author,
    tags = [],
    gem_slugs: gemSlugs = [],
  } = post;

  const date = formatDate(publishedAt, lang === 'en' ? 'en-US' : 'ru-RU');
  const typeLabel = type && POST_TYPE_KEYS[type] ? t(POST_TYPE_KEYS[type]) : type;

  return (
    <div className="section article-page">
      <Link className="btn btn-ghost" to="/articles">
        {t('back_to_articles')}
      </Link>

      <div className="mineral-header">
        <div>
          {typeLabel && <span className="section-label">{typeLabel}</span>}
          <h1 className="section-title">{data.title}</h1>
          {(date || author) && (
            <p className="section-desc article-meta">
              {date}
              {date && author ? ' · ' : ''}
              {author}
            </p>
          )}
        </div>
      </div>

      {coverImage && <img className="mineral-hero-image" src={coverImage} alt={data.title} />}

      {data.excerpt && <p className="article-excerpt article-lead">{data.excerpt}</p>}

      {contentHtml && (
        <div
          className="mineral-block article-content"
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />
      )}

      {tags.length > 0 && (
        <div className="mineral-block">
          <h3>{t('tags_title')}</h3>
          <div className="row">
            {tags.map((tag) => (
              <span key={tag} className="chip chip-active">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {gemSlugs.length > 0 && (
        <div className="mineral-block">
          <h3>{t('related_gems_title')}</h3>
          <div className="row">
            {gemSlugs.map((relSlug) => (
              <Link key={relSlug} to={`/minerals/${relSlug}`} className="chip chip-active">
                {relSlug}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}