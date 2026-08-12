<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;

/**
 * The recurrence rule behind a set of dates.
 *
 * A rule with frequency 'none' is a single date — kept in the same structure so
 * the generator and the admin UI have one path rather than two.
 */
class ScheduleSeries extends Model
{
    protected $table = 'schedule_series';

    protected $fillable = [
        'schedulable_type',
        'schedulable_id',
        'frequency',
        'interval',
        'weekdays',
        'until_date',
        'generated_through',
    ];

    protected $casts = [
        'weekdays' => 'array',
        'until_date' => 'date',
        'generated_through' => 'date',
        'interval' => 'integer',
    ];

    public const FREQUENCY_NONE = 'none';
    public const FREQUENCY_DAILY = 'daily';
    public const FREQUENCY_WEEKLY = 'weekly';
    public const FREQUENCY_MONTHLY = 'monthly';

    public const FREQUENCIES = [
        self::FREQUENCY_NONE,
        self::FREQUENCY_DAILY,
        self::FREQUENCY_WEEKLY,
        self::FREQUENCY_MONTHLY,
    ];

    public function schedulable(): MorphTo
    {
        return $this->morphTo();
    }

    public function occurrences(): HasMany
    {
        return $this->hasMany(ScheduleOccurrence::class, 'series_id');
    }

    public function repeats(): bool
    {
        return $this->frequency !== self::FREQUENCY_NONE;
    }
}
