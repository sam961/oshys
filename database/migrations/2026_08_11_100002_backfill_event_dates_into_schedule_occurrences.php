<?php

use App\Support\VenueTime;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Give every existing event a first occurrence.
 *
 * events.start_date / end_date are deliberately left in place. The public site
 * still reads them until Phase 3 moves over, so this migration only adds data.
 *
 * TIMEZONE — the important part. Legacy events.start_date holds the admin's
 * wall clock stored as though it were UTC: the edit form slices the UTC "HH:MM"
 * out of the serialized date into a datetime-local input and posts the naive
 * string straight back, which Laravel then casts in app.timezone (UTC). So an
 * event the admin entered as 10:00 (meaning 10:00 in Al Khobar) sits in the
 * column as 10:00 UTC — which is 13:00 venue time, and why existing events
 * already display three hours late.
 *
 * Occurrences created from here on go through VenueTime and are true UTC. If
 * the backfill copied the legacy values verbatim, one column would hold two
 * different meanings with nothing in the data to tell them apart. So legacy
 * values are re-read as venue-local and converted. The visible effect is that
 * pre-existing events will show their originally intended time once Phase 3
 * reads occurrences.
 *
 * Idempotent: an event that already has an occurrence at the converted instant
 * is skipped, so running this twice does not double up.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('schedule_occurrences') || ! Schema::hasTable('events')) {
            return;
        }

        $type = \App\Models\Event::class;
        $hasSoftDeletes = Schema::hasColumn('events', 'deleted_at');

        // Chunked because this runs against production data of unknown size.
        DB::table('events')
            ->whereNotNull('start_date')
            // A trashed event is not shown anywhere; giving it dates would only
            // create occurrences whose schedulable resolves to null.
            ->when($hasSoftDeletes, fn ($q) => $q->whereNull('deleted_at'))
            ->orderBy('id')
            ->chunkById(100, function ($events) use ($type) {
                $rows = [];
                $now = now();

                foreach ($events as $event) {
                    $startAt = VenueTime::toUtc((string) $event->start_date)->format('Y-m-d H:i:s');
                    $endAt = $event->end_date
                        ? VenueTime::toUtc((string) $event->end_date)->format('Y-m-d H:i:s')
                        : null;

                    $exists = DB::table('schedule_occurrences')
                        ->where('schedulable_type', $type)
                        ->where('schedulable_id', $event->id)
                        ->where('start_at', $startAt)
                        ->exists();

                    if ($exists) {
                        continue;
                    }

                    $rows[] = [
                        'schedulable_type' => $type,
                        'schedulable_id' => $event->id,
                        'series_id' => null,
                        'start_at' => $startAt,
                        'end_at' => $endAt,
                        // The old schema had a single per-event limit; it
                        // becomes the limit for this first date.
                        'capacity' => $event->max_participants,
                        'status' => 'scheduled',
                        'created_at' => $now,
                        'updated_at' => $now,
                    ];
                }

                if ($rows !== []) {
                    DB::table('schedule_occurrences')->insert($rows);
                }
            });
    }

    /**
     * Intentionally does nothing.
     *
     * The obvious implementation — delete event occurrences with a null
     * series_id — would also delete every date an admin added by hand, since
     * those are exactly the rows with no series. A `migrate:rollback --step=1`
     * on production, the likely response to a bad deploy, would silently
     * destroy real data.
     *
     * A full rollback drops the whole table in the preceding migration, which
     * is the only case where undoing this actually matters.
     */
    public function down(): void
    {
        // No-op by design — see above.
    }
};
