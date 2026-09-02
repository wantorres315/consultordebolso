<?php

namespace App\Http\Controllers;

use App\Models\HomeSection;

class HomeSectionController extends Controller
{
    public function index()
    {
        $sections = HomeSection::where('is_active', true)
            ->orderBy('position')
            ->get(['id', 'type', 'content']);

        return response()->json($sections);
    }
}
