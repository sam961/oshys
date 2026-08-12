<?php

namespace App\Support;

use Carbon\CarbonImmutable;
use Illuminate\Support\Carbon;

/**
 * Translates between the venue's local time and the UTC values we store.
 *
 * The admin types "2026-08-15T10:00" meaning ten in the morning in Al Khobar.
 * Laravel's default casting would read that as 10:00 UTC and store it as such,
 * which is what makes existing events display three hours late. Everything that
 * accepts or emits a schedule datetime goes through here instead.
 */
class VenueTime
{
    public static function timezone(): string
    {
        return config('cas.venue_timezone', 'Asia/Riyadh');
    }

    /**
     * Read a naive datetime string (as produced by an <input type="datetime-local">)
     * as venue-local time and return it as UTC for storage.
     *
     * Strings that already carry an explicit offset or a trailing Z are trusted
     * as-is — they are unambiguous, so re-interpreting them would corrupt them.
     */
    public static function toUtc(string $value): Carbon
    {
        // Passing the venue timezone is safe for both shapes: PHP's parser
        // ignores the argument when the string carries its own offset
        // ("…Z", "+03:00"), and applies it when the string is naive.
        return Carbon::parse($value, self::timezone())->utc();
    }

    /** Render a stored UTC value back into venue-local time. */
    public static function toVenue(Carbon|CarbonImmutable|string $value): Carbon
    {
        return Carbon::parse($value)->setTimezone(self::timezone());
    }

    /** "Now", expressed in venue-local time. */
    public static function now(): Carbon
    {
        return Carbon::now(self::timezone());
    }
}
