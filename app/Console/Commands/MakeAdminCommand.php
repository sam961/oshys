<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class MakeAdminCommand extends Command
{
    protected $signature = 'make:admin
                            {--email= : Admin email address}
                            {--name=Admin : Admin display name}';

    protected $description = 'Create or update an admin user with a securely prompted password';

    public function handle(): int
    {
        $email = $this->option('email') ?: $this->ask('Admin email');
        $name = $this->option('name') ?: 'Admin';

        $emailValidator = Validator::make(['email' => $email], ['email' => 'required|email']);
        if ($emailValidator->fails()) {
            $this->error('Invalid email address.');

            return self::FAILURE;
        }

        $password = $this->secret('Password (min 12 chars)');
        $confirm = $this->secret('Confirm password');

        if ($password !== $confirm) {
            $this->error('Passwords do not match.');

            return self::FAILURE;
        }

        if (strlen($password) < 12) {
            $this->error('Password must be at least 12 characters.');

            return self::FAILURE;
        }

        $user = User::updateOrCreate(
            ['email' => $email],
            ['name' => $name, 'password' => Hash::make($password)]
        );

        $this->info(($user->wasRecentlyCreated ? 'Created' : 'Updated') . " admin: {$user->email}");

        return self::SUCCESS;
    }
}
