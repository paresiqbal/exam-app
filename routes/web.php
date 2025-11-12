<?php

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

use App\Http\Controllers\Admin\ExamController;

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

    // Route teacher lain
});

// ADMIN & TEACHER routes

// STUDENT routes
Route::middleware(['auth', 'verified', 'role:student'])->group(function () {
    Route::get('/student/dashboard', function () {
        return Inertia::render('student/dashboard');
    })->name('student.dashboard');

    // Route student lain
});



require __DIR__ . '/settings.php';
