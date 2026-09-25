<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('menu_items', function (Blueprint $table) {
            $table->boolean('is_quick_link')
                ->default(false)
                ->after('is_active');

            $table->unsignedInteger('quick_link_order')
                ->nullable()
                ->after('is_quick_link');
        });
    }

    public function down(): void
    {
        Schema::table('menu_items', function (Blueprint $table) {
            $table->dropColumn([
                'is_quick_link',
                'quick_link_order',
            ]);
        });
    }
};