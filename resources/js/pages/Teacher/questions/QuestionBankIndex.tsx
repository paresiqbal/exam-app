import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';

interface QuestionBank {
    id: number;
    title: string;
    description?: string | null;
    questions_count: number;
    created_at: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Props {
    banks: {
        data: QuestionBank[];
        links: PaginationLink[];
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard Guru', href: dashboard().url },
    { title: 'Bank Soal', href: '/teacher/question-banks' },
];

export default function QuestionBankIndex({ banks }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Bank Soal" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold">Bank Soal</h1>
                    <Button asChild>
                        <Link href="/teacher/question-banks/create">
                            Buat Bank Soal Baru
                        </Link>
                    </Button>
                </div>

                <Card className="border border-sidebar-border/70 dark:border-sidebar-border">
                    <CardHeader>
                        <CardTitle>Bank Soal Anda</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {banks.data.length === 0 && (
                            <div className="rounded-lg border border-dashed border-sidebar-border/70 p-6 text-center text-sm text-muted-foreground">
                                Kamu belum punya bank soal.
                            </div>
                        )}

                        <div className="space-y-2">
                            {banks.data.map((bank) => (
                                <div
                                    key={bank.id}
                                    className="flex items-center justify-between rounded-lg border border-sidebar-border/70 bg-background/60 p-3 hover:bg-muted/40 dark:border-sidebar-border"
                                >
                                    <div className="space-y-1">
                                        <div className="font-medium">
                                            {bank.title}
                                        </div>
                                        {bank.description && (
                                            <p className="line-clamp-2 text-xs text-muted-foreground">
                                                {bank.description}
                                            </p>
                                        )}
                                        <p className="text-[11px] text-muted-foreground">
                                            {bank.questions_count} questions •
                                            created at{' '}
                                            {new Date(
                                                bank.created_at,
                                            ).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        {/* View / Open */}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            asChild
                                        >
                                            <Link
                                                href={`/teacher/question-banks/${bank.id}`}
                                            >
                                                Open
                                            </Link>
                                        </Button>

                                        {/* Delete with modal */}
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="sm"
                                                >
                                                    Delete
                                                </Button>
                                            </AlertDialogTrigger>

                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>
                                                        Delete this question
                                                        bank?
                                                    </AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be
                                                        undone. The bank &quot;
                                                        {bank.title}&quot; will
                                                        be deleted. You can only
                                                        delete a bank that has
                                                        no questions.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>
                                                        Cancel
                                                    </AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => {
                                                            router.delete(
                                                                `/teacher/question-banks/${bank.id}`,
                                                                {
                                                                    preserveScroll: true,
                                                                },
                                                            );
                                                        }}
                                                    >
                                                        Delete
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {banks.links.length > 1 && (
                            <div className="flex flex-wrap gap-2 pt-2">
                                {banks.links.map((link, i) => (
                                    <Button
                                        key={i}
                                        variant={
                                            link.active ? 'default' : 'outline'
                                        }
                                        size="sm"
                                        disabled={!link.url}
                                        asChild
                                    >
                                        {link.url ? (
                                            <Link
                                                href={link.url}
                                                preserveScroll
                                            >
                                                <span
                                                    dangerouslySetInnerHTML={{
                                                        __html: link.label,
                                                    }}
                                                />
                                            </Link>
                                        ) : (
                                            <span
                                                dangerouslySetInnerHTML={{
                                                    __html: link.label,
                                                }}
                                            />
                                        )}
                                    </Button>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
