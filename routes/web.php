<?php

use Illuminate\Support\Facades\Route;

// Catch-all route for React app (must be last)
Route::get('/{any}', function () {
    return view('app');
})->where('any', '.*');
