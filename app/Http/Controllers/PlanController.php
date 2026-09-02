<?php

namespace App\Http\Controllers;

use App\Models\Plan;

class PlanController extends Controller
{
    public function index()
    {
        return response()->json(
            Plan::where('is_active', true)
                ->orderByDesc('is_featured')
                ->orderBy('monthly_price')
                ->get()
        );
    }

    public function show(Plan $plan)
    {
        abort_unless($plan->is_active, 404);

        return response()->json($plan);
    }
}
