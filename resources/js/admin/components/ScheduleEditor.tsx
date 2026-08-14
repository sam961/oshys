import React, { useEffect, useRef, useState } from 'react';
import { CalendarPlus, Loader2, Plus, Trash2, Users, X } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  useGetScheduleQuery,
  useAddOccurrenceMutation,
  useUpdateOccurrenceMutation,
  useDeleteOccurrenceMutation,
} from '../../services/api';
import type { SchedulableType, UpcomingDate } from '../../types';
import { formatDayTime, weekdayShort } from '../../utils/dates';
import { DateTimeField } from './DateTimeField';

/** A date the admin has entered but not yet saved — only while creating. */
export interface DraftDate {
  start_at: string;
  end_at: string | null;
  capacity: number | null;
}

interface ScheduleEditorProps {
  type: SchedulableType;
  /** Parent record id. Null while the record is still being created. */
  id: number | null;
  /**
   * Creation mode: there is no record to attach dates to yet, so they are held
   * here and saved by the parent once it has an id.
   */
  onDraftChange?: (dates: DraftDate[]) => void;
}

const pad = (n: number) => String(n).padStart(2, '0');
const nowForInput = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
const isPast = (value: string): boolean => !!value && value < nowForInput();

const describe = (start: string, end: string | null): string => {
  const label = `${weekdayShort(start)} ${formatDayTime(start)}`;
  if (!end) return label;
  // Same day: show just the finishing time rather than repeating the date.
  return end.slice(0, 10) === start.slice(0, 10)
    ? `${label} – ${end.slice(11, 16)}`
    : `${label} – ${weekdayShort(end)} ${formatDayTime(end)}`;
};

/**
 * The dates something runs on: add, edit, remove.
 *
 * Deliberately a plain list. An earlier version generated dates from a repeat
 * rule, which meant the admin had to think in rules rather than dates and could
 * not simply fix one. Each row here is exactly what it looks like — a date
 * someone typed — and editing one changes only that one.
 */
