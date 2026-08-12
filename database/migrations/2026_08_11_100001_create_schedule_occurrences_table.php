<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * One concrete date on which something happens.
 *
 * Polymorphic because events, courses and trips all need scheduling and would
 * otherwise need three near-identical implementations. Occurrences carry the
 * schedulable directly as well as their series, so "the next date for this
 * course" is a single indexed query with no join.
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

            // Null for a date added by hand rather than generated from a rule.
            $table->foreignId('series_id')->nullable()
                ->constrained('schedule_series')
                ->cascadeOnDelete();

            // Stored UTC; see App\Support\VenueTime for the conversion the
            // admin's naive local input goes through.
            $table->dateTime('start_at');
            $table->dateTime('end_at')->nullable();

            // Optional per-date seat limit. Null means "no limit stated for
            // this date" and falls back to the parent's own capacity field.
            // Capacity is displayed only — nothing counts against it and the
            // site never blocks an inquiry.
            $table->unsignedInteger('capacity')->nullable();

            // Cancelling keeps the row: the admin can still see the date was
            // planned, while the public site filters it out.
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
