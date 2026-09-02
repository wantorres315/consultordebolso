<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('questionnaire_sections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('questionnaire_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('objective')->nullable();
            $table->unsignedInteger('position')->default(0);
            $table->timestamps();

            $table->index(['questionnaire_id', 'position']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('questionnaire_sections');
    }
};
