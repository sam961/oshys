<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Event;
use App\Models\ScheduleOccurrence;
use App\Models\Trip;
use App\Support\VenueTime;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

/**
 * Dates for events, courses and trips.
 *
 * A plain list: the admin adds each date by hand, edits it, or removes it.
 * There is no repeat rule — the dates are the record, not something derived
 * from one.
 *
 * All datetimes crossing this boundary are venue-local (Asia/Riyadh) naive
 * strings, matching what the admin's date and time controls produce. The
 * conversion to the UTC we store happens here, once, via VenueTime.
 */
class ScheduleController extends Controller
{
    /**
     * Only these may be scheduled. The type arrives in the URL, so this is a
     * whitelist rather than a lookup — never resolve a class name from input.
     */
    private const SCHEDULABLE_TYPES = [
        'events' => Event::class,
        'courses' => Course::class,
        'trips' => Trip::class,
    ];

    /** Every date on this record, soonest first. */
    public function show(string $type, int $id)
    {
        $model = $this->resolve($type, $id);

        return response()->json([
            'occurrences' => $model->occurrences()->orderBy('start_at')->get()
                ->map(fn (ScheduleOccurrence $o) => $this->present($o))
                ->values(),
        ]);
    }

    /** Add a date. */
    public function store(Request $request, string $type, int $id)
    {
        $model = $this->resolve($type, $id);
        $validated = $this->validateDate($request);

        $start = VenueTime::toUtc($validated['start_at']);
        $this->rejectPast($start);

        $model->occurrences()->create([
            'start_at' => $start,
            'end_at' => $this->endFrom($validated, $start),
            'capacity' => $validated['capacity'] ?? null,
        ]);

        $this->syncLegacyDates($model);

        return $this->show($type, $id);
    }

    /** Change a date's start, end or seat limit. */
    public function update(Request $request, ScheduleOccurrence $occurrence)
    {
        $validated = $this->validateDate($request, partial: true);
        $changes = [];

        if (array_key_exists('start_at', $validated)) {
            $moved = VenueTime::toUtc($validated['start_at']);

            // A date that has already happened stays editable — its seat limit
            // may still need correcting — but it cannot be *moved* backwards.
            //
            // Compared to the minute, not the instant: the admin's controls
            // have minute precision, so a stored value carrying seconds would
            // look like a move every time it was sent back unchanged.
            $unchanged = $moved->format('Y-m-d H:i') === $occurrence->start_at->format('Y-m-d H:i');

            if (! $unchanged) {
                $this->rejectPast($moved);
            }

            $changes['start_at'] = $moved;
        }

        if (array_key_exists('end_at', $validated)) {
            $start = $changes['start_at'] ?? $occurrence->start_at;
            $changes['end_at'] = $this->endFrom($validated, $start);
        }

        if (array_key_exists('capacity', $validated)) {
            $changes['capacity'] = $validated['capacity'];
        }

        $occurrence->update($changes);

        if ($parent = $occurrence->schedulable) {
            $this->syncLegacyDates($parent);
        }

        return response()->json($this->present($occurrence->fresh()));
    }

    /** Remove a date. */
    public function destroy(ScheduleOccurrence $occurrence)
    {
        $parent = $occurrence->schedulable;
        $occurrence->delete();

        if ($parent) {
            $this->syncLegacyDates($parent);
        }

        return response()->json(['message' => 'Date removed']);
    }

    private function validateDate(Request $request, bool $partial = false): array
    {
        $required = $partial ? 'sometimes' : 'required';

        return $request->validate([
            'start_at' => [$required, 'date'],
            'end_at' => ['nullable', 'date'],
            'capacity' => ['nullable', 'integer', 'min:0'],
        ]);
    }

    /**
     * The end instant, or null.
     *
     * Checked after conversion rather than with `after:start_at`, because the
     * incoming strings are venue-local and the validator would compare them as
     * UTC — three hours out.
     */
    private function endFrom(array $validated, \Illuminate\Support\Carbon $start): ?\Illuminate\Support\Carbon
    {
        if (empty($validated['end_at'])) {
            return null;
        }

        $end = VenueTime::toUtc($validated['end_at']);

        if ($end->lessThanOrEqualTo($start)) {
            throw ValidationException::withMessages([
                'end_at' => 'The end must be after the start.',
            ]);
        }

        return $end;
    }

    /** Same reasoning as endFrom: compare instants, not venue-local strings. */
    private function rejectPast(\Illuminate\Support\Carbon $start): void
    {
        if ($start->lessThan(now())) {
            throw ValidationException::withMessages([
                'start_at' => 'The date cannot be in the past.',
            ]);
        }
    }

    /**
     * Keep events.start_date / end_date pointing at the next date.
     *
     * The public event pages still read those columns, so removing or moving
     * the soonest date has to update them or the site advertises a date that
     * no longer exists. Falls back to the earliest date overall when every
     * date is in the past, rather than nulling a column the site reads.
     */
    private function syncLegacyDates(Model $model): void
    {
        if (! $model instanceof Event) {
            return;
        }

        $next = $model->occurrences()->upcoming()->orderBy('start_at')->first()
            ?? $model->occurrences()->orderBy('start_at')->first();

        if (! $next) {
            return;
        }

        $model->forceFill([
            'start_date' => $next->start_at,
            'end_date' => $next->end_at,
        ])->save();
    }

    /** @return Model&\App\Traits\Schedulable */
    private function resolve(string $type, int $id): Model
    {
        $class = self::SCHEDULABLE_TYPES[$type] ?? abort(404, 'Not a schedulable type');

        return $class::findOrFail($id);
    }

    /**
     * Dates leave as venue-local naive strings so the admin's date and time
     * controls round-trip without the browser reinterpreting them.
     */
    private function present(ScheduleOccurrence $occurrence): array
    {
        return [
            'id' => $occurrence->id,
            'start_at' => VenueTime::toVenue($occurrence->start_at)->format('Y-m-d\TH:i'),
            'end_at' => $occurrence->end_at ? VenueTime::toVenue($occurrence->end_at)->format('Y-m-d\TH:i') : null,
            'capacity' => $occurrence->capacity,
            'is_past' => $occurrence->start_at->isPast(),
        ];
    }
}
