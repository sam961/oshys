<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\Course;
use App\Models\Trip;
use App\Models\BlogPost;
use App\Models\Event;
use App\Models\TeamMember;
use App\Models\Banner;
use App\Models\Category;

class ArabicTranslationsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->addProductTranslations();
        $this->addCourseTranslations();
        $this->addTripTranslations();
        $this->addBlogPostTranslations();
        $this->addEventTranslations();
        $this->addTeamMemberTranslations();
        $this->addBannerTranslations();
        $this->addCategoryTranslations();

        $this->command->info('✅ Arabic translations added successfully!');
    }

    private function addProductTranslations()
    {
        $this->command->info('Adding Product translations...');

        $products = Product::all();

        foreach ($products as $product) {
            // Generate Arabic translations based on English content
            $arabicTranslations = [
                'name' => $this->translateToArabic($product->name, 'product_name'),
                'description' => $this->translateToArabic($product->description, 'description'),
                'details' => $this->translateToArabic($product->details, 'details'),
            ];

            foreach ($arabicTranslations as $field => $value) {
                if (!empty($value)) {
                    $product->setTranslation($field, 'ar', $value);
                }
            }
        }

        $this->command->info("  → {$products->count()} products translated");
    }

    private function addCourseTranslations()
    {
        $this->command->info('Adding Course translations...');

        $courses = Course::all();

        foreach ($courses as $course) {
            $arabicTranslations = [
                'name' => $this->translateToArabic($course->name, 'course_name'),
                'description' => $this->translateToArabic($course->description, 'description'),
                'details' => $this->translateToArabic($course->details, 'details'),
            ];

            foreach ($arabicTranslations as $field => $value) {
                if (!empty($value)) {
                    $course->setTranslation($field, 'ar', $value);
                }
            }
        }

        $this->command->info("  → {$courses->count()} courses translated");
    }

    private function addTripTranslations()
    {
        $this->command->info('Adding Trip translations...');

        $trips = Trip::all();

        foreach ($trips as $trip) {
            $arabicTranslations = [
                'name' => $this->translateToArabic($trip->name, 'trip_name'),
                'description' => $this->translateToArabic($trip->description, 'description'),
                'details' => $this->translateToArabic($trip->details, 'details'),
                'location' => $this->translateToArabic($trip->location, 'location'),
            ];

            foreach ($arabicTranslations as $field => $value) {
                if (!empty($value)) {
                    $trip->setTranslation($field, 'ar', $value);
                }
            }
        }

        $this->command->info("  → {$trips->count()} trips translated");
    }

    private function addBlogPostTranslations()
    {
        $this->command->info('Adding Blog Post translations...');

        $posts = BlogPost::all();

        foreach ($posts as $post) {
            $arabicTranslations = [
                'title' => $this->translateToArabic($post->title, 'blog_title'),
                'excerpt' => $this->translateToArabic($post->excerpt, 'excerpt'),
                'content' => $this->translateToArabic($post->content, 'content'),
            ];

            foreach ($arabicTranslations as $field => $value) {
                if (!empty($value)) {
                    $post->setTranslation($field, 'ar', $value);
                }
            }
        }

        $this->command->info("  → {$posts->count()} blog posts translated");
    }

    private function addEventTranslations()
    {
        $this->command->info('Adding Event translations...');

        $events = Event::all();

        foreach ($events as $event) {
            $arabicTranslations = [
                'title' => $this->translateToArabic($event->title, 'event_title'),
                'description' => $this->translateToArabic($event->description, 'description'),
                'location' => $this->translateToArabic($event->location, 'location'),
            ];

            foreach ($arabicTranslations as $field => $value) {
                if (!empty($value)) {
                    $event->setTranslation($field, 'ar', $value);
                }
            }
        }

        $this->command->info("  → {$events->count()} events translated");
    }

    private function addTeamMemberTranslations()
    {
        $this->command->info('Adding Team Member translations...');

        $members = TeamMember::all();

        foreach ($members as $member) {
            $arabicTranslations = [
                'name' => $this->translateToArabic($member->name, 'person_name'),
                'role' => $this->translateToArabic($member->role, 'role'),
                'bio' => $this->translateToArabic($member->bio, 'bio'),
                'experience' => $this->translateToArabic($member->experience, 'experience'),
            ];

            foreach ($arabicTranslations as $field => $value) {
                if (!empty($value)) {
                    $member->setTranslation($field, 'ar', $value);
                }
            }
        }

        $this->command->info("  → {$members->count()} team members translated");
    }

    private function addBannerTranslations()
    {
        $this->command->info('Adding Banner translations...');

        $banners = Banner::all();

        foreach ($banners as $banner) {
            $arabicTranslations = [
                'title' => $this->translateToArabic($banner->title, 'banner_title'),
                'description' => $this->translateToArabic($banner->description, 'description'),
                'button_text' => $this->translateToArabic($banner->button_text, 'button'),
            ];

            foreach ($arabicTranslations as $field => $value) {
                if (!empty($value)) {
                    $banner->setTranslation($field, 'ar', $value);
                }
            }
        }

        $this->command->info("  → {$banners->count()} banners translated");
    }

    private function addCategoryTranslations()
    {
        $this->command->info('Adding Category translations...');

        $categories = Category::all();

        foreach ($categories as $category) {
            $arabicTranslations = [
                'name' => $this->translateToArabic($category->name, 'category_name'),
                'description' => $this->translateToArabic($category->description, 'description'),
            ];

            foreach ($arabicTranslations as $field => $value) {
                if (!empty($value)) {
                    $category->setTranslation($field, 'ar', $value);
                }
            }
        }

        $this->command->info("  → {$categories->count()} categories translated");
    }

    /**
     * Simple translation helper - maps common English terms to Arabic
     * In production, you would use a proper translation API
     */
    private function translateToArabic($text, $type = 'general')
    {
        if (empty($text)) {
            return null;
        }

        // Common diving/tourism related translations
        $commonTranslations = [
            // Product names
            'Diving Mask' => 'قناع الغوص',
            'Snorkel' => 'أنبوب التنفس',
            'Fins' => 'زعانف',
            'Wetsuit' => 'بدلة الغوص',
            'Diving Gloves' => 'قفازات الغوص',
            'Diving Boots' => 'أحذية الغوص',
            'Underwater Camera' => 'كاميرا تحت الماء',

            // Course names
            'Open Water Diver' => 'غواص المياه المفتوحة',
            'Advanced Diving' => 'الغوص المتقدم',
            'Rescue Diver' => 'غواص الإنقاذ',
            'Divemaster' => 'قائد الغوص',
            'Freediving' => 'الغوص الحر',

            // Trip names
            'Red Sea Adventure' => 'مغامرة البحر الأحمر',
            'Coral Reef Exploration' => 'استكشاف الشعاب المرجانية',
            'Shipwreck Diving' => 'الغوص في حطام السفن',
            'Night Diving' => 'الغوص الليلي',

            // Locations
            'Red Sea' => 'البحر الأحمر',
            'Jeddah' => 'جدة',
            'Yanbu' => 'ينبع',
            'Umluj' => 'أملج',
            'NEOM' => 'نيوم',

            // Common phrases
            'Professional' => 'احترافي',
            'Beginner' => 'مبتدئ',
            'Intermediate' => 'متوسط',
            'Advanced' => 'متقدم',
            'Certification' => 'شهادة',
            'Equipment' => 'معدات',
            'Safety' => 'السلامة',
            'Training' => 'تدريب',
        ];

        // Check if we have a direct translation
        if (isset($commonTranslations[$text])) {
            return $commonTranslations[$text];
        }

        // For descriptions and longer text, provide a generic Arabic translation prompt
        // This is a placeholder - in production you'd use Google Translate API or similar
        switch ($type) {
            case 'product_name':
                return 'منتج: ' . $text;
            case 'course_name':
                return 'دورة: ' . $text;
            case 'trip_name':
                return 'رحلة: ' . $text;
            case 'blog_title':
                return 'مقال: ' . $text;
            case 'event_title':
                return 'حدث: ' . $text;
            case 'category_name':
                return 'فئة: ' . $text;
            case 'description':
                return 'وصف: ' . $text;
            case 'person_name':
                // Keep names as-is or transliterate
                return $text;
            case 'role':
                $roleTranslations = [
                    'Instructor' => 'مدرب',
                    'Dive Master' => 'قائد غوص',
                    'Course Director' => 'مدير الدورات',
                    'Assistant Instructor' => 'مساعد مدرب',
                ];
                return $roleTranslations[$text] ?? 'منصب: ' . $text;
            default:
                return '[AR] ' . $text;
        }
    }
}
