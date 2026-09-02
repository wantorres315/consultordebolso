<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Concerns\ReordersPositions;
use App\Http\Controllers\Controller;
use App\Models\HomeSection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class HomeSectionController extends Controller
{
    use ReordersPositions;

    private const TYPES = ['slider', 'testimonials', 'videos', 'text', 'text_image', 'plans'];

    public function index()
    {
        return response()->json(HomeSection::orderBy('position')->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'type' => ['required', 'string', 'in:'.implode(',', self::TYPES)],
            'content' => ['required', 'array'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $position = $this->nextPosition(fn () => HomeSection::query());

        $section = HomeSection::create([
            'type' => $data['type'],
            'content' => $data['content'],
            'is_active' => $data['is_active'] ?? true,
            'position' => $position,
        ]);

        return response()->json($section, 201);
    }

    public function update(Request $request, HomeSection $section)
    {
        $data = $request->validate([
            'content' => ['required', 'array'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $section->update($data);

        return response()->json($section);
    }

    public function destroy(HomeSection $section)
    {
        DB::transaction(function () use ($section) {
            $section->delete();

            $this->renumberSiblings(fn () => HomeSection::query());
        });

        return response()->noContent();
    }

    public function moveUp(HomeSection $section)
    {
        $this->moveItem($section, fn () => HomeSection::query(), 'up');

        return response()->json($section->fresh());
    }

    public function moveDown(HomeSection $section)
    {
        $this->moveItem($section, fn () => HomeSection::query(), 'down');

        return response()->json($section->fresh());
    }

    public function uploadImage(Request $request)
    {
        $request->validate([
            'image' => ['required', 'image', 'max:5120'],
        ]);

        $path = $request->file('image')->store('home-sections', 'public');

        return response()->json(['url' => Storage::disk('public')->url($path)]);
    }
}
