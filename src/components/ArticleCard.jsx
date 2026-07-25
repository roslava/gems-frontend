import { Link } from 'react-router-dom';
import { useLang, pickI18n } from '../i18n/LangContext.jsx';

export const POST_TYPE_KEYS = {
  blog: 'post_type_blog',
  guide: 'post_type_guide',
  history: 'post_type_history',
  esoteric: 'post_type_esoteric',
  review: 'post_type_review',
};

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

export default function ArticleCard({ post }) {
  const { lang, t } = useLang();
  const {
    slug,
    type,
    i18n = {},
    cover_image: coverImage,
    published_at: publishedAt,
    author,
    tags = [],
  } = post;

  const data = pickI18n(i18n, lang);
  const date = formatDate(publishedAt, lang === 'en' ? 'en-US' : 'ru-RU');
  const typeLabel = type && POST_TYPE_KEYS[type] ? t(POST_TYPE_KEYS[type]) : type;

  return (
    <Link to={`/articles/${slug}`} className="specimen-card facet-card article-card">
      <div
        className="specimen-photo article-photo"
        style={coverImage ? { backgroundImage: `url(${coverImage})` } : undefined}
      >
        {!coverImage && t('no_cover')}
      </div>
      <div className="specimen-body">
        <div className="specimen-name-row">
          <div className="specimen-name">{data.title || slug}</div>
          {typeLabel && <span className="stock-badge">{typeLabel}</span>}
        </div>
        {(date || author) && (
          <div className="specimen-latin article-meta">
            {date}
            {date && author ? ' · ' : ''}
            {author}
          </div>
        )}
        {data.excerpt && <p className="article-excerpt">{data.excerpt}</p>}
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
