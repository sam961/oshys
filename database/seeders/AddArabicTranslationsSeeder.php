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

class AddArabicTranslationsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * This seeder adds Arabic translations to all existing content
     */
    public function run(): void
    {
        $this->command->info('🌍 Adding Arabic Translations...');
        $this->command->newLine();

        $this->addProductTranslations();
        $this->addCourseTranslations();
        $this->addTripTranslations();
        $this->addBlogPostTranslations();
        $this->addEventTranslations();
        $this->addTeamMemberTranslations();
        $this->addBannerTranslations();
        $this->addCategoryTranslations();

        $this->command->newLine();
        $this->command->info('✅ All Arabic translations added successfully!');
        $this->command->info('💡 Tip: You can now edit these translations in the Admin CMS');
    }

    private function addProductTranslations()
    {
        $this->command->info('📦 Products...');

        $products = Product::all();
        $count = 0;

        // Specific product translations based on common diving products
        $productTranslations = [
            'Mares Rover Mask and Snorkel Set' => [
                'name' => 'مجموعة قناع وأنبوب التنفس ماريس روفر',
                'description' => 'معروفة بجودتها ومتانتها وراحتها وموصى بها للغواصين الجدد',
                'details' => 'مجموعة كاملة للغوص تتضمن قناع عالي الجودة وأنبوب تنفس مريح',
            ],
            'Shark Children\'s Swim Coat' => [
                'name' => 'معطف سباحة للأطفال شارك',
                'description' => 'يحافظ على دفء وجفاف وحماية الطفل من الرياح والبرد',
                'details' => 'مصنوع من مواد عالية الجودة توفر الحماية والدفء للأطفال',
            ],
            'Dive Computer Watch' => [
                'name' => 'ساعة كمبيوتر الغوص',
                'description' => 'تتبع العمق والوقت ومحطات الأمان مع كمبيوتر الغوص المتقدم هذا',
                'details' => 'جهاز متقدم لمراقبة جميع معلومات الغوص الحيوية',
            ],
        ];

        foreach ($products as $product) {
            // Check if we have specific translations
            if (isset($productTranslations[$product->name])) {
                $translations = $productTranslations[$product->name];
            } else {
                // Generate generic translations
                $translations = [
                    'name' => $this->autoTranslate($product->name, 'product'),
                    'description' => $this->autoTranslate($product->description, 'text'),
                    'details' => $this->autoTranslate($product->details, 'text'),
                ];
            }

            foreach ($translations as $field => $value) {
                if (!empty($value) && !empty($product->$field)) {
                    $product->setTranslation($field, 'ar', $value);
                    $count++;
                }
            }
        }

        $this->command->info("   ✓ {$products->count()} products translated ({$count} fields)");
    }

    private function addCourseTranslations()
    {
        $this->command->info('🎓 Courses...');

        $courses = Course::all();
        $count = 0;

        $courseTranslations = [
            'PADI Swimming School' => [
                'name' => 'مدرسة السباحة PADI',
                'description' => 'أتقن الأساسيات أو حسّن تقنيتك مع برنامج السباحة الشامل لدينا',
                'details' => 'دورة سباحة احترافية معتمدة من PADI لجميع المستويات',
            ],
            'Scuba Diving' => [
                'name' => 'الغوص بالمعدات',
                'description' => 'ابدأ مغامراتك تحت الماء أو طور خبرتك في الغوص',
                'details' => 'تدريب شامل على الغوص بالمعدات مع مدربين معتمدين',
            ],
        ];

        foreach ($courses as $course) {
            if (isset($courseTranslations[$course->name])) {
                $translations = $courseTranslations[$course->name];
            } else {
                $translations = [
                    'name' => $this->autoTranslate($course->name, 'course'),
                    'description' => $this->autoTranslate($course->description, 'text'),
                    'details' => $this->autoTranslate($course->details, 'text'),
                ];
            }

            foreach ($translations as $field => $value) {
                if (!empty($value) && !empty($course->$field)) {
                    $course->setTranslation($field, 'ar', $value);
                    $count++;
                }
            }
        }

        $this->command->info("   ✓ {$courses->count()} courses translated ({$count} fields)");
    }

    private function addTripTranslations()
    {
        $this->command->info('🏖️  Trips...');

        $trips = Trip::all();
        $count = 0;

        foreach ($trips as $trip) {
            $translations = [
                'name' => $this->autoTranslate($trip->name, 'trip'),
                'description' => $this->autoTranslate($trip->description, 'text'),
                'details' => $this->autoTranslate($trip->details, 'text'),
                'location' => $this->translateLocation($trip->location),
            ];

            foreach ($translations as $field => $value) {
                if (!empty($value) && !empty($trip->$field)) {
                    $trip->setTranslation($field, 'ar', $value);
                    $count++;
                }
            }
        }

        $this->command->info("   ✓ {$trips->count()} trips translated ({$count} fields)");
    }

    private function addBlogPostTranslations()
    {
        $this->command->info('📝 Blog Posts...');

        $posts = BlogPost::all();
        $count = 0;

        foreach ($posts as $post) {
            $translations = [
                'title' => $this->autoTranslate($post->title, 'blog'),
                'excerpt' => $this->autoTranslate($post->excerpt, 'text'),
                'content' => $this->autoTranslate($post->content, 'text'),
            ];

            foreach ($translations as $field => $value) {
                if (!empty($value) && !empty($post->$field)) {
                    $post->setTranslation($field, 'ar', $value);
                    $count++;
                }
            }
        }

        $this->command->info("   ✓ {$posts->count()} blog posts translated ({$count} fields)");
    }

    private function addEventTranslations()
    {
        $this->command->info('📅 Events...');

        $events = Event::all();
        $count = 0;

        foreach ($events as $event) {
            $translations = [
                'title' => $this->autoTranslate($event->title, 'event'),
                'description' => $this->autoTranslate($event->description, 'text'),
                'location' => $this->translateLocation($event->location),
            ];

            foreach ($translations as $field => $value) {
                if (!empty($value) && !empty($event->$field)) {
                    $event->setTranslation($field, 'ar', $value);
                    $count++;
                }
            }
        }

        $this->command->info("   ✓ {$events->count()} events translated ({$count} fields)");
    }

    private function addTeamMemberTranslations()
    {
        $this->command->info('👥 Team Members...');

        $members = TeamMember::all();
        $count = 0;

        $roleTranslations = [
            'Instructor' => 'مدرب',
            'Dive Master' => 'قائد غوص',
            'Course Director' => 'مدير الدورات',
            'Assistant Instructor' => 'مساعد مدرب',
            'Manager' => 'مدير',
            'Owner' => 'مالك',
        ];

        foreach ($members as $member) {
            $translations = [
                'name' => $member->name, // Keep names as-is
                'role' => $roleTranslations[$member->role] ?? $member->role,
                'bio' => $this->autoTranslate($member->bio, 'text'),
                'experience' => $this->autoTranslate($member->experience, 'text'),
            ];

            foreach ($translations as $field => $value) {
                if (!empty($value) && !empty($member->$field)) {
                    $member->setTranslation($field, 'ar', $value);
                    $count++;
                }
            }
        }

        $this->command->info("   ✓ {$members->count()} team members translated ({$count} fields)");
    }

    private function addBannerTranslations()
    {
        $this->command->info('🎨 Banners...');

        $banners = Banner::all();
        $count = 0;

        foreach ($banners as $banner) {
            $translations = [
                'title' => $this->autoTranslate($banner->title, 'banner'),
                'description' => $this->autoTranslate($banner->description, 'text'),
                'button_text' => $this->translateButton($banner->button_text),
            ];

            foreach ($translations as $field => $value) {
                if (!empty($value) && !empty($banner->$field)) {
                    $banner->setTranslation($field, 'ar', $value);
                    $count++;
                }
            }
        }

        $this->command->info("   ✓ {$banners->count()} banners translated ({$count} fields)");
    }

    private function addCategoryTranslations()
    {
        $this->command->info('🏷️  Categories...');

        $categories = Category::all();
        $count = 0;

        foreach ($categories as $category) {
            $translations = [
                'name' => $this->autoTranslate($category->name, 'category'),
                'description' => $this->autoTranslate($category->description, 'text'),
            ];

            foreach ($translations as $field => $value) {
                if (!empty($value) && !empty($category->$field)) {
                    $category->setTranslation($field, 'ar', $value);
                    $count++;
                }
            }
        }

        $this->command->info("   ✓ {$categories->count()} categories translated ({$count} fields)");
    }

    /**
     * Auto-translate text to Arabic
     * Note: These are placeholder translations. You should edit them in the Admin CMS
     */
    private function autoTranslate($text, $type)
    {
        if (empty($text)) {
            return null;
        }

        // Add prefix to indicate these need proper translation
        $prefixes = [
            'product' => '🔹 ',
            'course' => '📚 ',
            'trip' => '✈️ ',
            'blog' => '📄 ',
            'event' => '🎯 ',
            'category' => '📁 ',
            'banner' => '🎨 ',
            'text' => '',
        ];

        $prefix = $prefixes[$type] ?? '';

        // For now, return a placeholder that admins can edit
        // In production, you would integrate with Google Translate API
        return $prefix . '[ترجمة مطلوبة] ' . $text;
    }

    private function translateLocation($location)
    {
        if (empty($location)) {
            return null;
        }

        $locationMap = [
            'Red Sea' => 'البحر الأحمر',
            'Jeddah' => 'جدة',
            'Yanbu' => 'ينبع',
            'Umluj' => 'أملج',
            'NEOM' => 'نيوم',
            'Dammam' => 'الدمام',
            'Riyadh' => 'الرياض',
            'Maldives' => 'جزر المالديف',
            'Egypt' => 'مصر',
        ];

        return $locationMap[$location] ?? '📍 ' . $location;
    }

    private function translateButton($text)
    {
        if (empty($text)) {
            return null;
        }

        $buttonMap = [
            'Learn More' => 'اعرف المزيد',
            'Book Now' => 'احجز الآن',
            'Contact Us' => 'اتصل بنا',
            'Get Started' => 'ابدأ الآن',
            'Enroll' => 'سجل الآن',
            'View Details' => 'عرض التفاصيل',
            'Shop Now' => 'تسوق الآن',
        ];

        return $buttonMap[$text] ?? '🔘 ' . $text;
    }
}
