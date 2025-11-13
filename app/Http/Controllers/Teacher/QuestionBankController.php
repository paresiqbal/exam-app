<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\QuestionBank;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class QuestionBankController extends Controller
{
    public function index()
    {
        $banks = QuestionBank::withCount('questions')
            ->where('owner_id', Auth::id())
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
            'owner_id'    => Auth::id(),
            'title'       => $validated['title'],
            'description' => $validated['description'] ?? null,
        ]);

        return redirect()->to('/teacher/question-banks')
            ->with('success', 'Question bank created.');
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
        $bank->delete();

        return redirect()->back()->with('success', 'Question bank deleted.');
    }
}
