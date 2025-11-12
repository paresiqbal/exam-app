<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ExamOption extends Model
{
    use HasFactory;

    protected $fillable = [
        'question_id',
        'label',
        'option_text',
        'image_path',
        'is_correct',
        'position',
    ];

    protected $casts = [
        'is_correct' => 'boolean',
        'position'   => 'integer',
    ];
}
