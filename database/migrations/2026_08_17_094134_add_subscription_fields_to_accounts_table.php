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
        Schema::table('accounts', function (Blueprint $table) {
            $table->foreignId('plan_id')->nullable()->after('owner_id')->constrained()->nullOnDelete();
            $table->string('billing_period')->nullable()->after('plan_id');
            $table->string('subscription_status')->default('pending_payment')->after('billing_period');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('accounts', function (Blueprint $table) {
            $table->dropConstrainedForeignId('plan_id');
            $table->dropColumn(['billing_period', 'subscription_status']);
        });
    }
};
