import DeleteExamButton from '@/components/DeleteExamButton';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import React from 'react';

type Bank = {
    id: number;
    title: string;
};

type ExamQuestionPivot = {
    position: number | null;
    score_override: number | null;
    shuffle_choices: boolean;
};

type ExamQuestion = {
    id: number;
    text: string;
    pivot: ExamQuestionPivot;
};

type Exam = {
    id: number;
    title: string;
    description: string | null;
    token: string | null;
    start_at: string;
    end_at: string;
    duration_minutes: number;
    question_bank_id: number | null;
    questions: ExamQuestion[];
};

type AvailableQuestion = {
    id: number;
    text: string;
};

type PageProps = {
    exam: Exam;
    banks: Bank[];
    available_questions: AvailableQuestion[];
};

type ExamFormData = {
    title: string;
    description: string | null;
    token: string | null;
    start_at: string;
    end_at: string;
    duration_minutes: number;
    question_bank_id: number | '' | null;
    questions: {
        id: number;
        position: number | null;
        score_override: number | null;
        shuffle_choices: boolean;
    }[];
};

function formatDateTimeLocal(value: string): string {
    if (!value) return '';
    return value.slice(0, 16);
}

export default function EditExam() {
    const { exam, banks, available_questions } = usePage<PageProps>().props;

    const { data, setData, put, processing, errors } = useForm<ExamFormData>({
        title: exam.title ?? '',
        description: exam.description ?? '',
        token: exam.token ?? '',
        start_at: formatDateTimeLocal(exam.start_at),
        end_at: formatDateTimeLocal(exam.end_at),
        duration_minutes: exam.duration_minutes ?? 60,
        question_bank_id: exam.question_bank_id ?? '',
        questions:
            exam.questions?.map((q, index) => ({
                id: q.id,
                position: q.pivot.position ?? index + 1,
                score_override: q.pivot.score_override,
                shuffle_choices: q.pivot.shuffle_choices,
            })) ?? [],
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/exams/${exam.id}`);
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Ujian', href: '/admin/exams' },
        { title: 'Edit Ujian', href: `/admin/exams/${exam.id}/edit` },
    ];

    const toggleQuestion = (questionId: number) => {
        const exists = data.questions.find((q) => q.id === questionId);

        if (exists) {
            setData(
                'questions',
                data.questions.filter((q) => q.id !== questionId),
            );
        } else {
            setData('questions', [
                ...data.questions,
                {
                    id: questionId,
                    position: data.questions.length + 1,
                    score_override: null,
                    shuffle_choices: false,
                },
            ]);
        }
    };

    const isSelected = (id: number) => data.questions.some((q) => q.id === id);

    const updateQuestionField = (
        questionId: number,
        field: 'position' | 'score_override' | 'shuffle_choices',
        value: number | boolean | null,
    ) => {
        const updated = data.questions.map((q) =>
            q.id === questionId ? { ...q, [field]: value } : q,
        );
        setData('questions', updated);
    };

    const { flash } = usePage<{ flash: { success?: string; error?: string } }>()
        .props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Ujian" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <h1 className="mb-6 text-2xl font-semibold">Edit Ujian</h1>

                <form
                    onSubmit={submit}
                    className="max-w-screen space-y-6 rounded-xl border bg-card p-6"
                >
                    {/* Basic Info */}
                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Judul Ujian
                        </label>
                        <input
                            type="text"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            className="w-full rounded-lg border px-3 py-2 text-sm"
                        />
                        {errors.title && (
                            <p className="text-xs text-red-500">
                                {errors.title}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Deskripsi Ujian
                        </label>
                        <textarea
                            value={data.description ?? ''}
                            onChange={(e) =>
                                setData('description', e.target.value)
                            }
                            className="w-full rounded-lg border px-3 py-2 text-sm"
                        />
                        {errors.description && (
                            <p className="text-xs text-red-500">
                                {errors.description}
                            </p>
                        )}
                    </div>

                    {/* Waktu & Token */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Mulai pada
                            </label>
                            <input
                                type="datetime-local"
                                value={data.start_at}
                                onChange={(e) =>
                                    setData('start_at', e.target.value)
                                }
                                className="w-full rounded-lg border px-3 py-2 text-sm"
                            />
                            {errors.start_at && (
                                <p className="text-xs text-red-500">
                                    {errors.start_at}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Berakhir pada
                            </label>
                            <input
                                type="datetime-local"
                                value={data.end_at}
                                onChange={(e) =>
                                    setData('end_at', e.target.value)
                                }
                                className="w-full rounded-lg border px-3 py-2 text-sm"
                            />
                            {errors.end_at && (
                                <p className="text-xs text-red-500">
                                    {errors.end_at}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Durasi (menit)
                            </label>
                            <input
                                type="number"
                                value={data.duration_minutes}
                                onChange={(e) =>
                                    setData(
                                        'duration_minutes',
                                        Number(e.target.value),
                                    )
                                }
                                className="w-full rounded-lg border px-3 py-2 text-sm"
                            />
                            {errors.duration_minutes && (
                                <p className="text-xs text-red-500">
                                    {errors.duration_minutes}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Token
                            </label>
                            <input
                                type="text"
                                value={data.token ?? ''}
                                onChange={(e) =>
                                    setData('token', e.target.value)
                                }
                                className="w-full rounded-lg border px-3 py-2 text-sm"
                            />
                            {errors.token && (
                                <p className="text-xs text-red-500">
                                    {errors.token}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Bank Soal */}
                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Bank Soal
                        </label>
                        <select
                            value={data.question_bank_id ?? ''}
                            onChange={(e) =>
                                setData(
                                    'question_bank_id',
                                    e.target.value
                                        ? Number(e.target.value)
                                        : '',
                                )
                            }
                            className="w-full rounded-lg border px-3 py-2 text-sm"
                        >
                            <option value="">Pilih Bank Soal</option>
                            {banks.map((bank) => (
                                <option key={bank.id} value={bank.id}>
                                    {bank.title}
                                </option>
                            ))}
                        </select>
                        {errors.question_bank_id && (
                            <p className="text-xs text-red-500">
                                {errors.question_bank_id}
                            </p>
                        )}
                    </div>

                    {/* Pilih Soal & Detail Soal */}
                    <div className="grid gap-4 lg:grid-cols-2">
                        {/* List soal dari bank */}
                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Pilih Soal untuk Ujian
                            </label>
                            <div className="max-h-72 space-y-2 overflow-y-auto rounded-lg border p-3 text-sm">
                                {available_questions.length === 0 && (
                                    <p className="text-xs text-muted-foreground">
                                        Tidak ada soal di bank ini.
                                    </p>
                                )}

                                {available_questions.map((q) => (
                                    <label
                                        key={q.id}
                                        className="flex cursor-pointer items-start gap-2 rounded-md p-2 hover:bg-muted"
                                    >
                                        <input
                                            type="checkbox"
                                            className="mt-1"
                                            checked={isSelected(q.id)}
                                            onChange={() =>
                                                toggleQuestion(q.id)
                                            }
                                        />
                                        <div>
                                            <div className="font-medium">
                                                {q.text}
                                            </div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                            {errors.questions && (
                                <p className="text-xs text-red-500">
                                    {errors.questions}
                                </p>
                            )}
                        </div>

                        {/* Detail soal yang terpilih */}
                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Urutan & Skor Soal yang Terpilih
                            </label>

                            {data.questions.length === 0 ? (
                                <p className="text-xs text-muted-foreground">
                                    Belum ada soal yang dipilih.
                                </p>
                            ) : (
                                <div className="overflow-x-auto rounded-lg border">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-muted">
                                            <tr>
                                                <th className="px-3 py-2">#</th>
                                                <th className="px-3 py-2">
                                                    ID Soal
                                                </th>
                                                <th className="px-3 py-2">
                                                    Posisi
                                                </th>
                                                <th className="px-3 py-2">
                                                    Skor Override
                                                </th>
                                                <th className="px-3 py-2">
                                                    Acak Pilihan?
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data.questions.map((q, index) => (
                                                <tr
                                                    key={q.id}
                                                    className="border-t"
                                                >
                                                    <td className="px-3 py-2">
                                                        {index + 1}
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        {q.id}
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <input
                                                            type="number"
                                                            className="w-20 rounded border px-2 py-1 text-xs"
                                                            value={
                                                                q.position ??
                                                                index + 1
                                                            }
                                                            onChange={(e) =>
                                                                updateQuestionField(
                                                                    q.id,
                                                                    'position',
                                                                    Number(
                                                                        e.target
                                                                            .value,
                                                                    ),
                                                                )
                                                            }
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <input
                                                            type="number"
                                                            className="w-24 rounded border px-2 py-1 text-xs"
                                                            value={
                                                                q.score_override ??
                                                                ''
                                                            }
                                                            onChange={(e) => {
                                                                const val =
                                                                    e.target
                                                                        .value ===
                                                                    ''
                                                                        ? null
                                                                        : Number(
                                                                              e
                                                                                  .target
                                                                                  .value,
                                                                          );
                                                                updateQuestionField(
                                                                    q.id,
                                                                    'score_override',
                                                                    val,
                                                                );
                                                            }}
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={
                                                                q.shuffle_choices
                                                            }
                                                            onChange={(e) =>
                                                                updateQuestionField(
                                                                    q.id,
                                                                    'shuffle_choices',
                                                                    e.target
                                                                        .checked,
                                                                )
                                                            }
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>

                    {flash.success && (
                        <div className="mb-4 rounded-md bg-green-100 p-3 text-sm text-green-800">
                            {flash.success}
                        </div>
                    )}

                    {flash.error && (
                        <div className="mb-4 rounded-md bg-red-100 p-3 text-sm text-red-800">
                            {flash.error}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Menyimpan...' : 'Simpan Ujian'}
                        </Button>

                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => window.history.back()}
                        >
                            Batal
                        </Button>

                        <DeleteExamButton exam={exam} />
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
