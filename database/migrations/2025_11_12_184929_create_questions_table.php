<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teacher_id')->constrained('users')->cascadeOnDelete();
            $table->enum('type', ['single_select', 'multi_select', 'boolean', 'essay'])->default('single_select');

            $table->text('question_text');
            $table->string('image_path')->nullable();

            $table->json('options')->nullable();
            $table->json('correct_options')->nullable();
            $table->boolean('correct_answer_bool')->nullable();

            $table->unsignedSmallInteger('max_score')->default(1);
            $table->unsignedSmallInteger('min_score')->default(0);

            $table->enum('status', ['draft', 'pending', 'approved', 'rejected'])->default('approved');

            $table->unsignedSmallInteger('min_select')->nullable();
            $table->unsignedSmallInteger('max_select')->nullable();

            $table->timestamps();
            $table->index(['teacher_id', 'status', 'type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('questions');
    }
};
