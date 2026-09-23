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
        Schema::table('news_media', function (Blueprint $table) {
            $table->boolean('is_featured')
                ->default(false)
                ->after('title');
        });
    }

    public function down(): void
    {
        Schema::table('news_media', function (Blueprint $table) {
            $table->dropColumn('is_featured');
        });
    }
};
