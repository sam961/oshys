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
        Schema::table('trips', function (Blueprint $table) {
            $table->dropColumn(['location', 'duration', 'max_participants', 'number_of_dives', 'certification_required']);
        });
    }

    public function down(): void
    {
        Schema::table('trips', function (Blueprint $table) {
            $table->string('location')->nullable();
            $table->string('duration')->nullable();
            $table->integer('max_participants')->nullable();
            $table->integer('number_of_dives')->nullable();
            $table->boolean('certification_required')->default(false);
        });
    }
};
