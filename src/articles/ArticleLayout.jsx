import { Link } from 'react-router-dom';
import { useLang } from '../i18n/LangContext.jsx';

export default function ArticleLayout({ article, children }) {
  const { lang, t } = useLang();
  const data = article.i18n[lang];
  const date = article.publishedAt ? new Date(article.publishedAt + 'T12:00:00Z') : null;
  const dateLabel = date && !Number.isNaN(date.getTime())
    ? date.toLocaleDateString(lang === 'en' ? 'en-GB' : 'ru-RU', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
    : null;
  return <article className="section local-article">
    <Link className="local-article-back" to="/articles">{t('back_to_articles')}</Link>
    <header className="local-article-header">
      <h1>{data.title}</h1>
      {(article.author || dateLabel) && <p className="local-article-meta">
        {article.author}{article.author && dateLabel ? ' · ' : ''}
        {dateLabel && <time dateTime={article.publishedAt}>{dateLabel}</time>}
      </p>}
      {data.excerpt && <p className="local-article-lead">{data.excerpt}</p>}
    </header>
    <div className="local-article-content">{children}</div>
    {article.gemSlugs?.length > 0 && <aside className="local-article-related">
      <h2>{t('related_gems_title')}</h2>
      <div className="row">{article.gemSlugs.map((slug) =>
        <Link key={slug} to={`/minerals/${slug}`}>{slug}</Link>)}</div>
    </aside>}
  </article>;
}
