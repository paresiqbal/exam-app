import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface ChoiceForm {
    text: string;
    is_correct: boolean;
}

interface QuestionChoice {
    id: number;
    label: string;
    text: string;
    is_correct: boolean;
}

interface Question {
    id: number;
    type: 'mcq' | 'boolean';
    prompt: string;
    max_score: number;
    has_image: boolean;
    correct_boolean: boolean | null;
    choices: QuestionChoice[];
}

interface Bank {
    id: number;
    title: string;
    description?: string | null;
    questions_count: number;
    created_at: string;
}

interface Props {
    bank: Bank;
    questions: Question[];
}

const makeDefaultChoices = (): ChoiceForm[] => [
    { text: '', is_correct: false },
    { text: '', is_correct: false },
];

export default function QuestionBankShow({ bank, questions }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Teacher Dashboard', href: '/teacher/dashboard' },
        { title: 'Question Banks', href: '/teacher/question-banks' },
        { title: bank.title, href: `/teacher/question-banks/${bank.id}` },
    ];

    // MCQ form
    const {
        data: mcqData,
        setData: setMcqData,
        post: postMcq,
        processing: mcqProcessing,
        errors: mcqErrors,
        reset: resetMcq,
    } = useForm({
        question_bank_id: bank.id,
        prompt: '',
        max_score: 1,
        choices: makeDefaultChoices(),
    });

    // Boolean form
    const {
        data: boolData,
        setData: setBoolData,
        post: postBool,
        processing: boolProcessing,
        errors: boolErrors,
        reset: resetBool,
    } = useForm({
        question_bank_id: bank.id,
        prompt: '',
        max_score: 1,
        correct_boolean: true,
    });

    const submitMcq = (e: React.FormEvent) => {
        e.preventDefault();
        postMcq('/teacher/questions/mcq', {
            preserveScroll: true,
            onSuccess: () => {
                resetMcq();
                setMcqData('choices', makeDefaultChoices());
            },
        });
    };

    const submitBoolean = (e: React.FormEvent) => {
        e.preventDefault();
        postBool('/teacher/questions/boolean', {
            preserveScroll: true,
            onSuccess: () => {
                resetBool();
                setBoolData('correct_boolean', true);
            },
        });
    };

    const addChoice = () => {
        if (mcqData.choices.length >= 6) return;
        setMcqData('choices', [
            ...mcqData.choices,
            { text: '', is_correct: false },
        ]);
    };

    const removeChoice = (index: number) => {
        if (mcqData.choices.length <= 2) return;
        const copy = [...mcqData.choices];
        copy.splice(index, 1);
        setMcqData('choices', copy);
    };

    const toggleChoiceCorrect = (index: number) => {
        const copy = [...mcqData.choices];
        copy[index].is_correct = !copy[index].is_correct;
        setMcqData('choices', copy);
    };

    const updateChoiceText = (index: number, value: string) => {
        const copy = [...mcqData.choices];
        copy[index].text = value;
        setMcqData('choices', copy);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={bank.title} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-semibold">{bank.title}</h1>
                        {bank.description && (
                            <p className="mt-1 text-sm text-muted-foreground">
                                {bank.description}
                            </p>
                        )}
                        <p className="mt-1 text-xs text-muted-foreground">
                            {bank.questions_count} questions • created at{' '}
                            {new Date(bank.created_at).toLocaleString()}
                        </p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href="/teacher/question-banks">
                            Back to banks
                        </Link>
                    </Button>
                </div>

                {/* Forms row */}
                <div className="grid gap-4 md:grid-cols-2">
                    {/* MCQ form */}
                    <Card className="border border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader>
                            <CardTitle>Add Multiple Choice Question</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submitMcq} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">
                                        Question
                                    </label>
                                    <Textarea
                                        value={mcqData.prompt}
                                        onChange={(e) =>
                                            setMcqData('prompt', e.target.value)
                                        }
                                        rows={3}
                                        placeholder="Type your question here..."
                                    />
                                    {mcqErrors.prompt && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {mcqErrors.prompt}
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
                                        value={mcqData.max_score}
                                        onChange={(e) =>
                                            setMcqData(
                                                'max_score',
                                                Number(e.target.value),
                                            )
                                        }
                                    />
                                    {mcqErrors.max_score && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {mcqErrors.max_score}
                                        </p>
                                    )}
                                </div>

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
                                            disabled={
                                                mcqData.choices.length >= 6
                                            }
                                        >
                                            + Add choice
                                        </Button>
                                    </div>

                                    <div className="space-y-2">
                                        {mcqData.choices.map(
                                            (choice, index) => (
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
                                                            mcqData.choices
                                                                .length <= 2
                                                        }
                                                    >
                                                        ✕
                                                    </Button>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                    {mcqErrors.choices && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {mcqErrors.choices}
                                        </p>
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    disabled={mcqProcessing}
                                    className="w-full"
                                >
                                    {mcqProcessing ? 'Saving...' : 'Add MCQ'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Boolean form */}
                    <Card className="border border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader>
                            <CardTitle>Add True/False Question</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form
                                onSubmit={submitBoolean}
                                className="space-y-4"
                            >
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">
                                        Question
                                    </label>
                                    <Textarea
                                        value={boolData.prompt}
                                        onChange={(e) =>
                                            setBoolData(
                                                'prompt',
                                                e.target.value,
                                            )
                                        }
                                        rows={3}
                                        placeholder="Statement that is true or false..."
                                    />
                                    {boolErrors.prompt && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {boolErrors.prompt}
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
                                        value={boolData.max_score}
                                        onChange={(e) =>
                                            setBoolData(
                                                'max_score',
                                                Number(e.target.value),
                                            )
                                        }
                                    />
                                    {boolErrors.max_score && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {boolErrors.max_score}
                                        </p>
                                    )}
                                </div>

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
                                                    boolData.correct_boolean ===
                                                    true
                                                }
                                                onChange={() =>
                                                    setBoolData(
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
                                                    boolData.correct_boolean ===
                                                    false
                                                }
                                                onChange={() =>
                                                    setBoolData(
                                                        'correct_boolean',
                                                        false,
                                                    )
                                                }
                                            />
                                            <span>False</span>
                                        </label>
                                    </div>
                                    {boolErrors.correct_boolean && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {boolErrors.correct_boolean}
                                        </p>
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    disabled={boolProcessing}
                                    className="w-full"
                                >
                                    {boolProcessing
                                        ? 'Saving...'
                                        : 'Add True/False'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* Question list */}
                <Card className="border border-sidebar-border/70 dark:border-sidebar-border">
                    <CardHeader>
                        <CardTitle>Questions in this bank</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {questions.length === 0 && (
                            <p className="text-sm text-muted-foreground">
                                No questions yet. Add some using the forms
                                above.
                            </p>
                        )}

                        {questions.map((q) => (
                            <div
                                key={q.id}
                                className="rounded-lg border border-sidebar-border/70 bg-background/60 p-3 text-sm dark:border-sidebar-border"
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <span className="rounded bg-muted px-2 py-0.5 text-[10px] uppercase">
                                            {q.type === 'mcq'
                                                ? 'MCQ'
                                                : 'True/False'}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            Score: {q.max_score}
                                        </span>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            asChild
                                        >
                                            <Link
                                                href={`/teacher/question-banks/${bank.id}/questions/${q.id}/edit`}
                                            >
                                                Edit
                                            </Link>
                                        </Button>

                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="sm"
                                                >
                                                    Delete
                                                </Button>
                                            </AlertDialogTrigger>

                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>
                                                        Delete this question?
                                                    </AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be
                                                        undone. The question
                                                        will be permanently
                                                        removed from this bank.
                                                        If it is already
                                                        assigned to an exam,
                                                        deletion may be blocked
                                                        by the server.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>

                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>
                                                        Cancel
                                                    </AlertDialogCancel>

                                                    <AlertDialogAction
                                                        onClick={() => {
                                                            router.delete(
                                                                `/teacher/questions/${q.id}`,
                                                                {
                                                                    preserveScroll: true,
                                                                },
                                                            );
                                                        }}
                                                    >
                                                        Delete
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>

                                <p className="mt-2 font-medium">{q.prompt}</p>

                                {q.type === 'mcq' && q.choices.length > 0 && (
                                    <ul className="mt-2 space-y-1 text-xs">
                                        {q.choices.map((c) => (
                                            <li
                                                key={c.id}
                                                className="flex items-center gap-2"
                                            >
                                                <span className="font-semibold">
                                                    {c.label}.
                                                </span>
                                                <span>{c.text}</span>
                                                {c.is_correct && (
                                                    <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                                                        Correct
                                                    </span>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                )}

                                {q.type === 'boolean' && (
                                    <p className="mt-2 text-xs">
                                        Correct answer:{' '}
                                        <span className="font-semibold">
                                            {q.correct_boolean
                                                ? 'True'
                                                : 'False'}
                                        </span>
                                    </p>
                                )}
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
