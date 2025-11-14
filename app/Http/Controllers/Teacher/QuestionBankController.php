<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\QuestionBank;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class QuestionBankController extends Controller
{
    public function index()
    {
        $banks = QuestionBank::withCount('questions')
            ->where('created_by', Auth::id())
            ->latest()
            ->paginate(10)
            ->through(fn($bank) => [
                'id' => $bank->id,
                'title' => $bank->title,
                'description' => $bank->description,
                'questions_count' => $bank->questions_count,
                'created_at' => $bank->created_at->toDateTimeString(),
            ]);

        return Inertia::render('teacher/questions/QuestionBankIndex', [
            'banks' => $banks,
        ]);
    }

    public function create()
    {
        return Inertia::render('teacher/questions/CreateQuestionBank');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'       => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
        ]);

        QuestionBank::create([
            'created_by'  => Auth::id(),
            'title'       => $validated['title'],
            'description' => $validated['description'] ?? null,
        ]);

        return redirect()->to('/teacher/question-banks')
            ->with('success', 'Question bank created.');
    }

    public function show(QuestionBank $bank)
    {
        $bank->load(['questions.choices']);

        return Inertia::render('teacher/questions/QuestionBankShow', [
            'bank' => [
                'id' => $bank->id,
                'title' => $bank->title,
                'description' => $bank->description,
                'questions_count' => $bank->questions->count(),
                'created_at' => $bank->created_at->toDateTimeString(),
            ],
            'questions' => $bank->questions->map(function ($q) {
                return [
                    'id' => $q->id,
                    'type' => $q->type,
                    'prompt' => $q->prompt,
                    'max_score' => $q->max_score,
                    'has_image' => (bool) $q->image_path,
                    'correct_boolean' => $q->correct_boolean,
                    'choices' => $q->choices->map(fn($c) => [
                        'id' => $c->id,
                        'label' => $c->label,
                        'text' => $c->text,
                        'is_correct' => (bool) $c->is_correct,
                    ]),
                ];
            }),
        ]);
    }

    public function update(Request $request, QuestionBank $bank)
    {
        $validated = $request->validate([
            'title'       => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
        ]);

        $bank->update($validated);

        return redirect()->back()->with('success', 'Question bank updated.');
    }

    public function destroy(QuestionBank $bank)
    {
        if ($bank->created_by !== Auth::id()) {
            abort(403, 'Unauthorized');
        }

        // Optional safety:
        if ($bank->questions()->whereHas('exams')->exists()) {
            return back()->with('error', 'Cannot delete this bank because some questions are already assigned to exams.');
        }

        DB::transaction(function () use ($bank) {
            foreach ($bank->questions as $question) {
                $question->choices()->delete();
                $question->delete();
            }

            $bank->delete();
        });

        return redirect('/teacher/question-banks')
            ->with('success', 'Question bank and its questions were deleted.');
    }
}
