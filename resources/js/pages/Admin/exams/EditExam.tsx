import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import React from 'react';

type Exam = {
    id: number;
    title: string;
    description: string | null;
    token: string | null;
    start_at: string;
    end_at: string;
    duration_minutes: number;
};

type PageProps = {
    exam: Exam;
};

function formatDateTimeLocal(value: string): string {
    if (!value) return '';
    return value.slice(0, 16);
}

export default function EditExam() {
    const { exam } = usePage<PageProps>().props;

    const { data, setData, put, processing, errors } = useForm({
        title: exam.title ?? '',
        description: exam.description ?? '',
        token: exam.token ?? '',
        start_at: formatDateTimeLocal(exam.start_at),
        end_at: formatDateTimeLocal(exam.end_at),
        duration_minutes: exam.duration_minutes ?? 60,
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Ujian" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <h1 className="mb-6 text-2xl font-semibold">Edit Ujian</h1>
                <form
                    onSubmit={submit}
                    className="max-w-screen space-y-5 rounded-xl border bg-card p-6"
                >
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
                            value={data.description}
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
                                value={data.token}
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

                    <div className="flex gap-3">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Menyimpan...' : 'Simpan Ujian'}
                        </Button>
                        <Button variant="secondary">Batal</Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
