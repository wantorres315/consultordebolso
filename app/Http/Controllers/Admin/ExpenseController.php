<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use Illuminate\Http\Request;

class ExpenseController extends Controller
{
    public function index(Request $request)
    {
        $query = Expense::query()->with('creator:id,name')->latest('expense_date');

        if ($request->filled('from')) {
            $query->whereDate('expense_date', '>=', $request->date('from'));
        }

        if ($request->filled('to')) {
            $query->whereDate('expense_date', '<=', $request->date('to'));
        }

        $expenses = $query->paginate(20);

        return response()->json([
            'expenses' => $expenses,
            'summary' => [
                'total' => (float) Expense::sum('amount'),
                'this_month' => (float) Expense::where('expense_date', '>=', now()->startOfMonth())->sum('amount'),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'description' => ['required', 'string', 'max:255'],
            'category' => ['nullable', 'string', 'max:255'],
            'amount' => ['required', 'numeric', 'min:0'],
            'expense_date' => ['required', 'date'],
            'notes' => ['nullable', 'string'],
        ]);

        $data['created_by'] = $request->user()->id;

        $expense = Expense::create($data);
        $expense->load('creator:id,name');

        return response()->json($expense, 201);
    }

    public function update(Request $request, Expense $expense)
    {
        $data = $request->validate([
            'description' => ['required', 'string', 'max:255'],
            'category' => ['nullable', 'string', 'max:255'],
            'amount' => ['required', 'numeric', 'min:0'],
            'expense_date' => ['required', 'date'],
            'notes' => ['nullable', 'string'],
        ]);

        $expense->update($data);
        $expense->load('creator:id,name');

        return response()->json($expense);
    }

    public function destroy(Expense $expense)
    {
        $expense->delete();

        return response()->noContent();
    }
}
