<?php

// app/Http/Controllers/Teacher/QuestionBankController.php
namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreQuestionBankRequest;
use App\Models\QuestionBank;
use Illuminate\Support\Facades\Auth;

class QuestionBankController extends Controller
{
    public function index()
    {
        $banks = QuestionBank::withCount('questions')
            ->where('owner_id', Auth::id())
            ->latest()->paginate(20);

        return response()->json($banks);
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
