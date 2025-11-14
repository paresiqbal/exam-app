<?php

namespace Database\Seeders;

use App\Models\Exam;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class ExamSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('role', 'admin')->first();

        if (! $admin) {
            echo "No admin found, skipping ExamSeeder.\n";
            return;
        }

        $now = Carbon::now();

        // Exam yang sedang berjalan
        Exam::updateOrCreate(
            ['token' => 'RUN-001'],
            [
                'created_by'       => $admin->id,
                'title'            => 'Ujian Masuk Online – Gelombang 1',
                'description'      => 'Ujian resmi gelombang pertama.',
                'token'            => 'RUN-001',
                'start_at'         => $now->copy()->subHour(),
                'end_at'           => $now->copy()->addHours(2),
                'duration_minutes' => 90,
                'status'           => 'running',
            ]
        );

        // Exam yang akan datang
        Exam::updateOrCreate(
            ['token' => 'UP-001'],
            [
                'created_by'       => $admin->id,
                'title'            => 'Simulasi Ujian Nasional',
                'description'      => 'Simulasi ujian nasional seluruh jurusan.',
                'token'            => 'UP-001',
                'start_at'         => $now->copy()->addDay(),
                'end_at'           => $now->copy()->addDays(2),
                'duration_minutes' => 120,
                'status'           => 'upcoming',
            ]
        );
    }
}
