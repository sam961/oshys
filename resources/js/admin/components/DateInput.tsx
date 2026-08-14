import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface DateInputProps {
  /** ISO day, "YYYY-MM-DD", or "" when empty. */
  value: string;
  onChange: (value: string) => void;
  /** Earliest selectable day, same shape. */
  min?: string;
  disabled?: boolean;
  ariaLabel?: string;
  className?: string;
}

const pad = (n: number) => String(n).padStart(2, '0');
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

const toIso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** "2026-08-20" → "20/08/2026". */
const toDisplay = (iso: string): string => {
  const [y, m, d] = (iso || '').split('-');
  return y && m && d ? `${d}/${m}/${y}` : '';
};

/** "20/08/2026" → "2026-08-20", or "" when it is not a real date. */
const fromDisplay = (text: string): string => {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(text.trim());
  if (!m) return '';
  const [, dd, mm, yyyy] = m;
  const date = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  // Rejects 31/02 and friends: JS rolls them over, so the parts must survive.
  const valid = date.getFullYear() === Number(yyyy)
    && date.getMonth() === Number(mm) - 1
    && date.getDate() === Number(dd);
  return valid ? toIso(date) : '';
};

/** Digits only, slashes inserted as the admin types. */
const mask = (raw: string): string => {
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  const parts = [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)].filter(Boolean);
  return parts.join('/');
};

/**
 * A date field that always reads day / month / year.
 *
 * The native date input renders in the *browser's* locale, so a machine set to
 * US English shows 08/20/2026 no matter what the page says — there is no
 * attribute to override it. This types and displays dd/mm/yyyy everywhere, and
 * carries an ISO value underneath.
 */
export const DateInput: React.FC<DateInputProps> = ({
  value, onChange, min, disabled = false, ariaLabel, className = '',
}) => {
  const [text, setText] = useState(() => toDisplay(value));
  const [open, setOpen] = useState(false);
  const wrapper = useRef<HTMLDivElement>(null);

  // Follow the value when it changes elsewhere (a duration button, a reset).
  useEffect(() => { setText(toDisplay(value)); }, [value]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapper.current && !wrapper.current.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onEsc);
    };
  }, [open]);

  // The month the calendar is showing.
  const [cursor, setCursor] = useState(() => {
    const base = value || min || toIso(new Date());
    const [y, m] = base.split('-').map(Number);
    return new Date(y, (m || 1) - 1, 1);
  });
  useEffect(() => {
    if (!value) return;
    const [y, m] = value.split('-').map(Number);
    setCursor(new Date(y, m - 1, 1));
  }, [value]);

  const days = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const first = new Date(year, month, 1);
    // Monday-first, matching how the rest of the admin reads.
    const lead = (first.getDay() + 6) % 7;
    const count = new Date(year, month + 1, 0).getDate();
    return [
      ...Array.from({ length: lead }, () => null),
      ...Array.from({ length: count }, (_, i) => new Date(year, month, i + 1)),
    ];
  }, [cursor]);

  const commit = (raw: string) => {
    const masked = mask(raw);
    setText(masked);
    if (masked === '') { onChange(''); return; }
    const iso = fromDisplay(masked);
    if (iso) onChange(iso);
  };

  const pick = (day: Date) => {
    onChange(toIso(day));
    setText(toDisplay(toIso(day)));
    setOpen(false);
  };

  const isDisabledDay = (day: Date) => !!min && toIso(day) < min;
  const todayIso = toIso(new Date());

  return (
    <div ref={wrapper} className={`relative ${className}`}>
      <Calendar className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        inputMode="numeric"
        value={text}
        placeholder="dd/mm/yyyy"
        disabled={disabled}
        aria-label={ariaLabel}
        onChange={(e) => commit(e.target.value)}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          // A half-typed date reverts rather than sitting there looking saved.
          if (text && !fromDisplay(text)) setText(toDisplay(value));
        }}
        className="w-full rounded-lg border border-gray-300 py-2.5 pl-8 pr-8 focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
      />
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        aria-label="Open calendar"
        className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
      >
        <Calendar className="h-4 w-4" />
      </button>

      {open && !disabled && (
        <div className="absolute z-30 mt-1 w-72 rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
          <div className="mb-2 flex items-center justify-between">
            <button type="button" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
              className="rounded p-1.5 text-gray-500 hover:bg-gray-100" aria-label="Previous month">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-semibold text-gray-900">
              {MONTHS[cursor.getMonth()]} {cursor.getFullYear()}
            </span>
            <button type="button" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
              className="rounded p-1.5 text-gray-500 hover:bg-gray-100" aria-label="Next month">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mb-1 grid grid-cols-7 gap-0.5">
            {WEEKDAYS.map((d) => (
              <div key={d} className="py-1 text-center text-[11px] font-medium text-gray-500">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0.5">
            {days.map((day, i) => {
              if (!day) return <div key={`blank-${i}`} />;
              const iso = toIso(day);
              const selected = iso === value;
              const blocked = isDisabledDay(day);
              return (
                <button
                  key={iso}
                  type="button"
                  disabled={blocked}
                  onClick={() => pick(day)}
                  className={`rounded py-1.5 text-sm transition-colors ${
                    selected ? 'bg-primary-600 font-semibold text-white'
                      : blocked ? 'cursor-not-allowed text-gray-300'
                      : iso === todayIso ? 'bg-primary-50 font-semibold text-primary-700 hover:bg-primary-100'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
