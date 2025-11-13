<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class AttachExamQuestionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return Auth::check();
    }

    public function rules(): array
    {
        return [
            'question_id'    => ['required', 'exists:questions,id'],
            'position'       => ['required', 'integer', 'min:1'],
            'score_override' => ['nullable', 'integer', 'min:1', 'max:45'],
            'shuffle_choices' => ['boolean'],
        ];
    }
}
