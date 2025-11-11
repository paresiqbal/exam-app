import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';

// types
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
        post('/exams');
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Exams', href: '/admin/exams' },
        { title: 'Create', href: '/admin/exams/create' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Exam" />

            <h1 className="mb-6 text-2xl font-semibold">Create Exam</h1>

            <form
                onSubmit={submit}
                className="max-w-xl space-y-5 rounded-xl border bg-card p-6"
            >
                {/* Title */}
                <div>
                    <label className="mb-1 block text-sm font-medium">
                        Title
                    </label>
                    <input
                        type="text"
                        value={data.title}
                        onChange={(e) => setData('title', e.target.value)}
                        className="w-full rounded-lg border px-3 py-2 text-sm"
                    />
                    {errors.title && (
                        <p className="text-xs text-red-500">{errors.title}</p>
                    )}
                </div>

                {/* Description */}
                <div>
                    <label className="mb-1 block text-sm font-medium">
                        Description
                    </label>
                    <textarea
                        value={data.description}
                        onChange={(e) => setData('description', e.target.value)}
                        className="w-full rounded-lg border px-3 py-2 text-sm"
                    />
                    {errors.description && (
                        <p className="text-xs text-red-500">
                            {errors.description}
                        </p>
                    )}
                </div>

                {/* Date & Time */}
                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Start at
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
                            End at
                        </label>
                        <input
                            type="datetime-local"
                            value={data.end_at}
                            onChange={(e) => setData('end_at', e.target.value)}
                            className="w-full rounded-lg border px-3 py-2 text-sm"
                        />
                        {errors.end_at && (
                            <p className="text-xs text-red-500">
                                {errors.end_at}
                            </p>
                        )}
                    </div>
                </div>

                {/* Duration & Token */}
                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Duration (minutes)
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
                            Token (optional)
                        </label>
                        <input
                            type="text"
                            value={data.token}
                            onChange={(e) => setData('token', e.target.value)}
                            className="w-full rounded-lg border px-3 py-2 text-sm"
                        />
                        {errors.token && (
                            <p className="text-xs text-red-500">
                                {errors.token}
                            </p>
                        )}
                    </div>
                </div>

                {/* Submit / Cancel */}
                <div className="flex gap-3">
                    <button
                        type="submit"
                        disabled={processing}
                        className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
                    >
                        {processing ? 'Saving...' : 'Save Exam'}
                    </button>
                    <Link
                        href="/exams"
                        className="text-sm text-muted-foreground hover:underline"
                    >
                        Cancel
                    </Link>
                </div>
            </form>
        </AppLayout>
    );
}
