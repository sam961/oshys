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
