import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ExternalLink, MapPin, Pencil, Tag, Users, X } from 'lucide-react';
import type { Event } from '../../types';
import { sanitizeRichText } from '../../utils/sanitizeHtml';
import { formatDayTime, weekdayShort } from '../../utils/dates';

interface EventPreviewModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Read-only look at an event.
 *
 * The eye icon used to open the old edit modal, which showed the description in
 * a plain textarea — so a rich-text body appeared as raw "<p>…</p>" — and could
 * not touch the schedule at all. Editing belongs on the edit page; this is
 * purely for looking, and shows the thing the list cannot: every date.
 */
export const EventPreviewModal: React.FC<EventPreviewModalProps> = ({ event, isOpen, onClose }) => {
  if (!isOpen || !event) return null;

  const dates = event.upcoming_dates ?? [];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative flex max-h-[85vh] w-full max-w-2xl flex-col rounded-xl bg-white shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-6 py-4">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold text-gray-900">{event.title}</h2>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 capitalize text-gray-700">
                <Tag className="h-3 w-3" />{event.type}
              </span>
              <span className={`rounded-full px-2 py-0.5 ${event.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {event.is_active ? 'Active' : 'Inactive'}
              </span>
              {event.slug && <span className="truncate text-gray-400">/events/{event.slug}</span>}
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            {event.location && (
              <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4 text-gray-400" />{event.location}</span>
            )}
            {event.max_participants != null && (
              <span className="inline-flex items-center gap-1.5"><Users className="h-4 w-4 text-gray-400" />{event.max_participants} seats</span>
            )}
            {event.price != null && <span>SAR {event.price}</span>}
          </div>

          {/* Rendered, not printed as source — this is the whole point of the
              rich-text editor. */}
          <div>
            <h3 className="mb-2 text-sm font-semibold text-gray-900">Description</h3>
            <div
              className="prose prose-sm max-w-none text-gray-700"
              dangerouslySetInnerHTML={{ __html: sanitizeRichText(event.description) }}
            />
          </div>

          <div>
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900">
              <Calendar className="h-4 w-4 text-primary-600" />
              Upcoming dates {dates.length > 0 && <span className="font-normal text-gray-500">({dates.length})</span>}
            </h3>
            {dates.length === 0 ? (
              <p className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-3 py-4 text-center text-sm text-gray-500">
                No upcoming dates. Add them in the editor.
              </p>
            ) : (
              <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200 text-sm">
                {dates.map((d) => (
                  <li key={d.id} className="flex items-center justify-between px-3 py-2">
                    <span className="text-gray-900">{weekdayShort(d.start_at)} {formatDayTime(d.start_at)}</span>
                    {d.capacity != null && <span className="text-xs text-gray-500">{d.capacity} seats</span>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-gray-200 px-6 py-4">
          {event.slug && (
            <a
              href={`/events/${event.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <ExternalLink className="h-4 w-4" />
              View on site
            </a>
          )}
          <Link
            to={`/admin/events/${event.id}/edit`}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary-600 to-accent-600 px-4 py-2 text-sm font-medium text-white hover:shadow-lg"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Link>
        </div>
      </div>
    </div>
  );
};
