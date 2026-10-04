<?php

namespace Database\Seeders;

use App\Models\Tag;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class TagSeeder extends Seeder
{
    public function run(): void
    {
        $tags = [
            'Campaña',
            'Vacunación',
            'Prevención',
            'Jornada',
            'Congreso',
            'Capacitación',
            'Becas',
            'Residencias',
            'Donación de sangre',
            'Salud mental',
            'Investigación',
            'Aniversario',
            'Atención al paciente',
            'Novedades',
        ];

        foreach ($tags as $title) {
            Tag::firstOrCreate(
                ['slug' => Str::slug($title)],
                ['title' => $title]
            );
        }
    }
}