import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { getPost } from '../api.js';
import { POST_TYPE_LABELS } from '../components/ArticleCard.jsx';

function formatDate(iso) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString('ru-RU', {
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
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getPost(slug)
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
  }, [slug]);

  const contentHtml = useMemo(() => {
    if (!post?.content_ru) return '';
    return DOMPurify.sanitize(marked.parse(post.content_ru));
  }, [post]);

  if (loading) {
    return (
      <div className="section">
        <p className="status-text">Загрузка…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="section">
        <p className="status-text status-error">Не удалось загрузить статью: {error}</p>
        <Link className="btn btn-outline" to="/articles">
          ← К статьям
        </Link>
      </div>
    );
  }

  if (!post) return null;

  const {
    type,
    title_ru: titleRu,
    excerpt_ru: excerptRu,
    cover_image: coverImage,
    published_at: publishedAt,
    author,
    tags = [],
    gem_slugs: gemSlugs = [],
  } = post;

  const date = formatDate(publishedAt);

  return (
    <div className="section article-page">
      <Link className="btn btn-ghost" to="/articles">
        ← К статьям
      </Link>

      <div className="mineral-header">
        <div>
          {type && <span className="section-label">{POST_TYPE_LABELS[type] || type}</span>}
          <h1 className="section-title">{titleRu}</h1>
          {(date || author) && (
            <p className="section-desc article-meta">
              {date}
              {date && author ? ' · ' : ''}
              {author}
            </p>
          )}
        </div>
      </div>

      {coverImage && <img className="mineral-hero-image" src={coverImage} alt={titleRu} />}

      {excerptRu && <p className="article-excerpt article-lead">{excerptRu}</p>}

      {contentHtml && (
        <div
          className="mineral-block article-content"
          // Контент из своего API, отрендерен через marked и очищен DOMPurify
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />
      )}

      {tags.length > 0 && (
        <div className="mineral-block">
          <h3>Теги</h3>
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
          <h3>Связанные камни</h3>
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