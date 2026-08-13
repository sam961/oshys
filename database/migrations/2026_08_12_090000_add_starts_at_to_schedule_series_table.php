<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Record the instant a rule is anchored to.
 *
 * The anchor was only ever implicit in the dates the rule produced, and those
 * are not the same thing: a weekly Monday rule anchored on a Wednesday
 * generates its first date the following Monday. Without the anchor stored,
 * "has this rule's start date changed?" cannot be answered — which is what
 * decides whether an already-running series may keep a start date in the past.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('schedule_series') || Schema::hasColumn('schedule_series', 'starts_at')) {
            return;
        }

        Schema::table('schedule_series', function (Blueprint $table) {
            $table->dateTime('starts_at')->nullable()->after('schedulable_id');
        });

        // Backfill from the earliest date each existing rule produced. Not
        // always the exact original anchor, but the closest thing on record and
        // correct for every non-weekly rule.
        DB::table('schedule_series')->orderBy('id')->chunkById(100, function ($rows) {
            foreach ($rows as $row) {
                $earliest = DB::table('schedule_occurrences')
                    ->where('series_id', $row->id)
                    ->min('start_at');

                if ($earliest) {
                    DB::table('schedule_series')->where('id', $row->id)->update(['starts_at' => $earliest]);
                }
            }
        });
    }

    public function down(): void
    {
        if (Schema::hasColumn('schedule_series', 'starts_at')) {
            Schema::table('schedule_series', function (Blueprint $table) {
                $table->dropColumn('starts_at');
            });
        }
    }
};
