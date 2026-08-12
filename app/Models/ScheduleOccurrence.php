<?php

namespace App\Models;

use App\Support\VenueTime;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

/**
 * One concrete date on which an event, course or trip happens.
 */
class ScheduleOccurrence extends Model
{
    /**
     * The morph columns are deliberately absent: they are set by the
     * relationship (`$event->occurrences()->create(...)`), so leaving them
     * mass-assignable would let a request re-point a date at another record.
     */
    protected $fillable = [
        'series_id',
        'start_at',
        'end_at',
        'capacity',
        'status',
    ];

    protected $casts = [
        'start_at' => 'datetime',
        'end_at' => 'datetime',
        'capacity' => 'integer',
    ];

    public const STATUS_SCHEDULED = 'scheduled';
    public const STATUS_CANCELLED = 'cancelled';

    public function schedulable(): MorphTo
    {
        return $this->morphTo();
    }

    public function series(): BelongsTo
    {
        return $this->belongsTo(ScheduleSeries::class, 'series_id');
    }

    /** Dates the public site should show: not cancelled. */
    public function scopeScheduled(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_SCHEDULED);
    }

    /**
     * Dates that have not happened yet.
     *
     * Compared against real UTC "now" rather than a venue-local wall clock, so
     * this is correct regardless of where the request comes from.
     */
    public function scopeUpcoming(Builder $query): Builder
    {
        return $query->where('start_at', '>=', now());
    }

    public function isCancelled(): bool
    {
        return $this->status === self::STATUS_CANCELLED;
    }

    /**
     * The date as the venue experiences it — what public pages and the admin
     * should display, no matter the viewer's own timezone.
     */
    public function startAtVenue(): \Illuminate\Support\Carbon
    {
        return VenueTime::toVenue($this->start_at);
    }
}
