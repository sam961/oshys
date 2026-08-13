import React, { useMemo } from 'react';
import { Calendar, Clock, X } from 'lucide-react';

interface DateTimeFieldProps {
  label: string;
  /** "YYYY-MM-DDTHH:mm", or "" when nothing is chosen. */
  value: string;
  onChange: (value: string) => void;
  /** Earliest allowed value, same shape as `value`. */
  min?: string;
  required?: boolean;
  help?: string;
  /** Offer a clear button — for optional fields like an end time. */
  clearable?: boolean;
  /**
   * Quick "+1h" style buttons, measured from `relativeTo`. Used by the end
   * time, where the answer is nearly always a round duration after the start.
   */
  durationsFrom?: string;
  disabled?: boolean;
}

const pad = (n: number) => String(n).padStart(2, '0');

/** Times offered in the dropdown: every half hour, 06:00 to 22:00. */
const COMMON_TIMES = Array.from({ length: 33 }, (_, i) => {
  const minutes = 6 * 60 + i * 30;
  return `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;
});

const split = (value: string) => {
  const [date = '', time = ''] = (value || '').split('T');
  return { date, time: time.slice(0, 5) };
};

const addHours = (value: string, hours: number): string => {
  const { date, time } = split(value);
  if (!date || !time) return '';
  const [y, m, d] = date.split('-').map(Number);
  const [hh, mm] = time.split(':').map(Number);
  const next = new Date(y, m - 1, d, hh + hours, mm);
  return `${next.getFullYear()}-${pad(next.getMonth() + 1)}-${pad(next.getDate())}T${pad(next.getHours())}:${pad(next.getMinutes())}`;
};

/**
 * Date and time as two separate controls.
 *
 * A single `datetime-local` input is one field pretending to be two: the
 * calendar is fine, but the time has to be typed digit by digit, and on a
 * desktop browser it is a fiddly stepper. Splitting them gives the OS calendar
 * for the date and a list of half-hour slots for the time, which is what an
 * admin scheduling a class actually wants — while still allowing an exact time
 * for anything that does not land on the half hour.
 */
export const DateTimeField: React.FC<DateTimeFieldProps> = ({
  label,
  value,
  onChange,
  min,
  required = false,
  help,
  clearable = false,
  durationsFrom,
  disabled = false,
}) => {
  const { date, time } = split(value);
  const minParts = split(min || '');

  // Only constrain the time when the chosen day *is* the earliest day —
  // otherwise a later date would wrongly inherit the earliest day's cutoff.
  const minTime = minParts.date && date === minParts.date ? minParts.time : undefined;

  const times = useMemo(() => {
    const list = [...COMMON_TIMES];
    // Keep an existing off-grid time selectable rather than silently dropping it.
    if (time && !list.includes(time)) {
      list.push(time);
      list.sort();
    }
    return minTime ? list.filter((slot) => slot >= minTime) : list;
  }, [time, minTime]);

  const emit = (nextDate: string, nextTime: string) => {
    if (!nextDate) return onChange('');
    // A date with no time yet defaults to the first slot that is still
    // allowed, so picking a day alone already produces a usable value.
    const resolved = nextTime || times[0] || '09:00';
    onChange(`${nextDate}T${resolved}`);
  };

  const field = 'rounded-lg border border-gray-300 px-3 py-2.5 focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100';

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        {label}{required && ' *'}
      </label>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[9.5rem]">
          <Calendar className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="date"
            value={date}
            min={minParts.date || undefined}
            disabled={disabled}
            onChange={(e) => emit(e.target.value, time)}
            className={`${field} w-full pl-8`}
            aria-label={`${label} — date`}
          />
        </div>

        <div className="relative min-w-[7.5rem]">
          <Clock className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <select
            value={time}
            disabled={disabled || !date}
            onChange={(e) => emit(date, e.target.value)}
            className={`${field} w-full pl-8`}
            aria-label={`${label} — time`}
          >
            {!time && <option value="">--:--</option>}
            {times.map((slot) => (
              <option key={slot} value={slot}>{slot}</option>
            ))}
          </select>
        </div>

        {clearable && value && !disabled && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="rounded-lg border border-gray-300 p-2.5 text-gray-500 hover:bg-gray-50"
            title={`Clear ${label.toLowerCase()}`}
            aria-label={`Clear ${label.toLowerCase()}`}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {durationsFrom && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-gray-500">Duration:</span>
          {[1, 2, 3, 4].map((hours) => (
            <button
              key={hours}
              type="button"
              disabled={disabled || !durationsFrom}
              onClick={() => onChange(addHours(durationsFrom, hours))}
              className="rounded-full border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            >
              +{hours}h
            </button>
          ))}
        </div>
      )}

      {help && <p className="mt-1 text-xs text-gray-500">{help}</p>}
    </div>
  );
};

/** Date only — for a repeat-until, which has no time of day. */
export const DateField: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  min?: string;
  help?: string;
  clearable?: boolean;
}> = ({ label, value, onChange, min, help, clearable = false }) => (
  <div>
    <label className="mb-2 block text-sm font-medium text-gray-700">{label}</label>
    <div className="flex items-center gap-2">
      <div className="relative min-w-[9.5rem] sm:w-64">
        <Calendar className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="date"
          value={value}
          min={min}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-gray-300 py-2.5 pl-8 pr-3 focus:ring-2 focus:ring-primary-500"
          aria-label={label}
        />
      </div>
      {clearable && value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="rounded-lg border border-gray-300 p-2.5 text-gray-500 hover:bg-gray-50"
          title={`Clear ${label.toLowerCase()}`}
          aria-label={`Clear ${label.toLowerCase()}`}
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
    {help && <p className="mt-1 text-xs text-gray-500">{help}</p>}
  </div>
);
