<?php

// Script: supprime tous les comptes vendeurs (seller) et acheteurs (buyer)
require __DIR__.'/../vendor/autoload.php';
$app = require __DIR__.'/../bootstrap/app.php';
use Illuminate\Contracts\Console\Kernel;

$app->make(Kernel::class)->bootstrap();

use App\Models\Product;
use App\Models\User;

// adapte le nom si different

// Comptes supprimes
$users = User::whereIn('role', ['seller', 'buyer'])->get();
echo 'Comptes vendeurs/acheteurs : '.$users->count()."\n";

// Produits et requetes rattaches
$sellerIds = $users->pluck('id');
echo 'Produits : '.Product::whereIn('user_id', $sellerIds)->count()."\n";
echo 'Requetes : '.DB::table('stats_download_requests')->whereIn('seller_id', $sellerIds)->count()."\n";

// Suppression (geree plus bas dans la section V2)

echo "Suppression terminee.\n";
echo 'Utilisateurs restants : '.User::count()."\n";

// ---- V2 : suppression complete et transactionnelle ----
use Illuminate\Support\Facades\DB;

$users = DB::table('users')->whereIn('role', ['seller', 'buyer'])->pluck('id');
echo "\nComptes seller/buyer : ".$users->count()."\n";
if ($users->isEmpty()) {
    echo "Rien a supprimer.\n";
    exit(0);
}

$sellers = DB::table('sellers')->whereIn('user_id', $users)->pluck('id');
$buyers = DB::table('buyers')->whereIn('user_id', $users)->pluck('id');

echo 'Profils vendeurs  : '.$sellers->count()."\n";
echo 'Profils acheteurs : '.$buyers->count()."\n";
echo 'Produits          : '.DB::table('products')->whereIn('seller_id', $sellers)->count()."\n";
echo 'Requetes (stats_download_requests) : '.DB::table('stats_download_requests')->whereIn('seller_id', $sellers)->count()."\n";

DB::transaction(function () use ($users, $sellers, $buyers) {
    // Requetes du systeme rattachees aux vendeurs
    DB::table('stats_download_requests')->whereIn('seller_id', $sellers)->delete();

    // Produits vendeurs (images, vues, favoris d'abord)
    $productIds = DB::table('products')->whereIn('seller_id', $sellers)->pluck('id');
    DB::table('product_images')->whereIn('product_id', $productIds)->delete();
    DB::table('product_views')->whereIn('product_id', $productIds)->delete();
    DB::table('favorites')->whereIn('product_id', $productIds)->delete();
    DB::table('order_items')->whereIn('product_id', $productIds)->delete();
    DB::table('products')->whereIn('seller_id', $sellers)->delete();

    // Donnees e-commerce rattachees
    DB::table('order_items')->whereIn('order_id', DB::table('orders')->whereIn('seller_id', $sellers)->pluck('id'))->delete();
    DB::table('orders')->whereIn('seller_id', $sellers)->delete();
    DB::table('order_items')->whereIn('order_id', DB::table('orders')->whereIn('buyer_id', $buyers)->pluck('id'))->delete();
    DB::table('orders')->whereIn('buyer_id', $buyers)->delete();
    DB::table('reviews')->whereIn('seller_id', $sellers)->delete();
    DB::table('commissions')->whereIn('seller_id', $sellers)->delete();
    DB::table('payouts')->whereIn('seller_id', $sellers)->delete();
    DB::table('subscriptions')->whereIn('seller_id', $sellers)->delete();
    DB::table('sponsored_products')->whereIn('seller_id', $sellers)->delete();
    DB::table('seller_documents')->whereIn('seller_id', $sellers)->delete();

    // Favoris des acheteurs
    DB::table('favorites')->whereIn('buyer_id', $buyers)->delete();

    // Conversations / messages
    $conversations = DB::table('conversations')->where(function ($q) use ($users) {
        $q->whereIn('seller_id', $users)->orWhereIn('buyer_id', $users);
    })->pluck('id');
    DB::table('messages')->whereIn('conversation_id', $conversations)->delete();
    DB::table('conversations')->whereIn('id', $conversations)->delete();

    // Profils
    DB::table('sellers')->whereIn('id', $sellers)->delete();
    DB::table('buyers')->whereIn('id', $buyers)->delete();

    // Comptes utilisateurs
    DB::table('users')->whereIn('id', $users)->delete();
});

echo "\nSuppression terminee.\n";
foreach (DB::table('users')->select('role', DB::raw('count(*) as c'))->groupBy('role')->get() as $r) {
    echo str_pad($r->role ?? 'NULL', 15).' : '.$r->c."\n";
}
