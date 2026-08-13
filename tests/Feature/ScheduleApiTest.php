<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\Event;
use App\Models\ScheduleOccurrence;
use App\Models\ScheduleSeries;
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

    // ---------------------------------------------------------------- creation

    public function test_creating_an_event_then_scheduling_it_generates_the_series(): void
    {
        // Exactly what EventEditPage does on save: create, then schedule.
        $created = $this->postJson('/api/events', [
            'title' => 'Created With Rule',
            'description' => 'd',
            'type' => 'workshop',
            'start_date' => '2026-10-06T18:00',
            'end_date' => '2026-10-06T20:00',
        ])->assertCreated()->json();

        $response = $this->postJson("/api/schedules/events/{$created['id']}", [
            'start_at' => '2026-10-06T18:00',
            'end_at' => '2026-10-06T20:00',
            'frequency' => 'weekly',
            'interval' => 1,
            'weekdays' => [2],
            'until_date' => '2026-11-03',
        ])->assertOk()->json();

        $this->assertSame([
            '2026-10-06T18:00',
            '2026-10-13T18:00',
            '2026-10-20T18:00',
            '2026-10-27T18:00',
            '2026-11-03T18:00',
        ], $this->dates($response['occurrences']));

        // Every generated date inherits the two-hour duration.
        $this->assertSame('2026-10-06T20:00', $response['occurrences'][0]['end_at']);
        $this->assertSame('2026-11-03T20:00', $response['occurrences'][4]['end_at']);
    }

    public function test_creating_without_a_repeat_rule_still_produces_one_date(): void
    {
        // A non-repeating event must still get an occurrence, or it would be
        // invisible once the public site reads occurrences instead of the
        // legacy column.
        $event = $this->event();

        $response = $this->postJson("/api/schedules/events/{$event->id}", [
            'start_at' => '2026-10-06T18:00',
            'frequency' => 'none',
            'interval' => 1,
        ])->assertOk()->json();

        $this->assertCount(1, $response['occurrences']);
        $this->assertNull($response['occurrences'][0]['end_at']);
    }

    public function test_the_legacy_event_columns_track_the_first_upcoming_date(): void
    {
        $event = $this->event();

        $this->postJson("/api/schedules/events/{$event->id}", [
            'start_at' => '2026-10-06T18:00',
            'frequency' => 'weekly',
            'interval' => 1,
            'weekdays' => [2],
            'until_date' => '2026-10-20',
        ])->assertOk();

        // 18:00 in Al Khobar is 15:00 UTC.
        $this->assertSame('2026-10-06 15:00:00', $event->fresh()->start_date->utc()->format('Y-m-d H:i:s'));
    }

    // ------------------------------------------------------------- validation

    public function test_an_interval_below_one_is_rejected(): void
    {
        $event = $this->event();

        $this->postJson("/api/schedules/events/{$event->id}", [
            'start_at' => '2026-10-06T18:00', 'frequency' => 'daily', 'interval' => 0,
        ])->assertStatus(422)->assertJsonValidationErrors('interval');
    }

    public function test_an_until_date_before_the_start_is_rejected(): void
    {
        $event = $this->event();

        $this->postJson("/api/schedules/events/{$event->id}", [
            'start_at' => '2026-10-06T18:00', 'frequency' => 'daily', 'interval' => 1,
            'until_date' => '2026-09-01',
        ])->assertStatus(422)->assertJsonValidationErrors('until_date');
    }

    public function test_an_until_date_carrying_a_time_is_rejected_rather_than_erroring(): void
    {
        $event = $this->event();

        // Concatenated with a time server-side; a full datetime here would
        // produce an unparseable string and a 500.
        $this->postJson("/api/schedules/events/{$event->id}", [
            'start_at' => '2026-10-06T18:00', 'frequency' => 'daily', 'interval' => 1,
            'until_date' => '2026-11-03T10:00',
        ])->assertStatus(422)->assertJsonValidationErrors('until_date');
    }

    // ------------------------------------------------------- dates in the past

    public function test_a_first_date_in_the_past_is_rejected(): void
    {
        $event = $this->event();

        $this->postJson("/api/schedules/events/{$event->id}", [
            'start_at' => VenueTime::toVenue(now()->subDay())->format('Y-m-d\TH:i'),
            'frequency' => 'none', 'interval' => 1,
        ])->assertStatus(422)->assertJsonValidationErrors('start_at');
    }

    public function test_an_existing_series_that_started_in_the_past_can_still_be_extended(): void
    {
        // A course that began two months ago and runs for months more: changing
        // its until_date must not force the whole series forward.
        $event = $this->event();
        $started = VenueTime::toVenue(now()->subMonths(2))->format('Y-m-d\TH:i');

        // Seed it directly, since the API would refuse to create it.
        $series = ScheduleSeries::create([
            'schedulable_type' => Event::class, 'schedulable_id' => $event->id,
            'starts_at' => VenueTime::toUtc($started),
            'frequency' => 'weekly', 'interval' => 1, 'weekdays' => [1],
        ]);
        app(\App\Services\OccurrenceGenerator::class)
            ->generate($event, $series, VenueTime::toUtc($started));

        $this->postJson("/api/schedules/events/{$event->id}", [
            'start_at' => $started,
            'frequency' => 'weekly', 'interval' => 1, 'weekdays' => [1],
            'until_date' => now()->addMonth()->format('Y-m-d'),
        ])->assertOk();
    }

    public function test_a_one_off_date_in_the_past_is_rejected(): void
    {
        $event = $this->event();

        $this->postJson("/api/schedules/events/{$event->id}/occurrences", [
            'start_at' => VenueTime::toVenue(now()->subHour())->format('Y-m-d\TH:i'),
        ])->assertStatus(422)->assertJsonValidationErrors('start_at');
    }

    public function test_an_existing_date_cannot_be_moved_into_the_past(): void
    {
        $event = $this->event();
        $occurrence = $event->occurrences()->create(['start_at' => now()->addWeek()]);

        $this->putJson("/api/schedule-occurrences/{$occurrence->id}", [
            'start_at' => VenueTime::toVenue(now()->subDay())->format('Y-m-d\TH:i'),
        ])->assertStatus(422)->assertJsonValidationErrors('start_at');
    }

    public function test_a_past_date_can_still_have_its_capacity_and_status_edited(): void
    {
        // Editing a date that has already happened must stay possible — the
        // guard is on moving a date, not on touching one.
        $event = $this->event();
        $past = $event->occurrences()->create(['start_at' => now()->subWeek()]);

        $this->putJson("/api/schedule-occurrences/{$past->id}", ['capacity' => 4])
            ->assertOk()->assertJsonPath('capacity', 4);

        $this->putJson("/api/schedule-occurrences/{$past->id}", ['status' => 'cancelled'])
            ->assertOk()->assertJsonPath('status', 'cancelled');
    }

    public function test_weekdays_outside_one_to_seven_are_rejected(): void
    {
        $event = $this->event();

        $this->postJson("/api/schedules/events/{$event->id}", [
            'start_at' => '2026-10-06T18:00', 'frequency' => 'weekly', 'interval' => 1,
            'weekdays' => [0, 9],
        ])->assertStatus(422);
    }

    public function test_an_end_before_the_start_is_rejected(): void
    {
        $event = $this->event();

        $this->postJson("/api/schedules/events/{$event->id}", [
            'start_at' => '2026-10-06T18:00', 'end_at' => '2026-10-06T17:00',
            'frequency' => 'none', 'interval' => 1,
        ])->assertStatus(422)->assertJsonValidationErrors('end_at');
    }

    public function test_a_type_that_is_not_schedulable_is_rejected(): void
    {
        // The type comes from the URL, so it must never resolve an arbitrary
        // class — users are a model, but not a schedulable one.
        $this->getJson('/api/schedules/users/1')->assertNotFound();
        $this->postJson('/api/schedules/users/1', [
            'start_at' => '2026-10-06T18:00', 'frequency' => 'none', 'interval' => 1,
        ])->assertNotFound();
    }

    public function test_scheduling_requires_authentication(): void
    {
        $event = $this->event();
        app('auth')->forgetGuards();

        $this->postJson("/api/schedules/events/{$event->id}", [
            'start_at' => '2026-10-06T18:00', 'frequency' => 'none', 'interval' => 1,
        ])->assertUnauthorized();
    }

    // -------------------------------------------------------- per-date edits

    public function test_a_per_date_capacity_can_be_set_and_cleared(): void
    {
        $event = $this->event();
        $schedule = $this->postJson("/api/schedules/events/{$event->id}", [
            'start_at' => '2026-10-06T18:00', 'frequency' => 'daily', 'interval' => 1,
            'until_date' => '2026-10-08',
        ])->json();

        $id = $schedule['occurrences'][0]['id'];

        $this->putJson("/api/schedule-occurrences/{$id}", ['capacity' => 12])
            ->assertOk()->assertJsonPath('capacity', 12);

        // The clearing path: an empty string is what the admin form posts, and
        // it must land as null rather than failing integer validation.
        $this->putJson("/api/schedule-occurrences/{$id}", ['capacity' => null])
            ->assertOk()->assertJsonPath('capacity', null);
    }

    public function test_a_negative_capacity_is_rejected(): void
    {
        $event = $this->event();
        $occurrence = $event->occurrences()->create(['start_at' => VenueTime::toUtc('2026-10-06T18:00')]);

        $this->putJson("/api/schedule-occurrences/{$occurrence->id}", ['capacity' => -1])
            ->assertStatus(422)->assertJsonValidationErrors('capacity');
    }

    public function test_cancelling_a_date_hides_it_from_upcoming_but_keeps_it_for_the_admin(): void
    {
        $event = $this->event();
        $schedule = $this->postJson("/api/schedules/events/{$event->id}", [
            'start_at' => '2026-10-06T18:00', 'frequency' => 'daily', 'interval' => 1,
            'until_date' => '2026-10-08',
        ])->json();

        $id = $schedule['occurrences'][0]['id'];
        $this->putJson("/api/schedule-occurrences/{$id}", ['status' => 'cancelled'])->assertOk();

        // Still listed in the admin…
        $after = $this->getJson("/api/schedules/events/{$event->id}")->json();
        $this->assertCount(3, $after['occurrences']);
        $this->assertSame('cancelled', $after['occurrences'][0]['status']);

        // …but no longer counted as upcoming.
        $this->assertSame(2, $event->fresh()->upcomingOccurrences()->count());
    }

    public function test_cancelling_the_soonest_date_moves_the_legacy_column_on(): void
    {
        $event = $this->event();
        $schedule = $this->postJson("/api/schedules/events/{$event->id}", [
            'start_at' => '2026-10-06T18:00', 'frequency' => 'daily', 'interval' => 1,
            'until_date' => '2026-10-08',
        ])->json();

        $this->putJson("/api/schedule-occurrences/{$schedule['occurrences'][0]['id']}", ['status' => 'cancelled'])->assertOk();

        // The public site still reads this column until Phase 3, so it must not
        // keep advertising a cancelled date.
        $this->assertSame('2026-10-07 15:00:00', $event->fresh()->start_date->utc()->format('Y-m-d H:i:s'));
    }

    public function test_deleting_the_soonest_date_moves_the_legacy_column_on(): void
    {
        $event = $this->event();
        $schedule = $this->postJson("/api/schedules/events/{$event->id}", [
            'start_at' => '2026-10-06T18:00', 'frequency' => 'daily', 'interval' => 1,
            'until_date' => '2026-10-08',
        ])->json();

        $this->deleteJson("/api/schedule-occurrences/{$schedule['occurrences'][0]['id']}")->assertOk();

        $this->assertSame('2026-10-07 15:00:00', $event->fresh()->start_date->utc()->format('Y-m-d H:i:s'));
    }

    // ------------------------------------------------------------ regeneration

    public function test_a_hand_added_date_survives_regeneration(): void
    {
        $event = $this->event();
        $this->postJson("/api/schedules/events/{$event->id}", [
            'start_at' => '2026-10-06T18:00', 'frequency' => 'daily', 'interval' => 1,
            'until_date' => '2026-10-08',
        ])->assertOk();

        $this->postJson("/api/schedules/events/{$event->id}/occurrences", [
            'start_at' => '2026-12-25T09:00',
        ])->assertOk();

        $after = $this->postJson("/api/schedules/events/{$event->id}", [
            'start_at' => '2026-10-06T18:00', 'frequency' => 'daily', 'interval' => 1,
            'until_date' => '2026-10-08',
        ])->json();

        $oneOffs = array_values(array_filter($after['occurrences'], fn ($o) => $o['series_id'] === null));
        $this->assertCount(1, $oneOffs);
        $this->assertSame('2026-12-25T09:00', $oneOffs[0]['start_at']);
    }

    public function test_moving_the_time_of_day_keeps_capacities_and_cancellations(): void
    {
        $event = $this->event();
        $schedule = $this->postJson("/api/schedules/events/{$event->id}", [
            'start_at' => '2026-10-06T18:00', 'frequency' => 'daily', 'interval' => 1,
            'until_date' => '2026-10-08',
        ])->json();

        $this->putJson("/api/schedule-occurrences/{$schedule['occurrences'][1]['id']}", ['capacity' => 6])->assertOk();
        $this->putJson("/api/schedule-occurrences/{$schedule['occurrences'][2]['id']}", ['status' => 'cancelled'])->assertOk();

        $moved = $this->postJson("/api/schedules/events/{$event->id}", [
            'start_at' => '2026-10-06T19:30', 'frequency' => 'daily', 'interval' => 1,
            'until_date' => '2026-10-08',
        ])->json();

        $this->assertSame('2026-10-06T19:30', $moved['occurrences'][0]['start_at']);
        $this->assertSame(6, $moved['occurrences'][1]['capacity']);
        $this->assertSame('cancelled', $moved['occurrences'][2]['status']);
    }

    public function test_removing_the_repeat_rule_clears_generated_dates_but_keeps_one_offs(): void
    {
        $event = $this->event();
        $this->postJson("/api/schedules/events/{$event->id}", [
            'start_at' => '2026-10-06T18:00', 'frequency' => 'daily', 'interval' => 1,
            'until_date' => '2026-10-08',
        ])->assertOk();

        $this->postJson("/api/schedules/events/{$event->id}/occurrences", ['start_at' => '2026-12-25T09:00'])->assertOk();

        $after = $this->deleteJson("/api/schedules/events/{$event->id}")->assertOk()->json();

        $this->assertNull($after['series']);
        $this->assertCount(1, $after['occurrences']);
        $this->assertSame('2026-12-25T09:00', $after['occurrences'][0]['start_at']);
    }

    public function test_saving_a_rule_twice_does_not_duplicate_dates_or_series(): void
    {
        $event = $this->event();
        $payload = [
            'start_at' => '2026-10-06T18:00', 'frequency' => 'daily', 'interval' => 1,
            'until_date' => '2026-10-08',
        ];

        $this->postJson("/api/schedules/events/{$event->id}", $payload)->assertOk();
        $second = $this->postJson("/api/schedules/events/{$event->id}", $payload)->json();

        $this->assertCount(3, $second['occurrences']);
        $this->assertSame(1, ScheduleSeries::count());
    }

    public function test_the_six_month_horizon_cannot_be_exceeded_from_the_api(): void
    {
        $event = $this->event();

        $response = $this->postJson("/api/schedules/events/{$event->id}", [
            'start_at' => '2026-10-06T18:00', 'frequency' => 'daily', 'interval' => 1,
            'until_date' => '2030-01-01',
        ])->assertOk()->json();

        $last = VenueTime::toUtc(end($response['occurrences'])['start_at']);
        $this->assertTrue($last->lessThanOrEqualTo(VenueTime::toUtc('2027-04-06T23:59')));
    }

    // ------------------------------------------------------ courses and trips

    public function test_courses_can_be_scheduled(): void
    {
        $course = $this->course();

        $response = $this->postJson("/api/schedules/courses/{$course->id}", [
            'start_at' => '2026-10-06T18:00', 'frequency' => 'weekly', 'interval' => 1,
            'weekdays' => [2, 4], 'until_date' => '2026-10-15',
        ])->assertOk()->json();

        $this->assertSame([
            '2026-10-06T18:00',
            '2026-10-08T18:00',
            '2026-10-13T18:00',
            '2026-10-15T18:00',
        ], $this->dates($response['occurrences']));
        $this->assertSame(4, $course->fresh()->upcomingOccurrences()->count());
    }

    public function test_trips_can_be_scheduled_and_carry_per_date_capacity(): void
    {
        // Trips have no capacity column of their own, so per-date capacity is
        // the only limit they can express.
        $trip = $this->trip();

        $schedule = $this->postJson("/api/schedules/trips/{$trip->id}", [
            'start_at' => '2026-10-06T06:00', 'frequency' => 'monthly', 'interval' => 1,
            'until_date' => '2026-12-31',
        ])->assertOk()->json();

        $this->assertCount(3, $schedule['occurrences']);

        $this->putJson("/api/schedule-occurrences/{$schedule['occurrences'][0]['id']}", ['capacity' => 8])
            ->assertOk()->assertJsonPath('capacity', 8);
    }

    public function test_scheduling_one_record_does_not_touch_another_of_a_different_type(): void
    {
        $event = $this->event();
        $course = $this->course();

        $this->postJson("/api/schedules/events/{$event->id}", [
            'start_at' => '2026-10-06T18:00', 'frequency' => 'daily', 'interval' => 1, 'until_date' => '2026-10-08',
        ])->assertOk();

        // Same numeric id space, different morph type — a leak here would show
        // one record's dates on another.
        $courseSchedule = $this->getJson("/api/schedules/courses/{$course->id}")->assertOk()->json();

        $this->assertNull($courseSchedule['series']);
        $this->assertCount(0, $courseSchedule['occurrences']);
    }

    public function test_a_courses_dates_are_removed_when_it_is_force_deleted(): void
    {
        $course = $this->course();
        $this->postJson("/api/schedules/courses/{$course->id}", [
            'start_at' => '2026-10-06T18:00', 'frequency' => 'daily', 'interval' => 1, 'until_date' => '2026-10-08',
        ])->assertOk();

        $course->delete();
        $this->assertSame(3, ScheduleOccurrence::count(), 'Soft delete keeps dates so a restore works');

        $course->forceDelete();
        $this->assertSame(0, ScheduleOccurrence::count());
        $this->assertSame(0, ScheduleSeries::count());
    }
}
