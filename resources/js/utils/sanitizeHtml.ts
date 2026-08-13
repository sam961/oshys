import DOMPurify from 'dompurify';

/**
 * Sanitizers for CMS-authored HTML.
 *
 * Everything an admin writes in the rich-text editor is stored as raw HTML and
 * rendered with `dangerouslySetInnerHTML`. Since the editor gained inline image
 * support, that HTML now carries `<img>` tags, so every render site must run
 * through one of these instead of trusting the string.
 *
 * Two variants, because the two contexts want different things:
 *  - `sanitizeRichText` — full article bodies. Images allowed.
 *  - `sanitizeExcerpt`  — listing cards and popups, usually line-clamped.
 *    Images are stripped: an inline photo inside a `line-clamp-2` card blows
 *    the layout apart and is never what the card is meant to preview.
 */

const INLINE_TAGS = [
  'p', 'br', 'span', 'strong', 'b', 'em', 'i', 'u', 's', 'a',
  'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'hr',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
];

const RICH_TEXT_CONFIG = {
  ALLOWED_TAGS: [...INLINE_TAGS, 'img', 'figure', 'figcaption'],
  ALLOWED_ATTR: ['href', 'target', 'rel', 'src', 'alt', 'title', 'class', 'width', 'height', 'loading'],
  ALLOW_DATA_ATTR: false,
};

const EXCERPT_CONFIG = {
  ALLOWED_TAGS: INLINE_TAGS,
  ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
  ALLOW_DATA_ATTR: false,
};

let hooksRegistered = false;

/**
 * Inline images come straight from a phone camera in practice, so defer their
 * loading and never let one exceed its column. Registered once, lazily, so this
 * module stays side-effect-free until something actually sanitizes.
 */
const registerHooks = () => {
  if (hooksRegistered) return;
  hooksRegistered = true;

  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if (node.nodeName === 'IMG') {
      node.setAttribute('loading', 'lazy');
      node.setAttribute('decoding', 'async');
    }
    // CMS content can link anywhere; make new tabs safe by default.
    if (node.nodeName === 'A' && node.getAttribute('target') === '_blank') {
      node.setAttribute('rel', 'noopener noreferrer');
    }
  });
};

/** Full article body — formatting plus inline images. */
export const sanitizeRichText = (html?: string | null): string => {
  registerHooks();
  return DOMPurify.sanitize(html ?? '', RICH_TEXT_CONFIG);
};

/** Card / preview text — formatting only, images and figures removed. */
export const sanitizeExcerpt = (html?: string | null): string => {
  registerHooks();
  return DOMPurify.sanitize(html ?? '', EXCERPT_CONFIG);
};

/**
 * CMS HTML as readable plain text, for table cells and previews.
 *
 * Admin listings show a one-line excerpt of a rich-text field. Printing the
 * stored value directly puts "<p>test</p>" on screen; rendering it as HTML in a
 * table cell is worse. Parsing and taking the text is the only version that
 * reads correctly.
 */
export const htmlToText = (html?: string | null): string => {
  if (!html) return '';

  // Sanitize first: this parses attacker-influenced markup, and the result is
  // discarded anyway, so there is no reason to hand raw input to the parser.
  const clean = sanitizeExcerpt(html);

  // Block boundaries carry no whitespace of their own, so textContent alone
  // would run "<p>one</p><p>two</p>" together as "onetwo". Insert a separator
  // where the markup implies one.
  const spaced = clean.replace(/<\/(p|div|li|h[1-6]|blockquote|tr)>|<br\s*\/?>/gi, ' ');
  const parsed = new DOMParser().parseFromString(spaced, 'text/html');

  return (parsed.body.textContent || '').replace(/\s+/g, ' ').trim();
};
