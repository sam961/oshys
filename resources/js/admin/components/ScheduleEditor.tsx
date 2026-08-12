import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CalendarPlus, Loader2, Plus, RotateCcw, Trash2, Users, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  useGetScheduleQuery,
  useSaveScheduleMutation,
  useDeleteScheduleMutation,
  useAddOccurrenceMutation,
  useUpdateOccurrenceMutation,
  useDeleteOccurrenceMutation,
} from '../../services/api';
import type { ScheduleFrequency, SchedulableType } from '../../types';

/**
 * What the editor collects before the record exists.
 *
 * `start_at` is null when the parent form owns the first date — events have
 * their own Start Date field, and showing a second one here would be two
 * sources of truth. Courses and trips have no date field at all, so the editor
 * supplies it and this carries the value.
 */
export interface DraftRule {
  start_at: string | null;
  end_at: string | null;
  frequency: ScheduleFrequency;
  interval: number;
  weekdays: number[];
  until_date: string | null;
}

interface ScheduleEditorProps {
  /** Which content type this belongs to. */
  type: SchedulableType;
  /** Parent record id. Null while the record is still being created. */
  id: number | null;
  /**
   * Creation mode: the record has no id yet, so there is nothing to attach
   * dates to. The rule is collected here and handed to the parent, which
   * applies it once the record exists.
   */
  onDraftChange?: (rule: DraftRule) => void;
  /**
   * Whether the editor should ask for the first date while creating. True for
   * courses and trips, whose forms have no date field of their own.
   */
  draftProvidesFirstDate?: boolean;
}

const WEEKDAYS = [
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
  { value: 7, label: 'Sun' },
];

