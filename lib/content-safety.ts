import "server-only";

import sanitizeHtml from "sanitize-html";

/**
 * The deliberately small HTML vocabulary available to FitFuel's content
 * editor. Images belong in the dedicated cover-image field and layout/style
 * remain application-owned, so neither attributes nor inline CSS are accepted.
 */
const RICH_TEXT_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "p",
    "h2",
    "h3",
    "h4",
    "ul",
    "ol",
    "li",
    "strong",
    "em",
    "blockquote",
    "br",
    "code",
    "pre",
    "a",
  ],
  allowedAttributes: {
    a: ["href", "title"],
  },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowProtocolRelative: false,
  disallowedTagsMode: "discard",
};

/** Sanitize content when it is written and again at every public render. */
export function sanitizeRichHtml(value: string): string {
  return sanitizeHtml(value, RICH_TEXT_OPTIONS);
}

/** Plain text for metadata/structured data, with entities decoded safely. */
export function richHtmlToText(value: string): string {
  return sanitizeHtml(value, {
    allowedTags: [],
    allowedAttributes: {},
    disallowedTagsMode: "discard",
  }).trim();
}

/**
 * JSON.stringify alone leaves `</script>` intact. Escaping HTML-significant
 * characters keeps database content inside its application/ld+json element.
 */
export function safeJsonLd(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
