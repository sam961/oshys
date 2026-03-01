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
        Schema::create('courses', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description');
            $table->string('image')->nullable();
            $table->decimal('price', 10, 2);
            $table->string('duration')->nullable();
            $table->enum('level', ['Beginner', 'Intermediate', 'Advanced', 'All Levels'])->default('Beginner');
            $table->boolean('is_active')->default(true);
            $table->boolean('is_featured')->default(false);
            $table->integer('max_students')->nullable();
            $table->json('requirements')->nullable();
            $table->unsignedInteger('modules_count')->nullable();
            $table->unsignedInteger('students_count')->default(0);
            $table->boolean('has_certificate')->default(false);
            $table->boolean('has_lifetime_access')->default(false);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('courses');
    }
};
