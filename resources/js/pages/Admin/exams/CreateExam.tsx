import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import React from 'react';

type QuestionBank = {
    id: number;
    title: string;
    description?: string | null;
};

type PageProps = {
    banks: QuestionBank[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin/dashboard' },
    { title: 'Ujian', href: '/admin/exams' },
    { title: 'Buat Ujian', href: '/admin/exams/create' },
];

export default function CreateExam() {
    const { banks } = usePage<PageProps>().props;

    const { data, setData, post, processing, errors } = useForm({
        question_bank_id: '' as string | number,
        title: '',
        description: '',
        token: '',
        start_at: '',
        end_at: '',
        duration_minutes: 60,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/exams');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Buat Ujian" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold">Buat Ujian Baru</h1>
                    <Button variant="outline" asChild>
                        <Link href="/admin/exams">Kembali ke daftar</Link>
                    </Button>
                </div>

                <Card className="max-w-2xl border border-sidebar-border/70 dark:border-sidebar-border">
                    <CardHeader>
                        <CardTitle>Informasi Ujian</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-4">
                            {/* Bank Soal */}
                            <div className="space-y-1">
                                <label className="text-sm font-medium">
                                    Bank Soal
                                </label>
                                <select
                                    className="w-full rounded-lg border px-3 py-2 text-sm"
                                    value={data.question_bank_id}
                                    onChange={(e) =>
                                        setData(
                                            'question_bank_id',
                                            e.target.value,
                                        )
                                    }
                                >
                                    <option value="">
                                        -- Pilih bank soal --
                                    </option>
                                    {banks.map((bank) => (
                                        <option key={bank.id} value={bank.id}>
                                            {bank.title}
                                        </option>
                                    ))}
                                </select>
                                {errors.question_bank_id && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.question_bank_id}
                                    </p>
                                )}
                            </div>

                            {/* Judul */}
                            <div className="space-y-1">
                                <label className="text-sm font-medium">
                                    Judul Ujian
                                </label>
                                <Input
                                    value={data.title}
                                    onChange={(e) =>
                                        setData('title', e.target.value)
                                    }
                                    placeholder="Contoh: Ujian Masuk Gelombang 1"
                                />
                                {errors.title && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.title}
                                    </p>
                                )}
                            </div>

                            {/* Deskripsi */}
                            <div className="space-y-1">
                                <label className="text-sm font-medium">
                                    Deskripsi
                                </label>
                                <Textarea
                                    value={data.description}
                                    onChange={(e) =>
                                        setData('description', e.target.value)
                                    }
                                    placeholder="Deskripsi singkat ujian (opsional)"
                                    rows={4}
                                />
                                {errors.description && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.description}
                                    </p>
                                )}
                            </div>

                            {/* Waktu */}
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">
                                        Mulai pada
                                    </label>
                                    <Input
                                        type="datetime-local"
                                        value={data.start_at}
                                        onChange={(e) =>
                                            setData('start_at', e.target.value)
                                        }
                                    />
                                    {errors.start_at && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {errors.start_at}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-medium">
                                        Berakhir pada
                                    </label>
                                    <Input
                                        type="datetime-local"
                                        value={data.end_at}
                                        onChange={(e) =>
                                            setData('end_at', e.target.value)
                                        }
                                    />
                                    {errors.end_at && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {errors.end_at}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Durasi & Token */}
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">
                                        Durasi (menit)
                                    </label>
                                    <Input
                                        type="number"
                                        value={data.duration_minutes}
                                        onChange={(e) =>
                                            setData(
                                                'duration_minutes',
                                                Number(e.target.value),
                                            )
                                        }
                                        min={1}
                                    />
                                    {errors.duration_minutes && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {errors.duration_minutes}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-medium">
                                        Token Ujian (opsional)
                                    </label>
                                    <Input
                                        value={data.token}
                                        onChange={(e) =>
                                            setData('token', e.target.value)
                                        }
                                        placeholder="Contoh: TRYOUT-2025"
                                    />
                                    {errors.token && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {errors.token}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={processing}
                                className="w-full"
                            >
                                {processing ? 'Menyimpan...' : 'Buat Ujian'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
