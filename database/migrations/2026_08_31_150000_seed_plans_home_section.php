<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Plans used to be hardcoded at the bottom of the homepage. Now that it's
     * a regular home_sections block, seed one so existing sites keep showing
     * pricing in the same place after upgrading, instead of it disappearing
     * until an admin remembers to add it back manually.
     */
    public function up(): void
    {
        $position = (int) (DB::table('home_sections')->max('position') ?? -1) + 1;

        DB::table('home_sections')->insert([
            'type' => 'plans',
            'content' => json_encode([]),
            'position' => $position,
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        DB::table('home_sections')->where('type', 'plans')->delete();
    }
};
