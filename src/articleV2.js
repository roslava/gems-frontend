export function articleSlides(post) {
  return Array.isArray(post?.i18n?.media?.slides) ? post.i18n.media.slides : [];
}

export function articleTranslation(data) {
  return ['title', 'excerpt', 'content'].every((field) => typeof data?.[field] === 'string' && data[field].trim()) ? data : null;
}

export function slideText(slide, lang) {
  return {
    caption: typeof slide?.caption?.[lang] === 'string' ? slide.caption[lang].trim() : '',
    alt: typeof slide?.alt?.[lang] === 'string' ? slide.alt[lang].trim() : '',
  };
}

export function nextSlideIndex(index, count, direction) {
  if (count < 1) return 0;
  return (index + direction + count) % count;
}
