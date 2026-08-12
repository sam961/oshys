<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * A recurrence rule attached to an event, course or trip.
 *
 * The rule is only a recipe. The dates it produces are written as real rows in
 * schedule_occurrences when the series is saved, because this host has no task
 * scheduler to extend the series later.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('schedule_series')) {
            return;
        }

        Schema::create('schedule_series', function (Blueprint $table) {
            $table->id();
            $table->morphs('schedulable');

            // 'none' is a legitimate rule: a single date, no repetition. Keeping
            // one-offs in the same structure means the admin UI and the
            // generator have exactly one path rather than two.
            $table->enum('frequency', ['none', 'daily', 'weekly', 'monthly'])->default('none');

            // Repeat every N days/weeks/months.
            $table->unsignedSmallInteger('interval')->default(1);

            // Weekly rules only: ISO weekdays (1 = Monday … 7 = Sunday) the
            // series lands on. Null for other frequencies.
            $table->json('weekdays')->nullable();

            // Last date the series may produce, venue-local. Always clamped to
            // the configured horizon when generating.
            $table->date('until_date')->nullable();

            // How far dates have actually been materialised, so a later save
            // can tell what still needs generating.
            $table->date('generated_through')->nullable();

            $table->timestamps();

            // Schedulable::series() is a morphOne, so the code assumes exactly
            // one rule per record. Without this, a double form submit creates a
            // second series whose dates are live on the public calendar but
            // unreachable through the relation — invisible to the admin and
            // impossible to delete.
            $table->unique(['schedulable_type', 'schedulable_id'], 'schedule_series_schedulable_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('schedule_series');
    }
};
