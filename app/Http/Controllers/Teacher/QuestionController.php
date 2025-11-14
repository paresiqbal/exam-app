<?php

// app/Http/Controllers/Teacher/QuestionController.php
namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMcqQuestionRequest;
use App\Http\Requests\StoreBooleanQuestionRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Question;
use App\Models\QuestionBank;
use App\Models\QuestionChoice;
use Inertia\Inertia;

class QuestionController extends Controller
{
    public function storeMcq(StoreMcqQuestionRequest $request)
    {
        return DB::transaction(function () use ($request) {
            $q = Question::create([
                'question_bank_id' => $request->question_bank_id,
                'author_id'        => $request->user()->id,
                'type'             => 'mcq',
                'prompt'           => $request->prompt,
                'image_path'       => $request->file('image')?->store('question-images', 'public'),
                'max_score'        => $request->max_score,
            ]);

            $labels = ['A', 'B', 'C', 'D', 'E', 'F'];
            foreach (array_values($request->choices) as $i => $c) {
                QuestionChoice::create([
                    'question_id' => $q->id,
                    'label'       => $labels[$i],
                    'text'        => $c['text'],
                    'is_correct'  => (bool)($c['is_correct'] ?? false),
                    'position'    => $i + 1,
                ]);
            }

            return redirect()->back()->with('success', 'Question added.');
        });
    }

    public function storeBoolean(StoreBooleanQuestionRequest $request)
    {
        $q = Question::create([
            'question_bank_id' => $request->question_bank_id,
            'author_id'        => $request->user()->id,
            'type'             => 'boolean',
            'prompt'           => $request->prompt,
            'image_path'       => $request->file('image')?->store('question-images', 'public'),
            'max_score'        => $request->max_score,
            'correct_boolean'  => $request->boolean('correct_boolean'),
        ]);

        return redirect()->back()->with('success', 'Question added.');
    }

    public function edit(QuestionBank $bank, Question $question)
    {
        if ($question->question_bank_id !== $bank->id) {
            abort(404);
        }

        if ($question->author_id !== Auth::id()) {
            abort(403, 'Unauthorized');
        }

        $question->load('choices');

        return Inertia::render('teacher/questions/QuestionEdit', [
            'bank' => [
                'id' => $bank->id,
                'title' => $bank->title,
            ],
            'question' => [
                'id' => $question->id,
                'type' => $question->type,
                'prompt' => $question->prompt,
                'max_score' => $question->max_score,
                'correct_boolean' => $question->correct_boolean,
                'choices' => $question->choices->map(function (QuestionChoice $choice) {
                    return [
                        'id' => $choice->id,
                        'label' => $choice->label,
                        'text' => $choice->text,
                        'is_correct' => (bool) $choice->is_correct,
                    ];
                })->values(),
            ],
        ]);
    }

    public function update(Request $request, Question $question)
    {
        if ($question->author_id !== Auth::id()) {
            abort(403, 'Unauthorized');
        }

        if ($question->type === 'mcq') {
            $validated = $request->validate([
                'prompt' => ['required', 'string'],
                'max_score' => ['required', 'integer', 'min:1', 'max:45'],
                'choices' => ['required', 'array', 'min:2', 'max:6'],
                'choices.*.text' => ['required', 'string'],
                'choices.*.is_correct' => ['boolean'],
            ]);

            $choices = collect($validated['choices']);
            if ($choices->where('is_correct', true)->count() < 1) {
                return back()
                    ->withErrors(['choices' => 'At least one choice must be marked correct.'])
                    ->withInput();
            }

            DB::transaction(function () use ($question, $validated, $choices) {
                $question->update([
                    'prompt' => $validated['prompt'],
                    'max_score' => $validated['max_score'],
                ]);

                $question->choices()->delete();

                $labels = ['A', 'B', 'C', 'D', 'E', 'F'];

                foreach ($choices->values() as $index => $choice) {
                    QuestionChoice::create([
                        'question_id' => $question->id,
                        'label' => $labels[$index],
                        'text' => $choice['text'],
                        'is_correct' => (bool) ($choice['is_correct'] ?? false),
                        'position' => $index + 1,
                    ]);
                }
            });
        } elseif ($question->type === 'boolean') {
            $validated = $request->validate([
                'prompt' => ['required', 'string'],
                'max_score' => ['required', 'integer', 'min:1', 'max:45'],
                'correct_boolean' => ['required', 'boolean'],
            ]);

            $question->update([
                'prompt' => $validated['prompt'],
                'max_score' => $validated['max_score'],
                'correct_boolean' => $validated['correct_boolean'],
            ]);
        }

        return redirect("/teacher/question-banks/{$question->question_bank_id}")
            ->with('success', 'Question updated.');
    }



    public function destroy(Question $question)
    {
        if ($question->author_id !== Auth::id()) {
            abort(403, 'Unauthorized');
        }

        if ($question->exams()->exists()) {
            return back()->with('error', 'Cannot delete question that is already assigned to an exam.');
        }

        $question->choices()->delete();
        $question->delete();

        return back()->with('success', 'Question deleted.');
    }
}
