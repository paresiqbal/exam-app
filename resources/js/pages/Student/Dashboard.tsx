import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import React from 'react';

type JoinFormData = {
    token: string;
};

export default function StudentDashboard() {
    const { data, setData, post, processing, errors } = useForm<JoinFormData>({
        token: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/student/exams/join');
    };

    return (
        <AppLayout>
            <Head title="Dashboard Siswa" />

            <div className="p-4">
                <h1 className="mb-4 text-2xl font-semibold">Dashboard Siswa</h1>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Kartu Masuk Ujian */}
                    <div className="rounded-xl border bg-card p-6">
                        <h2 className="text-lg font-semibold">
                            Masuk Ujian dengan Token
                        </h2>
                        <p className="mt-1 mb-4 text-xs text-muted-foreground">
                            Masukkan token ujian yang diberikan oleh pengawas /
                            guru untuk mulai ujian.
                        </p>

                        <form onSubmit={submit} className="space-y-3">
                            <div>
                                <label className="mb-1 block text-sm font-medium">
                                    Token Ujian
                                </label>
                                <input
                                    type="text"
                                    value={data.token}
                                    onChange={(e) =>
                                        setData('token', e.target.value)
                                    }
                                    className="w-full rounded-lg border px-3 py-2 text-sm tracking-[0.2em] uppercase"
                                    placeholder="MISAL: ABC123"
                                />
                                {errors.token && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.token}
                                    </p>
                                )}
                            </div>

                            <Button type="submit" disabled={processing}>
                                {processing ? 'Memproses...' : 'Masuk Ujian'}
                            </Button>
                        </form>
                    </div>

                    {/* Kartu lain misalnya info universitas, dsb (nanti) */}
                    <div className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">
                        <p>
                            Di sini nanti bisa kamu isi daftar universitas,
                            jurusan, dan minimal nilai. Untuk sekarang bisa
                            dikosongkan dulu.
                        </p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
