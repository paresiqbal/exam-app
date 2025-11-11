<?php

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

use App\Http\Controllers\ExamController;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

// Route::middleware(['auth', 'verified'])->group(function () {
//     Route::get('dashboard', function () {
//         return Inertia::render('dashboard');
//     })->name('dashboard');
// });

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        $user = Auth::user();

        // Sesuaikan dengan value kolom "role" di tabel users kamu
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
        });
    });

// TEACHER routes
Route::middleware(['auth', 'verified', 'role:teacher'])->group(function () {
    Route::get('/teacher/dashboard', function () {
        return Inertia::render('teacher/dashboard');
    })->name('teacher.dashboard');

    // Route teacher lain
});

// STUDENT routes
Route::middleware(['auth', 'verified', 'role:student'])->group(function () {
    Route::get('/student/dashboard', function () {
        return Inertia::render('student/dashboard');
    })->name('student.dashboard');

    // Route student lain
});



require __DIR__ . '/settings.php';
