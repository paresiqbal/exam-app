<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class StoreMcqQuestionRequest extends FormRequest
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
            'choices'          => ['required', 'array', 'min:2', 'max:6'],
            'choices.*.text'   => ['required', 'string'],
            'choices.*.is_correct' => ['boolean'],
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($v) {
            $choices = $this->input('choices', []);
            $correctCount = collect($choices)->where('is_correct', true)->count();
            if ($correctCount < 1) {
                $v->errors()->add('choices', 'At least one choice must be marked correct.');
            }
        });
    }
}
