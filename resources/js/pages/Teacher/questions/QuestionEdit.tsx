import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';

interface QuestionChoice {
    id: number;
    label: string;
    text: string;
    is_correct: boolean;
}

type QuestionType = 'mcq' | 'boolean';

interface Question {
    id: number;
    type: QuestionType;
    prompt: string;
    max_score: number;
    correct_boolean: boolean | null;
    choices: QuestionChoice[];
}

interface Bank {
    id: number;
    title: string;
}

interface QuestionEditProps {
    bank: Bank;
    question: Question;
}

interface ChoiceForm {
    text: string;
    is_correct: boolean;
}

interface QuestionFormData {
    prompt: string;
    max_score: number;
    correct_boolean: boolean;
    choices: ChoiceForm[];
}

const makeInitialChoices = (question: Question): ChoiceForm[] => {
    if (question.type === 'mcq' && question.choices.length > 0) {
        return question.choices.map((choice) => ({
            text: choice.text,
            is_correct: choice.is_correct,
        }));
    }
    // fallback
    return [
        { text: '', is_correct: false },
        { text: '', is_correct: false },
    ];
};

export default function QuestionEdit({ bank, question }: QuestionEditProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Teacher Dashboard', href: '/teacher/dashboard' },
        { title: 'Question Banks', href: '/teacher/question-banks' },
        {
            title: bank.title,
            href: `/teacher/question-banks/${bank.id}`,
        },
        {
            title: 'Edit Question',
            href: `/teacher/question-banks/${bank.id}/questions/${question.id}/edit`,
        },
    ];

    const initialChoices = makeInitialChoices(question);

    const { data, setData, put, processing, errors } =
        useForm<QuestionFormData>({
            prompt: question.prompt,
            max_score: question.max_score,
            correct_boolean: question.correct_boolean ?? true,
            choices: initialChoices,
        });

    const isMcq = question.type === 'mcq';
    const isBoolean = question.type === 'boolean';

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/teacher/questions/${question.id}`, {
            preserveScroll: true,
        });
    };

    const addChoice = () => {
        if (!isMcq) return;
        if (data.choices.length >= 6) return;
        setData('choices', [...data.choices, { text: '', is_correct: false }]);
    };

    const removeChoice = (index: number) => {
        if (!isMcq) return;
        if (data.choices.length <= 2) return;
        const updated = [...data.choices];
        updated.splice(index, 1);
        setData('choices', updated);
    };

    const updateChoiceText = (index: number, value: string) => {
        if (!isMcq) return;
        const updated = [...data.choices];
        updated[index].text = value;
        setData('choices', updated);
    };

    const toggleChoiceCorrect = (index: number) => {
        if (!isMcq) return;
        const updated = [...data.choices];
        updated[index].is_correct = !updated[index].is_correct;
        setData('choices', updated);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Question" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-semibold">Edit Question</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Bank: {bank.title}
                        </p>
                    </div>

                    <Button variant="outline" asChild>
                        <Link href={`/teacher/question-banks/${bank.id}`}>
                            Back to bank
                        </Link>
                    </Button>
                </div>

                <Card className="max-w-3xl border border-sidebar-border/70 dark:border-sidebar-border">
                    <CardHeader>
                        <CardTitle>
                            {isMcq
                                ? 'Multiple Choice Question'
                                : 'True / False Question'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium">
                                    Question
                                </label>
                                <Textarea
                                    value={data.prompt}
                                    onChange={(e) =>
                                        setData('prompt', e.target.value)
                                    }
                                    rows={3}
                                />
                                {errors.prompt && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.prompt}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium">
                                    Max Score (1–45)
                                </label>
                                <Input
                                    type="number"
                                    min={1}
                                    max={45}
                                    value={data.max_score}
                                    onChange={(e) =>
                                        setData(
                                            'max_score',
                                            Number(e.target.value),
                                        )
                                    }
                                />
                                {errors.max_score && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.max_score}
                                    </p>
                                )}
                            </div>

                            {isMcq && (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-medium">
                                            Choices (min 2, max 6)
                                        </label>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={addChoice}
                                            disabled={data.choices.length >= 6}
                                        >
                                            + Add choice
                                        </Button>
                                    </div>

                                    <div className="space-y-2">
                                        {data.choices.map((choice, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center gap-2 rounded border border-sidebar-border/70 px-2 py-1 text-sm dark:border-sidebar-border"
                                            >
                                                <span className="w-5 text-xs font-semibold">
                                                    {String.fromCharCode(
                                                        65 + index,
                                                    )}
                                                </span>
                                                <Input
                                                    className="flex-1"
                                                    value={choice.text}
                                                    onChange={(e) =>
                                                        updateChoiceText(
                                                            index,
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder={`Choice ${index + 1}`}
                                                />
                                                <label className="flex items-center gap-1 text-xs">
                                                    <input
                                                        type="checkbox"
                                                        checked={
                                                            choice.is_correct
                                                        }
                                                        onChange={() =>
                                                            toggleChoiceCorrect(
                                                                index,
                                                            )
                                                        }
                                                    />
                                                    <span>Correct</span>
                                                </label>
                                                <Button
                                                    type="button"
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() =>
                                                        removeChoice(index)
                                                    }
                                                    disabled={
                                                        data.choices.length <= 2
                                                    }
                                                >
                                                    ✕
                                                </Button>
                                            </div>
                                        ))}
                                    </div>

                                    {errors.choices && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {errors.choices}
                                        </p>
                                    )}
                                </div>
                            )}

                            {isBoolean && (
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">
                                        Correct answer
                                    </label>
                                    <div className="flex gap-4 text-sm">
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name="correct_boolean"
                                                checked={
                                                    data.correct_boolean ===
                                                    true
                                                }
                                                onChange={() =>
                                                    setData(
                                                        'correct_boolean',
                                                        true,
                                                    )
                                                }
                                            />
                                            <span>True</span>
                                        </label>
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name="correct_boolean"
                                                checked={
                                                    data.correct_boolean ===
                                                    false
                                                }
                                                onChange={() =>
                                                    setData(
                                                        'correct_boolean',
                                                        false,
                                                    )
                                                }
                                            />
                                            <span>False</span>
                                        </label>
                                    </div>
                                    {errors.correct_boolean && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {errors.correct_boolean}
                                        </p>
                                    )}
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={processing}
                                className="w-full"
                            >
                                {processing ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
