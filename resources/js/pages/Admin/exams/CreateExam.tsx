import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';

// types
import { Button } from '@/components/ui/button';
import { type BreadcrumbItem } from '@/types';

export default function CreateExam() {
    const { data, setData, post, processing, errors } = useForm({
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

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Ujian', href: '/admin/exams' },
        { title: 'Buat Ujian', href: '/admin/exams/create' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Buat Ujian" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <h1 className="mb-6 text-2xl font-semibold">Buat Ujian</h1>
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
                            {processing ? 'Saving...' : 'Save Exam'}
                        </Button>
                        <Button variant="secondary">Cancel</Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
