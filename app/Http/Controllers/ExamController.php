<?php

namespace App\Http\Controllers;

use App\Models\Exam;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
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
        return inertia('admin/exams/EditExam', [
            'exam' => $exam,
        ]);
    }

    public function update(Request $request, Exam $exam)
    {
        $validated = $request->validate([
            'title'            => ['required', 'string', 'max:255'],
            'description'      => ['nullable', 'string'],
            'token'            => ['nullable', 'string', 'max:50'],
            'start_at'         => ['required', 'date'],
            'end_at'           => ['required', 'date', 'after_or_equal:start_at'],
            'duration_minutes' => ['required', 'integer', 'min:1'],
        ]);

        $exam->update($validated);

        return redirect()->route('admin.exams.index')
            ->with('success', 'Exam updated successfully.');
    }

    public function destroy(Exam $exam)
    {
        $exam->delete();

        return redirect()
            ->route('admin.exams.index')
            ->with('success', 'Exam deleted successfully.');
    }
}
