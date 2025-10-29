<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('translations', function (Blueprint $table) {
            $table->id();
            $table->morphs('translatable'); // Creates translatable_type and translatable_id
            $table->string('locale', 10)->index(); // 'en', 'ar', etc.
            $table->string('field'); // 'name', 'description', 'details', etc.
            $table->longText('value')->nullable(); // The translated content
            $table->timestamps();

            // Composite unique index to prevent duplicate translations
            $table->unique(['translatable_type', 'translatable_id', 'locale', 'field'], 'translations_unique');

            // Index for faster lookups
            $table->index(['translatable_type', 'translatable_id', 'locale']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('translations');
    }
};
