<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class StoreBooleanQuestionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return Auth::check();
    }

    public function rules(): array
    {
        return [
            'question_bank_id' => ['required', 'exists:question_banks,id'],
            'prompt'           => ['required', 'string'],
            'image'            => ['nullable', 'image', 'max:2048'],
            'max_score'        => ['required', 'integer', 'min:1', 'max:45'],
            'correct_boolean'  => ['required', 'boolean'],
        ];
    }
}
