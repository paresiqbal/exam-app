<?php

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;
use Inertia\Inertia;

use App\Http\Controllers\Admin\ExamController;
use App\Http\Controllers\Admin\ExamQuestionController;
use App\Http\Controllers\Student\StudentExamController;
use App\Http\Controllers\Teacher\QuestionBankController;
use App\Http\Controllers\Teacher\QuestionController;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');


Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        $user = Auth::user();

        return match ($user->role) {
            'admin'   => redirect()->route('admin.dashboard'),
            'teacher' => redirect()->route('teacher.dashboard'),
            'student' => redirect()->route('student.dashboard'),
            default   => abort(403, 'Unknown role.'),
        };
    })->name('dashboard');
});

// ADMIN routes
Route::middleware(['auth', 'verified', 'role:admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::get('/dashboard', fn() => Inertia::render('admin/dashboard'))
            ->name('dashboard');

        /**
         * EXAM ROUTES
         */
        Route::prefix('exams')->name('exams.')->group(function () {
            Route::get('/', [ExamController::class, 'index'])->name('index');
            Route::get('/create', [ExamController::class, 'create'])->name('create');
            Route::post('/', [ExamController::class, 'store'])->name('store');
            Route::get('/{exam}', [ExamController::class, 'show'])->name('show');
            Route::get('/{exam}/edit', [ExamController::class, 'edit'])->name('edit');
            Route::put('/{exam}', [ExamController::class, 'update'])->name('update');
            Route::delete('/{exam}', [ExamController::class, 'destroy'])->name('destroy');
        });
    });

// TEACHER routes
Route::middleware(['auth', 'verified', 'role:teacher'])->group(function () {
    Route::get('/teacher/dashboard', function () {
        return Inertia::render('teacher/dashboard');
    })->name('teacher.dashboard');

    /**
     * QUESTION BANK ROUTES & QUESTION ROUTES
     */
    Route::prefix('teacher')->name('teacher.')->group(function () {
        Route::get('/question-banks', [QuestionBankController::class, 'index'])->name('index');
        Route::get('/question-banks/create', [QuestionBankController::class, 'create'])->name('create');
        Route::post('/question-banks', [QuestionBankController::class, 'store'])->name('store');
        Route::get('/question-banks/{bank}', [QuestionBankController::class, 'show'])->name('banks.show');
        Route::put('/question-banks/{bank}', [QuestionBankController::class, 'update'])->name('update');
        Route::delete('/question-banks/{bank}', [QuestionBankController::class, 'destroy'])->name('destroy');
        Route::get(
            '/question-banks/{bank}/questions/{question}/edit',
            [QuestionController::class, 'edit']
        )->name('questions.edit');

        // question
        Route::post('/questions/mcq', [QuestionController::class, 'storeMcq'])->name('questions.store.mcq');
        Route::post('/questions/boolean', [QuestionController::class, 'storeBoolean'])->name('questions.store.boolean');
        Route::put('/questions/{question}', [QuestionController::class, 'update'])->name('questions.update');
        Route::delete('/questions/{question}', [QuestionController::class, 'destroy'])->name('questions.destroy');
    });
});

// STUDENT routes
Route::middleware(['auth', 'verified', 'role:student'])->group(function () {
    Route::get('/student/dashboard', function () {
        return Inertia::render('student/dashboard');
    })->name('student.dashboard');


    Route::prefix('student')->name('student.')->group(function () {
        Route::post('/exams/join', [StudentExamController::class, 'join'])
            ->name('exams.join');

        Route::get('/attempts/{attempt}', [StudentExamController::class, 'show'])
            ->name('attempts.show');
    });
});



require __DIR__ . '/settings.php';
