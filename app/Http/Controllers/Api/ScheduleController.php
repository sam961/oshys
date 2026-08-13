<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Event;
use App\Models\ScheduleOccurrence;
use App\Models\ScheduleSeries;
use App\Models\Trip;
use App\Services\OccurrenceGenerator;
use App\Support\VenueTime;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

/**
 * Scheduling for events, courses and trips.
 *
 * All datetimes crossing this boundary are venue-local (Asia/Riyadh) naive
 * strings, matching what an <input type="datetime-local"> produces and
 * displays. Conversion to the UTC we store happens here, once, via VenueTime.
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

    public function __construct(private readonly OccurrenceGenerator $generator)
    {
    }

    /** The series rule and every date, for the admin editor. */
    public function show(string $type, int $id)
    {
        $model = $this->resolve($type, $id);

        return response()->json([
            'series' => $this->presentSeries($model->series),
            'occurrences' => $model->occurrences()->orderBy('start_at')->get()
                ->map(fn (ScheduleOccurrence $o) => $this->presentOccurrence($o))
                ->values(),
        ]);
    }

    /**
     * Save the repeat rule and regenerate the dates it produces.
     *
     * Hand-added one-off dates carry no series and are left untouched.
     */
    public function store(Request $request, string $type, int $id)
    {
        $model = $this->resolve($type, $id);

        $validated = $request->validate([
            'start_at' => ['required', 'date'],
            'end_at' => ['nullable', 'date', 'after:start_at'],
            'frequency' => ['required', Rule::in(ScheduleSeries::FREQUENCIES)],
            // Floored at 1 by the generator too, but an admin who types 0
            // should be told rather than silently corrected.
            'interval' => ['required', 'integer', 'min:1', 'max:52'],
            'weekdays' => ['nullable', 'array'],
            'weekdays.*' => ['integer', 'between:1,7'],
            // Date-only: the value is concatenated with a time below, and a
            // full datetime here would produce an unparseable string.
            'until_date' => ['nullable', 'date_format:Y-m-d'],
        ]);

        $start = VenueTime::toUtc($validated['start_at']);
        $end = isset($validated['end_at']) ? VenueTime::toUtc($validated['end_at']) : null;

        $this->rejectPastStart($model, $start);

        // Checked here rather than with `after_or_equal` because until_date is
        // a calendar day and start_at is an instant — comparing the raw strings
        // would reject a same-day rule.
        if (! empty($validated['until_date'])) {
            $until = VenueTime::toUtc($validated['until_date'] . ' 23:59:59');
            if ($until->lessThan($start)) {
                throw ValidationException::withMessages([
                    'until_date' => 'The repeat-until date cannot be before the first date.',
                ]);
            }
        }

        // Three writes that must agree: the rule, the dates it produces, and
        // the legacy column the public site still reads. A failure between
        // them would leave a rule that does not describe the dates below it.
        DB::transaction(function () use ($model, $validated, $start, $end) {
            $series = ScheduleSeries::updateOrCreate(
                ['schedulable_type' => $model->getMorphClass(), 'schedulable_id' => $model->getKey()],
                [
                    'starts_at' => $start,
                    'frequency' => $validated['frequency'],
                    'interval' => $validated['interval'],
                    'weekdays' => $validated['frequency'] === ScheduleSeries::FREQUENCY_WEEKLY
                        ? ($validated['weekdays'] ?? [])
                        : null,
                    'until_date' => $validated['until_date'] ?? null,
                ]
            );

            $this->generator->generate($model, $series, $start, $end);
            $this->syncLegacyDates($model);
        });

        return $this->show($type, $id);
    }

    /** Add a single date that is not part of the repeat rule. */
    public function storeOccurrence(Request $request, string $type, int $id)
    {
        $model = $this->resolve($type, $id);

        $validated = $request->validate([
            'start_at' => ['required', 'date'],
            'end_at' => ['nullable', 'date', 'after:start_at'],
            'capacity' => ['nullable', 'integer', 'min:0'],
        ]);

        // Compared after conversion, not with `after_or_equal:now`: the
        // incoming string is venue-local and Laravel would read it as UTC,
        // putting the comparison three hours out.
        $startAt = VenueTime::toUtc($validated['start_at']);

        // A date added by hand is always new, so there is no unchanged-value
        // case to allow through.
        if ($startAt->lessThan(now())) {
            throw ValidationException::withMessages([
                'start_at' => 'The date cannot be in the past.',
            ]);
        }

        $model->occurrences()->create([
            'series_id' => null,
            'start_at' => $startAt,
            'end_at' => isset($validated['end_at']) ? VenueTime::toUtc($validated['end_at']) : null,
            'capacity' => $validated['capacity'] ?? null,
        ]);

        $this->syncLegacyDates($model);

        return $this->show($type, $id);
    }

    /** Change one date's capacity, times, or cancelled state. */
    public function updateOccurrence(Request $request, ScheduleOccurrence $occurrence)
    {
        $validated = $request->validate([
            'start_at' => ['sometimes', 'required', 'date'],
            'end_at' => ['nullable', 'date'],
            'capacity' => ['nullable', 'integer', 'min:0'],
            'status' => ['sometimes', Rule::in([
                ScheduleOccurrence::STATUS_SCHEDULED,
                ScheduleOccurrence::STATUS_CANCELLED,
            ])],
        ]);

        $changes = [];

        if (array_key_exists('start_at', $validated)) {
            $moved = VenueTime::toUtc($validated['start_at']);

            // Only a genuine move is blocked. A date that is already past stays
            // editable — its capacity or cancelled state may still need
            // changing, and that posts the same start_at back unchanged.
            if ($moved->lessThan(now()) && ! $moved->equalTo($occurrence->start_at)) {
                throw ValidationException::withMessages([
                    'start_at' => 'A date cannot be moved into the past.',
                ]);
            }

            $changes['start_at'] = $moved;
        }
        if (array_key_exists('end_at', $validated)) {
            $changes['end_at'] = $validated['end_at'] ? VenueTime::toUtc($validated['end_at']) : null;
        }
        if (array_key_exists('capacity', $validated)) {
            $changes['capacity'] = $validated['capacity'];
        }
        if (array_key_exists('status', $validated)) {
            $changes['status'] = $validated['status'];
        }

        $occurrence->update($changes);

        // Cancelling or moving the soonest date changes which date is next, and
        // the public site still reads the legacy column until Phase 3.
        if ($parent = $occurrence->schedulable) {
            $this->syncLegacyDates($parent);
        }

        return response()->json($this->presentOccurrence($occurrence->fresh()));
    }

    public function destroyOccurrence(ScheduleOccurrence $occurrence)
    {
        $parent = $occurrence->schedulable;
        $occurrence->delete();

        if ($parent) {
            $this->syncLegacyDates($parent);
        }

        return response()->json(['message' => 'Date removed']);
    }

    /** Remove the repeat rule and every date it generated. */
    public function destroy(string $type, int $id)
    {
        $model = $this->resolve($type, $id);

        // Occurrences cascade from the series' foreign key.
        $model->series()->delete();
        $this->syncLegacyDates($model->fresh());

        return $this->show($type, $id);
    }

    /**
     * Refuse a first date that has already passed.
     *
     * The one exception is an existing series whose first date is genuinely in
     * the past — a course that started two months ago and still has months to
     * run. Extending its until_date must not force the admin to move the whole
     * series forward, so an unchanged past start is allowed through. Anything
     * else — a new series, or a changed date — has to be in the future.
     */
    private function rejectPastStart(Model $model, Carbon $start): void
    {
        if ($start->greaterThanOrEqualTo(now())) {
            return;
        }

        // The rule's own anchor, not its first generated date — a weekly
        // Monday rule anchored on a Wednesday starts later than its anchor.
        // Rules predating the anchor column fall back to their earliest date,
        // which is the same value for every frequency except weekly.
        $series = $model->series;
        $anchor = $series?->starts_at
            ?? $series?->occurrences()->orderBy('start_at')->first()?->start_at;

        if ($anchor && $anchor->equalTo($start)) {
            return;
        }

        throw ValidationException::withMessages([
            'start_at' => 'The first date cannot be in the past.',
        ]);
    }

    /**
     * Keep events.start_date / end_date pointing at the first upcoming date.
     *
     * The public site still reads those columns until Phase 3 moves it onto
     * occurrences. Without this the two drift apart the moment a schedule is
     * edited, and the admin sees one time in "Event Details" and a different
     * one in "Dates & Capacity" for the same event.
     *
     * The value written is true UTC, matching the new occurrence semantics —
     * which also means the public site starts showing the correct time rather
     * than the three-hours-late one it shows today.
     */
    private function syncLegacyDates(Model $model): void
    {
        if (! $model instanceof Event) {
            return;
        }

        // The next date that has not happened yet — that is what the listing
        // pages filter on. Falling back to the earliest overall keeps the
        // column populated for a series that is entirely in the past, rather
        // than nulling a column the public site still reads.
        $first = $model->occurrences()->scheduled()->upcoming()->orderBy('start_at')->first()
            ?? $model->occurrences()->scheduled()->orderBy('start_at')->first();

        if (! $first) {
            return;
        }

        $model->forceFill([
            'start_date' => $first->start_at,
            'end_date' => $first->end_at,
        ])->save();
    }

    /**
     * @return Model&\App\Traits\Schedulable
     */
    private function resolve(string $type, int $id): Model
    {
        $class = self::SCHEDULABLE_TYPES[$type] ?? abort(404, 'Not a schedulable type');

        return $class::findOrFail($id);
    }

    private function presentSeries(?ScheduleSeries $series): ?array
    {
        if (! $series) {
            return null;
        }

        return [
            'id' => $series->id,
            'frequency' => $series->frequency,
            'interval' => $series->interval,
            'weekdays' => $series->weekdays ?? [],
            'until_date' => $series->until_date?->toDateString(),
            'generated_through' => $series->generated_through?->toDateString(),
        ];
    }

    /**
     * Dates leave as venue-local naive strings so the admin's datetime-local
     * inputs round-trip without the browser reinterpreting them.
     */
    private function presentOccurrence(ScheduleOccurrence $occurrence): array
    {
        return [
            'id' => $occurrence->id,
            'series_id' => $occurrence->series_id,
            'start_at' => VenueTime::toVenue($occurrence->start_at)->format('Y-m-d\TH:i'),
            'end_at' => $occurrence->end_at ? VenueTime::toVenue($occurrence->end_at)->format('Y-m-d\TH:i') : null,
            'capacity' => $occurrence->capacity,
            'status' => $occurrence->status,
            'is_past' => $occurrence->start_at->isPast(),
        ];
    }
}
