<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use App\Models\Payment;
use Illuminate\Http\Request;

class FinancialSummaryController extends Controller
{
    public function index(Request $request)
    {
        $paymentsQuery = Payment::query()->where('status', 'approved');
        $expensesQuery = Expense::query();

        if ($request->filled('from')) {
            $paymentsQuery->whereDate('paid_at', '>=', $request->date('from'));
            $expensesQuery->whereDate('expense_date', '>=', $request->date('from'));
        }

        if ($request->filled('to')) {
            $paymentsQuery->whereDate('paid_at', '<=', $request->date('to'));
            $expensesQuery->whereDate('expense_date', '<=', $request->date('to'));
        }

        $revenueTotal = (float) (clone $paymentsQuery)->sum('amount');
        $expensesTotal = (float) (clone $expensesQuery)->sum('amount');

        $revenueByType = (clone $paymentsQuery)
            ->selectRaw('type, SUM(amount) as total')
            ->groupBy('type')
            ->pluck('total', 'type')
            ->map(fn ($total) => (float) $total);

        $expensesByCategory = (clone $expensesQuery)
            ->leftJoin('categories', 'categories.id', '=', 'expenses.category_id')
            ->groupBy('categories.id', 'categories.name')
            ->orderByRaw('SUM(expenses.amount) desc')
            ->selectRaw('categories.id as category_id, categories.name as category_name, SUM(expenses.amount) as total')
            ->get()
            ->map(fn ($row) => [
                'category_id' => $row->category_id,
                'category_name' => $row->category_name,
                'total' => (float) $row->total,
            ]);

        return response()->json([
            'revenue_total' => $revenueTotal,
            'expenses_total' => $expensesTotal,
            'balance' => $revenueTotal - $expensesTotal,
            'revenue_by_type' => $revenueByType,
            'expenses_by_category' => $expensesByCategory,
        ]);
    }
}
