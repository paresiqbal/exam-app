<?php

namespace App\Policies;

use App\Models\Exam;
use App\Models\User;

class ExamPolicy
{
    /**
     * Admins can do anything.
     * Teachers can only manage their own exams.
     * Students have read-only access (if needed).
     */

    public function viewAny(User $user): bool
    {
        return $user->hasRole(['admin', 'teacher']);
    }

    public function view(User $user, Exam $exam): bool
    {
        return $user->hasRole('admin') || $user->id === $exam->created_by;
    }

    public function create(User $user): bool
    {
        return $user->hasRole(['admin', 'teacher']);
    }

    public function update(User $user, Exam $exam): bool
    {
        return $user->hasRole('admin') || $user->id === $exam->created_by;
    }

    public function delete(User $user, Exam $exam): bool
    {
        return $user->hasRole('admin') || $user->id === $exam->created_by;
    }

    public function manage(User $user, Exam $exam): bool
    {
        // convenience check for all "question management" actions
        return $user->hasRole('admin') || $user->id === $exam->created_by;
    }
}
