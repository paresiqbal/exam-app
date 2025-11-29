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

        $exam = Exam::where('token', $data['token'])->firstOrFail();

        $attempt = ExamAttempt::firstOrCreate(
            [
                'exam_id' => $exam->id,
                'user_id' => $request->user()->id,
            ],
            [
                'started_at' => now(),
            ]
        );

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
