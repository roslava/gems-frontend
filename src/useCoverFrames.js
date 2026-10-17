import { useEffect, useState } from 'react';
import { loadCoverFrames } from './coverFrames.js';

const EMPTY_FRAMES = [];

export function useCoverFrames(slug, lang, enabled = true) {
  const key = JSON.stringify([slug, lang]);
  const [result, setResult] = useState(null);
  useEffect(() => {
    let disposed = false;
    if (enabled && slug) loadCoverFrames(slug, lang).then(urls => {
      if (!disposed) setResult({ key, urls });
    });
    return () => { disposed = true; };
  }, [slug, lang, enabled, key]);
  return result?.key === key ? result.urls : EMPTY_FRAMES;
}

export function loadCoverImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const timeout = setTimeout(() => { image.onload = image.onerror = null; reject(new Error('Image timeout')); }, 10000);
    image.onload = () => { clearTimeout(timeout); resolve(); };
    image.onerror = () => { clearTimeout(timeout); reject(new Error('Image unavailable')); };
    image.src = url;
  });
}
