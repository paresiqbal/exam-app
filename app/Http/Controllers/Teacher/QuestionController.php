<?php

// app/Http/Controllers/Teacher/QuestionController.php
namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMcqQuestionRequest;
use App\Http\Requests\StoreBooleanQuestionRequest;
use Illuminate\Support\Facades\Auth;
use App\Models\Question;
use App\Models\QuestionChoice;
use Illuminate\Support\Facades\DB;

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

    public function destroy(Question $question)
    {
        // make sure only the author (teacher) can delete
        if ($question->author_id !== Auth::id()) { // or auth()->id()
            abort(403, 'Unauthorized');
        }

        // optional: block delete if already used in an exam
        if ($question->exams()->exists()) {
            return back()->with('error', 'Cannot delete question that is already assigned to an exam.');
        }

        $question->choices()->delete();
        $question->delete();

        return back()->with('success', 'Question deleted.');
    }
}
