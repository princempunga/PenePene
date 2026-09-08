<?php

use Illuminate\Contracts\Console\Kernel;

require __DIR__.'/../vendor/autoload.php';
$app = require __DIR__.'/../bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();

print_r(DB::select("SELECT name, sql FROM sqlite_master WHERE tbl_name='users'"));
