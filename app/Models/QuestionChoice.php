<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

// app/Models/QuestionChoice.php
class QuestionChoice extends Model
{
    use HasFactory;

    protected $fillable = ['question_id', 'label', 'text', 'is_correct', 'position'];
    protected $casts = ['is_correct' => 'boolean'];

    public function question(): BelongsTo
    {
        return $this->belongsTo(Question::class);
    }
}
