<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Exam;
use App\Models\Question;
use Illuminate\Http\Request;

class ExamQuestionAttachController extends Controller
{
    public function edit(Exam $exam)
    {
        $available = Question::pickable()->latest()->paginate(20);
        $attached  = $exam->bankQuestions()->get();

        return inertia('Admin/Exams/Edit', [
            'exam'      => $exam,
            'available' => $available,
            'attached'  => $attached,
        ]);
    }

    public function attach(Request $request, Exam $exam)
    {
        $data = $request->validate([
            'question_ids'   => 'required|array',
            'question_ids.*' => 'integer|exists:questions,id',
        ]);

        $currentMax = (int) $exam->bankQuestions()->max('exam_questions.order');
        $order = $currentMax;

        $attachPayload = [];
        foreach ($data['question_ids'] as $qid) {
            $order++;
            $attachPayload[$qid] = ['order' => $order, 'score' => null];
        }

        $exam->bankQuestions()->attach($attachPayload);

        return back()->with('success', 'Questions added to exam.');
    }

    public function detach(Exam $exam, Question $question)
    {
        $exam->bankQuestions()->detach($question->id);
        return back()->with('success', 'Question removed from exam.');
    }

    public function updateOrderScore(Request $request, Exam $exam)
    {
        $data = $request->validate([
            'items'           => 'required|array',
            'items.*.id'      => 'required|integer|exists:questions,id',
            'items.*.order'   => 'required|integer|min:0',
            'items.*.score'   => 'nullable|integer|min:0|max:100',
        ]);

        $syncData = [];
        foreach ($data['items'] as $item) {
            $syncData[$item['id']] = [
                'order' => $item['order'],
                'score' => $item['score'] ?? null,
            ];
        }

        $exam->bankQuestions()->syncWithoutDetaching($syncData);
        return back()->with('success', 'Order/score updated.');
    }
}
