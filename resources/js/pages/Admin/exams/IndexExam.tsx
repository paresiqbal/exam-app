import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';

type Exam = {
    id: number;
    title: string;
    description?: string | null;
    token: string | null;
    start_at: string;
    end_at: string;
    duration_minutes: number;
    status: 'upcoming' | 'running' | 'finished';
    attempts_count: number;
};

type ExamsPagination = {
    data: Exam[];
};

type PageProps = {
    exams: ExamsPagination;
};

function formatDateTime(value: string) {
    if (!value) return '-';
    return new Date(value).toLocaleString();
}

export default function IndexExam() {
    const { exams } = usePage<PageProps>().props;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Ujian', href: '/admin/exams' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Daftar Ujian" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="mb-4 flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Daftar Ujian</h1>

                    <Button asChild>
                        <Link href="/admin/exams/create">Buat Ujian</Link>
                    </Button>
                </div>

                <div className="overflow-x-auto rounded-xl border bg-card p-4">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="border-b text-left text-xs text-muted-foreground uppercase">
                                <th className="py-2 pr-4">Judul</th>
                                <th className="py-2 pr-4">Mulai</th>
                                <th className="py-2 pr-4">Berakhir</th>
                                <th className="py-2 pr-4">Durasi</th>
                                <th className="py-2 pr-4">Status</th>
                                <th className="py-2 pr-4">Participant</th>
                                <th className="py-2 pr-4">Token</th>
                                <th className="py-2 pr-0 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {exams.data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="py-6 text-center text-sm text-muted-foreground"
                                    >
                                        Belum ada ujian.
                                    </td>
                                </tr>
                            )}

                            {exams.data.map((exam) => (
                                <tr
                                    key={exam.id}
                                    className="border-b last:border-0"
                                >
                                    <td className="py-2 pr-4 align-top">
                                        <div className="font-medium">
                                            {exam.title}
                                        </div>
                                        {exam.description && (
                                            <div className="line-clamp-2 text-xs text-muted-foreground">
                                                {exam.description}
                                            </div>
                                        )}
                                    </td>
                                    <td className="py-2 pr-4 align-top">
                                        {formatDateTime(exam.start_at)}
                                    </td>
                                    <td className="py-2 pr-4 align-top">
                                        {formatDateTime(exam.end_at)}
                                    </td>
                                    <td className="py-2 pr-4 align-top">
                                        {exam.duration_minutes} menit
                                    </td>
                                    <td className="py-2 pr-4 align-top">
                                        {exam.status === 'running' && (
                                            <span className="rounded bg-green-100 px-2 py-1 text-xs text-green-700">
                                                Sedang Berlangsung
                                            </span>
                                        )}
                                        {exam.status === 'upcoming' && (
                                            <span className="rounded bg-yellow-100 px-2 py-1 text-xs text-yellow-700">
                                                Belum Mulai
                                            </span>
                                        )}
                                        {exam.status === 'finished' && (
                                            <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700">
                                                Selesai
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-2 pr-4 align-top">
                                        {exam.attempts_count} peserta
                                    </td>
                                    <td className="py-2 pr-4 align-top">
                                        {exam.token || (
                                            <span className="text-xs text-muted-foreground">
                                                -
                                            </span>
                                        )}
                                    </td>
                                    <td className="space-x-2 py-2 pr-0 text-right align-top">
                                        <Button
                                            asChild
                                            size="sm"
                                            variant="outline"
                                        >
                                            <Link
                                                href={`/admin/exams/${exam.id}`}
                                            >
                                                Detail
                                            </Link>
                                        </Button>

                                        {/* Edit */}
                                        <Button
                                            asChild
                                            size="sm"
                                            variant="outline"
                                        >
                                            <Link
                                                href={`/admin/exams/${exam.id}/edit`}
                                            >
                                                Edit
                                            </Link>
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
