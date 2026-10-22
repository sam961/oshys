<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Point events.start_date / end_date at the event's next date, in true UTC.
 *
 * The backfill migration turned each legacy start_date into a first
 * occurrence, converting it from the admin's wall clock to UTC — but it left
 * the legacy columns themselves untouched. So for every event that predates
 * scheduling the columns still hold the wall clock stored as if it were UTC,
 * and anything reading them shows the event three hours late (23:00 becomes
 * 02:00 the next day), right beside the correct time from its dates.
 *
 * Copying the next date (or, when every date has passed, the earliest) back
 * into the columns is the same thing ScheduleController does whenever a date
 * is edited, applied once to every event that has dates.
 *
 * Idempotent: it only ever copies from occurrences, so running it again
 * writes the same values (or a later "next date" once one has passed).
 */
return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('schedule_occurrences') || ! Schema::hasTable('events')) {
            return;
        }

        $type = \App\Models\Event::class;
        $now = now()->format('Y-m-d H:i:s');

        DB::table('events')->orderBy('id')->chunkById(100, function ($events) use ($type, $now) {
            foreach ($events as $event) {
                $dates = DB::table('schedule_occurrences')
                    ->where('schedulable_type', $type)
                    ->where('schedulable_id', $event->id)
                    ->orderBy('start_at');

                $next = (clone $dates)->where('status', 'scheduled')->where('start_at', '>=', $now)->first()
                    ?? (clone $dates)->first();

                if (! $next) {
                    continue;
                }

                DB::table('events')->where('id', $event->id)->update([
                    'start_date' => $next->start_at,
                    'end_date' => $next->end_at,
                ]);
            }
        });
    }

    /**
     * Nothing to undo: the previous values were the misread wall clocks this
     * corrects, and the dates themselves are untouched.
     */
    public function down(): void
    {
        //
    }
};
