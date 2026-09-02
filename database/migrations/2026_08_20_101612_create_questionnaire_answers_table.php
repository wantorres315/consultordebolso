<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('questionnaire_answers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('response_id')->constrained('questionnaire_responses')->cascadeOnDelete();
            $table->foreignId('question_id')->constrained('questionnaire_questions')->cascadeOnDelete();
            $table->json('value')->nullable();
            $table->timestamps();

            $table->unique(['response_id', 'question_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('questionnaire_answers');
    }
};
