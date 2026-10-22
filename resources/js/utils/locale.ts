/**
 * The locale to format dates in, for the site's language.
 *
 * Arabic is pinned to the Gregorian calendar and Western digits. Plain
 * 'ar-SA' leaves both to the device: some render Arabic-Indic digits beside
 * the Western ones the site uses for times and prices, and some switch to the
 * Hijri calendar — so one row could read "٢٠ نوفمبر ٢٠٢٦ · 08:00".
 */
export const dateLocale = (language: string, english = 'en-US'): string =>
  language === 'ar' ? 'ar-SA-u-ca-gregory-nu-latn' : english;

/**
 * An arrow from the start of a range to its end, in reading order: in Arabic
 * the start sits on the right, so the arrow has to point left.
 */
export const rangeArrow = (language: string): string => (language === 'ar' ? '←' : '→');
