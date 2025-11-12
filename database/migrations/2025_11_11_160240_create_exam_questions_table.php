<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('exam_questions', function (Blueprint $table) {
            // add pivot references
            $table->foreignId('question_id')->nullable()->after('exam_id'); // temp nullable for backfill
            $table->unsignedInteger('order')->default(0)->after('question_id');
            $table->unsignedSmallInteger('score')->nullable()->after('order'); // per-exam override

            // keep existing columns temporarily for backfill...
        });

        // BACKFILL: for each existing exam_questions row, create a bank Question and link it
        // We will assume 'created_by' on exams is an admin; we need a teacher_id.
        // If you already have teacher users, you can map; otherwise default to created_by or a fallback user.
        $teacherIdFallback = DB::table('users')->where('role', 'teacher')->value('id')
            ?? DB::table('users')->orderBy('id')->value('id');

        $rows = DB::table('exam_questions')->get();
        foreach ($rows as $row) {
            $questionId = DB::table('questions')->insertGetId([
                'teacher_id'          => $teacherIdFallback,
                'type'                => $row->type ?? 'single_select',
                'question_text'       => $row->question_text,
                'image_path'          => $row->image_path,
                'options'             => null, // we will migrate options next migration
                'correct_options'     => null,
                'correct_answer_bool' => $row->correct_answer_bool,
                'max_score'           => $row->max_score ?? 1,
                'min_score'           => $row->min_score ?? 0,
                'status'              => 'approved',
                'min_select'          => $row->min_select,
                'max_select'          => $row->max_select,
                'created_at'          => now(),
                'updated_at'          => now(),
            ]);

            DB::table('exam_questions')->where('id', $row->id)->update([
                'question_id' => $questionId,
                'order'       => $row->id, // simple deterministic order seed
                'score'       => $row->max_score, // carry over as per-exam default
            ]);
        }

        // Migrate ExamOption rows into the new questions.options JSON
        // We group by question_id (old exam_question id)
        $optionsByQuestion = DB::table('exam_options')
            ->select('id', 'question_id', 'label', 'option_text', 'image_path', 'is_correct', 'position')
            ->orderBy('position')
            ->get()
            ->groupBy('question_id');

        foreach ($optionsByQuestion as $oldExamQuestionId => $opts) {
            $questionId = DB::table('exam_questions')->where('id', $oldExamQuestionId)->value('question_id');
            if (!$questionId) continue;

            $arr = [];
            $correct = [];

            foreach ($opts as $o) {
                $arr[] = [
                    'id'          => $o->id,
                    'label'       => $o->label,
                    'text'        => $o->option_text,
                    'image_path'  => $o->image_path,
                    'is_correct'  => (bool)$o->is_correct,
                    'position'    => $o->position,
                ];
                if ($o->is_correct) {
                    $correct[] = $o->label ?: $o->id;
                }
            }

            DB::table('questions')->where('id', $questionId)->update([
                'options'         => json_encode($arr),
                'correct_options' => json_encode($correct),
                'updated_at'      => now(),
            ]);
        }

        // Now that backfill is done, make question_id NOT NULL and drop no-longer-needed columns
        Schema::table('exam_questions', function (Blueprint $table) {
            $table->foreignId('question_id')->nullable(false)->change();

            // columns to drop: question_text, image_path, type, max_score, min_score, min_select, max_select,
            // shuffle_options, correct_answer_bool
            foreach (
                [
                    'question_text',
                    'image_path',
                    'type',
                    'max_score',
                    'min_score',
                    'min_select',
                    'max_select',
                    'correct_answer_bool'
                ] as $col
            ) {
                if (Schema::hasColumn('exam_questions', $col)) {
                    $table->dropColumn($col);
                }
            }
        });

        // If you still need shuffle per exam, keep it here (per exam); otherwise drop it:
        if (Schema::hasColumn('exam_questions', 'shuffle_options')) {
            Schema::table('exam_questions', function (Blueprint $table) {
                // keep as per-exam flag (optional) – do nothing
            });
        }

        // Finally, add FKs & unique pair
        Schema::table('exam_questions', function (Blueprint $table) {
            $table->foreign('question_id')->references('id')->on('questions')->cascadeOnDelete();
            $table->unique(['exam_id', 'question_id']);
            $table->index(['exam_id', 'order']);
        });
    }

    public function down(): void
    {
        // This is a complex refactor; for simplicity we won't fully reverse backfill.
        // You could choose to leave this non-reversible or implement a partial rollback.
        // Here we just leave tables as-is to avoid data loss on down().
    }
};
