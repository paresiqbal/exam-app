import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

type Choice = {
    id: number;
    label: string;
    option_text: string;
};

type Question = {
    id: number;
    type: 'mcq' | 'boolean';
    prompt: string;
    image?: string | null;
    choices?: Choice[];
    max_score: number;
};

type AnswerValue = number[] | boolean | null;

type PageProps = {
    attempt: {
        id: number;
        exam_id: number;
    };
    question: Question;
    number: number;
    total_questions: number;
    answer: AnswerValue;
};

export default function QuestionPage() {
    const { attempt, question, number, total_questions, answer } =
        usePage<PageProps>().props;

    const normalizeInitialAnswer = (
        answer: AnswerValue,
        question: Question,
    ): AnswerValue => {
        if (question.type === 'mcq') {
            // For MCQ we always want an array
            return Array.isArray(answer) ? answer : [];
        }

        if (question.type === 'boolean') {
            // For boolean we only accept true/false, otherwise null
            return typeof answer === 'boolean' ? answer : null;
        }

        return null;
    };

    const [selectedAnswer, setSelectedAnswer] = useState<AnswerValue>(() =>
        normalizeInitialAnswer(answer, question),
    );
    const [processing, setProcessing] = useState(false);

    const isFirst = number === 1;
    const isLast = number === total_questions;

    const isAnswered =
        (question.type === 'mcq' &&
            Array.isArray(selectedAnswer) &&
            selectedAnswer.length > 0) ||
        (question.type === 'boolean' && typeof selectedAnswer === 'boolean');

    const saveAnswer = (goTo: number | 'finish') => {
        setProcessing(true);

        router.post(
            `/student/attempts/${attempt.id}/answer`,
            {
                question_id: question.id,
                // backend expects:
                // - "answer" for MCQ (array of ids)
                // - "boolean" for true/false
                answer: question.type === 'mcq' ? selectedAnswer : null,
                boolean: question.type === 'boolean' ? selectedAnswer : null,
            },
            {
                onSuccess: () => {
                    if (goTo === 'finish') {
                        router.post(`/student/attempts/${attempt.id}/finish`);
                    } else {
                        router.get(
                            `/student/attempts/${attempt.id}/questions/${goTo}`,
                        );
                    }
                },
                onFinish: () => setProcessing(false),
            },
        );
    };

    // MCQ: toggle (multi-select). If you want single-select, see comment below.
    const toggleChoice = (choiceId: number) => {
        setSelectedAnswer((prev) => {
            // If somehow not array yet, start fresh with this choice
            if (!Array.isArray(prev)) {
                return [choiceId];
            }

            if (prev.includes(choiceId)) {
                return prev.filter((id) => id !== choiceId);
            }

            return [...prev, choiceId];

            // If you want MCQ to be single-choice only, replace everything above with:
            // return [choiceId];
        });
    };

    return (
        <AppLayout>
            <Head title={`Soal ${number}`} />

            <div className="mx-auto max-w-3xl space-y-6 p-6">
                {/* Header */}
                <div className="rounded-lg border bg-card p-4">
                    <h1 className="text-xl font-semibold">
                        Soal {number} / {total_questions}
                    </h1>
                </div>

                {/* Question Prompt */}
                <div className="space-y-4 rounded-lg border bg-card p-4">
                    <p className="text-base leading-relaxed">
                        {question.prompt}
                    </p>

                    {question.image && (
                        <img
                            src={question.image}
                            className="max-w-full rounded-lg border"
                        />
                    )}
                </div>

                {/* Answer Section */}
                <div className="space-y-4 rounded-lg border bg-card p-4">
                    {question.type === 'mcq' && (
                        <div className="space-y-3">
                            {question.choices?.map((choice) => {
                                const isSelected =
                                    Array.isArray(selectedAnswer) &&
                                    selectedAnswer.includes(choice.id);

                                return (
                                    <div
                                        key={choice.id}
                                        onClick={() => toggleChoice(choice.id)}
                                        className={`cursor-pointer rounded-lg border p-3 transition ${
                                            isSelected
                                                ? 'border-blue-500 bg-blue-100'
                                                : 'hover:bg-gray-50'
                                        }`}
                                    >
                                        <strong>{choice.label}.</strong>{' '}
                                        {choice.option_text}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {question.type === 'boolean' && (
                        <div className="flex gap-3">
                            <Button
                                variant={
                                    selectedAnswer === true
                                        ? 'default'
                                        : 'outline'
                                }
                                onClick={() => setSelectedAnswer(true)}
                            >
                                Benar
                            </Button>

                            <Button
                                variant={
                                    selectedAnswer === false
                                        ? 'default'
                                        : 'outline'
                                }
                                onClick={() => setSelectedAnswer(false)}
                            >
                                Salah
                            </Button>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <div className="flex justify-between pt-4">
                    {!isFirst ? (
                        <Button
                            variant="secondary"
                            disabled={processing}
                            onClick={() => saveAnswer(number - 1)}
                        >
                            Sebelumnya
                        </Button>
                    ) : (
                        <div />
                    )}

                    {!isLast ? (
                        <Button
                            disabled={processing || !isAnswered}
                            onClick={() => saveAnswer(number + 1)}
                        >
                            Selanjutnya
                        </Button>
                    ) : (
                        <Button
                            variant="destructive"
                            disabled={processing || !isAnswered}
                            onClick={() => saveAnswer('finish')}
                        >
                            Selesai Ujian
                        </Button>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
