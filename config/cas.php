<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Venue timezone
    |--------------------------------------------------------------------------
    |
    | The academy operates from Al Khobar. Every scheduled date — an event, a
    | course session, a trip departure — happens in that local time, regardless
    | of where the visitor reading the page happens to be. A diver in London
    | looking at a Khobar dive wants the Khobar time, not their own.
    |
    | Dates are stored in UTC (app.timezone stays UTC so existing rows are not
    | reinterpreted). This value is what naive admin input is understood to
    | mean, and what public pages format back into. Saudi Arabia does not
    | observe DST, so the offset is a constant +03:00.
    |
    */

    'venue_timezone' => env('CAS_VENUE_TIMEZONE', 'Asia/Riyadh'),

    /*
    |--------------------------------------------------------------------------
    | Scheduling horizon
    |--------------------------------------------------------------------------
    |
    | How far ahead a recurring series may generate dates. The client asked for
    | six months. Dates are materialised as real rows when the series is saved
    | — there is no task scheduler on this host, so nothing would extend the
    | series later.
    |
    */

    'schedule_horizon_months' => 6,

];
