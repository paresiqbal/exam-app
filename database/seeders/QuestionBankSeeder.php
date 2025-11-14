<?php

namespace Database\Seeders;

use App\Models\QuestionBank;
use App\Models\Question;
use App\Models\User;
use Illuminate\Database\Seeder;

class QuestionBankSeeder extends Seeder
{
    public function run(): void
    {
        $owner = User::where('role', 'admin')->first() ?? User::first();

        if (! $owner) {
            echo "No user found, skipping QuestionBankSeeder.\n";
            return;
        }

        // BUAT 1 BANK SOAL
        $bank = QuestionBank::updateOrCreate(
            ['title' => 'Bank Soal UTBK'],
            [
                'description' => 'Kumpulan soal try out untuk latihan.',
                'owner_id'    => $owner->id,
            ]
        );

        // BERSIHKAN SOAL LAMA
        Question::where('question_bank_id', $bank->id)->delete();

        // 10 SOAL
        $sampleQuestions = [
            'Berapakah hasil dari 12 + 27?',
            'Siapa penemu lampu pijar?',
            'Apa ibu kota negara Jepang?',
            'Hewan berikut yang termasuk mamalia adalah?',
            'Bilangan prima terkecil adalah?',
            'Bahasa pemrograman apa yang digunakan Laravel?',
            'Apa fungsi utama CPU?',
            'Proses fotosintesis terjadi pada bagian?',
            'Planet terbesar di tata surya adalah?',
            'Siapa presiden pertama Indonesia?',
        ];

        foreach ($sampleQuestions as $prompt) {
            Question::create([
                'question_bank_id' => $bank->id,
                'author_id'        => $owner->id,

                // Your REAL schema fields:
                'prompt'           => $prompt,
                'type'             => 'mcq',
                'max_score'        => 1,
                'correct_boolean'  => null,
                'image_path'       => null,
            ]);
        }

        echo "QuestionBank & 10 Questions seeded successfully.\n";
    }
}
