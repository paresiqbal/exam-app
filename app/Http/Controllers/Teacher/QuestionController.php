<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Question;
use Illuminate\Http\Request;

class QuestionController extends Controller
{
    public function index(Request $request)
    {
        $questions = Question::where('teacher_id', $request->user()->id)
            ->latest()->paginate(20);

        return inertia('Teacher/Questions/Index', compact('questions'));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'type'           => 'required|in:single_select,multi_select,boolean,essay',
            'question_text'  => 'required|string',
            'image'          => 'nullable|image|max:2048',
            'options'        => 'nullable|array',
            'options.*.id'   => 'nullable',
            'options.*.label' => 'nullable|string|max:10',
            'options.*.text' => 'nullable|string',
            'options.*.image_path' => 'nullable|string',
            'options.*.is_correct' => 'nullable|boolean',
            'options.*.position'   => 'nullable|integer|min:0',
            'correct_options'      => 'nullable|array',
            'correct_answer_bool'  => 'nullable|boolean',
            'max_score'      => 'required|integer|min:1|max:100',
            'min_score'      => 'nullable|integer|min:0|max:100',
            'min_select'     => 'nullable|integer|min:0',
            'max_select'     => 'nullable|integer|min:0',
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('question-images', 'public');
        }

        Question::create([
            'teacher_id'          => $request->user()->id,
            'type'                => $data['type'],
            'question_text'       => $data['question_text'],
            'image_path'          => $imagePath,
            'options'             => $data['options'] ?? null,
            'correct_options'     => $data['correct_options'] ?? null,
            'correct_answer_bool' => $data['correct_answer_bool'] ?? null,
            'max_score'           => $data['max_score'],
            'min_score'           => $data['min_score'] ?? 0,
            'status'              => 'approved', // or 'pending' if you want review
            'min_select'          => $data['min_select'] ?? null,
            'max_select'          => $data['max_select'] ?? null,
        ]);

        return back()->with('success', 'Question created!');
    }
}
