import React from 'react';
import { Calendar, Users, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { UpcomingDate } from '../../types';

interface UpcomingDatesProps {
  dates: UpcomingDate[];
  /** Highlighted date; used by the WhatsApp enquiry in a later phase. */
  selectedId?: number | null;
  onSelect?: (date: UpcomingDate) => void;
  /** How many to show before the "show all" control appears. */
  collapseAfter?: number;
  className?: string;
}

/**
 * Parse a venue-local wall clock ("2026-11-01T17:00") into its parts.
 *
 * Deliberately not `new Date(value)` on the whole string: these carry no
 * offset, and letting the browser interpret them shifts an evening dive in
 * Al Khobar into the reader's own timezone — which for a visitor abroad can
 * move it to the previous day.
 */
const partsOf = (value: string) => {
  const [datePart, timePart = ''] = value.split('T');
  const [y, m, d] = datePart.split('-').map(Number);
  const [hh = '00', mm = '00'] = timePart.split(':');
  return { date: new Date(y, m - 1, d), hh, mm };
};

export const formatVenueDate = (value: string, locale: string): string =>
  partsOf(value).date.toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

export const formatVenueTime = (value: string): string => {
  const { hh, mm } = partsOf(value);
  return `${hh}:${mm}`;
};

/**
 * The dates something runs on.
 *
 * Only ever given upcoming, non-cancelled dates — the API filters both out, so
 * a visitor never sees a date that has passed or been called off.
 */
export const UpcomingDates: React.FC<UpcomingDatesProps> = ({
  dates,
  selectedId = null,
  onSelect,
  collapseAfter = 4,
  className = '',
}) => {
  const { t, i18n } = useTranslation();
  const [expanded, setExpanded] = React.useState(false);

  if (!dates || dates.length === 0) return null;

  const visible = expanded ? dates : dates.slice(0, collapseAfter);
  const hidden = dates.length - visible.length;
  const selectable = typeof onSelect === 'function';

  return (
    <div className={className}>
      <h3 className="mb-3 flex items-center gap-2 text-base sm:text-lg font-semibold text-gray-900">
        <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary-600" />
        {dates.length === 1 ? t('schedule.dateSingle') : t('schedule.dateCount', { count: dates.length })}
      </h3>

      <ul className="space-y-2">
        {visible.map((d) => {
          const isSelected = selectable && selectedId === d.id;
          const Row = selectable ? 'button' : 'div';

          return (
            <li key={d.id}>
              <Row
                {...(selectable
                  ? { type: 'button' as const, onClick: () => onSelect?.(d), 'aria-pressed': isSelected }
                  : {})}
                className={`flex w-full flex-col gap-1 rounded-lg border px-3 py-2.5 text-start transition-colors sm:flex-row sm:items-center sm:justify-between sm:gap-3 ${
                  isSelected
                    ? 'border-primary-500 bg-primary-50'
                    : `border-gray-200 bg-white ${selectable ? 'hover:border-primary-300 hover:bg-gray-50' : ''}`
                }`}
              >
                <span className="text-sm font-medium text-gray-900">
                  {formatVenueDate(d.start_at, i18n.language)}
                </span>

                <span className="flex items-center gap-3 text-xs sm:text-sm text-gray-600">
                  <span dir="ltr">
                    {formatVenueTime(d.start_at)}
                    {d.end_at ? ` – ${formatVenueTime(d.end_at)}` : ''}
                  </span>
                  {/* Shown only when the admin set one. It is informational —
                      nothing counts against it and nobody is turned away. */}
                  {d.capacity !== null && (
                    <span className="flex items-center gap-1 whitespace-nowrap text-gray-500">
                      <Users className="h-3.5 w-3.5" />
                      {t('schedule.seats', { count: d.capacity })}
                    </span>
                  )}
                </span>
              </Row>
            </li>
          );
        })}
      </ul>

      {hidden > 0 && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="mt-2 flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          {t('schedule.showAll', { count: hidden })}
          <ChevronDown className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

/** One-line "next date" for listing cards. */
export const NextDateBadge: React.FC<{ dates?: UpcomingDate[]; className?: string }> = ({ dates, className = '' }) => {
  const { t, i18n } = useTranslation();
  if (!dates || dates.length === 0) return null;

  const next = dates[0];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs sm:text-sm text-gray-600 ${className}`}>
      <Calendar className="h-3.5 w-3.5 text-primary-600" />
      <span>
        {t('schedule.next')}: {formatVenueDate(next.start_at, i18n.language)}
        {dates.length > 1 && (
          <span className="text-gray-400"> {t('schedule.plusMore', { count: dates.length - 1 })}</span>
        )}
      </span>
    </span>
  );
};
