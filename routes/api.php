<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CourseController;
use App\Http\Controllers\Api\TripController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\BlogPostController;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\TeamMemberController;
use App\Http\Controllers\Api\SettingController;
use App\Http\Controllers\Api\BannerController;
use App\Http\Controllers\Api\SocialInitiativeController;
use App\Http\Controllers\Api\FooterLinkController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\CourseImageController;
use App\Http\Controllers\Api\TripImageController;

// Auth routes
Route::post('login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('logout', [AuthController::class, 'logout']);
    Route::get('user', [AuthController::class, 'user']);
});

// Public read routes (index + show)
Route::get('courses', [CourseController::class, 'index']);
Route::get('courses/{course}', [CourseController::class, 'show']);
Route::get('trips', [TripController::class, 'index']);
Route::get('trips/{trip}', [TripController::class, 'show']);
Route::get('products', [ProductController::class, 'index']);
Route::get('products/{product}', [ProductController::class, 'show']);
Route::get('blog-posts', [BlogPostController::class, 'index']);
Route::get('blog-posts/{blog_post}', [BlogPostController::class, 'show']);
Route::get('events', [EventController::class, 'index']);
Route::get('events/{event}', [EventController::class, 'show']);
Route::get('team-members', [TeamMemberController::class, 'index']);
Route::get('team-members/{team_member}', [TeamMemberController::class, 'show']);
Route::get('team-members-featured', [TeamMemberController::class, 'featured']);
Route::get('settings', [SettingController::class, 'index']);
Route::get('settings/{setting}', [SettingController::class, 'show']);
Route::get('banners', [BannerController::class, 'index']);
Route::get('banners/{banner}', [BannerController::class, 'show']);
Route::get('social-initiatives', [SocialInitiativeController::class, 'index']);
Route::get('social-initiatives/{social_initiative}', [SocialInitiativeController::class, 'show']);
Route::get('footer-links', [FooterLinkController::class, 'index']);
Route::get('footer-links/{footer_link}', [FooterLinkController::class, 'show']);
Route::get('bookings', [BookingController::class, 'index']);
Route::get('bookings/{booking}', [BookingController::class, 'show']);

// Public form submissions
Route::post('contact', [ContactController::class, 'store']);
Route::post('bookings', [BookingController::class, 'store']);

// Protected write routes (create, update, delete)
Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('courses', CourseController::class)->except(['index', 'show']);
    Route::post('courses/{course}/images', [CourseImageController::class, 'store']);
    Route::put('courses/{course}/images/reorder', [CourseImageController::class, 'reorder']);
    Route::put('courses/{course}/images/{image}/set-main', [CourseImageController::class, 'setMain']);
    Route::delete('courses/{course}/images/{image}', [CourseImageController::class, 'destroy']);

    Route::apiResource('trips', TripController::class)->except(['index', 'show']);
    Route::post('trips/{trip}/images', [TripImageController::class, 'store']);
    Route::put('trips/{trip}/images/reorder', [TripImageController::class, 'reorder']);
    Route::put('trips/{trip}/images/{image}/set-main', [TripImageController::class, 'setMain']);
    Route::delete('trips/{trip}/images/{image}', [TripImageController::class, 'destroy']);

    Route::apiResource('products', ProductController::class)->except(['index', 'show']);
    Route::apiResource('blog-posts', BlogPostController::class)->except(['index', 'show']);
    Route::apiResource('events', EventController::class)->except(['index', 'show']);
    Route::apiResource('team-members', TeamMemberController::class)->except(['index', 'show']);
    Route::apiResource('settings', SettingController::class)->except(['index', 'show']);
    Route::apiResource('banners', BannerController::class)->except(['index', 'show']);
    Route::apiResource('social-initiatives', SocialInitiativeController::class)->except(['index', 'show']);
    Route::apiResource('footer-links', FooterLinkController::class)->except(['index', 'show']);
    Route::apiResource('bookings', BookingController::class)->except(['index', 'show', 'store']);
});
