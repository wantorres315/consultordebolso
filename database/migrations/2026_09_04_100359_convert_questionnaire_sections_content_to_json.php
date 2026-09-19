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
        Schema::table('questionnaire_sections', function (Blueprint $table) {
            $table->json('title_i18n')->nullable()->after('title');
            $table->json('objective_i18n')->nullable()->after('objective');
        });

        DB::table('questionnaire_sections')->orderBy('id')->chunkById(100, function ($rows) {
            foreach ($rows as $row) {
                DB::table('questionnaire_sections')->where('id', $row->id)->update([
                    'title_i18n' => json_encode(['pt_BR' => $row->title], JSON_UNESCAPED_UNICODE),
                    'objective_i18n' => $row->objective !== null
                        ? json_encode(['pt_BR' => $row->objective], JSON_UNESCAPED_UNICODE)
                        : null,
                ]);
            }
        });

        Schema::table('questionnaire_sections', function (Blueprint $table) {
            $table->dropColumn(['title', 'objective']);
        });

        DB::statement('ALTER TABLE questionnaire_sections RENAME COLUMN title_i18n TO title');
        DB::statement('ALTER TABLE questionnaire_sections RENAME COLUMN objective_i18n TO objective');
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
        Schema::table('questionnaire_sections', function (Blueprint $table) {
            $table->string('title_plain')->nullable()->after('title');
            $table->text('objective_plain')->nullable()->after('objective');
        });

        DB::table('questionnaire_sections')->orderBy('id')->chunkById(100, function ($rows) {
            foreach ($rows as $row) {
                $title = json_decode($row->title, true)['pt_BR'] ?? '';
                $objective = $row->objective !== null
                    ? (json_decode($row->objective, true)['pt_BR'] ?? null)
                    : null;

                DB::table('questionnaire_sections')->where('id', $row->id)->update([
                    'title_plain' => $title,
                    'objective_plain' => $objective,
                ]);
            }
        });

        Schema::table('questionnaire_sections', function (Blueprint $table) {
            $table->dropColumn(['title', 'objective']);
        });

        DB::statement('ALTER TABLE questionnaire_sections RENAME COLUMN title_plain TO title');
        DB::statement('ALTER TABLE questionnaire_sections RENAME COLUMN objective_plain TO objective');
    }
};
