<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreExamQuestionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check(); // or add role check if you want
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

            // Options (required only for multi_select)
            'options'              => ['required_if:type,multi_select', 'array'],
            'options.*.id'         => ['nullable', 'integer', 'exists:exam_options,id'],
            'options.*.label'      => ['nullable', 'string', 'max:5'],
            'options.*.option_text' => ['nullable', 'string'],
            'options.*.is_correct' => ['boolean'],
            'options.*.position'   => ['integer', 'min:0'],
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($v) {
            $type = $this->input('type');

            if ($type === 'multi_select') {
                $opts = collect($this->input('options', []));
                if ($opts->isEmpty()) {
                    $v->errors()->add('options', 'Options are required.');
                    return;
                }
                if ($opts->where('is_correct', true)->count() === 0) {
                    $v->errors()->add('options', 'Mark at least one option as correct.');
                }

                $min = (int)($this->input('min_select') ?? 1);
                $max = (int)($this->input('max_select') ?? 1);
                if ($min < 1 || $max < 1 || $min > $max) {
                    $v->errors()->add('max_select', 'Min/Max select must be ≥ 1 and min ≤ max.');
                }
                if ($max > $opts->count()) {
                    $v->errors()->add('max_select', 'Max select cannot exceed number of options.');
                }
            }

            if ($type === 'true_false' && !in_array($this->input('correct_answer_bool'), [0, 1, '0', '1'], true)) {
                $v->errors()->add('correct_answer_bool', 'Choose which (True/False) is correct.');
            }
        });
    }
}