export const ScheduleEditor: React.FC<ScheduleEditorProps> = ({ type, id, onDraftChange }) => {
  const isDraft = id === null && typeof onDraftChange === 'function';
  const skip = id === null;

  const { data, isLoading, isFetching } = useGetScheduleQuery({ type, id: id ?? 0 }, { skip });
  const [addOccurrence, { isLoading: isAdding }] = useAddOccurrenceMutation();
  const [updateOccurrence] = useUpdateOccurrenceMutation();
  const [deleteOccurrence] = useDeleteOccurrenceMutation();

  // The "add a date" row.
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  const [capacity, setCapacity] = useState('');

  // Dates entered before the record exists.
  const [drafts, setDrafts] = useState<DraftDate[]>([]);
  const notifyDraft = useRef(onDraftChange);
  notifyDraft.current = onDraftChange;
  useEffect(() => { notifyDraft.current?.(drafts); }, [drafts]);

  const saved = data?.occurrences ?? [];
  const rows = isDraft
    ? drafts.map((d, i) => ({ id: -(i + 1), ...d, is_past: false }))
    : saved;

  const resetForm = () => { setStartAt(''); setEndAt(''); setCapacity(''); };

  const validate = (): boolean => {
    if (!startAt) { toast.error('Pick a start date and time.'); return false; }
    if (isPast(startAt)) { toast.error('That date has already passed.'); return false; }
    if (endAt && endAt <= startAt) { toast.error('The end must be after the start.'); return false; }
    const seats = capacity.trim() === '' ? null : Number(capacity);
    if (seats !== null && (Number.isNaN(seats) || seats < 0)) {
      toast.error('Seat limit must be zero or more.'); return false;
    }
    return true;
  };

  const handleAdd = async () => {
    if (!validate()) return;
    const payload: DraftDate = {
      start_at: startAt,
      end_at: endAt || null,
      capacity: capacity.trim() === '' ? null : Math.trunc(Number(capacity)),
    };

    if (isDraft) {
      setDrafts((prev) => [...prev, payload].sort((a, b) => a.start_at.localeCompare(b.start_at)));
      resetForm();
      return;
    }

    try {
      await addOccurrence({ type, id: id as number, data: payload }).unwrap();
      resetForm();
      toast.success('Date added');
    } catch (error: any) {
      const messages = error?.data?.errors ? Object.values(error.data.errors).flat() : null;
      toast.error((messages?.[0] as string) ?? 'Could not add that date');
    }
  };

  const handleRemove = async (row: { id: number }, index: number) => {
    if (isDraft) {
      setDrafts((prev) => prev.filter((_, i) => i !== index));
      return;
    }
    if (!window.confirm('Remove this date?')) return;
    try {
      await deleteOccurrence({ occurrenceId: row.id, type, parentId: id as number }).unwrap();
      toast.success('Date removed');
    } catch {
      toast.error('Could not remove that date');
    }
  };

  /**
   * Saved rows edit in place. The input is uncontrolled, so a rejection has to
   * put the old value back or it keeps showing a number the database lacks.
   */
  const handleCapacity = async (row: UpcomingDate, raw: string, input: HTMLInputElement) => {
    const restore = () => { input.value = row.capacity === null ? '' : String(row.capacity); };
    const next = raw.trim() === '' ? null : Math.trunc(Number(raw));

    if (next !== null && (Number.isNaN(next) || next < 0)) {
      toast.error('Seat limit must be zero or more. Leave it blank for no limit.');
      restore();
      return;
    }
    if (next === (row.capacity ?? null)) return;

    try {
      await updateOccurrence({ occurrenceId: row.id, type, parentId: id as number, data: { capacity: next } }).unwrap();
    } catch {
      toast.error('Could not update the seat limit');
      restore();
    }
  };

  const handleTime = async (row: UpcomingDate, field: 'start_at' | 'end_at', value: string) => {
    if (field === 'start_at' && !value) return;
    try {
      await updateOccurrence({
        occurrenceId: row.id, type, parentId: id as number,
        data: { [field]: value || null } as Partial<UpcomingDate>,
      }).unwrap();
    } catch (error: any) {
      const messages = error?.data?.errors ? Object.values(error.data.errors).flat() : null;
      toast.error((messages?.[0] as string) ?? 'Could not change that date');
    }
  };

  const [editing, setEditing] = useState<number | null>(null);

  return (
    <div className="space-y-5">
      {/* Add a date */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DateTimeField label="Starts" value={startAt} onChange={setStartAt} min={nowForInput()} required clearable />
          <DateTimeField
            label="Ends"
            value={endAt}
            onChange={setEndAt}
            min={startAt || nowForInput()}
            clearable
            durationsFrom={startAt}
            help="Optional."
          />
        </div>

        <div className="mt-4 flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Seat limit</label>
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4 text-gray-400" />
              <input
                type="number"
                min={0}
                value={capacity}
                placeholder="No limit"
                onChange={(e) => setCapacity(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAdd(); } }}
                className="w-28 rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500"
                aria-label="Seat limit (optional)"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            disabled={isAdding || !startAt}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary-600 to-accent-600 px-5 py-2.5 font-medium text-white hover:shadow-lg disabled:opacity-50"
          >
            {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Add date
          </button>
        </div>
      </div>

      {/* The dates */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h4 className="text-sm font-semibold text-gray-900">
            Dates {rows.length > 0 && <span className="font-normal text-gray-500">({rows.length})</span>}
          </h4>
          {isFetching && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
        </div>

        {isLoading ? (
          <div className="py-8 text-center"><Loader2 className="mx-auto h-5 w-5 animate-spin text-gray-400" /></div>
        ) : rows.length === 0 ? (
          <p className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
            <CalendarPlus className="mx-auto mb-2 h-5 w-5 text-gray-400" />
            No dates yet. Add one above.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200">
            {rows.map((row, index) => (
              <li key={row.id} className="px-4 py-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-medium ${row.is_past ? 'text-gray-400' : 'text-gray-900'}`}>
                      {describe(row.start_at, row.end_at)}
                    </p>
                    {row.is_past && <span className="text-xs text-gray-400">Past</span>}
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5" title="Optional seat limit">
                      <Users className="h-4 w-4 text-gray-400" aria-hidden="true" />
                      <input
                        type="number"
                        min={0}
                        defaultValue={row.capacity ?? ''}
                        placeholder="—"
                        disabled={isDraft}
                        aria-label="Seat limit for this date"
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); (e.target as HTMLInputElement).blur(); } }}
                        onBlur={(e) => !isDraft && handleCapacity(row as UpcomingDate, e.target.value, e.target)}
                        className="w-20 rounded border border-gray-300 px-2 py-1 text-sm focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                      />
                    </div>

                    {!isDraft && (
                      <button
                        type="button"
                        onClick={() => setEditing(editing === row.id ? null : row.id)}
                        className="rounded px-2 py-1 text-xs font-medium text-primary-600 hover:bg-primary-50"
                      >
                        {editing === row.id ? 'Done' : 'Change time'}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleRemove(row, index)}
                      title="Remove this date"
                      aria-label="Remove this date"
                      className="rounded p-2 text-gray-500 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {editing === row.id && !isDraft && (
                  <div className="mt-3 grid grid-cols-1 gap-4 border-t border-gray-100 pt-3 sm:grid-cols-2">
                    <DateTimeField
                      label="Starts"
                      value={row.start_at}
                      onChange={(v) => handleTime(row as UpcomingDate, 'start_at', v)}
                      min={row.is_past ? undefined : nowForInput()}
                    />
                    <DateTimeField
                      label="Ends"
                      value={row.end_at ?? ''}
                      onChange={(v) => handleTime(row as UpcomingDate, 'end_at', v)}
                      min={row.start_at}
                      clearable
                      durationsFrom={row.start_at}
                    />
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}

        {isDraft && rows.length > 0 && (
          <p className="mt-2 text-xs text-gray-500">
            These are saved when you create the record.
          </p>
        )}
      </div>
    </div>
  );
};

export default ScheduleEditor;
