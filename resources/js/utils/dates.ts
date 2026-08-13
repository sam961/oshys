/**
 * Date formatting for the admin panel.
 *
 * One convention throughout: day / month / year, zero-padded, with a 24-hour
 * clock. Numeric and unambiguous — "01/11/2026" cannot be misread the way
 * "Nov 1" and "1 Nov" can be by different readers, and the admin panel is used
 * by people who write dates day-first.
 *
 * Values from the schedule API are venue-local naive strings
 * ("2026-11-01T17:00"). Those are read straight from their parts rather than
 * through `new Date()`, which would re-interpret them in the viewer's timezone
 * and can shift the day. Strings that carry their own offset ("…Z", "+03:00")
 * are unambiguous instants and do go through `new Date()`.
 */

const pad = (n: number) => String(n).padStart(2, '0');

/** "2026-11-01" or "2026-11-01T17:00" — a local wall clock, no offset. */
const NAIVE = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?/;
/** Ends with Z or ±HH:MM — a real instant rather than a wall clock. */
const HAS_OFFSET = /(Z|[+-]\d{2}:?\d{2})$/;

interface Parts { y: string; m: string; d: string; hh?: string; mm?: string }

const parse = (value: string | Date): Parts | null => {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    return {
      y: String(value.getFullYear()), m: pad(value.getMonth() + 1), d: pad(value.getDate()),
      hh: pad(value.getHours()), mm: pad(value.getMinutes()),
    };
  }

  if (typeof value !== 'string') return null;

  // An instant: let the platform convert it to the viewer's local time.
  if (HAS_OFFSET.test(value.trim())) {
    const asDate = new Date(value);
    return Number.isNaN(asDate.getTime()) ? null : parse(asDate);
  }

  const match = NAIVE.exec(value.trim());
  if (!match) return null;

  const [, y, m, d, hh, mm] = match;
  return { y, m, d, hh, mm };
};

/** "01/11/2026". Returns the input unchanged if it is not a date. */
export const formatDay = (value: string | Date): string => {
  const p = parse(value);
  if (!p) return value instanceof Date ? '' : String(value);
  return `${p.d}/${p.m}/${p.y}`;
};

/** "17:00", 24-hour. Empty when the value carries no time of day. */
export const formatTime = (value: string | Date): string => {
  const p = parse(value);
  return p?.hh !== undefined && p.mm !== undefined ? `${p.hh}:${p.mm}` : '';
};

/** "01/11/2026 · 17:00", or just the day when there is no time. */
export const formatDayTime = (value: string | Date): string => {
  const time = formatTime(value);
  const day = formatDay(value);
  return time ? `${day} · ${time}` : day;
};

/**
 * Short weekday — "Sun". Empty when the value is not a date.
 *
 * Kept alongside the numeric date in schedule lists: when reviewing a weekly
 * series, the weekday is the thing being checked, and reading it back out of
 * "01/11/2026" is work.
 */
export const weekdayShort = (value: string | Date): string => {
  const p = parse(value);
  if (!p) return '';
  return new Date(Number(p.y), Number(p.m) - 1, Number(p.d))
    .toLocaleDateString('en-GB', { weekday: 'short' });
};