const FREQUENCIES: { value: ScheduleFrequency; label: string }[] = [
  { value: 'none', label: 'Does not repeat' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

/** Venue-local "now", rounded up to the next hour, for a sensible default. */
const defaultStart = (): string => {
  const d = new Date();
  d.setMinutes(0, 0, 0);
  d.setHours(d.getHours() + 1);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const formatDate = (value: string): string => {
  // Values are venue-local naive strings; parsing the date parts directly
  // avoids the browser reinterpreting them in its own timezone.
  const [datePart, timePart] = value.split('T');
  const [y, m, d] = datePart.split('-').map(Number);
  const label = new Date(y, m - 1, d).toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  });
  return `${label} · ${timePart}`;
};

/**
 * Repeat rule plus the dates it produces, shared by events, courses and trips.
 *
 * Capacity is optional per date and displayed only — nothing counts against it
 * and the site never blocks an inquiry.
 */
export const ScheduleEditor: React.FC<ScheduleEditorProps> = ({
  type,
  id,
  onDraftChange,
  draftProvidesFirstDate = false,
}) => {
  const skip = id === null;
  const isDraft = skip && typeof onDraftChange === 'function';
  // While creating, the first-date fields are shown only when this editor is
  // the one that owns them.
  const hideFirstDate = isDraft && !draftProvidesFirstDate;
  const { data, isLoading, isFetching } = useGetScheduleQuery({ type, id: id ?? 0 }, { skip });

  const [saveSchedule, { isLoading: isSaving }] = useSaveScheduleMutation();
  const [deleteSchedule, { isLoading: isDeletingSeries }] = useDeleteScheduleMutation();
  const [addOccurrence, { isLoading: isAdding }] = useAddOccurrenceMutation();
  const [updateOccurrence] = useUpdateOccurrenceMutation();
  const [deleteOccurrence] = useDeleteOccurrenceMutation();

  // Blank while creating a course or trip: dates are optional there, and a
  // prefilled default would silently give every new record a date nobody
  // asked for. Elsewhere a sensible starting point is more useful.
  const [startAt, setStartAt] = useState(() =>
    (id === null && draftProvidesFirstDate ? '' : defaultStart()));
  const [endAt, setEndAt] = useState('');
  const [frequency, setFrequency] = useState<ScheduleFrequency>('none');
  const [interval, setIntervalValue] = useState(1);
  const [weekdays, setWeekdays] = useState<number[]>([]);
  const [untilDate, setUntilDate] = useState('');
  const [oneOffDate, setOneOffDate] = useState('');

  // Seed the rule form once per record. Re-running on every `data` change
  // would discard a half-edited rule the moment any other mutation (a capacity
  // blur, a cancelled date) triggered a refetch.
  const hydratedFor = useRef<string | null>(null);
  useEffect(() => {
    if (!data || skip) return;
    const key = `${type}-${id}`;
    if (hydratedFor.current === key) return;
    hydratedFor.current = key;

    if (data.series) {
      setFrequency(data.series.frequency);
      setIntervalValue(data.series.interval || 1);
      setWeekdays(data.series.weekdays ?? []);
      setUntilDate(data.series.until_date ?? '');
    }

    // Prefer the first generated date; fall back to the earliest date of any
    // kind so an event backfilled from the old single-date column opens with
    // its real time rather than a "now + 1h" default the admin would then
    // accidentally generate a whole series from.
    const seed = data.occurrences.find((o) => o.series_id !== null) ?? data.occurrences[0];
    if (seed) {
      setStartAt(seed.start_at);
      setEndAt(seed.end_at ?? '');
    }
  }, [data, skip, type, id]);

  const occurrences = data?.occurrences ?? [];
  const upcomingCount = useMemo(
    () => occurrences.filter((o) => !o.is_past && o.status === 'scheduled').length,
    [occurrences],
  );

  // Keep the parent's copy of the rule current while creating.
  useEffect(() => {
    if (!isDraft) return;
    onDraftChange?.({
      start_at: draftProvidesFirstDate ? startAt : null,
      end_at: draftProvidesFirstDate ? (endAt || null) : null,
      frequency,
      interval,
      weekdays: frequency === 'weekly' ? weekdays : [],
      until_date: untilDate || null,
    });
  }, [isDraft, draftProvidesFirstDate, onDraftChange, startAt, endAt, frequency, interval, weekdays, untilDate]);

  if (skip && !isDraft) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
        <CalendarPlus className="mx-auto mb-2 h-6 w-6 text-gray-400" />
        <p className="text-sm text-gray-500">Save this record first, then add its dates.</p>
      </div>
    );
  }

  const toggleWeekday = (day: number) =>
    setWeekdays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()));

  const handleSaveRule = async () => {
    if (!startAt) {
      toast.error('Pick the first date and time.');
      return;
    }
    if (frequency === 'weekly' && weekdays.length === 0) {
      toast.error('Choose at least one weekday, or set the repeat to "Does not repeat".');
      return;
    }
    try {
      const result = await saveSchedule({
        type,
        id: id as number,
        data: {
          start_at: startAt,
          end_at: endAt || null,
          frequency,
          interval,
          weekdays: frequency === 'weekly' ? weekdays : [],
          until_date: untilDate || null,
        },
      }).unwrap();

      const generated = result.occurrences.filter((o) => o.series_id !== null).length;
      toast.success(generated === 1 ? '1 date saved' : `${generated} dates generated`);
    } catch (error: any) {
      const messages = error?.data?.errors ? Object.values(error.data.errors).flat() : null;
      toast.error((messages?.[0] as string) ?? error?.data?.message ?? 'Could not save the schedule');
    }
  };

  const handleAddOneOff = async () => {
    if (!oneOffDate) return;
    try {
      await addOccurrence({ type, id: id as number, data: { start_at: oneOffDate } }).unwrap();
      setOneOffDate('');
      toast.success('Date added');
    } catch {
      toast.error('Could not add that date');
    }
  };

  /**
   * The input is uncontrolled, so nothing puts a server value back into it on
   * its own. Every rejection therefore has to restore the box explicitly, or
   * it keeps showing a number the database does not have.
   */
  const handleCapacityChange = async (
    occurrenceId: number,
    raw: string,
    input: HTMLInputElement,
    previous: number | null,
  ) => {
    const restore = () => { input.value = previous === null ? '' : String(previous); };
    const trimmed = raw.trim();
    const capacity = trimmed === '' ? null : Math.trunc(Number(trimmed));

    if (capacity !== null && (Number.isNaN(capacity) || capacity < 0)) {
      toast.error('Seat limit must be zero or more. Leave it blank for no limit.');
      restore();
      return;
    }

    try {
      await updateOccurrence({ occurrenceId, type, parentId: id as number, data: { capacity } }).unwrap();
    } catch {
      toast.error('Could not update the seat limit');
      restore();
    }
  };

  /**
   * These inputs sit inside the parent record's <form>, which has a submit
   * button — so Enter would save the whole record and navigate away.
   */
  const blockEnterSubmit = (e: React.KeyboardEvent, onEnter?: () => void) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    onEnter?.();
  };

  const handleToggleCancelled = async (occurrenceId: number, currentStatus: string) => {
    try {
      await updateOccurrence({
        occurrenceId,
        type,
        parentId: id as number,
        data: { status: currentStatus === 'cancelled' ? 'scheduled' : 'cancelled' },
      }).unwrap();
    } catch {
      toast.error('Could not change that date');
    }
  };

  const handleDeleteOccurrence = async (occurrenceId: number) => {
    if (!window.confirm('Remove this date? A date generated by the repeat rule will come back next time the rule is saved.')) return;
    try {
      await deleteOccurrence({ occurrenceId, type, parentId: id as number }).unwrap();
    } catch {
      toast.error('Could not remove that date');
    }
  };

  const handleClearSeries = async () => {
    if (!window.confirm('Remove the repeat rule and every date it generated? Dates you added by hand are kept.')) return;
    try {
      await deleteSchedule({ type, id: id as number }).unwrap();
      setFrequency('none');
      setWeekdays([]);
      setUntilDate('');
      toast.success('Repeat rule removed');
    } catch {
      toast.error('Could not remove the repeat rule');
    }
  };

  const busy = isSaving || isDeletingSeries || isAdding;

  return (
    <div className="space-y-6">
      {/* Repeat rule */}
      <div className="space-y-4">
        {/* While creating, the first date comes from the form's own Start Date
            field — showing a second one here would be two sources of truth. */}
        <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${hideFirstDate ? 'hidden' : ''}`}>
          <div>
            {/* Optional while creating a course or trip — leaving it blank
                simply means no dates. Required once you are generating. */}
            <label className="mb-2 block text-sm font-medium text-gray-700">
              First date &amp; time{draftProvidesFirstDate && isDraft ? '' : ' *'}
            </label>
            <input
              type="datetime-local"
              value={startAt}
              onChange={(e) => setStartAt(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Ends at</label>
            <input
              type="datetime-local"
              value={endAt}
              onChange={(e) => setEndAt(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-primary-500"
            />
            <p className="mt-1 text-xs text-gray-500">Applied to every date in the series.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Repeat</label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as ScheduleFrequency)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-primary-500"
            >
              {FREQUENCIES.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>

          {frequency !== 'none' && (
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Repeat every</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={52}
                  value={interval}
                  onChange={(e) => setIntervalValue(Math.max(1, Number(e.target.value) || 1))}
                  className="w-24 rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-600">
                  {frequency === 'daily' ? 'day(s)' : frequency === 'weekly' ? 'week(s)' : 'month(s)'}
                </span>
              </div>
            </div>
          )}
        </div>

        {frequency === 'weekly' && (
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">On these days</label>
            <div className="flex flex-wrap gap-2">
              {WEEKDAYS.map((day) => (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => toggleWeekday(day.value)}
                  aria-pressed={weekdays.includes(day.value)}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                    weekdays.includes(day.value)
                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                      : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>
            <p className="mt-1 text-xs text-gray-500">
              The first date is only included if its own weekday is selected.
            </p>
          </div>
        )}

        {frequency !== 'none' && (
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Repeat until</label>
            <input
              type="date"
              value={untilDate}
              onChange={(e) => setUntilDate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-primary-500 sm:w-64"
            />
            <p className="mt-1 text-xs text-gray-500">
              Dates are generated up to six months ahead, whichever comes first.
            </p>
          </div>
        )}

        {isDraft && (
          <p className="rounded-lg border border-primary-100 bg-primary-50 px-4 py-3 text-sm text-primary-800">
            {draftProvidesFirstDate
              ? 'Optional. Set a first date to give this a schedule — dates are generated when you save. Leave it blank and no dates are added.'
              : 'Dates will be generated from the Start Date & Time above when you save.'}
            {' '}You can adjust individual dates and seat limits afterwards.
          </p>
        )}

        <div className={`flex flex-wrap items-center gap-3 ${isDraft ? 'hidden' : ''}`}>
          <button
            type="button"
            onClick={handleSaveRule}
            disabled={busy}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary-600 to-accent-600 px-5 py-2.5 font-medium text-white hover:shadow-lg disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarPlus className="h-4 w-4" />}
            {data?.series ? 'Update dates' : 'Generate dates'}
          </button>

          {data?.series && (
            <button
              type="button"
              onClick={handleClearSeries}
              disabled={busy}
              className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              <RotateCcw className="h-4 w-4" />
              Remove repeat rule
            </button>
          )}
        </div>
      </div>

      {/* Generated dates — nothing exists until the record is saved. */}
      <div className={isDraft ? 'hidden' : ''}>
        <div className="mb-3 flex items-center justify-between">
          <h4 className="text-sm font-semibold text-gray-900">
            Dates {occurrences.length > 0 && <span className="font-normal text-gray-500">({upcomingCount} upcoming)</span>}
          </h4>
          {isFetching && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
        </div>

        {isLoading ? (
          <div className="py-8 text-center"><Loader2 className="mx-auto h-5 w-5 animate-spin text-gray-400" /></div>
        ) : occurrences.length === 0 ? (
          <p className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
            No dates yet. Set the first date above and generate.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200">
            {occurrences.map((o) => (
              <li
                key={o.id}
                className={`flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center ${o.status === 'cancelled' ? 'bg-gray-50' : ''}`}
              >
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-medium ${o.status === 'cancelled' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                    {formatDate(o.start_at)}
                  </p>
                  <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                    {o.series_id === null && (
                      <span className="rounded bg-blue-50 px-1.5 py-0.5 text-blue-700">One-off</span>
                    )}
                    {o.is_past && <span>Past</span>}
                    {o.status === 'cancelled' && <span className="text-red-600">Cancelled</span>}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-gray-400" aria-hidden="true" />
                    <input
                      type="number"
                      min={0}
                      step={1}
                      aria-label="Seat limit for this date (optional)"
                      defaultValue={o.capacity ?? ''}
                      placeholder="—"
                      onKeyDown={(e) => blockEnterSubmit(e, () => (e.target as HTMLInputElement).blur())}
                      onBlur={(e) => {
                        const raw = e.target.value;
                        const next = raw.trim() === '' ? null : Math.trunc(Number(raw));
                        if (next !== (o.capacity ?? null)) {
                          handleCapacityChange(o.id, raw, e.target, o.capacity ?? null);
                        }
                      }}
                      className="w-20 rounded border border-gray-300 px-2 py-1 text-sm focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleCancelled(o.id, o.status)}
                    title={o.status === 'cancelled' ? 'Restore this date' : 'Cancel this date'}
                    aria-label={o.status === 'cancelled' ? 'Restore this date' : 'Cancel this date'}
                    className="rounded p-2 text-gray-500 hover:bg-gray-100"
                  >
                    {o.status === 'cancelled' ? <RotateCcw className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteOccurrence(o.id)}
                    title="Remove this date"
                    aria-label="Remove this date"
                    className="rounded p-2 text-gray-500 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* One-off date outside the rule */}
      <div className={`border-t border-gray-100 pt-4 ${isDraft ? 'hidden' : ''}`}>
        <label className="mb-2 block text-sm font-medium text-gray-700">Add a single date</label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="datetime-local"
            value={oneOffDate}
            onChange={(e) => setOneOffDate(e.target.value)}
            onKeyDown={(e) => blockEnterSubmit(e, handleAddOneOff)}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-primary-500"
          />
          <button
            type="button"
            onClick={handleAddOneOff}
            disabled={!oneOffDate || busy}
            className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Add date
          </button>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Kept separate from the repeat rule, so regenerating will not remove it.
        </p>
      </div>
    </div>
  );
};

export default ScheduleEditor;
