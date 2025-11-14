<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Question extends Model
{
    use HasFactory;

    protected $fillable = [
        'question_bank_id',
        'author_id',
        'type',
        'prompt',
        'image_path',
        'max_score',
        'correct_boolean'
    ];

    protected $casts = [
        'correct_boolean' => 'boolean',
    ];

    public function bank(): BelongsTo
    {
        return $this->belongsTo(QuestionBank::class, 'question_bank_id');
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function choices(): HasMany
    {
        return $this->hasMany(QuestionChoice::class);
    }

    public function exams(): BelongsToMany
    {
        return $this->belongsToMany(Exam::class, 'exam_question')
            ->withPivot(['position', 'score_override', 'shuffle_choices'])
            ->withTimestamps()
            ->orderByPivot('position');
    }

    public function scoreForExam(?Exam $exam): int
    {
        if (!$exam) return $this->max_score;
        $row = $this->exams()->where('exam_id', $exam->id)->first();
        return $row?->pivot?->score_override ?? $this->max_score;
    }
}
