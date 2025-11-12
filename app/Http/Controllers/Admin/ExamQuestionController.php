<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreExamQuestionRequest;
use App\Http\Requests\UpdateExamQuestionRequest;
use App\Models\Exam;
use App\Models\ExamQuestion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ExamQuestionController extends Controller
{
    /** List questions for an exam */
    public function index(Exam $exam)
    {
        $questions = $exam->questions()
            ->with(['options' => fn($q) => $q->orderBy('position')])
            ->latest()
            ->paginate(10);

        return Inertia::render('admin/questions/Index', [
            'exam'      => $exam,
            'questions' => $questions,
        ]);
    }

    /** Show create form */
    public function create(Exam $exam)
    {
        return Inertia::render('admin/questions/Create', [
            'exam' => $exam,
        ]);
    }

    /** Store a new question (with options) */
    public function store(StoreExamQuestionRequest $request, Exam $exam)
    {
        $data = $request->validated();

        // Upload image if any
        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('question-images', 'public');
        }

        $question = $exam->questions()->create([
            'question_text'       => $data['question_text'],
            'image_path'          => $imagePath,
            'type'                => $data['type'],
            'max_score'           => $data['max_score'],
            'min_score'           => $data['min_score'],
            'min_select'          => $data['min_select'] ?? null,
            'max_select'          => $data['max_select'] ?? null,
            'shuffle_options'     => (bool)($data['shuffle_options'] ?? true),
            'correct_answer_bool' => $data['type'] === 'true_false'
                ? (bool)($data['correct_answer_bool'] ?? null)
                : null,
        ]);

        if ($data['type'] === 'multi_select' && !empty($data['options'])) {
            $question->options()->createMany(
                collect($data['options'])->map(fn($opt) => [
                    'label'       => $opt['label'] ?? null,
                    'option_text' => $opt['option_text'] ?? null,
                    'image_path'  => $opt['image_path'] ?? null,
                    'is_correct'  => (bool)($opt['is_correct'] ?? false),
                    'position'    => $opt['position'] ?? 0,
                ])->all()
            );
        }

        return redirect()
            ->route('admin.exams.questions.index', $exam)
            ->with('success', 'Question created.');
    }

    /** Show edit form */
    public function edit(Exam $exam, ExamQuestion $q)
    {
        abort_unless($q->exam_id === $exam->id, 404);
        $q->load(['options' => fn($oq) => $oq->orderBy('position')]);

        return Inertia::render('admin/questions/Edit', [
            'exam'     => $exam,
            'question' => $q,
        ]);
    }

    /** Update question + sync options */
    public function update(UpdateExamQuestionRequest $request, Exam $exam, ExamQuestion $q)
    {
        abort_unless($q->exam_id === $exam->id, 404);
        $data = $request->validated();

        // Replace image if newly uploaded
        if ($request->hasFile('image')) {
            if ($q->image_path) {
                // optional: delete old file
                Storage::disk('public')->delete($q->image_path);
            }
            $q->image_path = $request->file('image')->store('question-images', 'public');
        }

        $q->fill([
            'question_text'       => $data['question_text'],
            'type'                => $data['type'],
            'max_score'           => $data['max_score'],
            'min_score'           => $data['min_score'],
            'min_select'          => $data['min_select'] ?? null,
            'max_select'          => $data['max_select'] ?? null,
            'shuffle_options'     => (bool)($data['shuffle_options'] ?? true),
            'correct_answer_bool' => $data['type'] === 'true_false'
                ? (bool)($data['correct_answer_bool'] ?? null)
                : null,
        ])->save();

        // Sync options for multi_select; clear for true_false
        if ($data['type'] === 'multi_select') {
            $incoming = collect($data['options'] ?? []);
            $incomingIds = $incoming->pluck('id')->filter()->all();

            // delete removed options
            $q->options()->whereNotIn('id', $incomingIds ?: [0])->delete();

            // upsert current
            foreach ($incoming as $opt) {
                $q->options()->updateOrCreate(
                    ['id' => $opt['id'] ?? 0],
                    [
                        'label'       => $opt['label'] ?? null,
                        'option_text' => $opt['option_text'] ?? null,
                        'image_path'  => $opt['image_path'] ?? null,
                        'is_correct'  => (bool)($opt['is_correct'] ?? false),
                        'position'    => $opt['position'] ?? 0,
                    ]
                );
            }
        } else {
            $q->options()->delete();
        }

        return redirect()
            ->route('admin.exams.questions.index', $exam)
            ->with('success', 'Question updated.');
    }

    /** Delete question (block if already answered, if you track answers) */
    public function destroy(Exam $exam, ExamQuestion $q)
    {
        abort_unless($q->exam_id === $exam->id, 404);

        // If you have ExamAnswer model/relationship:
        if (method_exists($q, 'answers') && $q->answers()->exists()) {
            return back()->with('error', 'Cannot delete: question already has answers.');
        }

        $q->delete();

        return back()->with('success', 'Question deleted.');
    }

    /** Reorder options: expects payload [{id, position}] */
    public function reorderOptions(Exam $exam, ExamQuestion $q, Request $request)
    {
        abort_unless($q->exam_id === $exam->id, 404);
        $data = $request->validate([
            'order'             => ['required', 'array'],
            'order.*.id'        => ['required', 'integer'],
            'order.*.position'  => ['required', 'integer', 'min:0'],
        ]);

        foreach ($data['order'] as $row) {
            $q->options()->whereKey($row['id'])->update(['position' => $row['position']]);
        }

        return back()->with('success', 'Options reordered.');
    }
}
