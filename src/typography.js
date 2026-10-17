// Keep short Russian function words with the next word without changing API data.
const SHORT_WORDS = new Set('а и но да или ни в во на к ко с со у о об обо от до по за из без для при про над под перед через я ты он мы вы их ей им её его они она оно это мой моя моё мои твой твоя наш ваш кто что как же бы ли не'.split(' '));

export function keepWordsTogether(text, lang = 'ru') {
  if (typeof text !== 'string' || lang !== 'ru') return text;
  return text.replace(/([^\s])[ \u00a0]+(?=[—–](?:[ \u00a0]|$))/gu, '$1\u00a0').replace(/([А-Яа-яЁё]+)([  ]+)(?=[«„“"(]*[А-Яа-яЁёA-Za-z0-9])/gu,
    (match, word) => SHORT_WORDS.has(word.toLowerCase()) ? word + '\u00a0' : match);
}

export function keepHtmlWordsTogether(html, lang = 'ru') {
  if (!html || lang !== 'ru' || typeof DOMParser === 'undefined') return html;
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const walker = doc.createTreeWalker(doc.body, 4);
  let node;
  while ((node = walker.nextNode())) {
    if (!node.parentElement.closest('pre, code')) {
      node.nodeValue = keepWordsTogether(node.nodeValue, lang);
    }
  }
  return doc.body.innerHTML;
}
