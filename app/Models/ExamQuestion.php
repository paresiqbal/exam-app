<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ExamQuestion extends Model
{
    use HasFactory;

    protected $fillable = [
        'exam_id',
        'question_text',
        'image_path',
        'type',
        'max_score',
        'min_score',
        'min_select',
        'max_select',
        'shuffle_options',
        'correct_answer_bool',
    ];

    protected $casts = [
        'max_score'         => 'integer',
        'min_score'         => 'integer',
        'min_select'        => 'integer',
        'max_select'        => 'integer',
        'shuffle_options'   => 'boolean',
        'correct_answer_bool' => 'boolean',
    ];

    public function exam(): BelongsTo
    {
        return $this->belongsTo(Exam::class);
    }

    public function options(): HasMany
    {
        return $this->hasMany(ExamOption::class, 'question_id');
    }

    public function answers(): HasMany
    {
        return $this->hasMany(ExamAnswer::class, 'question_id');
    }

    public function correctOptionIds(): array
    {
        if ($this->type !== 'multi_select') return [];
        return $this->options()->where('is_correct', true)->pluck('id')->all();
    }

    public function question(): BelongsTo
    {
        return $this->belongsTo(\App\Models\Question::class, 'question_id');
    }
}
