<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Database\Seeders\RoleUserSeeder;
use Database\Seeders\UniversitySeeder;
use Database\Seeders\ExamSeeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'password' => 'password',
                'email_verified_at' => now(),
            ]
        );

        $this->call([
            RoleUserSeeder::class,
        ]);

        $this->call(UniversitySeeder::class);

        $this->call([
            RoleUserSeeder::class,
            UniversitySeeder::class,
            ExamSeeder::class,
        ]);
    }
}
