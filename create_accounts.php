<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Seller;
use Illuminate\Support\Facades\Hash;

echo "=== Creation des comptes ===\n\n";

// 1. Creer le compte Admin
$adminEmail = 'admin@penepene.com';
$admin = User::firstOrCreate(
    ['email' => $adminEmail],
    [
        'name' => 'Admin User',
        'password' => Hash::make('password'),
        'role' => 'admin',
        'is_active' => true,
        'email_verified_at' => now(),
        'locale' => 'fr',
    ]
);

if ($admin->wasRecentlyCreated) {
    echo "✅ Admin cree: {$adminEmail} / password\n";
} else {
    echo "ℹ️  Admin existe deja: {$adminEmail}\n";
}

// 2. Creer le compte Super Admin
$superAdminEmail = 'superadmin@penepene.com';
$superAdmin = User::firstOrCreate(
    ['email' => $superAdminEmail],
    [
        'name' => 'Super Admin',
        'password' => Hash::make('SuperAdmin123!'),
        'role' => 'super_admin',
        'is_active' => true,
        'email_verified_at' => now(),
        'locale' => 'fr',
    ]
);

if ($superAdmin->wasRecentlyCreated) {
    echo "✅ Super Admin cree: {$superAdminEmail} / SuperAdmin123!\n";
} else {
    echo "ℹ️  Super Admin existe deja: {$superAdminEmail}\n";
}

// 3. Creer le compte Vendeur (Seller) avec profil
$sellerEmail = 'vendeur@penepene.com';
$sellerUser = User::firstOrCreate(
    ['email' => $sellerEmail],
    [
        'name' => 'Jean Vendeur',
        'password' => Hash::make('Vendeur123!'),
        'role' => 'seller',
        'phone' => '+255 712 345 678',
        'is_active' => true,
        'email_verified_at' => now(),
        'locale' => 'fr',
    ]
);

if ($sellerUser->wasRecentlyCreated) {
    echo "✅ Vendeur cree: {$sellerEmail} / Vendeur123!\n";
} else {
    echo "ℹ️  Vendeur existe deja: {$sellerEmail}\n";
}

// Creer le profil Seller si inexistant
if (!Seller::where('user_id', $sellerUser->id)->exists()) {
    Seller::create([
        'user_id' => $sellerUser->id,
        'business_name' => 'Mon Magasin PenePene',
        'slug' => 'mon-magasin-penepene-' . uniqid(),
        'description' => 'Ceci est un compte vendeur de demonstration.',
        'phone' => '+255 712 345 678',
        'whatsapp' => '+255 712 345 678',
        'email' => $sellerEmail,
        'address' => '123 Rue principale',
        'city' => 'Dar es Salaam',
        'country' => 'Tanzania',
        'status' => 'verified',
        'trust_score' => 100.00,
        'strikes' => 0,
        'response_rate' => 100.00,
    ]);
    echo "✅ Profil Seller cree pour {$sellerEmail}\n";
} else {
    echo "ℹ️  Profil Seller existe deja pour {$sellerEmail}\n";
}

echo "\n=== Resume des comptes ===\n";
echo "Admin:        {$adminEmail} / password\n";
echo "Super Admin:  {$superAdminEmail} / SuperAdmin123!\n";
echo "Vendeur:      {$sellerEmail} / Vendeur123!\n";
echo "\nTu peux maintenant te connecter avec ces identifiants.\n";
