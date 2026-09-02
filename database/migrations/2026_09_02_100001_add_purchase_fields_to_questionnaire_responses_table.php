<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('questionnaire_responses', function (Blueprint $table) {
            $table->string('purchase_status')->nullable()->after('status');
            $table->decimal('purchase_amount', 10, 2)->nullable()->after('purchase_status');
        });
    }

    public function down(): void
    {
        Schema::table('questionnaire_responses', function (Blueprint $table) {
            $table->dropColumn(['purchase_status', 'purchase_amount']);
        });
    }
};
