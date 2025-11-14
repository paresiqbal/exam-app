<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Exam;
use App\Models\Question;
use App\Models\QuestionBank;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ExamController extends Controller
{
    public function index(): Response
    {
        $exams = Exam::withCount('attempts')
            ->orderByDesc('start_at')
            ->paginate(10);

        return Inertia::render('admin/exams/IndexExam', [
            'exams' => $exams,
        ]);
    }


    public function create(): Response
    {
        $banks = QuestionBank::all();

        return Inertia::render('admin/exams/CreateExam', [
            'banks' => $banks,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'question_bank_id' => ['required', 'exists:question_banks,id'],
            'title'            => ['required', 'string', 'max:255'],
            'description'      => ['nullable', 'string'],
            'token'            => ['nullable', 'string', 'max:50'],
            'start_at'         => ['required', 'date'],
            'end_at'           => ['required', 'date', 'after_or_equal:start_at'],
            'duration_minutes' => ['required', 'integer', 'min:1'],
        ]);

        $data['created_by'] = $request->user()->id;
        $data['status'] = 'upcoming';

        Exam::create($data);

        return redirect()
            ->route('admin.exams.index')
            ->with('success', 'Exam created.');
    }

    public function show(Exam $exam)
    {
        return inertia('admin/exams/ShowExam', [
            'exam' => $exam,
        ]);
    }

    public function edit(Exam $exam)
    {
        $banks = QuestionBank::select('id', 'title')->get();

        $exam->load([
            'questionBank',
            'questions' => function ($q) {
                // ambil semua kolom questions + pivot
                $q->select('questions.*');
            },
        ]);

        // default: tidak ada soal kalau belum pilih bank
        $availableQuestions = collect();

        if ($exam->question_bank_id) {
            $availableQuestions = Question::where('question_bank_id', $exam->question_bank_id)
                ->orderBy('id')
                ->get(); // <─ tidak menyebut nama kolom spesifik
        }

        return inertia('admin/exams/EditExam', [
            'exam'                => $exam,
            'banks'               => $banks,
            'available_questions' => $availableQuestions,
        ]);
    }


    public function update(Request $request, Exam $exam)
    {
        $validated = $request->validate([
            'question_bank_id' => ['required', 'exists:question_banks,id'],
            'title'            => ['required', 'string', 'max:255'],
            'description'      => ['nullable', 'string'],
            'token'            => ['nullable', 'string', 'max:50'],
            'start_at'         => ['required', 'date'],
            'end_at'           => ['required', 'date', 'after_or_equal:start_at'],
            'duration_minutes' => ['required', 'integer', 'min:1'],

            // questions array from frontend
            'questions'                    => ['nullable', 'array'],
            'questions.*.id'              => [
                'required_with:questions',
                'integer',
                Rule::exists('questions', 'id')
                    ->where(
                        fn($q) =>
                        $q->where('question_bank_id', $request->question_bank_id)
                    ),
            ],
            'questions.*.position'        => ['nullable', 'integer', 'min:1'],
            'questions.*.score_override'  => ['nullable', 'integer', 'min:0'],
            'questions.*.shuffle_choices' => ['nullable', 'boolean'],
        ]);

        // Update basic exam fields
        $exam->update($validated);

        // Sync questions ke pivot
        $questionsData = $request->input('questions', []);

        $syncPayload = [];

        foreach ($questionsData as $index => $q) {
            $questionId = $q['id'];

            $syncPayload[$questionId] = [
                'position'        => $q['position'] ?? ($index + 1),
                'score_override'  => $q['score_override'] ?? null,
                'shuffle_choices' => $q['shuffle_choices'] ?? false,
            ];
        }

        $exam->questions()->sync($syncPayload);

        return redirect()
            ->route('admin.exams.index')
            ->with('success', 'Exam updated successfully.');
    }

    public function destroy(Exam $exam)
    {
        // 1. Kalau sudah ada attempt, jangan hapus, tampilkan pesan rapi
        if ($exam->attempts()->exists()) {
            return back()->with('error', 'Tidak bisa menghapus ujian yang sudah pernah dikerjakan siswa.');
        }

        // 2. Lepaskan relasi soal (opsional, tergantung FK)
        $exam->questions()->detach();

        // 3. Hapus exam
        $exam->delete();

        return redirect()
            ->route('admin.exams.index')
            ->with('success', 'Ujian berhasil dihapus.');
    }
}
