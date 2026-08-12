<?php

namespace Tests\Feature;

use App\Models\Event;
use App\Models\ScheduleOccurrence;
use App\Models\ScheduleSeries;
use App\Services\OccurrenceGenerator;
use App\Support\VenueTime;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class OccurrenceGeneratorTest extends TestCase
{
    use RefreshDatabase;

    private function event(): Event
    {
        return Event::create([
            'title' => 'Beach Cleanup',
            'description' => 'Test',
            'type' => 'workshop',
            'start_date' => '2026-09-01 07:00:00',
        ]);
    }

    private function series(Event $event, array $attributes): ScheduleSeries
    {
        return ScheduleSeries::create(array_merge([
            'schedulable_type' => Event::class,
            'schedulable_id' => $event->id,
            'frequency' => ScheduleSeries::FREQUENCY_NONE,
            'interval' => 1,
        ], $attributes));
    }

    /** Venue-local dates, for readable assertions. */
    private function localDates($occurrences): array
    {
        return collect($occurrences)
            ->map(fn ($o) => VenueTime::toVenue($o instanceof ScheduleOccurrence ? $o->start_at : $o)->format('Y-m-d H:i'))
            ->values()
            ->all();
    }

    public function test_a_naive_admin_time_is_stored_as_venue_local(): void
    {
        // The admin types 10:00 meaning 10:00 in Al Khobar (UTC+3).
        $utc = VenueTime::toUtc('2026-09-01T10:00');

        $this->assertSame('2026-09-01 07:00:00', $utc->utc()->format('Y-m-d H:i:s'));
        $this->assertSame('2026-09-01 10:00', VenueTime::toVenue($utc)->format('Y-m-d H:i'));
    }

    public function test_a_string_with_an_explicit_offset_is_not_reinterpreted(): void
    {
        $utc = VenueTime::toUtc('2026-09-01T10:00:00Z');

        $this->assertSame('2026-09-01 10:00:00', $utc->utc()->format('Y-m-d H:i:s'));
    }

    public function test_frequency_none_produces_a_single_date(): void
    {
        $event = $this->event();
        $series = $this->series($event, ['frequency' => ScheduleSeries::FREQUENCY_NONE]);

        $created = (new OccurrenceGenerator())->generate($event, $series, VenueTime::toUtc('2026-09-01T10:00'));

        $this->assertCount(1, $created);
        $this->assertSame(['2026-09-01 10:00'], $this->localDates($created));
    }

    public function test_daily_with_an_interval_spaces_dates_correctly(): void
    {
        $event = $this->event();
        $series = $this->series($event, [
            'frequency' => ScheduleSeries::FREQUENCY_DAILY,
            'interval' => 3,
            'until_date' => '2026-09-10',
        ]);

        $created = (new OccurrenceGenerator())->generate($event, $series, VenueTime::toUtc('2026-09-01T10:00'));

        $this->assertSame([
            '2026-09-01 10:00',
            '2026-09-04 10:00',
            '2026-09-07 10:00',
            '2026-09-10 10:00',
        ], $this->localDates($created));
    }

    public function test_weekly_lands_on_each_selected_weekday(): void
    {
        $event = $this->event();
        // 2026-09-01 is a Tuesday. Repeat Tuesdays and Thursdays for two weeks.
        $series = $this->series($event, [
            'frequency' => ScheduleSeries::FREQUENCY_WEEKLY,
            'interval' => 1,
            'weekdays' => [2, 4],
            'until_date' => '2026-09-11',
        ]);

        $created = (new OccurrenceGenerator())->generate($event, $series, VenueTime::toUtc('2026-09-01T10:00'));

        $this->assertSame([
            '2026-09-01 10:00',
            '2026-09-03 10:00',
            '2026-09-08 10:00',
            '2026-09-10 10:00',
        ], $this->localDates($created));
    }

    public function test_monthly_skips_months_without_the_target_day(): void
    {
        $event = $this->event();
        // The 31st: November and February have no 31st, so they are skipped
        // rather than rolling into the 1st of the following month.
        $series = $this->series($event, [
            'frequency' => ScheduleSeries::FREQUENCY_MONTHLY,
            'interval' => 1,
            'until_date' => '2027-01-31',
        ]);

        $created = (new OccurrenceGenerator())->generate($event, $series, VenueTime::toUtc('2026-10-31T10:00'));

        $this->assertSame([
            '2026-10-31 10:00',
            '2026-12-31 10:00',
            '2027-01-31 10:00',
        ], $this->localDates($created));
    }

    public function test_a_rule_with_no_end_date_is_capped_at_the_horizon(): void
    {
        config(['cas.schedule_horizon_months' => 6]);

        $event = $this->event();
        $series = $this->series($event, [
            'frequency' => ScheduleSeries::FREQUENCY_DAILY,
            'interval' => 1,
            'until_date' => null,
        ]);

        $created = (new OccurrenceGenerator())->generate($event, $series, VenueTime::toUtc('2026-09-01T10:00'));

        $last = VenueTime::toVenue($created->last()->start_at);

        $this->assertTrue(
            $last->lessThanOrEqualTo(Carbon::parse('2027-03-01 23:59:59', VenueTime::timezone())),
            "Last generated date {$last} exceeded the six-month horizon"
        );
        $this->assertGreaterThan(150, $created->count(), 'Daily for six months should produce ~180 dates');
    }

    public function test_an_until_date_earlier_than_the_horizon_wins(): void
    {
        $event = $this->event();
        $series = $this->series($event, [
            'frequency' => ScheduleSeries::FREQUENCY_DAILY,
            'interval' => 1,
            'until_date' => '2026-09-05',
        ]);

        $created = (new OccurrenceGenerator())->generate($event, $series, VenueTime::toUtc('2026-09-01T10:00'));

        $this->assertCount(5, $created);
        $this->assertSame('2026-09-05 10:00', $this->localDates($created)[4]);
    }

    public function test_regenerating_preserves_capacity_overrides_and_cancellations(): void
    {
        $event = $this->event();
        $series = $this->series($event, [
            'frequency' => ScheduleSeries::FREQUENCY_DAILY,
            'interval' => 1,
            'until_date' => '2026-09-05',
        ]);

        $generator = new OccurrenceGenerator();
        $created = $generator->generate($event, $series, VenueTime::toUtc('2026-09-01T10:00'));

        // The admin caps one date and cancels another.
        $created[1]->update(['capacity' => 8]);
        $created[2]->update(['status' => ScheduleOccurrence::STATUS_CANCELLED]);

        // The series is then extended.
        $series->update(['until_date' => '2026-09-07']);
        $regenerated = $generator->generate($event->fresh(), $series, VenueTime::toUtc('2026-09-01T10:00'));

        $this->assertCount(7, $regenerated);
        $this->assertSame(8, $regenerated[1]->capacity, 'Capacity override was lost on regeneration');
        $this->assertSame(
            ScheduleOccurrence::STATUS_CANCELLED,
            $regenerated[2]->status,
            'Cancellation was lost on regeneration'
        );
        $this->assertNull($regenerated[0]->capacity);
    }

    public function test_regenerating_does_not_duplicate_dates(): void
    {
        $event = $this->event();
        $series = $this->series($event, [
            'frequency' => ScheduleSeries::FREQUENCY_DAILY,
            'interval' => 1,
            'until_date' => '2026-09-05',
        ]);

        $generator = new OccurrenceGenerator();
        $generator->generate($event, $series, VenueTime::toUtc('2026-09-01T10:00'));
        $generator->generate($event->fresh(), $series, VenueTime::toUtc('2026-09-01T10:00'));

        $this->assertSame(5, $event->occurrences()->count());
    }

    public function test_upcoming_scope_excludes_past_and_cancelled_dates(): void
    {
        $event = $this->event();

        $event->occurrences()->create(['start_at' => now()->subDay(), 'status' => 'scheduled']);
        $event->occurrences()->create(['start_at' => now()->addDay(), 'status' => 'cancelled']);
        $keeper = $event->occurrences()->create(['start_at' => now()->addDays(2), 'status' => 'scheduled']);

        $upcoming = $event->upcomingOccurrences()->get();

        $this->assertCount(1, $upcoming);
        $this->assertTrue($upcoming->first()->is($keeper));
    }

    public function test_changing_the_time_of_day_keeps_overrides(): void
    {
        // "Move the Tuesday class from 10am to 11am" must not wipe the series.
        $event = $this->event();
        $series = $this->series($event, [
            'frequency' => ScheduleSeries::FREQUENCY_DAILY,
            'interval' => 1,
            'until_date' => '2026-09-04',
        ]);

        $generator = new OccurrenceGenerator();
        $created = $generator->generate($event, $series, VenueTime::toUtc('2026-09-01T10:00'));
        $created[1]->update(['capacity' => 8]);
        $created[2]->update(['status' => ScheduleOccurrence::STATUS_CANCELLED]);

        $moved = $generator->generate($event->fresh(), $series, VenueTime::toUtc('2026-09-01T11:00'));

        $this->assertSame('2026-09-01 11:00', $this->localDates($moved)[0]);
        $this->assertSame(8, $moved[1]->capacity, 'Override lost when the time of day changed');
        $this->assertSame(ScheduleOccurrence::STATUS_CANCELLED, $moved[2]->status);
    }

    public function test_hand_added_dates_survive_regeneration(): void
    {
        $event = $this->event();
        $series = $this->series($event, [
            'frequency' => ScheduleSeries::FREQUENCY_DAILY,
            'interval' => 1,
            'until_date' => '2026-09-03',
        ]);

        $generator = new OccurrenceGenerator();
        $generator->generate($event, $series, VenueTime::toUtc('2026-09-01T10:00'));

        // A one-off added by hand carries no series.
        $manual = $event->occurrences()->create(['start_at' => VenueTime::toUtc('2026-10-20T09:00')]);

        $generator->generate($event->fresh(), $series, VenueTime::toUtc('2026-09-01T10:00'));

        $this->assertNotNull($manual->fresh(), 'A hand-added date was destroyed by regeneration');
        $this->assertSame(4, $event->occurrences()->count());
    }

    public function test_an_until_date_before_the_start_still_yields_the_first_date(): void
    {
        $event = $this->event();
        $series = $this->series($event, [
            'frequency' => ScheduleSeries::FREQUENCY_DAILY,
            'interval' => 1,
            'until_date' => '2026-08-01',
        ]);

        $created = (new OccurrenceGenerator())->generate($event, $series, VenueTime::toUtc('2026-09-01T10:00'));

        $this->assertCount(1, $created, 'A record given a date should never end up with none');
    }

    public function test_weekly_with_an_interval_greater_than_one(): void
    {
        $event = $this->event();
        $series = $this->series($event, [
            'frequency' => ScheduleSeries::FREQUENCY_WEEKLY,
            'interval' => 2,
            'weekdays' => [1, 3],
            'until_date' => '2026-09-30',
        ]);

        $created = (new OccurrenceGenerator())->generate($event, $series, VenueTime::toUtc('2026-09-01T10:00'));

        // 2026-09-01 is a Tuesday; its week's Monday (08-31) precedes the start
        // and is skipped. Then whole two-week steps.
        $this->assertSame([
            '2026-09-02 10:00',
            '2026-09-14 10:00',
            '2026-09-16 10:00',
            '2026-09-28 10:00',
            '2026-09-30 10:00',
        ], $this->localDates($created));
    }

    public function test_weekly_including_sunday_which_ends_the_week(): void
    {
        $event = $this->event();
        $series = $this->series($event, [
            'frequency' => ScheduleSeries::FREQUENCY_WEEKLY,
            'interval' => 1,
            'weekdays' => [1, 7],
            'until_date' => '2026-09-14',
        ]);

        $created = (new OccurrenceGenerator())->generate($event, $series, VenueTime::toUtc('2026-09-06T10:00'));

        // 2026-09-06 is a Sunday — the last day of its ISO week.
        $this->assertSame([
            '2026-09-06 10:00',
            '2026-09-07 10:00',
            '2026-09-13 10:00',
            '2026-09-14 10:00',
        ], $this->localDates($created));
    }

    public function test_monthly_from_a_leap_day(): void
    {
        $event = $this->event();
        $series = $this->series($event, [
            'frequency' => ScheduleSeries::FREQUENCY_MONTHLY,
            'interval' => 1,
            'until_date' => '2028-08-31',
        ]);

        $created = (new OccurrenceGenerator())->generate($event, $series, VenueTime::toUtc('2028-02-29T10:00'));

        // Only months with a 29th qualify; none are skipped after February.
        $this->assertSame('2028-02-29 10:00', $this->localDates($created)[0]);
        $this->assertSame('2028-03-29 10:00', $this->localDates($created)[1]);
    }

    public function test_an_until_date_beyond_the_horizon_is_clamped(): void
    {
        config(['cas.schedule_horizon_months' => 6]);

        $event = $this->event();
        $series = $this->series($event, [
            'frequency' => ScheduleSeries::FREQUENCY_MONTHLY,
            'interval' => 1,
            'until_date' => '2030-01-01',
        ]);

        $created = (new OccurrenceGenerator())->generate($event, $series, VenueTime::toUtc('2026-09-01T10:00'));

        // Sep through Mar inclusive — the horizon, not the until_date.
        $this->assertSame('2027-03-01 10:00', $this->localDates($created)[count($created) - 1]);
    }

    public function test_a_zero_or_negative_interval_cannot_loop_forever(): void
    {
        $event = $this->event();

        foreach ([ScheduleSeries::FREQUENCY_WEEKLY, ScheduleSeries::FREQUENCY_MONTHLY, ScheduleSeries::FREQUENCY_DAILY] as $frequency) {
            // Built in memory, bypassing the unsigned column, because the
            // generator must terminate on its own rather than relying on the
            // schema to reject the value.
            $series = new ScheduleSeries([
                'frequency' => $frequency,
                'interval' => -1,
                'weekdays' => [2, 4],
                'until_date' => '2026-10-01',
            ]);

            $dates = (new OccurrenceGenerator())->expand($series, VenueTime::toUtc('2026-09-01T10:00'));

            $this->assertGreaterThan(0, $dates->count(), "{$frequency} produced nothing");
            $this->assertLessThan(500, $dates->count(), "{$frequency} ran away");
        }
    }

    public function test_a_reversed_end_time_does_not_produce_negative_durations(): void
    {
        $event = $this->event();
        $series = $this->series($event, ['frequency' => ScheduleSeries::FREQUENCY_NONE]);

        $created = (new OccurrenceGenerator())->generate(
            $event,
            $series,
            VenueTime::toUtc('2026-09-01T10:00'),
            VenueTime::toUtc('2026-09-01T09:00'),
        );

        $this->assertNull($created[0]->end_at, 'An end before the start should be discarded, not propagated');
    }

    public function test_courses_and_trips_can_be_scheduled_too(): void
    {
        $course = \App\Models\Course::create([
            'name' => 'Open Water', 'slug' => 'open-water-test', 'description' => 'd', 'price' => 100,
        ]);
        $trip = \App\Models\Trip::create([
            'name' => 'Reef Trip', 'slug' => 'reef-trip-test', 'description' => 'd', 'price' => 200,
        ]);

        foreach ([$course, $trip] as $model) {
            $series = ScheduleSeries::create([
                'schedulable_type' => $model::class,
                'schedulable_id' => $model->id,
                'frequency' => ScheduleSeries::FREQUENCY_WEEKLY,
                'interval' => 1,
                'weekdays' => [6],
                'until_date' => '2026-09-30',
            ]);

            $created = (new OccurrenceGenerator())->generate($model, $series, VenueTime::toUtc('2026-09-01T08:00'));

            $this->assertGreaterThan(0, $created->count());
            $this->assertSame($model::class, $created->first()->schedulable_type);
            $this->assertTrue($model->fresh()->hasSchedule());
        }
    }

    public function test_force_deleting_a_parent_removes_its_dates(): void
    {
        $event = $this->event();
        $event->occurrences()->create(['start_at' => VenueTime::toUtc('2026-09-01T10:00')]);

        $event->delete();
        $this->assertSame(1, ScheduleOccurrence::count(), 'Soft delete should keep dates so a restore works');

        $event->forceDelete();
        $this->assertSame(0, ScheduleOccurrence::count(), 'Force delete should not leave orphaned dates');
    }

    public function test_next_occurrence_uses_an_eager_loaded_relation_without_extra_queries(): void
    {
        $event = $this->event();
        $event->occurrences()->create(['start_at' => now()->addDays(3), 'status' => 'scheduled']);
        $event->occurrences()->create(['start_at' => now()->addDay(), 'status' => 'scheduled']);

        $loaded = Event::with('upcomingOccurrences')->find($event->id);

        DB::enableQueryLog();
        $next = $loaded->nextOccurrence();
        $queries = DB::getQueryLog();
        DB::disableQueryLog();

        $this->assertNotNull($next);
        $this->assertCount(0, $queries, 'nextOccurrence() queried despite the relation being eager loaded');
    }
}
