<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Agregar relación con páginas institucionales.
     */
    public function up(): void
    {
        Schema::table('news_media', function (Blueprint $table) {
            /*
            |--------------------------------------------------------------------------
            | news_id pasa a ser opcional
            |--------------------------------------------------------------------------
            |
            | Un registro de news_media puede pertenecer a:
            |
            | - una noticia
            | - una página institucional
            |
            */

            $table->dropForeign(['news_id']);

            $table->foreignId('news_id')
                ->nullable()
                ->change();

            /*
            |--------------------------------------------------------------------------
            | Página institucional
            |--------------------------------------------------------------------------
            */

            $table->foreignId('page_id')
                ->nullable()
                ->after('news_id')
                ->constrained('institutional_pages')
                ->cascadeOnDelete();
        });
    }

    /**
     * Revertir cambios.
     */
    public function down(): void
    {
        Schema::table('news_media', function (Blueprint $table) {
            $table->dropForeign(['page_id']);

            $table->dropColumn('page_id');

            $table->dropForeign(['news_id']);

            $table->foreignId('news_id')
                ->nullable(false)
                ->change();

            $table->foreign('news_id')
                ->references('id')
                ->on('news')
                ->cascadeOnDelete();
        });
    }
};