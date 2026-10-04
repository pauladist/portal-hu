<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Conecta el botón "CALENDARIO DE NOTICIAS" con el historial público.
     * Solo toca el botón si todavía no tiene destino configurado.
     */
    public function up(): void
    {
        DB::table('menu_items')
            ->where('title', 'CALENDARIO DE NOTICIAS')
            ->whereNull('url')
            ->whereNull('file_path')
            ->whereNull('page_id')
            ->update([
                'destination_type' => 'url',
                'url' => '/noticias',
            ]);
    }

    public function down(): void
    {
        DB::table('menu_items')
            ->where('title', 'CALENDARIO DE NOTICIAS')
            ->where('url', '/noticias')
            ->update([
                'destination_type' => null,
                'url' => null,
            ]);
    }
};