import { pickI18n } from '../i18n/LangContext.jsx';

// Картинка блока: если для текущего языка задан override (нужно для схем/диаграмм
// со встроенным в изображение текстом — например, подписи на осях на русском vs
// на английском), берём его; иначе используем общую картинку блока.
function resolveImageUrl(block, langData) {
  return langData?.image_url || block.image_url || null;
}

function resolveImageUrls(block, langData) {
  const override = langData?.image_urls;
  if (override && (override[0] || override[1])) return override;
  return block.image_urls || [];
}

function HeadingBlock({ block, langData }) {
  if (!langData?.text) return null;
  if (block.level === 'subheading') {
    return <h3 className="block-col block-subheading">{langData.text}</h3>;
  }
  return <h2 className="block-col block-heading">{langData.text}</h2>;
}

function ParagraphBlock({ langData }) {
  if (!langData?.text) return null;
  // Текст блока — обычный текст с сохранением переносов строк, без markdown-парсинга:
  // композиция здесь задаётся структурой блоков, а не разметкой внутри текста.
  return (
    <p className="block-col block-paragraph">
      {langData.text.split('\n').map((line, i, arr) => (
        <span key={i}>
          {line}
          {i < arr.length - 1 && <br />}
        </span>
      ))}
    </p>
  );
}

function ImageBlock({ block, langData }) {
  const url = resolveImageUrl(block, langData);
  if (!url) return null;
  const caption = langData?.caption;
  const isFull = block.layout === 'full';

  return (
    <figure className={isFull ? 'block-image-full' : 'block-col block-image-inset'}>
      <img src={url} alt={caption || ''} loading="lazy" />
      {caption && <figcaption className="block-image-caption">{caption}</figcaption>}
    </figure>
  );
}

function ImagePairBlock({ block, langData }) {
  const urls = resolveImageUrls(block, langData);
  if (!urls[0] && !urls[1]) return null;
  const captions = langData?.captions || [];

  return (
    <div className="block-image-pair">
      {[0, 1].map((i) =>
        urls[i] ? (
          <figure key={i}>
            <img src={urls[i]} alt={captions[i] || ''} loading="lazy" />
            {captions[i] && <figcaption className="block-image-caption">{captions[i]}</figcaption>}
          </figure>
        ) : (
          <div key={i} />
        )
      )}
    </div>
  );
}

function QuoteBlock({ langData }) {
  if (!langData?.text) return null;
  return (
    <blockquote className="block-col block-quote">
      <span className="block-quote-mark" aria-hidden="true">
        &ldquo;
      </span>
      <p className="block-quote-text">{langData.text}</p>
      {langData.attribution && <cite className="block-quote-attribution">{langData.attribution}</cite>}
    </blockquote>
  );
}

export default function BlockRenderer({ blocks, lang }) {
  if (!blocks || blocks.length === 0) return null;

  return (
    <div className="article-blocks">
      {blocks.map((block) => {
        const langData = pickI18n(block.i18n, lang);

        switch (block.type) {
          case 'heading':
            return <HeadingBlock key={block.id} block={block} langData={langData} />;
          case 'paragraph':
            return <ParagraphBlock key={block.id} langData={langData} />;
          case 'image':
            return <ImageBlock key={block.id} block={block} langData={langData} />;
          case 'image_pair':
            return <ImagePairBlock key={block.id} block={block} langData={langData} />;
          case 'quote':
            return <QuoteBlock key={block.id} langData={langData} />;
          default:
            return null;
        }
      })}
    </div>
  );
}
