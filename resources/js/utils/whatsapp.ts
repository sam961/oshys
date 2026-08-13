/**
 * WhatsApp contact details and link building.
 *
 * The number was previously repeated in five files. Changing it meant finding
 * all five, and missing one meant enquiries going to a number nobody watches.
 */

/** International format, no plus or spaces — what wa.me expects in the path. */
export const WHATSAPP_NUMBER = '966541000233';

/** Display form, for anywhere the number is shown rather than linked. */
export const WHATSAPP_DISPLAY = '+966 54 100 0233';

/** `tel:` form. */
export const PHONE_HREF = `tel:+${WHATSAPP_NUMBER}`;

/**
 * Build a wa.me link with a prefilled message.
 *
 * encodeURIComponent handles Arabic and the newlines that separate the subject
 * from the date — WhatsApp shows the result as a normal multi-line message.
 */
export const whatsappLink = (message?: string): string => {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
};
