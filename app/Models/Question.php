<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Question extends Model
{
    protected $fillable = [
        'teacher_id',
        'type',
        'question_text',
        'image_path',
        'options',
        'correct_options',
        'correct_answer_bool',
        'max_score',
        'min_score',
        'status',
        'min_select',
        'max_select',
    ];

    protected $casts = [
        'options'            => 'array',
        'correct_options'    => 'array',
        'correct_answer_bool' => 'boolean',
        'max_score'          => 'integer',
        'min_score'          => 'integer',
        'min_select'         => 'integer',
        'max_select'         => 'integer',
    ];

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    public function exams(): BelongsToMany
    {
        return $this->belongsToMany(Exam::class, 'exam_questions')
            ->withPivot(['order', 'score', 'shuffle_options'])
            ->withTimestamps();
    }

    /** Only questions admins can pick */
    public function scopePickable($q)
    {
        return $q->where('status', 'approved');
    }
}
