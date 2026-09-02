<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function index(Request $request)
    {
        $query = Payment::query()->with('account:id,name')->latest('paid_at');

        if ($request->filled('type')) {
            $query->where('type', $request->string('type'));
        }

        if ($request->filled('from')) {
            $query->whereDate('paid_at', '>=', $request->date('from'));
        }

        if ($request->filled('to')) {
            $query->whereDate('paid_at', '<=', $request->date('to'));
        }

        $payments = $query->paginate(20);

        $approved = Payment::where('status', 'approved');

        return response()->json([
            'payments' => $payments,
            'summary' => [
                'total' => (float) (clone $approved)->sum('amount'),
                'this_month' => (float) (clone $approved)->where('paid_at', '>=', now()->startOfMonth())->sum('amount'),
                'subscriptions_total' => (float) (clone $approved)->where('type', 'subscription')->sum('amount'),
                'questionnaire_purchases_total' => (float) (clone $approved)->where('type', 'questionnaire_purchase')->sum('amount'),
                'manual_total' => (float) (clone $approved)->where('type', 'manual')->sum('amount'),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'account_id' => ['nullable', 'exists:accounts,id'],
            'description' => ['required', 'string', 'max:255'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'paid_at' => ['required', 'date'],
            'notes' => ['nullable', 'string'],
        ]);

        $payment = Payment::create([
            'account_id' => $data['account_id'] ?? null,
            'description' => $data['description'],
            'type' => 'manual',
            'method' => 'manual',
            'amount' => $data['amount'],
            'currency' => 'BRL',
            'status' => 'approved',
            'paid_at' => $data['paid_at'],
            'notes' => $data['notes'] ?? null,
        ]);

        $payment->load('account:id,name');

        return response()->json($payment, 201);
    }
}
