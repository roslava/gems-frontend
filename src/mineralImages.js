import { imageUrl } from './gemV2.js';

// Section illustrations never belong to the main specimen gallery.
export function partitionMineralImages(images, cdnBase) {
  const gallery = [];
  const sections = Object.create(null);
  for (const image of images?.gallery || []) {
    if (!image.type?.startsWith('section:')) {
      gallery.push(image);
      continue;
    }
    const id = image.type.slice('section:'.length);
    const url = imageUrl(images, image, cdnBase);
    if (!id || !url) continue;
    (sections[id] ||= []).push({ url, caption: image.caption, alt: image.caption });
  }
  return { gallery, sections };
}
