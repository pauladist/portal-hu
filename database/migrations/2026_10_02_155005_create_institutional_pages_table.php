<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Crear tabla de páginas institucionales.
     */
    public function up(): void
    {
        Schema::create('institutional_pages', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->string('title');

            $table->string('slug')
                ->unique();

            $table->string('subtitle')
                ->nullable();

            $table->longText('content')
                ->nullable();

            $table->enum('status', [
                'draft',
                'published',
            ])->default('draft');

            $table->dateTime('published_at')
                ->nullable();

            $table->timestamps();
        });
    }

    /**
     * Eliminar tabla de páginas institucionales.
     */
    public function down(): void
    {
        Schema::dropIfExists('institutional_pages');
    }
};