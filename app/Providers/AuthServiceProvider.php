<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use App\Models\Exam;
use App\Policies\ExamPolicy;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        Exam::class => ExamPolicy::class,
    ];

    public function boot(): void
    {
        $this->registerPolicies();
    }
}
