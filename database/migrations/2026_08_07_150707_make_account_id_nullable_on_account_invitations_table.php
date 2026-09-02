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
        Schema::table('account_invitations', function (Blueprint $table) {
            $table->dropForeign(['account_id']);
            $table->dropColumn('account_id');
        });

        Schema::table('account_invitations', function (Blueprint $table) {
            $table->foreignId('account_id')->nullable()->after('id')->constrained()->cascadeOnDelete();
            $table->string('account_name')->nullable()->after('role');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('account_invitations', function (Blueprint $table) {
            $table->dropForeign(['account_id']);
            $table->dropColumn(['account_id', 'account_name']);
        });

        Schema::table('account_invitations', function (Blueprint $table) {
            $table->foreignId('account_id')->after('id')->constrained()->cascadeOnDelete();
        });
    }
};
