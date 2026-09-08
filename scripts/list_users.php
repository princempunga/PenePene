<?php

use App\Models\User;
use Illuminate\Contracts\Console\Kernel;

require __DIR__.'/../vendor/autoload.php';
$app = require __DIR__.'/../bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();

foreach (User::all() as $u) {
    echo $u->id.' | '.$u->email.' | '.$u->role.' | actif='.($u->is_active ? 'oui' : 'non')."\n";
}
