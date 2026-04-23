<?php

use Illuminate\Support\Facades\Route;

// Admin SPA — serves the admin bundle for any /admin/* path.
// Must come BEFORE the public catch-all so it takes precedence.
Route::get('/admin/{any?}', function () {
    return view('admin');
})->where('any', '.*');

// Public SPA — catch-all route for React app (must be last).
Route::get('/{any}', function () {
    return view('app');
})->where('any', '.*');
