<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('account_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('questionnaire_response_id')->nullable()->constrained()->nullOnDelete();
            $table->string('type');
            $table->string('method')->default('mercadopago');
            $table->string('mercadopago_payment_id')->nullable()->unique();
            $table->decimal('amount', 10, 2);
            $table->string('currency')->default('BRL');
            $table->string('status')->default('approved');
            $table->timestamp('paid_at');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['type', 'paid_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
