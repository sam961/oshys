<?php

namespace App\Services;

use App\Models\ScheduleOccurrence;
use App\Models\ScheduleSeries;
use App\Support\VenueTime;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * Turns a recurrence rule into concrete dates.
 *
 * Dates are materialised as rows the moment a series is saved. This host has no
 * task scheduler, so nothing would extend a series later — which is also why
 * the horizon is capped rather than open-ended.
 *
 * Regenerating preserves what a human changed: a date whose capacity was
 * overridden, or which was cancelled, keeps that state. Preservation is keyed
 * on the venue-local calendar day rather than the exact instant, because
 * "move the Tuesday class from 10am to 11am" is a routine edit and must not
 * silently wipe every override on the series.
 */
class OccurrenceGenerator
{
    /**
     * Rebuild a model's dates from its series rule.
     *
     * @param  Model  $schedulable  Event, Course or Trip
     * @param  Carbon  $firstStart  UTC instant of the first date
     * @param  Carbon|null  $firstEnd  UTC instant the first date ends, if any
     * @return EloquentCollection<int, ScheduleOccurrence>
     */
    public function generate(Model $schedulable, ScheduleSeries $series, Carbon $firstStart, ?Carbon $firstEnd = null): EloquentCollection
    {
        $starts = $this->expand($series, $firstStart);

        // A reversed end time would otherwise propagate a negative duration to
        // every date in the series.
        $duration = $firstEnd && $firstEnd->greaterThan($firstStart)
            ? $firstStart->diffInSeconds($firstEnd)
            : null;

        // The delete and the inserts must stand or fall together: a failure
        // between them would leave the record with no dates at all, and the
        // overrides being carried across exist only in memory at that point.
        return DB::transaction(function () use ($schedulable, $series, $starts, $duration) {
            $preserved = $this->preservableState($schedulable, $series);

            $schedulable->occurrences()->where('series_id', $series->id)->delete();

            $now = now();
            $rows = [];

            foreach ($starts as $start) {
                $carried = $this->takePreserved($preserved, $start);

                $rows[] = [
                    'schedulable_type' => $schedulable->getMorphClass(),
                    'schedulable_id' => $schedulable->getKey(),
                    'series_id' => $series->id,
                    'start_at' => $start->utc()->format('Y-m-d H:i:s'),
                    'end_at' => $duration !== null
                        ? $start->copy()->addSeconds($duration)->utc()->format('Y-m-d H:i:s')
                        : null,
                    'capacity' => $carried['capacity'] ?? null,
                    'status' => $carried['status'] ?? ScheduleOccurrence::STATUS_SCHEDULED,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }

            // One insert rather than ~180 — this runs inside an admin's save
            // request against a remote database on shared hosting.
            foreach (array_chunk($rows, 200) as $chunk) {
                ScheduleOccurrence::insert($chunk);
            }

            $series->update([
                'generated_through' => $starts->isEmpty()
                    ? null
                    : VenueTime::toVenue($starts->last())->toDateString(),
            ]);

            return $schedulable->occurrences()
                ->where('series_id', $series->id)
                ->orderBy('start_at')
                ->get();
        });
    }

    /**
     * Capacity overrides and cancellations from the dates about to be replaced,
     * grouped by venue-local day so a change of time-of-day keeps them.
     *
     * @return Collection<string, Collection<int, array{capacity: int|null, status: string}>>
     */
    private function preservableState(Model $schedulable, ScheduleSeries $series): Collection
    {
        return $schedulable->occurrences()
            ->where('series_id', $series->id)
            ->orderBy('start_at')
            ->get()
            ->filter(fn (ScheduleOccurrence $o) => $o->capacity !== null || $o->isCancelled())
            ->groupBy(fn (ScheduleOccurrence $o) => VenueTime::toVenue($o->start_at)->toDateString())
            ->map(fn ($group) => $group->map(fn (ScheduleOccurrence $o) => [
                'capacity' => $o->capacity,
                'status' => $o->status,
            ])->values());
    }

    /**
     * Consume the next preserved state for the day this date falls on, so two
     * occurrences on the same day keep their own values rather than sharing one.
     *
     * @param  Collection<string, Collection<int, array>>  $preserved
     * @return array{capacity?: int|null, status?: string}
     */
    private function takePreserved(Collection $preserved, Carbon $start): array
    {
        $key = VenueTime::toVenue($start)->toDateString();
        $forDay = $preserved->get($key);

        if (! $forDay || $forDay->isEmpty()) {
            return [];
        }

        return $forDay->shift() ?? [];
    }

    /**
     * Expand a rule into the UTC instants it lands on.
     *
     * The first date is always included, even when the rule would otherwise
     * produce nothing (an until_date earlier than the start, say) — a record
     * that was given a date should never end up with none.
     *
     * @return Collection<int, Carbon>
     */
    public function expand(ScheduleSeries $series, Carbon $firstStart): Collection
    {
        $limit = $this->horizon($series, $firstStart);
        $interval = $this->interval($series);

        $dates = match ($series->frequency) {
            ScheduleSeries::FREQUENCY_DAILY => $this->step($firstStart, $limit, fn (Carbon $d) => $d->copy()->addDays($interval)),
            ScheduleSeries::FREQUENCY_WEEKLY => $this->weekly($series, $firstStart, $limit, $interval),
            ScheduleSeries::FREQUENCY_MONTHLY => $this->monthly($firstStart, $limit, $interval),
            default => collect([$firstStart->copy()]),
        };

        return $dates->isEmpty() ? collect([$firstStart->copy()]) : $dates;
    }

    /**
     * Repeat interval, floored at 1.
     *
     * Zero or negative would either stand still or walk backwards, and a
     * backwards cursor never reaches the horizon — an infinite loop. The
     * column is unsigned so a negative cannot normally be stored, but the
     * generator must not depend on the schema to stay terminating.
     */
    private function interval(ScheduleSeries $series): int
    {
        return max(1, (int) $series->interval);
    }

    /**
     * The last instant a series may produce: its own until_date, clamped to the
     * configured horizon. The clamp is not optional — a rule with no end date
     * would otherwise generate forever.
     */
    private function horizon(ScheduleSeries $series, Carbon $firstStart): Carbon
    {
        $months = (int) config('cas.schedule_horizon_months', 6);
        $cap = $firstStart->copy()->addMonthsNoOverflow($months);

        if ($series->until_date === null) {
            return $cap;
        }

        // until_date is a venue-local calendar day and is inclusive, so the
        // series may run up to the very end of it.
        $until = VenueTime::toUtc($series->until_date->toDateString() . ' 23:59:59');

        return $until->lessThan($cap) ? $until : $cap;
    }

    /**
     * @param  callable(Carbon): Carbon  $advance
     * @return Collection<int, Carbon>
     */
    private function step(Carbon $start, Carbon $limit, callable $advance): Collection
    {
        $dates = collect();
        $cursor = $start->copy();

        while ($cursor->lessThanOrEqualTo($limit)) {
            $dates->push($cursor->copy());
            $next = $advance($cursor);

            // A cursor that fails to advance would spin forever.
            if ($next->lessThanOrEqualTo($cursor)) {
                break;
            }

            $cursor = $next;
        }

        return $dates;
    }

    /**
     * Weekly rules may land on several weekdays — "every Tuesday and Thursday".
     * Weekdays are ISO (1 = Monday … 7 = Sunday) and interpreted in venue-local
     * time, since that is the day the admin means.
     *
     * Note the series' own start date is dropped when its weekday is not among
     * the selected ones. That follows the admin's stated rule, but the Phase 2
     * UI must show the generated dates so it is never a surprise.
     *
     * @return Collection<int, Carbon>
     */
    private function weekly(ScheduleSeries $series, Carbon $firstStart, Carbon $limit, int $interval): Collection
    {
        $weekdays = collect($series->weekdays ?? [])
            ->map(fn ($d) => (int) $d)
            ->filter(fn (int $d) => $d >= 1 && $d <= 7)
            ->unique()
            ->sort()
            ->values();

        $localStart = VenueTime::toVenue($firstStart);

        // No weekdays chosen means "the same weekday as the first date".
        if ($weekdays->isEmpty()) {
            return $this->step($firstStart, $limit, fn (Carbon $d) => $d->copy()->addWeeks($interval));
        }

        $dates = collect();
        // Anchor on the Monday of the first date's week so "every 2 weeks"
        // counts whole weeks rather than drifting from an arbitrary weekday.
        $weekAnchor = $localStart->copy()->startOfWeek(Carbon::MONDAY);

        while ($weekAnchor->copy()->utc()->lessThanOrEqualTo($limit)) {
            foreach ($weekdays as $weekday) {
                $candidate = $weekAnchor->copy()
                    ->addDays($weekday - 1)
                    ->setTime($localStart->hour, $localStart->minute, $localStart->second)
                    ->utc();

                if ($candidate->lessThan($firstStart) || $candidate->greaterThan($limit)) {
                    continue;
                }

                $dates->push($candidate);
            }

            $weekAnchor->addWeeks($interval);
        }

        return $dates->sort(fn (Carbon $a, Carbon $b) => $a <=> $b)->values();
    }

    /**
     * Monthly rules keep the day-of-month of the first date.
     *
     * addMonthsNoOverflow is deliberate: the 31st in a 30-day month must not
     * roll into the 1st of the next one. Such months are skipped instead, which
     * is what "monthly on the 31st" means to a person.
     *
     * @return Collection<int, Carbon>
     */
    private function monthly(Carbon $firstStart, Carbon $limit, int $interval): Collection
    {
        $localStart = VenueTime::toVenue($firstStart);
        $targetDay = (int) $localStart->day;

        $dates = collect();
        $monthCursor = $localStart->copy()->startOfMonth();

        while ($monthCursor->copy()->utc()->lessThanOrEqualTo($limit)) {
            // Only months that actually contain the target day qualify.
            if ($targetDay <= $monthCursor->daysInMonth) {
                $candidate = $monthCursor->copy()
                    ->setDay($targetDay)
                    ->setTime($localStart->hour, $localStart->minute, $localStart->second)
                    ->utc();

                if ($candidate->greaterThanOrEqualTo($firstStart) && $candidate->lessThanOrEqualTo($limit)) {
                    $dates->push($candidate);
                }
            }

            $monthCursor->addMonthsNoOverflow($interval);
        }

        return $dates->values();
    }
}
