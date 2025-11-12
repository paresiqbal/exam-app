<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateExamQuestionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'question_text'        => ['required', 'string'],
            'image'                => ['nullable', 'image', 'max:2048'],
            'type'                 => ['required', 'in:multi_select,true_false'],
            'max_score'            => ['required', 'integer', 'min:0', 'max:255'],
            'min_score'            => ['required', 'integer', 'min:0', 'lte:max_score'],
            'min_select'           => ['nullable', 'integer', 'min:0'],
            'max_select'           => ['nullable', 'integer', 'min:0'],
            'shuffle_options'      => ['boolean'],
            'correct_answer_bool'  => ['nullable', 'boolean'],

            // Options (only for multi_select)
            'options'              => ['required_if:type,multi_select', 'array'],
            'options.*.id'         => ['nullable', 'integer', 'exists:exam_options,id'],
            'options.*.label'      => ['nullable', 'string', 'max:5'],
            'options.*.option_text' => ['nullable', 'string'],
            'options.*.is_correct' => ['boolean'],
            'options.*.position'   => ['integer', 'min:0'],
        ];
    }
}
