<?php

namespace Database\Seeders;

use App\Models\Exam;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class ExamSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('role', 'admin')->first();

        if (!$admin) {
            // Kalau belum ada admin, skip supaya nggak error
            return;
        }

        $now = Carbon::now();

        Exam::updateOrCreate(

            ['title' => 'Simulasi Ujian Masuk 1'],
            [
                'created_by'       => $admin->id,
                'description'      => 'Ujian simulasi untuk calon mahasiswa.',
                'token'            => 'SIMULASI-001',
                'start_at'         => $now->copy()->addDay(),
                'end_at'           => $now->copy()->addDays(2),
                'duration_minutes' => 90,
                'status' => 'upcoming'
            ]
        );

        Exam::updateOrCreate(
            ['title' => 'Try Out Nasional'],
            [
                'created_by'       => $admin->id,
                'description'      => 'Try out nasional semua jurusan.',
                'token'            => 'TRYOUT-2025',
                'start_at'         => $now->copy()->addDays(3),
                'end_at'           => $now->copy()->addDays(4),
                'duration_minutes' => 120,
                'status' => 'upcoming'
            ]
        );
    }
}
