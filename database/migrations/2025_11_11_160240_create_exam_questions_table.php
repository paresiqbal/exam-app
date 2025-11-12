<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('exam_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exam_id')->constrained()->cascadeOnDelete();
            $table->text('question_text');
            $table->string('image_path')->nullable();
            $table->enum('type', ['multi_select', 'true_false']);
            $table->unsignedTinyInteger('max_score')->default(1);
            $table->unsignedTinyInteger('min_score')->default(0);
            $table->unsignedTinyInteger('min_select')->nullable();
            $table->unsignedTinyInteger('max_select')->nullable();
            $table->boolean('shuffle_options')->default(true);
            $table->boolean('correct_answer_bool')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exam_questions');
    }
};
