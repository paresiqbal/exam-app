<?php

namespace App\Http\Controllers;

use App\Models\ExamAttempt;
use App\Models\ExamAnswer;
use App\Models\Question;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StudentExamAnswerController extends Controller
{
    /**
     * Show question number X for the exam attempt
     */
    public function show(Request $request, ExamAttempt $attempt, int $number)
    {
        // Authorization
        if ($attempt->user_id !== $request->user()->id) {
            abort(403);
        }

        // Load exam & questions
        $exam = $attempt->exam()->with(['questions.choices'])->first();

        $questions = $exam->questions()->orderBy('exam_question.position')->get();

        if ($number < 1 || $number > $questions->count()) {
            abort(404);
        }

        $question = $questions[$number - 1];

        // Get existing answer
        $existingAnswer = ExamAnswer::where('exam_attempt_id', $attempt->id)
            ->where('question_id', $question->id)
            ->first();

        return Inertia::render('student/exams/QuestionPage', [
            'attempt'  => $attempt,
            'question' => [
                'id'      => $question->id,
                'type'    => $question->type,
                'prompt'  => $question->prompt,
                'image'   => $question->image_path,
                'choices' => $question->choices()->orderBy('position')->get(),
                'max_score' => $question->max_score,
            ],
            'number'         => $number,
            'total_questions' => $questions->count(),
            'answer'         => $existingAnswer ? $existingAnswer->answer : null,
        ]);
    }

    /**
     * Save answer for a question
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

        // Determine correctness
        $isCorrect = null;
        $score = 0;

        if ($question->type === 'mcq') {
            $submitted = $data['answer'] ?? [];

            $correctChoices = $question->choices()->where('is_correct', true)->pluck('id')->toArray();

            $isCorrect = ($submitted === $correctChoices);

            $score = $isCorrect ? $question->max_score : 0;
        }

        if ($question->type === 'boolean') {
            $submitted = $data['boolean'] ?? null;

            $isCorrect = ($submitted === $question->correct_boolean);

            $score = $isCorrect ? $question->max_score : 0;
        }

        ExamAnswer::updateOrCreate(
            [
                'exam_attempt_id' => $attempt->id,
                'question_id'     => $question->id,
            ],
            [
                'answer'     => $question->type === 'mcq' ? $data['answer'] : $data['boolean'],
                'is_correct' => $isCorrect,
                'score'      => $score,
            ]
        );

        return back()->with('success', 'Answer saved');
    }

    /**
     * Finish exam
     */
    public function finish(Request $request, ExamAttempt $attempt)
    {
        if ($attempt->user_id !== $request->user()->id) {
            abort(403);
        }

        // calculate total score
        $totalScore = $attempt->answers()->sum('score');

        $attempt->update([
            'finished_at' => now(),
            'score'       => $totalScore,
            'passed'      => $totalScore >= 50, // <-- change your pass rule here
        ]);

        return redirect()->route('student.dashboard')
            ->with('success', 'Ujian selesai');
    }
}
