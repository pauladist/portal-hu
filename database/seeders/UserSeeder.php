<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $adminRole = Role::where('name', 'Administrador')->first();
        $communicationRole = Role::where('name', 'Comunicación')->first();

        User::updateOrCreate(
            [
                'email' => 'admin@portal.com',
            ],
            [
                'name' => 'Administrador',
                'last_name' => 'Portal',
                'password' => Hash::make('password'),
                'role_id' => $adminRole->id,
            ]
        );

        User::updateOrCreate(
            [
                'email' => 'comunicacion@portal.com',
            ],
            [
                'name' => 'Comunicación',
                'last_name' => 'Portal',
                'password' => Hash::make('password'),
                'role_id' => $communicationRole->id,
            ]
        );
    }
}