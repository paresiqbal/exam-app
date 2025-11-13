// resources/js/Pages/teacher/questions/CreateQuestionBank.tsx
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Teacher Dashboard', href: '/teacher/dashboard' },
    { title: 'Question Banks', href: '/teacher/question-banks' },
    { title: 'Create Question Bank', href: '/teacher/question-banks/create' },
];

export default function CreateQuestionBank() {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        // 🔥 THIS is the important line:
        post('/teacher/question-banks'); // NOT /create
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Question Bank" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold">
                        Create Question Bank
                    </h1>
                    <Button variant="outline" asChild>
                        <Link href="/teacher/question-banks">Back to list</Link>
                    </Button>
                </div>

                <Card className="max-w-xl border border-sidebar-border/70 dark:border-sidebar-border">
                    <CardHeader>
                        <CardTitle>New Question Bank</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium">
                                    Title
                                </label>
                                <Input
                                    value={data.title}
                                    onChange={(e) =>
                                        setData('title', e.target.value)
                                    }
                                    placeholder="e.g. Bank Soal Matematika Kelas 10"
                                />
                                {errors.title && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.title}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium">
                                    Description
                                </label>
                                <Textarea
                                    value={data.description}
                                    onChange={(e) =>
                                        setData('description', e.target.value)
                                    }
                                    placeholder="Deskripsi singkat (opsional)"
                                    rows={4}
                                />
                                {errors.description && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.description}
                                    </p>
                                )}
                            </div>

                            <Button
                                type="submit"
                                disabled={processing}
                                className="w-full"
                            >
                                {processing ? 'Saving...' : 'Create Bank'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
