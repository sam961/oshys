import type { Course, Event, Trip } from '../../types';

export type CalendarKind = 'event' | 'course' | 'trip';

/**
 * One thing happening on one day.
 *
 * A repeating event produces several of these — one per date — which is the
 * whole point: the calendar previously read a single `start_date` per event, so
 * a weekly course showed up once and then appeared to have stopped.
 */
export interface CalendarEntry {
  /** Unique per occurrence, not per record — a series shares one record id. */
  key: string;
  id: number;
  kind: CalendarKind;
  title: string;
  description: string;
  location?: string;
  href: string;
  /** Venue-local wall clock, "2026-11-01T17:00". */
  startAt: string;
  /** The same moment as a local Date, for grouping by day only. */
  date: Date;
  /** When it finishes, if that is on a later day: a trip that runs a week. */
  endAt?: string;
  endDate?: Date;
}

/**
 * Build a Date from a venue-local string's parts.
 *
 * Never `new Date(wholeString)`: these carry no offset, so the browser applies
 * the reader's timezone. For a visitor west of Al Khobar an evening dive slides
 * back into the previous day and lands in the wrong calendar cell.
 */
const localDate = (value: string): Date => {
  const [datePart, timePart = '00:00'] = value.split('T');
  const [y, m, d] = datePart.split('-').map(Number);
  const [hh, mm] = timePart.split(':').map(Number);
  return new Date(y, (m || 1) - 1, d || 1, hh || 0, mm || 0);
};

const toEntries = <T extends { id: number; upcoming_dates?: { id: number; start_at: string; end_at?: string | null }[] }>(
  items: T[],
  kind: CalendarKind,
  title: (item: T) => string,
  description: (item: T) => string,
  href: (item: T) => string,
  location?: (item: T) => string | undefined,
): CalendarEntry[] =>
  items.flatMap((item) =>
    (item.upcoming_dates ?? []).map((d) => ({
      key: `${kind}-${item.id}-${d.id}`,
      id: item.id,
      kind,
      title: title(item),
      description: description(item),
      location: location?.(item),
      href: href(item),
      startAt: d.start_at,
      date: localDate(d.start_at),
      // Only an end on another day matters here; a same-day end changes
      // nothing about which cells the entry sits in.
      ...(d.end_at && d.end_at.slice(0, 10) !== d.start_at.slice(0, 10)
        ? { endAt: d.end_at, endDate: localDate(d.end_at) }
        : {}),
    })),
  );

/**
 * Flatten events, courses and trips into calendar entries.
 *
 * Events with no occurrences fall back to their legacy `start_date` so nothing
 * vanishes from the calendar for a record that predates scheduling and has not
 * been re-saved since.
 */
export const buildCalendarEntries = (
  events: Event[] = [],
  courses: Course[] = [],
  trips: Trip[] = [],
): CalendarEntry[] => {
  const scheduled = toEntries(
    events, 'event',
    (e) => e.title, (e) => e.description || '',
    (e) => `/events/${e.slug || e.id}`, (e) => e.location,
  );

  const legacy: CalendarEntry[] = events
    .filter((e) => !e.upcoming_dates?.length && e.start_date)
    .map((e) => {
      // A stored instant, unlike the occurrence strings — parse it as one.
      const date = new Date(e.start_date);
      return {
        key: `event-${e.id}-legacy`,
        id: e.id,
        kind: 'event' as const,
        title: e.title,
        description: e.description || '',
        location: e.location,
        href: `/events/${e.slug || e.id}`,
        startAt: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}T${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`,
        date,
      };
    });

  return [
    ...scheduled,
    ...legacy,
    ...toEntries(courses, 'course', (c) => c.name, (c) => c.description || '', (c) => `/shop/courses/${c.id}`),
    ...toEntries(trips, 'trip', (tr) => tr.name, (tr) => tr.description || '', (tr) => `/shop/trips/${tr.id}`),
  ].sort((a, b) => a.date.getTime() - b.date.getTime());
};

/** True when an entry runs into a later day. */
export const spansDays = (entry: CalendarEntry): boolean => !!entry.endDate;

/**
 * Group by calendar day, for the month grid.
 *
 * An entry is listed on every day it runs, not just the one it starts on: a
 * trip from the 20th to the 25th has to show on the 22nd, or that day reads as
 * free while the boat is out.
 */
export const groupByDay = (entries: CalendarEntry[]): Record<string, CalendarEntry[]> =>
  entries.reduce((acc, entry) => {
    const day = new Date(entry.date.getFullYear(), entry.date.getMonth(), entry.date.getDate());
    const last = entry.endDate ?? entry.date;
    // Bounded, so a mistyped end years away cannot stall the page.
    for (let i = 0; i < 62 && day <= last; i++) {
      (acc[day.toDateString()] ||= []).push(entry);
      day.setDate(day.getDate() + 1);
    }
    return acc;
  }, {} as Record<string, CalendarEntry[]>);

/**
 * The next date of each event, course and trip — one entry per record.
 *
 * For a short "what's coming up" list. Taken per date, a course with five
 * sessions this week filled every slot and pushed everything else out.
 */
export const nextPerRecord = (entries: CalendarEntry[]): CalendarEntry[] => {
  const seen = new Set<string>();
  return entries.filter((entry) => {
    const record = `${entry.kind}-${entry.id}`;
    if (seen.has(record)) return false;
    seen.add(record);
    return true;
  });
};
