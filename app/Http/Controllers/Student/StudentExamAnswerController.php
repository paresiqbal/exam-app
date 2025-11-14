<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\ExamAttempt;
use App\Models\ExamAnswer;
use App\Models\Question;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StudentExamAnswerController extends Controller
{
    /**
     * Tampilkan soal ke-{number} untuk attempt ini
     */
    public function show(Request $request, ExamAttempt $attempt, int $number)
    {
        // pastikan attempt ini milik user yang login
        if ($attempt->user_id !== $request->user()->id) {
            abort(403);
        }

        // load exam + questions + choices
        $exam = $attempt->exam()->with(['questions.choices'])->firstOrFail();

        // ambil semua soal exam, urut berdasarkan position
        $questions = $exam->questions()
            ->with('choices')
            ->orderBy('exam_question.position')
            ->get();

        if ($questions->isEmpty()) {
            abort(404, 'Tidak ada soal pada ujian ini.');
        }

        if ($number < 1 || $number > $questions->count()) {
            abort(404);
        }

        $question = $questions[$number - 1];

        // cari jawaban yang sudah pernah disimpan (kalau ada)
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
                    ->get([
                        'id',
                        'label',
                        'text as option_text',
                    ])
                    : [],
            ],
            'number'          => $number,
            'total_questions' => $questions->count(),
            'answer'          => $existingAnswer?->answer ?? null,
        ]);
    }

    /**
     * Simpan jawaban untuk satu soal
     */
    public function save(Request $request, ExamAttempt $attempt)
    {
        if ($attempt->user_id !== $request->user()->id) {
            abort(403);
        }

        $data = $request->validate([
            'question_id' => ['required', 'exists:questions,id'],
            'answer'      => ['nullable', 'array'],
            'boolean'     => ['nullable', 'boolean'],
        ]);

        $question = Question::with('choices')->findOrFail($data['question_id']);

        $isCorrect = null;
        $score     = 0;

        if ($question->type === 'mcq') {
            $submitted = $data['answer'] ?? [];

            // id choices yang benar
            $correctChoices = $question->choices()
                ->where('is_correct', true)
                ->pluck('id')
                ->toArray();

            // sort agar perbandingan tidak tergantung urutan klik
            sort($submitted);
            sort($correctChoices);

            $isCorrect = ($submitted === $correctChoices);
            $score     = $isCorrect ? $question->max_score : 0;

            $storedAnswer = $submitted;
        } elseif ($question->type === 'boolean') {
            $submitted = $data['boolean'];

            $isCorrect = ($submitted === $question->correct_boolean);
            $score     = $isCorrect ? $question->max_score : 0;

            $storedAnswer = $submitted;
        } else {
            $storedAnswer = null;
        }

        ExamAnswer::updateOrCreate(
            [
                'exam_attempt_id' => $attempt->id,
                'question_id'     => $question->id,
            ],
            [
                'answer'     => $storedAnswer,
                'is_correct' => $isCorrect,
                'score'      => $score,
            ]
        );

        return back()->with('success', 'Jawaban tersimpan.');
    }

    /**
     * Selesaikan ujian
     */
    public function finish(Request $request, ExamAttempt $attempt)
    {
        if ($attempt->user_id !== $request->user()->id) {
            abort(403);
        }

        // hitung total skor dari semua jawaban
        $totalScore = $attempt->answers()->sum('score');

        $attempt->update([
            'finished_at' => now(),
            'score'       => $totalScore,
            'passed'      => $totalScore >= 50, // aturan lulus bisa kamu sesuaikan
        ]);

        return redirect()
            ->route('student.dashboard')
            ->with('success', 'Ujian selesai. Skor kamu: ' . $totalScore);
    }
}
