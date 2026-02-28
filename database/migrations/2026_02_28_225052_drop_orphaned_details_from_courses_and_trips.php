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
            $table->dropColumn('details');
        });

        Schema::table('trips', function (Blueprint $table) {
            $table->dropColumn('details');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            $table->text('details')->nullable()->after('description');
        });

        Schema::table('trips', function (Blueprint $table) {
            $table->text('details')->nullable()->after('description');
        });
    }
};
