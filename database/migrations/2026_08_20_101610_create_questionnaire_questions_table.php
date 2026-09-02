<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('questionnaire_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('section_id')->constrained('questionnaire_sections')->cascadeOnDelete();
            $table->text('prompt');
            $table->text('help_text')->nullable();
            $table->string('type');
            $table->json('options')->nullable();
            $table->boolean('allow_other')->default(false);
            $table->boolean('is_required')->default(true);
            $table->unsignedInteger('position')->default(0);
            $table->timestamps();

            $table->index(['section_id', 'position']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('questionnaire_questions');
    }
};
