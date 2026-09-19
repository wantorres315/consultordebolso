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
        Schema::table('questionnaires', function (Blueprint $table) {
            $table->json('title_i18n')->nullable()->after('title');
            $table->json('description_i18n')->nullable()->after('description');
        });

        DB::table('questionnaires')->orderBy('id')->chunkById(100, function ($rows) {
            foreach ($rows as $row) {
                DB::table('questionnaires')->where('id', $row->id)->update([
                    'title_i18n' => json_encode(['pt_BR' => $row->title], JSON_UNESCAPED_UNICODE),
                    'description_i18n' => $row->description !== null
                        ? json_encode(['pt_BR' => $row->description], JSON_UNESCAPED_UNICODE)
                        : null,
                ]);
            }
        });

        Schema::table('questionnaires', function (Blueprint $table) {
            $table->dropColumn(['title', 'description']);
        });

        DB::statement('ALTER TABLE questionnaires RENAME COLUMN title_i18n TO title');
        DB::statement('ALTER TABLE questionnaires RENAME COLUMN description_i18n TO description');
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
        Schema::table('questionnaires', function (Blueprint $table) {
            $table->string('title_plain')->nullable()->after('title');
            $table->text('description_plain')->nullable()->after('description');
        });

        DB::table('questionnaires')->orderBy('id')->chunkById(100, function ($rows) {
            foreach ($rows as $row) {
                $title = json_decode($row->title, true)['pt_BR'] ?? '';
                $description = $row->description !== null
                    ? (json_decode($row->description, true)['pt_BR'] ?? null)
                    : null;

                DB::table('questionnaires')->where('id', $row->id)->update([
                    'title_plain' => $title,
                    'description_plain' => $description,
                ]);
            }
        });

        Schema::table('questionnaires', function (Blueprint $table) {
            $table->dropColumn(['title', 'description']);
        });

        DB::statement('ALTER TABLE questionnaires RENAME COLUMN title_plain TO title');
        DB::statement('ALTER TABLE questionnaires RENAME COLUMN description_plain TO description');
    }
};
