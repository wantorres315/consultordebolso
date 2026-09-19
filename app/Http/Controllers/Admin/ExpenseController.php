<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ExpenseController extends Controller
{
    public function index(Request $request)
    {
        $query = Expense::query()->with(['creator:id,name', 'category'])->latest('expense_date');

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
            'category_id' => ['nullable', 'exists:categories,id'],
            'amount' => ['required', 'numeric', 'min:0'],
            'expense_date' => ['required', 'date'],
            'notes' => ['nullable', 'string'],
        ]);

        $data['created_by'] = $request->user()->id;

        $expense = Expense::create($data);
        $expense->load(['creator:id,name', 'category']);

        return response()->json($expense, 201);
    }

    public function storeRecurring(Request $request)
    {
        $data = $request->validate([
            'description' => ['required', 'string', 'max:255'],
            'category_id' => ['nullable', 'exists:categories,id'],
            'amount' => ['required', 'numeric', 'min:0'],
            'start_date' => ['required', 'date'],
            'months' => ['required', 'integer', 'min:2', 'max:120'],
            'notes' => ['nullable', 'string'],
        ]);

        $groupId = (string) Str::uuid();
        $startDate = Carbon::parse($data['start_date']);
        $userId = $request->user()->id;

        $expenses = collect(range(0, $data['months'] - 1))->map(
            fn ($i) => Expense::create([
                'description' => $data['description'],
                'category_id' => $data['category_id'] ?? null,
                'amount' => $data['amount'],
                'expense_date' => $startDate->copy()->addMonthsNoOverflow($i)->toDateString(),
                'created_by' => $userId,
                'notes' => $data['notes'] ?? null,
                'recurring_group_id' => $groupId,
                'installment_number' => $i + 1,
                'installment_total' => $data['months'],
            ])
        );

        return response()->json(['expenses' => $expenses->values()], 201);
    }

    public function update(Request $request, Expense $expense)
    {
        $data = $request->validate([
            'description' => ['required', 'string', 'max:255'],
            'category_id' => ['nullable', 'exists:categories,id'],
            'amount' => ['required', 'numeric', 'min:0'],
            'expense_date' => ['required', 'date'],
            'notes' => ['nullable', 'string'],
        ]);

        $expense->update($data);
        $expense->load(['creator:id,name', 'category']);

        return response()->json($expense);
    }

    public function destroy(Expense $expense)
    {
        $expense->delete();

        return response()->noContent();
    }
}
