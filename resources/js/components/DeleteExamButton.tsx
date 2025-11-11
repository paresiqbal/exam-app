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
import { router } from '@inertiajs/react';
import { useState } from 'react';

interface DeleteExamButtonProps {
    exam: {
        id: number;
        title: string;
        description: string | null;
        token?: string | null;
        start_at: string;
        end_at: string;
        duration_minutes: number;
        status?: string | null;
    };
}

export default function DeleteExamButton({ exam }: DeleteExamButtonProps) {
    const [open, setOpen] = useState(false);

    const handleDelete = () => {
        router.delete(`/admin/exams/${exam.id}`, {
            onSuccess: () => setOpen(false),
        });
    };

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button variant="destructive">Hapus Ujian</Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Tindakan ini tidak dapat dibatalkan. Ini akan menghapus
                        secara permanen <strong>{exam.title}</strong> dan data
                        terkait.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction
                        className="bg-red-900 text-white"
                        onClick={handleDelete}
                    >
                        Ya, hapus Ujian
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
