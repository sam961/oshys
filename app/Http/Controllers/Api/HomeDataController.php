<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use App\Models\BlogPost;
use App\Models\Course;
use App\Models\Event;
use App\Models\FooterLink;
use App\Models\Product;
use App\Models\Setting;
use App\Models\SocialInitiative;
use App\Models\TeamMember;
use App\Models\Trip;
use Illuminate\Http\Request;

class HomeDataController extends Controller
{
    use TranslatableController;

    /**
     * Return a consolidated payload of the public data the homepage needs.
     *
     * This endpoint mirrors the "featured/active" filter case of the individual
     * resource controllers so the frontend can avoid issuing ~10 parallel
     * requests on initial load.
     */
    public function index(Request $request)
    {
        // Banners — active, position=hero (mirrors BannerController::index ordering)
        $banners = Banner::with('translations')
            ->where('is_active', true)
            ->where('position', 'hero')
            ->orderBy('display_order', 'asc')
            ->orderBy('created_at', 'desc')
            ->get();
        $banners = $this->transformWithTranslations($banners);

        // Courses — active + featured (mirrors CourseController::index)
        $courses = Course::with(['translations', 'images'])
            ->where('is_active', true)
            ->where('is_featured', true)
            ->orderBy('created_at', 'desc')
            ->get();
        $courses = $this->transformWithTranslations($courses);

        // Trips — active + featured (mirrors TripController::index)
        $trips = Trip::with(['images', 'translations'])
            ->where('is_active', true)
            ->where('is_featured', true)
            ->orderBy('created_at', 'desc')
            ->get();
        $trips = $this->transformWithTranslations($trips);

        // Products — active + featured (mirrors ProductController::index)
        $products = Product::with(['images', 'translations'])
            ->where('is_active', true)
            ->where('is_featured', true)
            ->orderBy('created_at', 'desc')
            ->get();
        $products = $this->transformWithTranslations($products);

        // Blog posts — published + featured (mirrors BlogPostController::index)
        $blogPosts = BlogPost::with(['author', 'images', 'translations'])
            ->where('is_published', true)
            ->where('is_featured', true)
            ->orderBy('created_at', 'desc')
            ->get();
        $blogPosts = $this->transformWithTranslations($blogPosts);

        // Events — active + upcoming (mirrors EventController::index ordering)
        $events = Event::with(['images', 'translations'])
            ->where('is_active', true)
            ->where('start_date', '>=', now())
            ->orderBy('start_date', 'asc')
            ->get();
        $events = $this->transformWithTranslations($events);

        // Featured team member (mirrors TeamMemberController::featured)
        $featuredId = Setting::get('featured_instructor_id');
        if (!$featuredId) {
            $teamFeatured = TeamMember::with(['images', 'translations'])
                ->where('is_active', true)
                ->orderBy('display_order', 'asc')
                ->first();
        } else {
            $teamFeatured = TeamMember::with(['images', 'translations'])
                ->where('id', $featuredId)
                ->where('is_active', true)
                ->first();
        }

        // Settings — all (mirrors SettingController::index ordering)
        $settings = Setting::orderBy('group', 'asc')
            ->orderBy('key', 'asc')
            ->get();

        // Social initiatives — published + featured (mirrors SocialInitiativeController::index)
        $socialInitiatives = SocialInitiative::with(['translations'])
            ->where('is_published', true)
            ->where('is_featured', true)
            ->orderBy('created_at', 'desc')
            ->get();
        $socialInitiatives = $this->transformWithTranslations($socialInitiatives);

        // Footer links — active (mirrors FooterLinkController::index ordering)
        $footerLinks = FooterLink::with('translations')
            ->where('is_active', true)
            ->orderBy('display_order', 'asc')
            ->orderBy('created_at', 'desc')
            ->get();
        $footerLinks = $this->transformWithTranslations($footerLinks);

        return response()->json([
            'banners' => $banners,
            'courses' => $courses,
            'trips' => $trips,
            'products' => $products,
            'blog_posts' => $blogPosts,
            'events' => $events,
            'team_featured' => $teamFeatured,
            'settings' => $settings,
            'social_initiatives' => $socialInitiatives,
            'footer_links' => $footerLinks,
        ]);
    }
}
