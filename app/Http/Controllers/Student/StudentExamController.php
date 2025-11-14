<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Exam;
use App\Models\ExamAttempt;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StudentExamController extends Controller
{
    /**
     * Siswa mengisi token untuk masuk ujian
     */
    public function join(Request $request)
    {
        $data = $request->validate([
            'token' => ['required', 'string'],
        ]);

        $token = $data['token'];

        /** @var \App\Models\User $user */
        $user = $request->user();

        // Cari exam berdasarkan token
        $exam = Exam::where('token', $token)->first();

        if (! $exam) {
            return back()->withErrors([
                'token' => 'Token ujian tidak valid.',
            ]);
        }

        // Cek waktu ujian
        $now = now();
        if ($exam->start_at->isFuture()) {
            return back()->withErrors([
                'token' => 'Ujian belum dimulai.',
            ]);
        }

        if ($exam->end_at->isPast()) {
            return back()->withErrors([
                'token' => 'Ujian sudah berakhir.',
            ]);
        }

        // Optional: cek status kalau kamu pakai 'upcoming', 'running', 'done'
        if ($exam->status === 'done') {
            return back()->withErrors([
                'token' => 'Ujian ini sudah selesai.',
            ]);
        }

        // Cek apakah siswa sudah punya attempt
        $existingAttempt = ExamAttempt::where('exam_id', $exam->id)
            ->where('user_id', $user->id)
            ->latest()
            ->first();

        if ($existingAttempt && $existingAttempt->finished_at) {
            return back()->withErrors([
                'token' => 'Kamu sudah menyelesaikan ujian ini.',
            ]);
        }

        // Kalau sudah pernah mulai tapi belum selesai → lanjutkan
        if ($existingAttempt && ! $existingAttempt->finished_at) {
            return redirect()->route('student.attempts.show', $existingAttempt);
        }

        // Buat attempt baru
        $attempt = ExamAttempt::create([
            'exam_id'    => $exam->id,
            'user_id'    => $user->id,
            'started_at' => now(),
            'score'      => null,
            'passed'     => false,
        ]);

        return redirect()->route('student.attempts.show', $attempt);
    }

    /**
     * Halaman attempt (nanti di sini isi soal)
     */
    public function show(Request $request, ExamAttempt $attempt): Response
    {
        // pastikan attempt ini milik user yang login
        if ($attempt->user_id !== $request->user()->id) {
            abort(403);
        }

        $attempt->load('exam');

        return Inertia::render('student/exams/ShowAttempt', [
            'attempt' => [
                'id'         => $attempt->id,
                'exam_id'    => $attempt->exam_id,
                'started_at' => optional($attempt->started_at)->toDateTimeString(),
                'finished_at' => optional($attempt->finished_at)->toDateTimeString(),
                'score'      => $attempt->score,
                'passed'     => $attempt->passed,
                'exam'       => [
                    'id'               => $attempt->exam->id,
                    'title'            => $attempt->exam->title,
                    'description'      => $attempt->exam->description,
                    'duration_minutes' => $attempt->exam->duration_minutes,
                ],
            ],
        ]);
    }
}
