<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

/**
 * Give events a readable address: /events/beach-cleanup rather than /events/123.
 *
 * Nullable rather than required. Numeric ids keep resolving alongside slugs, so
 * a link already shared, bookmarked or indexed does not break — and a row that
 * somehow ends up without a slug still has a working page.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('events')) {
            return;
        }

        if (! Schema::hasColumn('events', 'slug')) {
            Schema::table('events', function (Blueprint $table) {
                $table->string('slug')->nullable()->unique()->after('title');
            });
        }

        // Backfill from existing titles. Trashed events are included: they can
        // be restored, and restoring one to find it has no address would be a
        // strange failure to diagnose later.
        $used = DB::table('events')->whereNotNull('slug')->pluck('slug')->all();
        $used = array_flip($used);

        DB::table('events')->whereNull('slug')->orderBy('id')->chunkById(100, function ($events) use (&$used) {
            foreach ($events as $event) {
                // Str::slug transliterates Arabic rather than dropping it
                // ("تنظيف الشاطئ" becomes "tnthyf-alshaty"), so a non-Latin
                // title still yields something readable. The id fallback covers
                // a title made entirely of characters it cannot transliterate.
                $base = Str::slug((string) $event->title) ?: 'event-' . $event->id;

                $slug = $base;
                $suffix = 2;
                while (isset($used[$slug])) {
                    $slug = $base . '-' . $suffix++;
                }

                $used[$slug] = true;
                DB::table('events')->where('id', $event->id)->update(['slug' => $slug]);
            }
        });
    }

    public function down(): void
    {
        if (Schema::hasColumn('events', 'slug')) {
            Schema::table('events', function (Blueprint $table) {
                $table->dropUnique(['slug']);
                $table->dropColumn('slug');
            });
        }
    }
};
