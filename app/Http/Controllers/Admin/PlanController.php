<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use Illuminate\Http\Request;

class PlanController extends Controller
{
    public function index()
    {
        return response()->json(Plan::latest()->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'monthly_price' => ['required', 'numeric', 'min:0'],
            'annual_price' => ['required', 'numeric', 'min:0'],
            'monthly_price_usd' => ['nullable', 'numeric', 'min:0'],
            'annual_price_usd' => ['nullable', 'numeric', 'min:0'],
            'monthly_price_eur' => ['nullable', 'numeric', 'min:0'],
            'annual_price_eur' => ['nullable', 'numeric', 'min:0'],
            'max_members' => ['required', 'integer', 'min:0'],
            'max_wallet_plans' => ['required', 'integer', 'min:0'],
            'is_active' => ['boolean'],
            'is_featured' => ['boolean'],
        ]);

        return response()->json(Plan::create($data), 201);
    }

    public function update(Request $request, Plan $plan)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'monthly_price' => ['required', 'numeric', 'min:0'],
            'annual_price' => ['required', 'numeric', 'min:0'],
            'monthly_price_usd' => ['nullable', 'numeric', 'min:0'],
            'annual_price_usd' => ['nullable', 'numeric', 'min:0'],
            'monthly_price_eur' => ['nullable', 'numeric', 'min:0'],
            'annual_price_eur' => ['nullable', 'numeric', 'min:0'],
            'max_members' => ['required', 'integer', 'min:0'],
            'max_wallet_plans' => ['required', 'integer', 'min:0'],
            'is_active' => ['boolean'],
            'is_featured' => ['boolean'],
        ]);

        $plan->update($data);

        return response()->json($plan);
    }

    public function destroy(Plan $plan)
    {
        $plan->delete();

        return response()->noContent();
    }
}
