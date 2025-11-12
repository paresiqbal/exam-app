import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';

// ---- Types (no `any`) ----
interface Exam {
    id: number;
    title: string;
}

interface Option {
    id: number;
    label?: string | null;
    option_text?: string | null;
    is_correct: boolean;
    position: number;
}

type QuestionType = 'multi_select' | 'true_false';

interface Question {
    id: number;
    exam_id: number;
    question_text: string;
    type: QuestionType;
    max_score: number;
    min_score: number;
    min_select?: number | null;
    max_select?: number | null;
    shuffle_options: boolean;
    correct_answer_bool?: boolean | null;
    image_path?: string | null;
    options?: Option[];
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Paginated<T> {
    data: T[];
    links: PaginationLink[];
}

interface Props {
    exam: Exam;
    questions: Paginated<Question>;
}

export default function Index({ exam, questions }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Ujian', href: '/admin/exams' },
        { title: exam.title, href: `/admin/exams` },
        { title: 'Pertanyaan', href: `/admin/exams/${exam.id}/questions` },
    ];

    const onDelete = (id: number) => {
        if (!confirm('Hapus pertanyaan ini?')) return;
        router.delete(`/admin/exams/${exam.id}/questions/${id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Pertanyaan — ${exam.title}`} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="mb-2 flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">
                        Pertanyaan — {exam.title}
                    </h1>
                    <Link href={`/admin/exams/${exam.id}/questions/create`}>
                        <Button>+ Buat Pertanyaan</Button>
                    </Link>
                </div>

                <div className="overflow-hidden rounded-xl border bg-card">
                    {questions.data.length === 0 ? (
                        <div className="p-6 text-sm text-neutral-500">
                            Belum ada pertanyaan untuk ujian ini.
                        </div>
                    ) : (
                        <ul className="divide-y">
                            {questions.data.map((q) => (
                                <li
                                    key={q.id}
                                    className="flex items-center justify-between gap-4 p-4"
                                >
                                    <div className="min-w-0">
                                        <div className="truncate font-medium">
                                            {q.question_text}
                                        </div>
                                        <div className="mt-1 text-xs text-neutral-500">
                                            Tipe:{' '}
                                            {q.type === 'multi_select'
                                                ? 'Pilihan Ganda'
                                                : 'Benar/Salah'}{' '}
                                            · Skor: {q.max_score} · Opsi:{' '}
                                            {q.options?.length ?? 0}
                                        </div>
                                    </div>
                                    <div className="flex shrink-0 gap-2">
                                        <Link
                                            href={`/admin/exams/${exam.id}/questions/${q.id}/edit`}
                                        >
                                            <Button variant="secondary">
                                                Ubah
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="destructive"
                                            onClick={() => onDelete(q.id)}
                                        >
                                            Hapus
                                        </Button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Pagination */}
                {questions.links?.length > 0 && (
                    <nav className="flex flex-wrap gap-2">
                        {questions.links.map((l, i) => (
                            <Link
                                key={`${l.label}-${i}`}
                                href={l.url ?? '#'}
                                className={`rounded-md px-3 py-1 text-sm ${
                                    l.active
                                        ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                                        : 'border'
                                } ${!l.url ? 'pointer-events-none opacity-50' : ''}`}
                                // labels from Laravel include «, », &nbsp; etc.
                                dangerouslySetInnerHTML={{ __html: l.label }}
                            />
                        ))}
                    </nav>
                )}
            </div>
        </AppLayout>
    );
}
