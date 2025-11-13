<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class UpdateQuestionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return Auth::check();
    }

    public function rules(): array
    {
        return [
            'prompt'          => ['sometimes', 'string'],
            'image'           => ['nullable', 'image', 'max:2048'],
            'max_score'       => ['sometimes', 'integer', 'min:1', 'max:45'],
            // for boolean
            'correct_boolean' => ['nullable', 'boolean'],
            // for MCQ updates (optional)
            'choices'         => ['nullable', 'array', 'min:2', 'max:6'],
            'choices.*.id'    => ['nullable', 'exists:question_choices,id'],
            'choices.*.text'  => ['required_with:choices', 'string'],
            'choices.*.is_correct' => ['boolean'],
        ];
    }
}
