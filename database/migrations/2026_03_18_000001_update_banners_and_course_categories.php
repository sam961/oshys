<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Update hero banners with new content and course categories.
     */
    public function up(): void
    {
        // Update hero banner slides
        DB::table('banners')->where('title', 'Adventure')->update([
            'title' => 'Have you ever wondered what it feels like to breathe underwater?',
            'description' => '"Most people have never experienced their first breath underwater." At CAS, we guide you through that moment safely and confidently.',
            'button_text' => 'Start Your Diving Journey with CAS',
            'button_link' => '/shop/courses?category=Start+Diving',
            'display_order' => 1,
        ]);

        DB::table('banners')->where('title', 'Discovery')->update([
            'title' => 'The Ocean Changes the Way You Think',
            'description' => 'CAS programs focus on calmness, awareness, and disciplined diving.',
            'button_text' => null,
            'button_link' => null,
            'display_order' => 2,
        ]);

        DB::table('banners')->where('title', 'Fun')->update([
            'title' => 'Diving Is Learned — Not Just Experienced',
            'description' => 'Structured training pathways from beginner to advanced divers.',
            'button_text' => null,
            'button_link' => null,
            'display_order' => 3,
        ]);

        // Update course categories
        DB::table('courses')->where('category', 'Swimming')->update(['category' => 'Swim Programs']);
        DB::table('courses')->where('category', 'Long-Term')->update(['category' => 'Leadership']);
        DB::table('courses')->where('category', 'Family')->update(['category' => 'Family and Youth']);

        // Split Diving into Start Diving (Open Water) and Develop Your Diving (everything else)
        DB::table('courses')
            ->where('category', 'Diving')
            ->where('slug', 'open-water-diver-course')
            ->update(['category' => 'Start Diving']);

        DB::table('courses')
            ->where('category', 'Diving')
            ->update(['category' => 'Develop Your Diving']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Restore original banner titles
        DB::table('banners')->where('title', 'Have you ever wondered what it feels like to breathe underwater?')->update([
            'title' => 'Adventure',
            'description' => null,
            'button_text' => null,
            'button_link' => null,
            'display_order' => 1,
        ]);

        DB::table('banners')->where('title', 'The Ocean Changes the Way You Think')->update([
            'title' => 'Discovery',
            'description' => null,
            'display_order' => 3,
        ]);

        DB::table('banners')->where('title', 'Diving Is Learned — Not Just Experienced')->update([
            'title' => 'Fun',
            'description' => null,
            'display_order' => 2,
        ]);

        // Restore course categories
        DB::table('courses')->where('category', 'Swim Programs')->update(['category' => 'Swimming']);
        DB::table('courses')->where('category', 'Leadership')->update(['category' => 'Long-Term']);
        DB::table('courses')->where('category', 'Family and Youth')->update(['category' => 'Family']);
        DB::table('courses')->where('category', 'Start Diving')->update(['category' => 'Diving']);
        DB::table('courses')->where('category', 'Develop Your Diving')->update(['category' => 'Diving']);
    }
};
