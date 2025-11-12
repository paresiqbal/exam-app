<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;


return new class extends Migration {
    public function up(): void
    {
        Schema::create('question_choices', function (Blueprint $t) {
            $t->id();
            $t->foreignId('question_id')->constrained()->cascadeOnDelete();
            $t->string('label', 1); // A, B, C, D, ...
            $t->text('text');
            $t->boolean('is_correct')->default(false);
            $t->unsignedTinyInteger('position')->default(1);
            $t->timestamps();

            $t->unique(['question_id', 'label']);
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('question_choices');
    }
};
