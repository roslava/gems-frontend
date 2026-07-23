import { Link } from 'react-router-dom';

export const POST_TYPE_LABELS = {
  blog: 'Блог',
  guide: 'Гид',
  history: 'История',
  esoteric: 'Эзотерика',
  review: 'Обзор',
};

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

export default function ArticleCard({ post }) {
  const {
    slug,
    type,
    title_ru: titleRu,
    excerpt_ru: excerptRu,
    cover_image: coverImage,
    published_at: publishedAt,
    author,
    tags = [],
  } = post;

  const date = formatDate(publishedAt);

  return (
    <Link to={`/articles/${slug}`} className="specimen-card facet-card article-card">
      <div
        className="specimen-photo article-photo"
        style={coverImage ? { backgroundImage: `url(${coverImage})` } : undefined}
      >
        {!coverImage && 'нет обложки'}
      </div>
      <div className="specimen-body">
        <div className="specimen-name-row">
          <div className="specimen-name">{titleRu || slug}</div>
          {type && <span className="stock-badge">{POST_TYPE_LABELS[type] || type}</span>}
        </div>
        {(date || author) && (
          <div className="specimen-latin article-meta">
            {date}
            {date && author ? ' · ' : ''}
            {author}
          </div>
        )}
        {excerptRu && <p className="article-excerpt">{excerptRu}</p>}
        {tags.length > 0 && (
          <div className="row article-tags">
            {tags.slice(0, 4).map((tag) => (
              <span key={tag} className="chip chip-active">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}