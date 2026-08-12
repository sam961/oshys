<?php

namespace App\Traits;

use App\Models\ScheduleOccurrence;
use App\Models\ScheduleSeries;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\Relations\MorphOne;

/**
 * Gives a model dates.
 *
 * Applied to Event, Course and Trip. Courses and trips had no date fields at
 * all before this; events had a single start/end pair, which the backfill
 * migration turned into their first occurrence.
 */
trait Schedulable
{
    public function occurrences(): MorphMany
    {
        return $this->morphMany(ScheduleOccurrence::class, 'schedulable')
            ->orderBy('start_at');
    }

    /**
     * Dates a visitor should see: scheduled, not yet passed, soonest first.
     *
     * Eager-load this rather than calling it per row — `with('upcomingOccurrences')`
     * on a listing query, not inside the loop.
     */
    public function upcomingOccurrences(): MorphMany
    {
        return $this->occurrences()->scheduled()->upcoming();
    }

    public function series(): MorphOne
    {
        return $this->morphOne(ScheduleSeries::class, 'schedulable');
    }

    /**
     * The next date this runs, or null if nothing is scheduled.
     *
     * Reads from an already-loaded relation when there is one, so calling it
     * inside a listing loop after eager loading does not fire a query per row.
     */
    public function nextOccurrence(): ?ScheduleOccurrence
    {
        if ($this->relationLoaded('upcomingOccurrences')) {
            return $this->getRelation('upcomingOccurrences')->first();
        }

        if ($this->relationLoaded('occurrences')) {
            return $this->getRelation('occurrences')
                ->first(fn (ScheduleOccurrence $o) => ! $o->isCancelled() && $o->start_at >= now());
        }

        return $this->upcomingOccurrences()->first();
    }

    public function hasSchedule(): bool
    {
        if ($this->relationLoaded('occurrences')) {
            return $this->getRelation('occurrences')->isNotEmpty();
        }

        return $this->occurrences()->exists();
    }

    /**
     * Drop the dates when the record is permanently deleted.
     *
     * Polymorphic columns cannot carry a foreign key, so nothing at the
     * database level would remove them. Soft deletes are deliberately not
     * cascaded — restoring the record should bring its dates back with it —
     * which does mean any query starting from ScheduleOccurrence must
     * constrain through the schedulable relation to avoid surfacing dates for
     * a trashed record. Phase 3's calendar queries depend on this.
     */
    public static function bootSchedulable(): void
    {
        static::forceDeleted(function ($model) {
            $model->occurrences()->delete();
            $model->series()->delete();
        });
    }
}
