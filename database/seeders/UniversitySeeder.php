<?php

namespace Database\Seeders;

use App\Models\University;
use App\Models\Major;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class UniversitySeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            [
                'name' => 'Universitas A',
                'location' => 'Jakarta',
                'description' => 'Kampus contoh A',
                'majors' => [
                    ['name' => 'Informatika', 'min_score' => 80],
                    ['name' => 'Sistem Informasi', 'min_score' => 75],
                ],
            ],
            [
                'name' => 'Universitas B',
                'location' => 'Bandung',
                'description' => 'Kampus contoh B',
                'majors' => [
                    ['name' => 'Teknik Elektro', 'min_score' => 78],
                    ['name' => 'Teknik Industri', 'min_score' => 72],
                ],
            ],
        ];

        foreach ($data as $uniData) {
            $university = University::create([
                'name' => $uniData['name'],
                'slug' => Str::slug($uniData['name']),
                'location' => $uniData['location'],
                'description' => $uniData['description'],
            ]);

            foreach ($uniData['majors'] as $majorData) {
                Major::create([
                    'university_id' => $university->id,
                    'name' => $majorData['name'],
                    'slug' => Str::slug($university->slug . '-' . $majorData['name']),
                    'min_score' => $majorData['min_score'],
                    'description' => null,
                ]);
            }
        }
    }
}
