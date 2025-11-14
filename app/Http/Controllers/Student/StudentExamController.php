<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Exam;
use App\Models\ExamAnswer;
use App\Models\ExamAttempt;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StudentExamController extends Controller
{

    public function join(Request $request)
    {
        $data = $request->validate([
            'token' => ['required', 'string'],
        ]);

        $token = $data['token'];

        $user = $request->user();

        $exam = Exam::where('token', $token)->first();

        if (! $exam) {
            return back()->withErrors([
                'token' => 'Token ujian tidak valid.',
            ]);
        }

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

        if ($exam->status === 'done') {
            return back()->withErrors([
                'token' => 'Ujian ini sudah selesai.',
            ]);
        }

        $existingAttempt = ExamAttempt::where('exam_id', $exam->id)
            ->where('user_id', $user->id)
            ->latest()
            ->first();

        if ($existingAttempt && $existingAttempt->finished_at) {
            return back()->withErrors([
                'token' => 'Kamu sudah menyelesaikan ujian ini.',
            ]);
        }

        if ($existingAttempt && ! $existingAttempt->finished_at) {
            return redirect()->route('student.attempt.questions.show', [
                'attempt' => $existingAttempt->id,
                'number'  => 1,
            ]);
        }

        $attempt = ExamAttempt::create([
            'exam_id'    => $exam->id,
            'user_id'    => $user->id,
            'started_at' => now(),
            'score'      => null,
            'passed'     => false,
        ]);

        return redirect()->route('student.attempt.questions.show', [
            'attempt' => $attempt->id,
            'number'  => 1,
        ]);
    }

    public function show(Request $request, ExamAttempt $attempt, int $number)
    {
        if ($attempt->user_id !== $request->user()->id) {
            abort(403);
        }

        $exam = $attempt->exam()->with(['questions.choices'])->firstOrFail();

        $questions = $exam->questions()
            ->with('choices')
            ->orderBy('exam_question.position')
            ->get();

        if ($questions->isEmpty()) {
            // Ujian belum punya soal → balikkan ke dashboard dengan pesan
            return redirect()
                ->route('student.dashboard')
                ->with('error', 'Ujian ini belum memiliki soal. Silakan hubungi pengawas.');
        }

        if ($number < 1 || $number > $questions->count()) {
            // nomor soal tidak valid → paksa ke nomor 1
            return redirect()->route('student.attempt.questions.show', [
                'attempt' => $attempt->id,
                'number'  => 1,
            ]);
        }

        $question = $questions[$number - 1];

        $existingAnswer = ExamAnswer::where('exam_attempt_id', $attempt->id)
            ->where('question_id', $question->id)
            ->first();

        return Inertia::render('student/exams/QuestionPage', [
            'attempt' => [
                'id'      => $attempt->id,
                'exam_id' => $attempt->exam_id,
            ],
            'question' => [
                'id'        => $question->id,
                'type'      => $question->type,
                'prompt'    => $question->prompt,
                'image'     => $question->image_path,
                'max_score' => $question->max_score,
                'choices'   => $question->type === 'mcq'
                    ? $question->choices()
                    ->orderBy('position')
                    ->get(['id', 'label', 'option_text'])
                    : [],
            ],
            'number'          => $number,
            'total_questions' => $questions->count(),
            'answer'          => $existingAnswer?->answer ?? null,
        ]);
    }
}
