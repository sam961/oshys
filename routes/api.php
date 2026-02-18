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
use App\Http\Controllers\Api\SocialInitiativeController;
use App\Http\Controllers\Api\FooterLinkController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\CourseImageController;
use App\Http\Controllers\Api\TripImageController;

// API Routes
Route::apiResource('courses', CourseController::class);
Route::post('courses/{course}/images', [CourseImageController::class, 'store']);
Route::put('courses/{course}/images/reorder', [CourseImageController::class, 'reorder']);
Route::put('courses/{course}/images/{image}/set-main', [CourseImageController::class, 'setMain']);
Route::delete('courses/{course}/images/{image}', [CourseImageController::class, 'destroy']);
Route::apiResource('trips', TripController::class);
Route::post('trips/{trip}/images', [TripImageController::class, 'store']);
Route::put('trips/{trip}/images/reorder', [TripImageController::class, 'reorder']);
Route::put('trips/{trip}/images/{image}/set-main', [TripImageController::class, 'setMain']);
Route::delete('trips/{trip}/images/{image}', [TripImageController::class, 'destroy']);
Route::apiResource('products', ProductController::class);
Route::apiResource('blog-posts', BlogPostController::class);
Route::apiResource('events', EventController::class);
Route::apiResource('team-members', TeamMemberController::class);
Route::get('team-members-featured', [TeamMemberController::class, 'featured']);
Route::apiResource('categories', CategoryController::class);
Route::apiResource('settings', SettingController::class);
Route::apiResource('banners', BannerController::class);
Route::apiResource('social-initiatives', SocialInitiativeController::class);
Route::apiResource('footer-links', FooterLinkController::class);
Route::apiResource('bookings', BookingController::class);
Route::post('contact', [ContactController::class, 'store']);
