import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

type AttemptExam = {
    id: number;
    title: string;
    description: string | null;
    duration_minutes: number;
};

type Attempt = {
    id: number;
    exam_id: number;
    started_at: string | null;
    finished_at: string | null;
    score: number | null;
    passed: boolean;
    exam: AttemptExam;
};

type PageProps = {
    attempt: Attempt;
};

export default function ShowAttempt({ attempt }: PageProps) {
    return (
        <AppLayout>
            <Head title={`Ujian: ${attempt.exam.title}`} />

            <div className="space-y-4 p-4">
                <h1 className="text-2xl font-semibold">{attempt.exam.title}</h1>

                {attempt.exam.description && (
                    <p className="text-sm text-muted-foreground">
                        {attempt.exam.description}
                    </p>
                )}

                <div className="text-xs text-muted-foreground">
                    Durasi: {attempt.exam.duration_minutes} menit <br />
                    Mulai: {attempt.started_at ?? '-'} <br />
                    {attempt.finished_at && <>Selesai: {attempt.finished_at}</>}
                </div>

                <div className="rounded-lg border bg-card p-4 text-sm">
                    <p>
                        Kamu berhasil masuk ujian menggunakan token! 🎉 <br />
                        Halaman ini masih kosong — nanti kita isi sistem soal
                        1-per-1, timer, navigasi, dan submit jawaban.
                    </p>
                </div>
            </div>
        </AppLayout>
    );
}
