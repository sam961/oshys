<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * One date on which something happens.
 *
 * Polymorphic because events, courses and trips all need dates and would
 * otherwise need three near-identical implementations. Each row is a date the
 * admin entered — there is no repeat rule and nothing derives these.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('schedule_occurrences')) {
            return;
        }

        Schema::create('schedule_occurrences', function (Blueprint $table) {
            $table->id();
            $table->morphs('schedulable');

            // Stored UTC; see App\Support\VenueTime for the conversion the
            // admin's naive local input goes through.
            $table->dateTime('start_at');
            $table->dateTime('end_at')->nullable();

            // Optional per-date seat limit. Null means no limit is stated for
            // this date. Displayed only — nothing counts against it and the
            // site never blocks an inquiry.
            $table->unsignedInteger('capacity')->nullable();

            // Retained so a date can be hidden without losing it. Nothing sets
            // it today: removing a date simply deletes the row.
            $table->enum('status', ['scheduled', 'cancelled'])->default('scheduled');

            $table->timestamps();

            // "Upcoming dates for this record", the query every listing runs.
            $table->index(['schedulable_type', 'schedulable_id', 'start_at'], 'sched_occ_schedulable_start_idx');
            // "Everything happening in this month", for the calendar.
            $table->index('start_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('schedule_occurrences');
    }
};
