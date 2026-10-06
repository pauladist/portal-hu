<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            'Académicas',
            'Buenas prácticas',
            'Cumpleaños',
            'Fundación Hospital Universitario',
            'Material educativo',
            'Menú Buffet',
            'Noticias anteriores',
            'Noticias del día',
            'Principal',
            'Reconocimientos',
        ];

        foreach ($categories as $title) {
            Category::firstOrCreate(
                ['slug' => Str::slug($title)],
                ['title' => $title]
            );
        }
    }
}