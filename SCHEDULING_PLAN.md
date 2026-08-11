# Scheduling & Capacity — Implementation Plan

**Client feedback point:** #2 — Recurring events, multi-date scheduling, per-date capacity
**Scope:** Events, Courses **and** Trips (confirmed with client)
**Status:** Planned — not started
**Prepared:** August 11, 2026

---

## Decisions already made

| Question | Decision |
|---|---|
| Which content types | Events, Courses, Trips — all three |
| Capacity | **Optional field per date.** Displayed when set, hidden when blank. Never blocks anyone — no "Sold Out", no seat counting |
| On-site booking | **Unchanged.** No date picker added. Date selection happens over WhatsApp (point #4) |
| Calendar | Courses and trips join events on the homepage calendar, with a type filter |
| Recurrence horizon | 6 months maximum |
| Series editing | Shared content on the parent; per-date capacity override and per-date cancellation |

## Why one shared model instead of three

Courses and trips currently have **no date fields at all** — only `events` and `banners` have date
columns anywhere in the schema. Courses have `duration` (free text, e.g. "3 days") and `max_students`;
trips have neither dates nor capacity.

So this is not "extend events" — it is scheduling built once and attached to three types. A
polymorphic `schedule_occurrences` table means the generator, admin UI, API shape and calendar
integration are each built once. Three separate implementations would cost roughly double and
drift apart over time.

Existing tables are **not modified**. The change is additive, which keeps deployment low-risk.

---

## Standing rules for every phase

These are project conventions plus lessons already paid for in this codebase. They apply to all
phases and are part of each phase's exit criteria.

1. **Every EN key needs an AR key.** No exceptions.
2. **Bump the translations version whenever `public/locales/*.json` changes** —
   `VITE_TRANSLATIONS_VERSION` in `resources/js/i18n/config.ts`. Locale JSON is cached for a year
   by `.htaccess` and for 30 days by a CacheFirst service-worker rule. Skipping this ships raw
   key names (`nav.events`) to anyone with a warm cache. This has already bitten us once.
3. **`npm run build` after every frontend change.** Compiled assets are committed; the server
   does not build.
4. **A green build is not verification.** Bundling does not execute code. Load the actual page in
   a browser before calling anything done. A TipTap version bump once passed the build and left
   the admin as a blank white page.
5. **Pin dependency versions exactly** for anything in the editor/ProseMirror family. A caret
   allowed a minor upgrade that crashed the admin.
6. **Mobile-first Tailwind.** Base classes are mobile; `sm:`/`lg:`/`xl:` widen. No `text-4xl`
   without a mobile override.
7. **Stage specific files.** Never `git add -A` at repo root. Never commit `.env` or `storage.zip`.
8. **Migrations must be idempotent** — check `Schema::hasColumn()` / `hasTable()` before changing.

---

## Phase 1 — Schema, model and occurrence generator

**Goal:** the data layer exists, existing events are migrated onto it, and nothing on the live
site changes yet.

### Build
- Migration: `schedule_occurrences` — `schedulable_type`, `schedulable_id`, `series_id` (nullable),
  `start_at`, `end_at` (nullable), `capacity` (nullable), `status` (`scheduled|cancelled`),
  timestamps. Indexes on `(schedulable_type, schedulable_id)` and `start_at`.
- Migration: `schedule_series` — `frequency` (`none|daily|weekly|monthly`), `interval`,
  `weekdays` (json), `until_date`.
- Backfill migration: every existing event's `start_date`/`end_date` becomes its first occurrence.
  Existing `events.start_date` columns stay in place for now — nothing is dropped until the public
  site has fully moved over (Phase 3).
- `ScheduleOccurrence` and `ScheduleSeries` models; `Schedulable` trait with the `morphMany`
  relation, added to `Event`, `Course`, `Trip`.
- Occurrence generator service: expands a rule into concrete rows, hard-capped at 6 months.
  Materialised at save time — **there is no task scheduler on this shared host**, so nothing can
  generate future dates later.
- Regeneration logic that preserves per-date capacity overrides and cancellations when a series
  rule is edited.
- Timezone: confirm and pin the app timezone (currently unset/default) before any dates are stored.

### Exit criteria
- `php artisan migrate` runs clean, and rolls back clean.
- Re-running the backfill does not duplicate occurrences.
- Generator unit-tested for: weekly-by-weekday, monthly, the 6-month cap, and DST-free correctness
  in Asia/Riyadh.
- Editing a series preserves an overridden capacity on an individual date.
- No public-facing change is visible.

### QA agent brief
> Audit the new scheduling schema and generator. Verify: the backfill is idempotent and correct for
> every existing event including those with null `end_date`; the 6-month cap cannot be exceeded via
> any rule combination; regenerating a series preserves per-date capacity overrides and cancelled
> dates; occurrence queries are indexed and do not introduce N+1 when loading a list of events;
> rollback restores the previous state. Check timezone handling explicitly — construct an occurrence
> near midnight and confirm it survives a round trip through the API unchanged. Report with
> file:line and concrete reproduction steps. Do not report speculative issues.

### Code review agent brief
> Review the migrations, models, trait and generator service. Focus on: idempotency of migrations
> per project convention; whether the polymorphic relation is indexed correctly; whether the
> generator's recurrence maths is correct at month boundaries and for months with fewer days;
> N+1 risk in the relation; whether `series_id` nullability is handled everywhere; naming and
> structure consistency with the existing `app/Models` and `app/Http/Controllers/Api` conventions.
> Verify each claim against the code before reporting it.

---

## Phase 2 — Shared admin scheduling UI, wired to Events

**Goal:** an admin can create a repeating event with multiple dates and per-date capacity.
**First reviewable milestone — the client can see this working.**

### Build
- `ScheduleEditor` admin component (shared, used by all three types in later phases):
  - repeat rule builder — none / daily / weekly / monthly, interval, until-date
  - generated date list, each row with an optional capacity input and a cancel action
  - clear indication when a date's capacity overrides the parent's
- Wire into `EventEditPage`.
- API endpoints for occurrence CRUD; RTK Query hooks and tag invalidation.
- EN + AR strings for all new admin labels.

### Exit criteria
- Create a weekly event for 3 months → correct dates generated, visible in admin.
- Set capacity on one date only → persists, others stay blank.
- Cancel one date → removed from public view (once Phase 3 lands), retained in admin.
- Edit the series → overrides and cancellations survive.
- Build passes **and** the page loads in a real browser with no console errors.

### QA agent brief
> Audit the admin scheduling UI end to end in a browser, logged in. Verify: creating, editing and
> deleting a series; the 6-month cap surfaces a sensible message rather than silently truncating;
> per-date capacity accepts blank and rejects negatives; cancelling a date is reversible; the form's
> unsaved-changes guard still fires with the new fields; the UI is usable at mobile width; every new
> string is translated in both EN and AR with no raw keys leaking. Confirm the translations version
> was bumped. Report concrete reproduction steps.

### Code review agent brief
> Review the ScheduleEditor component, its integration into EventEditPage, and the occurrence API
> endpoints. Focus on: whether the component is genuinely reusable for Course and Trip in later
> phases or has Event-specific assumptions baked in; validation parity between client and server;
> RTK Query cache invalidation correctness (stale lists after mutation); controlled-input and key
> handling in the generated date list; accessibility of the date rows; consistency with the existing
> admin component conventions. Verify before reporting.

---

## Phase 3 — Public display for Events, and the calendar

**Goal:** visitors see multiple dates; the calendar reflects them.

### Build
- Event listing cards show the next upcoming date.
- Event detail page shows all upcoming dates with a date selector.
- `EventsCalendar` reads occurrences rather than `event.start_date`.
- Past/cancelled dates filtered out of public views.
- Retire `events.start_date`/`end_date` reads from the public path (columns stay until Phase 6).

### Exit criteria
- An event with 8 dates shows all 8 on the calendar, in the right months.
- Cancelled dates never appear publicly.
- Arabic and RTL verified.
- Cache behaviour understood: public GETs are wrapped in a 5-minute cache, so a newly added date
  can take up to 5 minutes to appear. Confirm this is acceptable or exempt the endpoint.

### QA agent brief
> Audit the public event pages and calendar in a browser at mobile, tablet and desktop widths, in
> both EN and AR. Verify: multi-date events render correctly on listing, detail and calendar;
> cancelled and past dates are absent; the date selector works with keyboard and touch; no layout
> break with a long list of dates; RTL mirrors correctly; no console errors. Confirm the 5-minute
> public cache does not make newly added dates look broken to an admin previewing the site.

### Code review agent brief
> Review the public-facing changes. Focus on: date formatting and locale handling (`ar-SA` vs
> `en-US`), timezone correctness between server and browser, whether occurrence filtering happens
> in SQL rather than in PHP/JS over a full result set, N+1 queries on listing pages, and whether the
> calendar's grouping logic handles an event whose occurrences span multiple months. Verify claims
> against the code.

---

## Phase 4 — Courses

**Goal:** courses gain scheduling, reusing everything built above.

### Build
- Attach `Schedulable` to Course; add `ScheduleEditor` to `CourseEditPage`.
- Course listing and detail show upcoming dates.
- Courses join the calendar, with a type filter (Events / Courses / Trips).
- Decide the relationship between the existing free-text `duration` ("3 days") and real dates —
  they will now coexist and could contradict each other.

### Exit criteria
- A course with dates behaves identically to an event with dates.
- Courses with no dates still render exactly as they do today — this must not regress the
  existing course pages.
- Calendar type filter works in both locales.

### QA agent brief
> Audit courses with dates, and — critically — courses **without** dates, which must be unchanged
> from today's behaviour. Verify the calendar type filter, the interaction between `duration` text
> and real dates, and that the existing booking flow (name/email/phone, no date) still works and
> still makes sense on a course that now shows 5 dates. Flag any place where a visitor could be
> confused about which date they are enquiring about.

### Code review agent brief
> Review the Course integration. Focus on whether ScheduleEditor was genuinely reused or forked,
> whether the API response shape stayed consistent across types, and whether any Event-specific
> assumption leaked into shared code. Check that course pages without occurrences take the same
> code path as before rather than a new nullable-heavy branch.

---

## Phase 5 — Trips

**Goal:** same treatment for trips.

### Build
- Attach `Schedulable` to Trip; `ScheduleEditor` in `TripEditPage`.
- Trip listing/detail show dates; trips join the calendar filter.
- Note: trips currently have **no capacity field at all**, so per-date capacity is new here rather
  than an override of an existing parent value.

### Exit criteria
- Trips with and without dates both behave correctly.
- All three types coexist on the calendar without visual collision.

### QA agent brief
> Audit trips, then audit all three types together on the calendar — particularly a single day
> holding an event, a course and a trip simultaneously. Verify capacity works on trips despite no
> parent field existing. Re-check mobile calendar popups with mixed types.

### Code review agent brief
> Review the Trip integration and, more importantly, do a consolidation pass across all three:
> is there now duplicated logic that should be factored out? Is the shared code still coherent
> after three integrations, or has it accumulated per-type special cases?

---

## Phase 6 — WhatsApp inquiry, cleanup and hardening

**Goal:** close client point #4 using the date model, and remove now-dead code.

### Build
- WhatsApp inquiry button on detail pages, pre-filled with title **and the selected date**
  (client point #4).
- Extract the hardcoded WhatsApp number — it currently appears in four separate files.
- Drop `events.start_date`/`end_date` once nothing reads them, in a separate reversible migration.
- Final pass: sitemap/meta implications for point #3 (slugs), which is now unblocked.

### Exit criteria
- WhatsApp message contains the correct title and date, correctly encoded, in both languages.
- Arabic message text reads naturally, not as a translated-English string.
- No references remain to the dropped columns.

### QA agent brief
> Verify the WhatsApp link on all three types, in both languages, on real mobile behaviour —
> the pre-filled text must survive URL encoding including Arabic characters and the date format.
> Confirm the number is correct and sourced from one place. Confirm nothing still reads the
> dropped columns.

### Code review agent brief
> Review the WhatsApp integration and the column-drop migration. Focus on: encoding correctness,
> whether the drop migration is reversible and safe to run against production data, and whether
> any code path still expects `start_date` to exist.

---

## Estimate

| Phase | Work | Days |
|---|---|---|
| 1 | Schema, model, generator, backfill | 2 |
| 2 | Shared admin UI + Events | 2 |
| 3 | Public display + calendar | 1.5 |
| 4 | Courses | 2 |
| 5 | Trips | 1 |
| 6 | WhatsApp + cleanup | 0.5 |
| | **Total** | **~9 days** |

QA and review passes are included in each phase's figure. Phases 1–3 deliver a complete working
feature for events; 4 and 5 are largely reuse.

## Deployment notes

- Compiled assets are committed — run `npm run build` and commit `public/build/` with the change.
- **Migrations must be run on the server.** This is the first phase of work in a while that adds
  tables; confirm the deployment process for `php artisan migrate` before Phase 1 ships.
- The backfill migration touches existing event data. Take a database backup first.
- Bump the translations version any time locale files change.

## Open items

- Timezone is not explicitly configured; pin it before storing dates (Phase 1).
- The 5-minute public API cache will delay newly added dates by up to 5 minutes.
- `duration` free text on courses will coexist with real dates and could contradict them (Phase 4).
- On-site booking still captures no date. If the client later wants that, it is ~2 days on top.
