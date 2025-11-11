<?php

namespace App\Http\Controllers;

use App\Models\Exam;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

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
        return Inertia::render('admin/exams/CreateExam');
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'title'            => ['required', 'string', 'max:255'],
            'description'      => ['nullable', 'string'],
            'token'            => ['nullable', 'string', 'max:50'],
            'start_at'         => ['required', 'date'],
            'end_at'           => ['required', 'date', 'after_or_equal:start_at'],
            'duration_minutes' => ['required', 'integer', 'min:1'],
        ]);

        $data['created_by'] = $request->user()->id;

        Exam::create($data);

        return redirect()
            ->route('admin.exams.index')
            ->with('success', 'Exam created.');
    }

    public function detail(Exam $exam): Response
    {
        $exam->loadCount('attempts');

        return Inertia::render('admin/exams/DetailExam', [
            'exam' => $exam,
        ]);
    }


    public function edit(Exam $exam): Response
    {
        return Inertia::render('admin/exams/EditExam', [
            'exam' => $exam,
        ]);
    }

    public function update(Request $request, Exam $exam): RedirectResponse
    {
        $data = $request->validate([
            'title'            => ['required', 'string', 'max:255'],
            'description'      => ['nullable', 'string'],
            'token'            => ['nullable', 'string', 'max:50'],
            'start_at'         => ['required', 'date'],
            'end_at'           => ['required', 'date', 'after_or_equal:start_at'],
            'duration_minutes' => ['required', 'integer', 'min:1'],
        ]);

        $exam->update($data);

        return redirect()
            ->route('admin.exams.index')
            ->with('success', 'Exam updated.');
    }

    public function destroy(Exam $exam): RedirectResponse
    {
        $exam->delete();

        return redirect()
            ->route('exams.index')
            ->with('success', 'Exam deleted.');
    }
}
