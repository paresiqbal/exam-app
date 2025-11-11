import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';

type Exam = {
    id: number;
    title: string;
    description?: string | null;
    token: string | null;
    start_at: string;
    end_at: string;
    duration_minutes: number;
    attempts_count: number;
};

type PageProps = {
    exam: Exam;
};

export default function ShowExam() {
    const { exam } = usePage<PageProps>().props;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Ujian', href: '/admin/exams' },
        { title: exam.title, href: `/admin/exams/${exam.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Detail Ujian - ${exam.title}`} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <h1 className="mb-4 text-2xl font-semibold">
                    Detail Ujian: {exam.title}
                </h1>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2 rounded-xl border bg-card p-4 text-sm">
                        <p>
                            <span className="font-medium">Deskripsi:</span>{' '}
                            {exam.description || '-'}
                        </p>
                        <p>
                            <span className="font-medium">Mulai:</span>{' '}
                            {exam.start_at}
                        </p>
                        <p>
                            <span className="font-medium">Berakhir:</span>{' '}
                            {exam.end_at}
                        </p>
                        <p>
                            <span className="font-medium">Durasi:</span>{' '}
                            {exam.duration_minutes} menit
                        </p>
                        <p>
                            <span className="font-medium">Token:</span>{' '}
                            {exam.token || '-'}
                        </p>
                        <p>
                            <span className="font-medium">Participant:</span>{' '}
                            {exam.attempts_count}
                        </p>
                    </div>

                    <div className="rounded-xl border bg-card p-4 text-sm text-muted-foreground">
                        {/* nanti bisa diisi list peserta, grafik, dsb */}
                        Detail lanjutan (peserta, nilai, dll) nanti kita isi di
                        sini.
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
