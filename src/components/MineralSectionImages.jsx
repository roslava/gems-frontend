import ArticleSlider from './ArticleSlider.jsx';

export default function MineralSectionImages({ slides, lang }) {
  if (!slides?.length) return null;
  return <div className="mineral-section-images"><ArticleSlider slides={slides} lang={lang} /></div>;
}
