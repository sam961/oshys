import type { Event } from '../types';

/**
 * When an event happens, for the public pages.
 *
 * Read from the event's dates (`upcoming_dates`), not from `start_date`. That
 * column only moves when an admin edits a date — nothing updates it when a
 * date simply passes — so an event whose first date is over would read as
 * finished while later dates are still ahead.
 *
 * Everything here is in the venue's own time. A dive at 23:00 in Al Khobar is
 * shown as 23:00 on that day to every visitor, wherever they are reading from.
 */

/** The academy is in Al Khobar; every date it runs is in this time. */
const VENUE_TIMEZONE = 'Asia/Riyadh';

/**
 * A venue-local wall clock ("2026-11-20T23:00") as a Date whose local fields
 * hold those numbers. For formatting only — it is not the real instant — but
 * formatting it prints 23:00 on the 20th in any browser timezone.
 */
export const wallClock = (value: string): Date => {
  const [datePart, timePart = '00:00'] = value.split('T');
  const [y, m, d] = datePart.split('-').map(Number);
  const [hh, mm] = timePart.split(':').map(Number);
  return new Date(y, (m || 1) - 1, d || 1, hh || 0, mm || 0);
};

/** A stored instant ("2026-11-20T20:00:00.000000Z") as the venue's wall clock. */
const instantToWallClock = (instant: string | Date): string => {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: VENUE_TIMEZONE,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
    }).formatToParts(new Date(instant)).map((p) => [p.type, p.value]),
  );
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
};

/**
 * "Now" on the venue's clock, as "YYYY-MM-DDTHH:mm".
 *
 * What the server measures "in the past" against. Taken from the browser's
 * own clock instead, an admin in London would be offered times that have
 * already passed in Al Khobar, and one further east refused times that have
 * not.
 */
export const venueNow = (): string => instantToWallClock(new Date());

/** True while the event has a date still ahead. */
export const isUpcomingEvent = (event: Event): boolean => !!event.upcoming_dates?.length;

/**
 * The date to show for an event, as venue wall clocks: its next date, or —
 * once every date has passed — the one the event record carries.
 */
export const eventWhen = (event: Event): { start: string; end: string | null } => {
  const next = event.upcoming_dates?.[0];
  if (next) return { start: next.start_at, end: next.end_at };
  return {
    start: instantToWallClock(event.start_date),
    end: event.end_date ? instantToWallClock(event.end_date) : null,
  };
};
