<?php

namespace App\Http\Controllers\Admin\Concerns;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

trait ReordersPositions
{
    protected function nextPosition(callable $queryFactory): int
    {
        return ($queryFactory()->max('position') ?? -1) + 1;
    }

    protected function renumberSiblings(callable $queryFactory): void
    {
        $siblings = $queryFactory()->orderBy('position')->lockForUpdate()->get();

        foreach ($siblings as $index => $sibling) {
            if ((int) $sibling->position !== $index) {
                $sibling->update(['position' => $index]);
            }
        }
    }

    protected function moveItem(Model $item, callable $queryFactory, string $direction): void
    {
        DB::transaction(function () use ($item, $queryFactory, $direction) {
            $siblings = $queryFactory()->lockForUpdate()->get();

            $neighbor = $direction === 'up'
                ? $siblings->where('position', '<', $item->position)->sortByDesc('position')->first()
                : $siblings->where('position', '>', $item->position)->sortBy('position')->first();

            if (! $neighbor) {
                return;
            }

            $itemPosition = $item->position;
            $item->update(['position' => $neighbor->position]);
            $neighbor->update(['position' => $itemPosition]);
        });
    }
}
