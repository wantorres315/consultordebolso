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
        Schema::table('expenses', function (Blueprint $table) {
            $table->foreignId('category_id')->nullable()->after('category')->constrained()->nullOnDelete();
        });

        DB::table('expenses')
            ->whereNotNull('category')
            ->select('category')
            ->distinct()
            ->get()
            ->each(function ($row) {
                $categoryId = DB::table('categories')->insertGetId([
                    'name' => $row->category,
                    'type' => 'expense',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                DB::table('expenses')->where('category', $row->category)->update(['category_id' => $categoryId]);
            });

        Schema::table('expenses', function (Blueprint $table) {
            $table->dropColumn('category');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('expenses', function (Blueprint $table) {
            $table->string('category')->nullable()->after('description');
        });

        DB::table('expenses')
            ->join('categories', 'categories.id', '=', 'expenses.category_id')
            ->update(['expenses.category' => DB::raw('categories.name')]);

        Schema::table('expenses', function (Blueprint $table) {
            $table->dropConstrainedForeignId('category_id');
        });
    }
};
