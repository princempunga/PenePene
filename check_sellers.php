<?php
require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$rows = App\Models\Seller::selectRaw('status, count(*) as n')->groupBy('status')->get();
foreach ($rows as $r) {
    echo $r->status . ' : ' . $r->n . PHP_EOL;
}
echo 'Total vendeurs: ' . App\Models\Seller::count() . PHP_EOL;
