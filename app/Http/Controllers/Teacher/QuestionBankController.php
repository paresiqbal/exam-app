<?php

// app/Http/Controllers/Teacher/QuestionBankController.php
namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreQuestionBankRequest;
use App\Models\QuestionBank;
use Illuminate\Support\Facades\Auth;
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

    public function store(StoreQuestionBankRequest $request)
    {
        $bank = QuestionBank::create([
            'owner_id'    => $request->user()->id,
            'title'       => $request->title,
            'description' => $request->description,
        ]);
        return response()->json($bank, 201);
    }
}
