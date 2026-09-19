<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('questionnaire_questions', function (Blueprint $table) {
            $table->json('prompt_i18n')->nullable()->after('prompt');
            $table->json('help_text_i18n')->nullable()->after('help_text');
        });

        DB::table('questionnaire_questions')->orderBy('id')->chunkById(100, function ($rows) {
            foreach ($rows as $row) {
                DB::table('questionnaire_questions')->where('id', $row->id)->update([
                    'prompt_i18n' => json_encode(['pt_BR' => $row->prompt], JSON_UNESCAPED_UNICODE),
                    'help_text_i18n' => $row->help_text !== null
                        ? json_encode(['pt_BR' => $row->help_text], JSON_UNESCAPED_UNICODE)
                        : null,
                ]);
            }
        });

        Schema::table('questionnaire_questions', function (Blueprint $table) {
            $table->dropColumn(['prompt', 'help_text']);
        });

        DB::statement('ALTER TABLE questionnaire_questions RENAME COLUMN prompt_i18n TO prompt');
        DB::statement('ALTER TABLE questionnaire_questions RENAME COLUMN help_text_i18n TO help_text');
    }

    /**
     * Reverse the migrations.
     *
     * Rollback only recovers the pt_BR value — any en/es translations added
     * after this migration ran are lost, since pt_BR was the sole source of
     * truth beforehand.
     */
    public function down(): void
    {
        Schema::table('questionnaire_questions', function (Blueprint $table) {
            $table->text('prompt_plain')->nullable()->after('prompt');
            $table->text('help_text_plain')->nullable()->after('help_text');
        });

        DB::table('questionnaire_questions')->orderBy('id')->chunkById(100, function ($rows) {
            foreach ($rows as $row) {
                $prompt = json_decode($row->prompt, true)['pt_BR'] ?? '';
                $helpText = $row->help_text !== null
                    ? (json_decode($row->help_text, true)['pt_BR'] ?? null)
                    : null;

                DB::table('questionnaire_questions')->where('id', $row->id)->update([
                    'prompt_plain' => $prompt,
                    'help_text_plain' => $helpText,
                ]);
            }
        });

        Schema::table('questionnaire_questions', function (Blueprint $table) {
            $table->dropColumn(['prompt', 'help_text']);
        });

        DB::statement('ALTER TABLE questionnaire_questions RENAME COLUMN prompt_plain TO prompt');
        DB::statement('ALTER TABLE questionnaire_questions RENAME COLUMN help_text_plain TO help_text');
    }
};
