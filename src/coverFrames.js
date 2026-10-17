import { getPostCoverFrames } from './api.js';

const sequences = new Map();
export function parseCoverFrames(payload) {
  if (!Array.isArray(payload?.frames)) throw new Error('Invalid cover frames response');
  return payload.frames.map(frame => {
    if (typeof frame?.url !== 'string' || !/^https?:\/\//i.test(frame.url)) throw new Error('Invalid cover frame URL');
    return frame.url;
  });
}
export function loadCoverFrames(slug, lang) {
  const key = JSON.stringify([slug, lang]);
  if (!sequences.has(key)) {
    sequences.set(key, getPostCoverFrames(slug, { lang }).then(parseCoverFrames).catch(() => []));
  }
  return sequences.get(key);
}

// Load one image at a time; retain the displayed image until the next is ready.
export function startCoverPlayback(urls, show, { load, schedule = setTimeout, cancel = clearTimeout, delay = 700 } = {}) {
  if (urls.length < 2) return () => {};
  let stopped = false;
  let timer;
  let index = 0;
  const failed = new Set();
  const prepared = new Map();
  const prepare = url => {
    if (!prepared.has(url)) prepared.set(url, load(url).then(() => true, () => false));
    return prepared.get(url);
  };
  prepare(urls[1]);
  const advance = async () => {
    for (let step = 1; step <= urls.length; step++) {
      const next = (index + step) % urls.length;
      if (failed.has(urls[next])) continue;
      try {
        if (!await prepare(urls[next])) throw new Error('Image unavailable');
        if (stopped) return;
        index = next;
        show(urls[index]);
        prepare(urls[(index + 1) % urls.length]);
        timer = schedule(advance, delay);
        return;
      } catch { failed.add(urls[next]); }
      if (stopped) return;
    }
  };
  timer = schedule(advance, delay);
  return () => { stopped = true; cancel(timer); };
}

// Older Article V2 posts keep their ordered cover images in media.slides.
export function playbackFrames(frames, post) {
  if (frames.length) return frames;
  const slides = post?.i18n?.media?.slides;
  return Array.isArray(slides)
    ? slides.map(slide => slide?.url).filter(url => typeof url === 'string' && /^https?:\/\//i.test(url))
    : [];
}
