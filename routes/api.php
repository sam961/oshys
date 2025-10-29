<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\CourseController;
use App\Http\Controllers\Api\TripController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\BlogPostController;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\TeamMemberController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\SettingController;
use App\Http\Controllers\Api\BannerController;

// API Routes
Route::apiResource('courses', CourseController::class);
Route::apiResource('trips', TripController::class);
Route::apiResource('products', ProductController::class);
Route::apiResource('blog-posts', BlogPostController::class);
Route::apiResource('events', EventController::class);
Route::apiResource('team-members', TeamMemberController::class);
Route::apiResource('categories', CategoryController::class);
Route::apiResource('settings', SettingController::class);
Route::apiResource('banners', BannerController::class);
