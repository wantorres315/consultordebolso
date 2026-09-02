<?php

namespace Database\Seeders;

use App\Models\Account;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $admin = User::factory()->create([
            'name' => 'Admin',
            'email' => 'admin@example.com',
            'is_platform_admin' => true,
        ]);

        $owner = User::factory()->create([
            'name' => 'Dono',
            'email' => 'dono@example.com',
            'role' => 'owner',
        ]);

        $account = Account::create([
            'name' => "Conta de {$owner->name}",
            'owner_id' => $owner->id,
        ]);

        $owner->account_id = $account->id;
        $owner->save();

        User::factory()->create([
            'name' => 'Membro',
            'email' => 'membro@example.com',
            'role' => 'member',
            'account_id' => $account->id,
        ]);
    }
}
