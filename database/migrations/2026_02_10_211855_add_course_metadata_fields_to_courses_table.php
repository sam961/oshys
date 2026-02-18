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
        Schema::table('courses', function (Blueprint $table) {
            $table->unsignedInteger('modules_count')->nullable()->after('max_students');
            $table->unsignedInteger('students_count')->default(0)->after('modules_count');
            $table->boolean('has_certificate')->default(false)->after('students_count');
            $table->boolean('has_lifetime_access')->default(false)->after('has_certificate');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            $table->dropColumn(['modules_count', 'students_count', 'has_certificate', 'has_lifetime_access']);
        });
    }
};
