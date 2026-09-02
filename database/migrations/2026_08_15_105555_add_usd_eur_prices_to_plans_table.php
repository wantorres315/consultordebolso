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
        Schema::table('plans', function (Blueprint $table) {
            $table->decimal('monthly_price_usd', 10, 2)->nullable()->after('annual_price');
            $table->decimal('annual_price_usd', 10, 2)->nullable()->after('monthly_price_usd');
            $table->decimal('monthly_price_eur', 10, 2)->nullable()->after('annual_price_usd');
            $table->decimal('annual_price_eur', 10, 2)->nullable()->after('monthly_price_eur');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('plans', function (Blueprint $table) {
            $table->dropColumn([
                'monthly_price_usd',
                'annual_price_usd',
                'monthly_price_eur',
                'annual_price_eur',
            ]);
        });
    }
};
