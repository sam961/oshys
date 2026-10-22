<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\Event;
use App\Models\ScheduleOccurrence;
use App\Models\Trip;
use App\Models\User;
use App\Support\VenueTime;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

/**
 * The scheduling API as the admin actually drives it, including the
 * create-then-schedule sequence the edit forms perform on save.
 */
class ScheduleApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // The dates below are fixed calendar days, and the API refuses dates
        // in the past. Pin "now" before all of them, or the suite starts
        // failing on its own once the real clock passes them.
        $this->travelTo(\Illuminate\Support\Carbon::parse('2026-08-14 09:00:00', 'UTC'));

        Sanctum::actingAs(User::factory()->create());
    }

    private function event(array $attributes = []): Event
    {
        return Event::create(array_merge([
            'title' => 'Beach Cleanup',
            'description' => 'd',
            'type' => 'workshop',
            'start_date' => '2026-09-01 07:00:00',
        ], $attributes));
    }

    private function course(): Course
    {
        return Course::create(['name' => 'Open Water', 'slug' => 'ow-' . uniqid(), 'description' => 'd', 'price' => 100]);
    }

    private function trip(): Trip
    {
        return Trip::create(['name' => 'Reef Trip', 'slug' => 'rt-' . uniqid(), 'description' => 'd', 'price' => 200]);
    }

    /** Venue-local strings, for readable assertions. */
    private function dates(array $occurrences): array
    {
        return array_map(fn ($o) => $o['start_at'], $occurrences);
    }

    // -------------------------------------------------------------------- CRUD

    public function test_a_date_can_be_added(): void
    {
        $event = $this->event();

        $response = $this->postJson("/api/schedules/events/{$event->id}", [
            'start_at' => '2026-10-06T18:00',
            'end_at' => '2026-10-06T20:00',
            'capacity' => 12,
        ])->assertOk()->json();

        $this->assertCount(1, $response['occurrences']);
        $this->assertSame('2026-10-06T18:00', $response['occurrences'][0]['start_at']);
        $this->assertSame('2026-10-06T20:00', $response['occurrences'][0]['end_at']);
        $this->assertSame(12, $response['occurrences'][0]['capacity']);
    }

    public function test_dates_come_back_soonest_first(): void
    {
        $event = $this->event();

        foreach (['2026-12-01T09:00', '2026-10-06T18:00', '2026-11-15T12:00'] as $when) {
            $this->postJson("/api/schedules/events/{$event->id}", ['start_at' => $when])->assertOk();
        }

        $response = $this->getJson("/api/schedules/events/{$event->id}")->assertOk()->json();

        $this->assertSame([
            '2026-10-06T18:00', '2026-11-15T12:00', '2026-12-01T09:00',
        ], $this->dates($response['occurrences']));
    }

    public function test_a_date_can_be_moved(): void
    {
        $event = $this->event();
        $created = $this->postJson("/api/schedules/events/{$event->id}", ['start_at' => '2026-10-06T18:00'])->json();
        $id = $created['occurrences'][0]['id'];

        $this->putJson("/api/schedule-occurrences/{$id}", ['start_at' => '2026-10-07T19:30'])
            ->assertOk()->assertJsonPath('start_at', '2026-10-07T19:30');
    }

    public function test_moving_only_the_start_moves_the_end_with_it(): void
    {
        $event = $this->event();
        $created = $this->postJson("/api/schedules/events/{$event->id}", [
            'start_at' => '2026-11-05T10:00', 'end_at' => '2026-11-05T12:00',
        ])->json();
        $id = $created['occurrences'][0]['id'];

        $this->putJson("/api/schedule-occurrences/{$id}", ['start_at' => '2026-11-12T10:00'])
            ->assertOk()
            ->assertJsonPath('start_at', '2026-11-12T10:00')
            ->assertJsonPath('end_at', '2026-11-12T12:00');
    }

    public function test_moving_the_start_of_a_date_with_no_end_leaves_it_without_one(): void
    {
        $event = $this->event();
        $created = $this->postJson("/api/schedules/events/{$event->id}", ['start_at' => '2026-11-05T10:00'])->json();
        $id = $created['occurrences'][0]['id'];

        $this->putJson("/api/schedule-occurrences/{$id}", ['start_at' => '2026-11-12T10:00'])
            ->assertOk()
            ->assertJsonPath('end_at', null);
    }

    public function test_a_seat_limit_can_be_set_and_cleared(): void
    {
        $event = $this->event();
        $created = $this->postJson("/api/schedules/events/{$event->id}", ['start_at' => '2026-10-06T18:00'])->json();
        $id = $created['occurrences'][0]['id'];

        $this->putJson("/api/schedule-occurrences/{$id}", ['capacity' => 8])
            ->assertOk()->assertJsonPath('capacity', 8);

        // The clearing path: an empty value must land as null, not fail
        // integer validation.
        $this->putJson("/api/schedule-occurrences/{$id}", ['capacity' => null])
            ->assertOk()->assertJsonPath('capacity', null);
    }

    public function test_an_end_time_can_be_added_then_removed(): void
    {
        $event = $this->event();
        $created = $this->postJson("/api/schedules/events/{$event->id}", ['start_at' => '2026-10-06T18:00'])->json();
        $id = $created['occurrences'][0]['id'];

        $this->putJson("/api/schedule-occurrences/{$id}", ['end_at' => '2026-10-06T21:00'])
            ->assertOk()->assertJsonPath('end_at', '2026-10-06T21:00');

        $this->putJson("/api/schedule-occurrences/{$id}", ['end_at' => null])
            ->assertOk()->assertJsonPath('end_at', null);
    }

    public function test_a_date_can_be_removed(): void
    {
        $event = $this->event();
        $created = $this->postJson("/api/schedules/events/{$event->id}", ['start_at' => '2026-10-06T18:00'])->json();

        $this->deleteJson("/api/schedule-occurrences/{$created['occurrences'][0]['id']}")->assertOk();

        $this->assertCount(0, $this->getJson("/api/schedules/events/{$event->id}")->json()['occurrences']);
    }

    public function test_removing_one_date_leaves_the_others(): void
    {
        $event = $this->event();
        foreach (['2026-10-06T18:00', '2026-10-13T18:00', '2026-10-20T18:00'] as $when) {
            $this->postJson("/api/schedules/events/{$event->id}", ['start_at' => $when])->assertOk();
        }
        $all = $this->getJson("/api/schedules/events/{$event->id}")->json()['occurrences'];

        $this->deleteJson("/api/schedule-occurrences/{$all[1]['id']}")->assertOk();

        $this->assertSame(
            ['2026-10-06T18:00', '2026-10-20T18:00'],
            $this->dates($this->getJson("/api/schedules/events/{$event->id}")->json()['occurrences'])
        );
    }

    // ------------------------------------------------------------- validation

    public function test_a_date_in_the_past_is_rejected(): void
    {
        $event = $this->event();

        $this->postJson("/api/schedules/events/{$event->id}", [
            'start_at' => VenueTime::toVenue(now()->subDay())->format('Y-m-d\TH:i'),
        ])->assertStatus(422)->assertJsonValidationErrors('start_at');
    }

    public function test_an_end_before_the_start_is_rejected(): void
    {
        $event = $this->event();

        $this->postJson("/api/schedules/events/{$event->id}", [
            'start_at' => '2026-10-06T18:00', 'end_at' => '2026-10-06T17:00',
        ])->assertStatus(422)->assertJsonValidationErrors('end_at');
    }

    public function test_a_negative_seat_limit_is_rejected(): void
    {
        $event = $this->event();

        $this->postJson("/api/schedules/events/{$event->id}", [
            'start_at' => '2026-10-06T18:00', 'capacity' => -1,
        ])->assertStatus(422)->assertJsonValidationErrors('capacity');
    }

    public function test_an_existing_date_cannot_be_moved_into_the_past(): void
    {
        $event = $this->event();
        $occurrence = $event->occurrences()->create(['start_at' => now()->addWeek()]);

        $this->putJson("/api/schedule-occurrences/{$occurrence->id}", [
            'start_at' => VenueTime::toVenue(now()->subDay())->format('Y-m-d\TH:i'),
        ])->assertStatus(422)->assertJsonValidationErrors('start_at');
    }

    public function test_a_past_date_stays_editable_without_being_moved(): void
    {
        // Its seat limit may still need correcting; only *moving* it back is
        // refused, and re-sending the same start must not trip that.
        $event = $this->event();
        $past = $event->occurrences()->create(['start_at' => now()->subWeek()]);

        $this->putJson("/api/schedule-occurrences/{$past->id}", ['capacity' => 4])
            ->assertOk()->assertJsonPath('capacity', 4);

        $this->putJson("/api/schedule-occurrences/{$past->id}", [
            'start_at' => VenueTime::toVenue($past->start_at)->format('Y-m-d\TH:i'),
        ])->assertOk();
    }

    public function test_a_type_that_is_not_schedulable_is_rejected(): void
    {
        // The type comes from the URL, so it must never resolve an arbitrary
        // class — users are a model, but not a schedulable one.
        $this->getJson('/api/schedules/users/1')->assertNotFound();
        $this->postJson('/api/schedules/users/1', ['start_at' => '2026-10-06T18:00'])->assertNotFound();
    }

    public function test_scheduling_requires_authentication(): void
    {
        $event = $this->event();
        app('auth')->forgetGuards();

        $this->postJson("/api/schedules/events/{$event->id}", ['start_at' => '2026-10-06T18:00'])
            ->assertUnauthorized();
    }

    // --------------------------------------------------- the legacy event date

    public function test_the_legacy_event_columns_track_the_next_date(): void
    {
        $event = $this->event();

        $this->postJson("/api/schedules/events/{$event->id}", [
            'start_at' => '2026-10-06T18:00', 'end_at' => '2026-10-06T20:00',
        ])->assertOk();

        // 18:00 in Al Khobar is 15:00 UTC.
        $this->assertSame('2026-10-06 15:00:00', $event->fresh()->start_date->utc()->format('Y-m-d H:i:s'));
    }

    public function test_an_event_form_date_is_stored_as_venue_time(): void
    {
        $this->postJson('/api/events', [
            'title' => 'Night Dive', 'description' => 'd', 'type' => 'workshop', 'is_active' => true,
            'start_date' => '2026-11-20T23:00', 'end_date' => '2026-11-21T01:00',
        ])->assertCreated();

        // 23:00 in Al Khobar is 20:00 UTC — not 23:00 UTC, which the site
        // would show as 02:00 the next morning.
        $event = Event::where('title', 'Night Dive')->firstOrFail();
        $this->assertSame('2026-11-20 20:00:00', $event->start_date->utc()->format('Y-m-d H:i:s'));
        $this->assertSame('2026-11-20 22:00:00', $event->end_date->utc()->format('Y-m-d H:i:s'));
    }

    public function test_the_resync_migration_points_old_events_at_their_dates_in_utc(): void
    {
        // An event as it was before scheduling: the admin's 23:00 sitting in
        // the column as though it were UTC, with its backfilled first date.
        $event = $this->event(['start_date' => '2026-11-20 23:00:00', 'end_date' => '2026-11-21 01:00:00']);
        $event->occurrences()->create([
            'start_at' => VenueTime::toUtc('2026-11-20T23:00'),
            'end_at' => VenueTime::toUtc('2026-11-21T01:00'),
        ]);

        $migration = require database_path('migrations/2026_10_22_100000_resync_event_dates_from_schedule.php');
        $migration->up();
        $migration->up(); // running it twice changes nothing

        $fresh = $event->fresh();
        $this->assertSame('2026-11-20 20:00:00', $fresh->start_date->utc()->format('Y-m-d H:i:s'));
        $this->assertSame('2026-11-20 22:00:00', $fresh->end_date->utc()->format('Y-m-d H:i:s'));
    }

    // ------------------------------------------------------------ the homepage

    public function test_the_homepage_keeps_an_event_whose_first_date_has_passed(): void
    {
        $event = $this->event(['title' => 'Weekly Dive', 'is_active' => true]);
        foreach (['2026-10-06T18:00', '2026-10-13T18:00'] as $when) {
            $this->postJson("/api/schedules/events/{$event->id}", ['start_at' => $when])->assertOk();
        }

        // The legacy column still points at the 6th, but the 13th is ahead.
        $this->travelTo(VenueTime::toUtc('2026-10-08T09:00'));
        app('auth')->forgetGuards();

        $events = $this->getJson('/api/home-data')->assertOk()->json('events');
        $this->assertSame(['Weekly Dive'], array_column($events, 'title'));
        $this->assertSame('2026-10-13T18:00', $events[0]['upcoming_dates'][0]['start_at']);
    }

    public function test_the_homepage_lists_events_by_their_next_date_and_drops_ones_with_none(): void
    {
        $later = $this->event(['title' => 'Later', 'is_active' => true]);
        $sooner = $this->event(['title' => 'Sooner', 'is_active' => true]);
        $calledOff = $this->event(['title' => 'Called Off', 'is_active' => true, 'start_date' => '2026-12-01 07:00:00']);

        $this->postJson("/api/schedules/events/{$later->id}", ['start_at' => '2026-11-20T18:00'])->assertOk();
        $this->postJson("/api/schedules/events/{$sooner->id}", ['start_at' => '2026-11-10T18:00'])->assertOk();
        $id = $this->postJson("/api/schedules/events/{$calledOff->id}", ['start_at' => '2026-12-01T10:00'])
            ->json('occurrences.0.id');
        $this->deleteJson("/api/schedule-occurrences/{$id}")->assertOk();

        app('auth')->forgetGuards();
        $this->assertSame(['Sooner', 'Later'], array_column($this->getJson('/api/home-data')->json('events'), 'title'));
    }

    public function test_removing_the_soonest_date_moves_the_legacy_column_on(): void
    {
        $event = $this->event();
        foreach (['2026-10-06T18:00', '2026-10-07T18:00'] as $when) {
            $this->postJson("/api/schedules/events/{$event->id}", ['start_at' => $when])->assertOk();
        }
        $all = $this->getJson("/api/schedules/events/{$event->id}")->json()['occurrences'];

        $this->deleteJson("/api/schedule-occurrences/{$all[0]['id']}")->assertOk();

        // The public pages still read this column, so it must not keep
        // advertising a date that has been removed.
        $this->assertSame('2026-10-07 15:00:00', $event->fresh()->start_date->utc()->format('Y-m-d H:i:s'));
    }

    // ------------------------------------------------------------------ slugs

    public function test_an_event_gets_a_readable_slug_when_created(): void
    {
        $created = $this->postJson('/api/events', [
            'title' => 'Beach Cleanup 2026',
            'description' => 'd', 'type' => 'workshop',
            'start_date' => '2026-10-06T18:00', 'end_date' => '2026-10-06T20:00',
        ])->assertCreated()->json();

        $this->assertSame('beach-cleanup-2026', $created['slug']);
    }

    public function test_a_second_event_with_the_same_title_gets_a_distinct_slug(): void
    {
        $payload = [
            'title' => 'Beach Cleanup', 'description' => 'd', 'type' => 'workshop',
            'start_date' => '2026-10-06T18:00', 'end_date' => '2026-10-06T20:00',
        ];

        $first = $this->postJson('/api/events', $payload)->json();
        $second = $this->postJson('/api/events', $payload)->json();

        $this->assertSame('beach-cleanup', $first['slug']);
        $this->assertSame('beach-cleanup-2', $second['slug']);
    }

    public function test_an_arabic_title_is_transliterated_rather_than_dropped(): void
    {
        $created = $this->postJson('/api/events', [
            'title' => 'تنظيف الشاطئ', 'description' => 'd', 'type' => 'workshop',
            'start_date' => '2026-10-06T18:00', 'end_date' => '2026-10-06T20:00',
        ])->assertCreated()->json();

        $this->assertNotEmpty($created['slug']);
        $this->assertMatchesRegularExpression('/^[a-z0-9-]+$/', $created['slug']);
    }

    public function test_an_event_can_be_fetched_by_slug_or_by_id(): void
    {
        $event = $this->event();
        $event->update(['slug' => 'beach-cleanup']);

        $this->getJson('/api/events/beach-cleanup')->assertOk()->assertJsonPath('id', $event->id);
        // The old address must keep working — links are already out there.
        $this->getJson("/api/events/{$event->id}")->assertOk()->assertJsonPath('id', $event->id);
    }

    public function test_an_unknown_slug_is_a_404_rather_than_a_wrong_record(): void
    {
        $this->event();

        $this->getJson('/api/events/no-such-event')->assertNotFound();
    }

    public function test_renaming_an_event_moves_its_slug_but_saving_it_unchanged_does_not(): void
    {
        $event = $this->event();
        $event->update(['slug' => 'beach-cleanup']);

        // An unrelated edit leaves the address alone.
        $this->putJson("/api/events/{$event->id}", ['title' => 'Beach Cleanup', 'location' => 'Half Moon'])->assertOk();
        $event->refresh();
        $this->assertSame('beach-cleanup', $event->slug);

        // A real rename moves it.
        $this->putJson("/api/events/{$event->id}", ['title' => 'Reef Cleanup'])->assertOk();
        $this->assertSame('reef-cleanup', $event->fresh()->slug);
    }

    // ------------------------------------------------------ courses and trips

    public function test_courses_and_trips_take_dates_too(): void
    {
        foreach ([['courses', $this->course()], ['trips', $this->trip()]] as [$type, $model]) {
            $response = $this->postJson("/api/schedules/{$type}/{$model->id}", [
                'start_at' => '2026-10-06T18:00', 'capacity' => 6,
            ])->assertOk()->json();

            $this->assertCount(1, $response['occurrences']);
            $this->assertSame(6, $response['occurrences'][0]['capacity']);
        }
    }

    public function test_scheduling_one_record_does_not_touch_another_of_a_different_type(): void
    {
        $event = $this->event();
        $course = $this->course();

        $this->postJson("/api/schedules/events/{$event->id}", ['start_at' => '2026-10-06T18:00'])->assertOk();

        // Same numeric id space, different morph type — a leak here would show
        // one record's dates on another.
        $this->assertCount(0, $this->getJson("/api/schedules/courses/{$course->id}")->json()['occurrences']);
    }

    public function test_a_courses_dates_are_removed_when_it_is_force_deleted(): void
    {
        $course = $this->course();
        $this->postJson("/api/schedules/courses/{$course->id}", ['start_at' => '2026-10-06T18:00'])->assertOk();

        $course->delete();
        $this->assertSame(1, ScheduleOccurrence::count(), 'Soft delete keeps dates so a restore works');

        $course->forceDelete();
        $this->assertSame(0, ScheduleOccurrence::count());
    }
}
