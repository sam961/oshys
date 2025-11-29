<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Category;
use App\Models\Course;
use App\Models\Trip;
use App\Models\Product;
use App\Models\BlogPost;
use App\Models\Event;
use App\Models\TeamMember;
use App\Models\Setting;
use App\Models\Banner;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create admin user (without factory for production compatibility)
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@coralsandshells.sa',
            'email_verified_at' => now(),
            'password' => bcrypt('password'),
        ]);

        // Create Categories
        $courseCategory = Category::create([
            'name' => 'Professional Courses',
            'slug' => 'professional-courses',
            'description' => 'Professional diving and swimming courses',
            'type' => 'course',
            'is_active' => true,
        ]);

        $tripCategory = Category::create([
            'name' => 'Adventure Trips',
            'slug' => 'adventure-trips',
            'description' => 'Exciting diving adventures',
            'type' => 'trip',
            'is_active' => true,
        ]);

        $productCategories = [
            ['name' => 'BCDs', 'slug' => 'bcds', 'type' => 'product'],
            ['name' => 'Masks & Snorkels', 'slug' => 'masks-snorkels', 'type' => 'product'],
            ['name' => 'Fins', 'slug' => 'fins', 'type' => 'product'],
            ['name' => 'Wetsuits', 'slug' => 'wetsuits', 'type' => 'product'],
            ['name' => 'Electronics', 'slug' => 'electronics', 'type' => 'product'],
            ['name' => 'Gift', 'slug' => 'gift', 'type' => 'product'],
            ['name' => 'Kids Gear', 'slug' => 'kids-gear', 'type' => 'product'],
        ];

        foreach ($productCategories as $cat) {
            Category::create([
                'name' => $cat['name'],
                'slug' => $cat['slug'],
                'description' => 'Diving equipment and gear',
                'type' => $cat['type'],
                'is_active' => true,
            ]);
        }

        $blogCategory = Category::create([
            'name' => 'Diving Tips',
            'slug' => 'diving-tips',
            'description' => 'Tips and guides for divers',
            'type' => 'blog',
            'is_active' => true,
        ]);

        // Create Courses
        $courses = [
            [
                'name' => 'PADI Swimming School',
                'slug' => 'padi-swimming-school',
                'description' => 'Master the basics or refine your technique with our comprehensive swimming programs, guided by experienced instructors.',
                'details' => 'This comprehensive swimming program is designed for all skill levels. Our experienced instructors will guide you through water safety, basic strokes, and advanced techniques.',
                'image' => null,
                'price' => 450.00,
                'duration' => '4 weeks',
                'level' => 'Beginner',
                'category_id' => $courseCategory->id,
                'is_active' => true,
                'is_featured' => true,
                'max_students' => 10,
            ],
            [
                'name' => 'Scuba Diving',
                'slug' => 'scuba-diving',
                'description' => 'Start your underwater adventures or advance your scuba diving expertise with our professionally guided training programs.',
                'details' => 'Learn to dive safely with our PADI certified instructors. This course covers diving theory, equipment, safety procedures, and open water dives.',
                'image' => null,
                'price' => 1200.00,
                'duration' => '3-5 days',
                'level' => 'All Levels',
                'category_id' => $courseCategory->id,
                'is_active' => true,
                'is_featured' => true,
                'max_students' => 8,
            ],
            [
                'name' => 'Diving Equipment Training',
                'slug' => 'diving-equipment-training',
                'description' => 'Gear up with confidence. Get expert advice to help you build your essential dive equipment collection.',
                'details' => 'Learn about different types of diving equipment, maintenance, and proper usage. Perfect for new divers.',
                'image' => null,
                'price' => 200.00,
                'duration' => '1 day',
                'level' => 'All Levels',
                'category_id' => $courseCategory->id,
                'is_active' => true,
                'is_featured' => false,
                'max_students' => 15,
            ],
            [
                'name' => 'Free Diving',
                'slug' => 'free-diving',
                'description' => 'Begin your underwater journey or deepen your freediving skills with our expert instruction and training programs.',
                'details' => 'Explore the art of freediving with professional training in breath-holding techniques, equalization, and safety.',
                'image' => null,
                'price' => 800.00,
                'duration' => '2-3 days',
                'level' => 'Intermediate',
                'category_id' => $courseCategory->id,
                'is_active' => true,
                'is_featured' => true,
                'max_students' => 6,
            ],
            [
                'name' => 'Diving Specialties',
                'slug' => 'diving-specialties',
                'description' => 'From shorelines to professional diving. This course teaches everything from navigation to search and rescue and night diving.',
                'details' => 'Advanced specialty courses including deep diving, wreck diving, navigation, and night diving.',
                'image' => null,
                'price' => 950.00,
                'duration' => 'Varies',
                'level' => 'Advanced',
                'category_id' => $courseCategory->id,
                'is_active' => true,
                'is_featured' => false,
                'max_students' => 4,
            ],
        ];

        foreach ($courses as $course) {
            Course::create($course);
        }

        // Create Trips
        $trips = [
            [
                'name' => 'Jubail Diving Experience',
                'slug' => 'jubail-diving-experience',
                'description' => 'Your gateway to magical seas and a magnificent underwater realm.',
                'details' => 'Explore the beautiful waters of Jubail with crystal clear visibility and diverse marine life. Perfect for all skill levels.',
                'image' => null,
                'price' => 350.00,
                'location' => 'Jubail',
                'duration' => 'Full Day',
                'difficulty' => 'Beginner',
                'category_id' => $tripCategory->id,
                'is_active' => true,
                'is_featured' => true,
                'certification_required' => false,
                'max_participants' => 20,
            ],
            [
                'name' => 'Diving From The Shore',
                'slug' => 'diving-from-the-shore',
                'description' => 'Explore a mysterious environment and witness amazing marine creatures.',
                'details' => 'Shore diving experience perfect for beginners. Easy entry and exit points with shallow reefs.',
                'image' => null,
                'price' => 250.00,
                'location' => 'Various Locations',
                'duration' => 'Half Day',
                'difficulty' => 'Beginner',
                'category_id' => $tripCategory->id,
                'is_active' => true,
                'is_featured' => true,
                'certification_required' => false,
                'max_participants' => 15,
            ],
            [
                'name' => 'Half Moon Bay Dive',
                'slug' => 'half-moon-bay-dive',
                'description' => 'An ideal place to train in diving fundamentals and advanced specialties like Peak Performance Buoyancy and Underwater Navigation.',
                'details' => 'Perfect training ground for advanced techniques. Clear waters and interesting underwater topography.',
                'image' => null,
                'price' => 400.00,
                'location' => 'Half Moon Bay',
                'duration' => 'Full Day',
                'difficulty' => 'Intermediate',
                'category_id' => $tripCategory->id,
                'is_active' => true,
                'is_featured' => true,
                'certification_required' => true,
                'max_participants' => 12,
            ],
            [
                'name' => 'Red Sea Adventure',
                'slug' => 'red-sea-adventure',
                'description' => 'Discover the vibrant coral reefs and diverse marine life of the Red Sea.',
                'details' => '3-day expedition to the Red Sea featuring multiple dive sites, comfortable accommodation, and meals.',
                'image' => null,
                'price' => 1500.00,
                'location' => 'Red Sea',
                'duration' => '3 Days',
                'difficulty' => 'All Levels',
                'category_id' => $tripCategory->id,
                'is_active' => true,
                'is_featured' => false,
                'certification_required' => false,
                'max_participants' => 25,
            ],
            [
                'name' => 'Night Diving Experience',
                'slug' => 'night-diving-experience',
                'description' => 'Experience the underwater world in a whole new light with our guided night dives.',
                'details' => 'Witness nocturnal marine life and bioluminescence. All equipment and lights provided.',
                'image' => null,
                'price' => 300.00,
                'location' => 'Various Locations',
                'duration' => 'Evening',
                'difficulty' => 'Intermediate',
                'category_id' => $tripCategory->id,
                'is_active' => true,
                'is_featured' => false,
                'certification_required' => true,
                'max_participants' => 10,
            ],
            [
                'name' => 'Wreck Diving Expedition',
                'slug' => 'wreck-diving-expedition',
                'description' => 'Explore sunken ships and discover history beneath the waves.',
                'details' => 'Advanced wreck diving experience. Explore historical shipwrecks with experienced guides.',
                'image' => null,
                'price' => 500.00,
                'location' => 'Arabian Gulf',
                'duration' => 'Full Day',
                'difficulty' => 'Advanced',
                'category_id' => $tripCategory->id,
                'is_active' => true,
                'is_featured' => false,
                'certification_required' => true,
                'max_participants' => 8,
            ],
        ];

        foreach ($trips as $trip) {
            Trip::create($trip);
        }

        // Create Products
        $products = [
            [
                'name' => 'Gift Card',
                'slug' => 'gift-card',
                'description' => 'Gift the ones you love an adventure of a lifetime!',
                'details' => 'Available in various denominations. Valid for 1 year from purchase date.',
                'image' => null,
                'price' => 500.00,
                'category_id' => Category::where('slug', 'gift')->first()->id,
                'in_stock' => true,
                'is_active' => true,
                'is_featured' => true,
                'stock_quantity' => 100,
                'sku' => 'GIFT-500',
            ],
            [
                'name' => 'Cressi Solid BCD Large',
                'slug' => 'cressi-solid-bcd-large',
                'description' => 'The Cressi Solid is a popular model, especially for dive centers and new divers, known for its durability and simplicity.',
                'details' => 'Durable BCD with integrated weight system. Available in multiple sizes.',
                'image' => null,
                'price' => 450.00,
                'category_id' => Category::where('slug', 'bcds')->first()->id,
                'in_stock' => true,
                'is_active' => true,
                'is_featured' => true,
                'stock_quantity' => 5,
                'sku' => 'BCD-CRS-L',
            ],
            [
                'name' => 'Mares Rover Mask and Snorkel Set',
                'slug' => 'mares-rover-mask-and-snorkel-set',
                'description' => 'Known for its quality, durability, and comfort and recommended for new divers and snorkelers.',
                'details' => 'High-quality silicone mask with tempered glass and dry-top snorkel.',
                'image' => null,
                'price' => 120.00,
                'category_id' => Category::where('slug', 'masks-snorkels')->first()->id,
                'in_stock' => true,
                'is_active' => true,
                'is_featured' => true,
                'stock_quantity' => 15,
                'sku' => 'MSK-MAR-ROV',
            ],
            [
                'name' => 'Shark Children\'s Swim Coat',
                'slug' => 'shark-childrens-swim-coat',
                'description' => 'Keep a child warm, dry, and protected from wind and cold while they are out of the water.',
                'details' => 'Available in sizes 4-12 years. Water-resistant and thermal protection.',
                'image' => null,
                'price' => 65.00,
                'category_id' => Category::where('slug', 'kids-gear')->first()->id,
                'in_stock' => true,
                'is_active' => true,
                'is_featured' => true,
                'stock_quantity' => 20,
                'sku' => 'KIDS-COAT-SHK',
            ],
            [
                'name' => 'Dive Computer Watch',
                'slug' => 'dive-computer-watch',
                'description' => 'Track your depth, time, and safety stops with this advanced dive computer.',
                'details' => 'Multi-function dive computer with air integration capability. Water resistant to 200m.',
                'image' => null,
                'price' => 350.00,
                'category_id' => Category::where('slug', 'electronics')->first()->id,
                'in_stock' => true,
                'is_active' => true,
                'is_featured' => false,
                'stock_quantity' => 8,
                'sku' => 'COMP-WATCH-01',
            ],
            [
                'name' => 'Professional Fins',
                'slug' => 'professional-fins',
                'description' => 'High-performance fins for efficient underwater movement.',
                'details' => 'Adjustable strap fins with rigid blade for maximum propulsion.',
                'image' => null,
                'price' => 180.00,
                'category_id' => Category::where('slug', 'fins')->first()->id,
                'in_stock' => true,
                'is_active' => true,
                'is_featured' => false,
                'stock_quantity' => 12,
                'sku' => 'FINS-PRO-01',
            ],
            [
                'name' => 'Underwater Camera',
                'slug' => 'underwater-camera',
                'description' => 'Capture your underwater adventures in stunning 4K quality.',
                'details' => '4K video, 20MP photos, waterproof to 40m without housing.',
                'image' => null,
                'price' => 600.00,
                'category_id' => Category::where('slug', 'electronics')->first()->id,
                'in_stock' => false,
                'is_active' => true,
                'is_featured' => false,
                'stock_quantity' => 0,
                'sku' => 'CAM-UW-4K',
            ],
            [
                'name' => 'Wetsuit Full Body',
                'slug' => 'wetsuit-full-body',
                'description' => 'Stay warm and comfortable during extended dives.',
                'details' => '3mm neoprene wetsuit. Available in multiple sizes.',
                'image' => null,
                'price' => 280.00,
                'category_id' => Category::where('slug', 'wetsuits')->first()->id,
                'in_stock' => true,
                'is_active' => true,
                'is_featured' => false,
                'stock_quantity' => 10,
                'sku' => 'SUIT-WET-3MM',
            ],
        ];

        foreach ($products as $product) {
            Product::create($product);
        }

        // Create Blog Posts
        $blogPosts = [
            [
                'title' => 'Essential Tips for First-Time Divers',
                'slug' => 'essential-tips-for-first-time-divers',
                'excerpt' => 'Embarking on your first dive? Here are the top tips every beginner should know before taking the plunge.',
                'content' => '<p>Diving is an incredible experience that opens up a whole new world beneath the waves. Here are essential tips for your first dive...</p>',
                'image' => null,
                'category_id' => $blogCategory->id,
                'author_id' => $admin->id,
                'is_published' => true,
                'is_featured' => true,
                'published_at' => now()->subDays(5),
            ],
            [
                'title' => 'Exploring the Red Sea: A Diver\'s Paradise',
                'slug' => 'exploring-the-red-sea-a-divers-paradise',
                'excerpt' => 'Discover why the Red Sea remains one of the world\'s premier diving destinations with its vibrant coral reefs.',
                'content' => '<p>The Red Sea is renowned for its crystal-clear waters and stunning coral formations...</p>',
                'image' => null,
                'category_id' => $blogCategory->id,
                'author_id' => $admin->id,
                'is_published' => true,
                'is_featured' => true,
                'published_at' => now()->subDays(10),
            ],
            [
                'title' => 'Choosing the Right Diving Equipment',
                'slug' => 'choosing-the-right-diving-equipment',
                'excerpt' => 'A comprehensive guide to selecting diving gear that matches your skill level and diving style.',
                'content' => '<p>Selecting the right equipment is crucial for a safe and enjoyable diving experience...</p>',
                'image' => null,
                'category_id' => $blogCategory->id,
                'author_id' => $admin->id,
                'is_published' => true,
                'is_featured' => true,
                'published_at' => now()->subDays(15),
            ],
            [
                'title' => 'The Benefits of Freediving for Mental Health',
                'slug' => 'the-benefits-of-freediving-for-mental-health',
                'excerpt' => 'Learn how freediving can improve your mental well-being through breathwork and mindfulness.',
                'content' => '<p>Freediving is not just a physical sport; it offers profound mental health benefits...</p>',
                'image' => null,
                'category_id' => $blogCategory->id,
                'author_id' => $admin->id,
                'is_published' => true,
                'is_featured' => false,
                'published_at' => now()->subDays(20),
            ],
            [
                'title' => 'Marine Conservation: How Divers Can Help',
                'slug' => 'marine-conservation-how-divers-can-help',
                'excerpt' => 'Practical ways divers can contribute to protecting our oceans and marine ecosystems.',
                'content' => '<p>As divers, we have a unique relationship with the ocean and a responsibility to protect it...</p>',
                'image' => null,
                'category_id' => $blogCategory->id,
                'author_id' => $admin->id,
                'is_published' => true,
                'is_featured' => false,
                'published_at' => now()->subDays(25),
            ],
            [
                'title' => 'Night Diving: A Different World After Dark',
                'slug' => 'night-diving-a-different-world-after-dark',
                'excerpt' => 'Experience the magic of night diving and discover the nocturnal marine life that comes alive.',
                'content' => '<p>Night diving reveals a completely different underwater world with unique marine life...</p>',
                'image' => null,
                'category_id' => $blogCategory->id,
                'author_id' => $admin->id,
                'is_published' => true,
                'is_featured' => false,
                'published_at' => now()->subDays(30),
            ],
        ];

        foreach ($blogPosts as $post) {
            BlogPost::create($post);
        }

        // Create Events
        $events = [
            [
                'title' => 'Dive Theory Workshop',
                'description' => 'Learn the fundamentals of diving theory and safety.',
                'type' => 'workshop',
                'start_date' => now()->addDays(15)->setTime(12, 0),
                'end_date' => now()->addDays(15)->setTime(16, 0),
                'location' => 'Coral & Shells Training Center',
                'is_active' => true,
                'max_participants' => 20,
                'price' => 50.00,
            ],
            [
                'title' => 'Beginner Scuba Course',
                'description' => 'Start your diving journey with our beginner course.',
                'type' => 'course',
                'start_date' => now()->addDays(22)->setTime(9, 0),
                'end_date' => now()->addDays(24)->setTime(17, 0),
                'location' => 'Coral & Shells Training Center',
                'is_active' => true,
                'max_participants' => 10,
                'price' => 1200.00,
            ],
            [
                'title' => 'Red Sea Trip',
                'description' => '3-day diving expedition to the Red Sea.',
                'type' => 'trip',
                'start_date' => now()->addDays(30)->setTime(6, 0),
                'end_date' => now()->addDays(32)->setTime(18, 0),
                'location' => 'Red Sea',
                'is_active' => true,
                'max_participants' => 25,
                'price' => 1500.00,
            ],
            [
                'title' => 'Advanced Navigation Training',
                'description' => 'Master underwater navigation techniques.',
                'type' => 'workshop',
                'start_date' => now()->addDays(35)->setTime(10, 0),
                'end_date' => now()->addDays(35)->setTime(15, 0),
                'location' => 'Half Moon Bay',
                'is_active' => true,
                'max_participants' => 8,
                'price' => 150.00,
            ],
        ];

        foreach ($events as $event) {
            Event::create($event);
        }

        // Create Team Members
        $teamMembers = [
            [
                'name' => 'Abdulrhman Bubshait',
                'role' => 'PADI Swim School Instructor & IPC Staff Instructor',
                'bio' => 'Experienced diving instructor with over 7 years of teaching experience.',
                'image' => null,
                'email' => 'abdulrhman@coralsandshells.sa',
                'phone' => '+966501234567',
                'experience' => '7 Years',
                'certifications' => ['PADI', 'IPC Staff'],
                'is_active' => true,
                'display_order' => 1,
            ],
            [
                'name' => 'Sarah Al-Ahmed',
                'role' => 'Master Scuba Diver Trainer',
                'bio' => 'Passionate about marine conservation and diving education.',
                'image' => null,
                'email' => 'sarah@coralsandshells.sa',
                'phone' => '+966502345678',
                'experience' => '10 Years',
                'certifications' => ['PADI Master', 'Rescue Diver'],
                'is_active' => true,
                'display_order' => 2,
            ],
            [
                'name' => 'Mohammed Al-Qahtani',
                'role' => 'Freediving Instructor',
                'bio' => 'Specialized in freediving techniques and breath-hold training.',
                'image' => null,
                'email' => 'mohammed@coralsandshells.sa',
                'phone' => '+966503456789',
                'experience' => '5 Years',
                'certifications' => ['AIDA', 'SSI Freediving'],
                'is_active' => true,
                'display_order' => 3,
            ],
            [
                'name' => 'Fatima Al-Dosari',
                'role' => 'Dive Safety Officer',
                'bio' => 'Ensures safety standards and emergency procedures are followed.',
                'image' => null,
                'email' => 'fatima@coralsandshells.sa',
                'phone' => '+966504567890',
                'experience' => '8 Years',
                'certifications' => ['DAN', 'EFR Instructor'],
                'is_active' => true,
                'display_order' => 4,
            ],
        ];

        foreach ($teamMembers as $member) {
            TeamMember::create($member);
        }

        // Create Banners
        $banners = [
            [
                'title' => 'ADVENTURE',
                'description' => 'Embark on thrilling underwater expeditions',
                'image' => null,
                'button_text' => 'Explore Trips',
                'button_link' => '/shop/trips',
                'position' => 'hero',
                'display_order' => 1,
                'is_active' => true,
            ],
            [
                'title' => 'DISCOVERY',
                'description' => 'Uncover the mysteries of the deep blue',
                'image' => null,
                'button_text' => 'View Courses',
                'button_link' => '/shop/courses',
                'position' => 'hero',
                'display_order' => 2,
                'is_active' => true,
            ],
            [
                'title' => 'FUN',
                'description' => 'Experience the joy of diving with friends',
                'image' => null,
                'button_text' => 'Join Us',
                'button_link' => '/contact',
                'position' => 'hero',
                'display_order' => 3,
                'is_active' => true,
            ],
        ];

        foreach ($banners as $banner) {
            Banner::create($banner);
        }

        // Create Settings
        $settings = [
            ['key' => 'site_name', 'value' => 'Coral & Shells Diving Center', 'type' => 'string', 'group' => 'general'],
            ['key' => 'site_description', 'value' => 'Professional diving center in Saudi Arabia', 'type' => 'string', 'group' => 'general'],
            ['key' => 'contact_email', 'value' => 'info@coralsandshells.sa', 'type' => 'string', 'group' => 'contact'],
            ['key' => 'contact_phone', 'value' => '+966 50 123 4567', 'type' => 'string', 'group' => 'contact'],
            ['key' => 'whatsapp_number', 'value' => '+966501234567', 'type' => 'string', 'group' => 'contact'],
            ['key' => 'facebook_url', 'value' => 'https://facebook.com/coralsandshells', 'type' => 'string', 'group' => 'social'],
            ['key' => 'instagram_url', 'value' => 'https://instagram.com/coralsandshells', 'type' => 'string', 'group' => 'social'],
        ];

        foreach ($settings as $setting) {
            Setting::create($setting);
        }

        $this->command->info('Database seeded successfully!');
    }
}
