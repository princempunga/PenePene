<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('users')
            ->whereIn('locale', ['en', ''])
            ->orWhereNull('locale')
            ->update(['locale' => 'fr']);
    }

    public function down(): void
    {
        //
    }
};
