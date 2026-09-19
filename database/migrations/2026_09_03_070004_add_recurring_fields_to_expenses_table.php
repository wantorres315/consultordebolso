<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('expenses', function (Blueprint $table) {
            $table->uuid('recurring_group_id')->nullable()->after('notes');
            $table->unsignedSmallInteger('installment_number')->nullable()->after('recurring_group_id');
            $table->unsignedSmallInteger('installment_total')->nullable()->after('installment_number');

            $table->index('recurring_group_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('expenses', function (Blueprint $table) {
            $table->dropColumn(['recurring_group_id', 'installment_number', 'installment_total']);
        });
    }
};
