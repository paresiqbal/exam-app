<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class ReorderExamQuestionsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return Auth::check();
    }

    public function rules(): array
    {
        return [
            'items'              => ['required', 'array', 'min:1'],
            'items.*.question_id' => ['required', 'exists:questions,id'],
            'items.*.position'   => ['required', 'integer', 'min:1'],
        ];
    }
}
