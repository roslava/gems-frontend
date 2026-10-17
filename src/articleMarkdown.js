import { marked } from 'marked';
import DOMPurify from 'dompurify';

export const MARKDOWN_TAGS = ['p', 'h2', 'h3', 'ul', 'ol', 'li', 'strong', 'em', 'a', 'blockquote', 'br', 'code', 'pre', 'hr', 'img'];

export function renderArticleMarkdown(content, purifier = DOMPurify) {
  if (!content) return '';
  return purifier.sanitize(marked.parse(content), {
    ALLOWED_TAGS: MARKDOWN_TAGS,
    ALLOWED_ATTR: ['href', 'title', 'src', 'alt'],
  });
}
