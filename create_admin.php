<?php App\Models\User::firstOrCreate(['email' => 'admin@penepene.com'], ['name' => 'Admin User', 'password' => bcrypt('password'), 'role' => 'admin', 'is_active' => true]); echo 'Admin created!';
