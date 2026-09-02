<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

#[Signature('app:create-platform-admin {name?} {email?} {password?}')]
#[Description('Create a platform admin user, who can invite account owners.')]
class CreatePlatformAdmin extends Command
{
    public function handle(): int
    {
        $name = $this->argument('name') ?? $this->ask('Nome');
        $email = $this->argument('email') ?? $this->ask('E-mail');
        $password = $this->argument('password') ?? $this->secret('Senha');

        $validator = Validator::make(compact('name', 'email', 'password'), [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
        ]);

        if ($validator->fails()) {
            foreach ($validator->errors()->all() as $error) {
                $this->error($error);
            }

            return self::FAILURE;
        }

        $user = User::create([
            'name' => $name,
            'email' => $email,
            'password' => Hash::make($password),
        ]);

        $user->is_platform_admin = true;
        $user->save();

        $this->info("Admin da plataforma \"{$email}\" criado com sucesso.");

        return self::SUCCESS;
    }
}
