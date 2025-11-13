<?php

// app/Http/Controllers/Teacher/QuestionBankController.php
namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\QuestionBank;
use Inertia\Inertia;

class QuestionBankController extends Controller
{
    public function index()
    {
        $banks = QuestionBank::withCount('questions')
            ->where('owner_id', auth()->Auth::id())
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
}
