// layout
import AppLayout from '@/layouts/app-layout';

// inertia
import { Head, Link } from '@inertiajs/react';

// types
import { type BreadcrumbItem } from '@/types';

export default function Index() {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Ujian', href: '/admin/exams' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Ujian" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="mb-4 flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Ujian</h1>
                    <Link
                        href="/admin/exams/create"
                        className="rounded border bg-orange-400 px-3 py-2 text-sm font-bold"
                    >
                        Buat Ujian
                    </Link>
                </div>

                <div>Daftar Ujian</div>
            </div>
        </AppLayout>
    );
}
