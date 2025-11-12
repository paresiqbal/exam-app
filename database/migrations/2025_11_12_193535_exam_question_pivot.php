<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// 2025_11_13_000004_create_exam_question_pivot.php
return new class extends Migration {
    public function up(): void
    {
        Schema::create('exam_question', function (Blueprint $t) {
            $t->id();
            $t->foreignId('exam_id')->constrained()->cascadeOnDelete();
            $t->foreignId('question_id')->constrained()->cascadeOnDelete();
            $t->unsignedSmallInteger('position')->default(1);
            $t->unsignedTinyInteger('score_override')->nullable();
            $t->boolean('shuffle_choices')->default(true);
            $t->timestamps();
            $t->unique(['exam_id', 'question_id']);
            $t->unique(['exam_id', 'position']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exam_question');
    }
};
