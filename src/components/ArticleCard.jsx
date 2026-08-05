import { Link } from 'react-router-dom';
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

export default function ArticleCard({ post }) {
  const { lang, t } = useLang();
  const {
    slug,
    i18n = {},
    cover_image: coverImage,
    published_at: publishedAt,
    author,
    tags = [],
  } = post;

  const data = pickI18n(i18n, lang);
  const date = formatDate(publishedAt, lang === 'en' ? 'en-US' : 'ru-RU');
  // Если для языка задана своя обложка (баннер с текстом на картинке) — берём её,
  // иначе общая обложка статьи.
  const resolvedCover = data?.cover_image || coverImage;

  return (
    <Link to={`/articles/${slug}`} className="specimen-card facet-card article-card">
      <div
        className="specimen-photo article-photo"
        style={resolvedCover ? { backgroundImage: `url(${resolvedCover})` } : undefined}
      >
        {!resolvedCover && t('no_cover')}
      </div>
      <div className="specimen-body">
        <div className="specimen-name-row">
          <div className="specimen-name">{data.title || slug}</div>
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
