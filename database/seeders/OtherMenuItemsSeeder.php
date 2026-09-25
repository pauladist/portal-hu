<?php

namespace Database\Seeders;

use App\Models\MenuItem;
use Illuminate\Database\Seeder;

class OtherMenuItemsSeeder extends Seeder
{
    public function run(): void
    {
        $otros = MenuItem::create([
            'parent_id' => null,
            'title' => 'OTROS',
            'destination_type' => null,
            'url' => null,
            'file_path' => null,
            'order' => 13,
            'is_active' => true,
        ]);

        MenuItem::create([
            'parent_id' => $otros->id,
            'title' => 'SID',
            'destination_type' => null,
            'url' => 'https://sid.uncu.edu.ar/wp/',
            'file_path' => null,
            'order' => 1,
            'is_active' => true,
        ]);

        MenuItem::create([
            'parent_id' => $otros->id,
            'title' => 'BIBLIOTECA DIGITAL',
            'destination_type' => null,
            'url' => 'https://bdigital.uncu.edu.ar/',
            'file_path' => null,
            'order' => 2,
            'is_active' => true,
        ]);

        MenuItem::create([
            'parent_id' => $otros->id,
            'title' => 'CALENDARIO DE NOTICIAS',
            'destination_type' => null,
            'url' => null,
            'file_path' => null,
            'order' => 3,
            'is_active' => true,
        ]);
    }
}