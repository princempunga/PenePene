<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::getConnection()->getDriverName() !== 'sqlite') {
            DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('super_admin', 'admin', 'seller', 'buyer', 'government') NOT NULL DEFAULT 'buyer'");

            return;
        }

        DB::statement('PRAGMA foreign_keys=OFF');

        DB::statement('CREATE TABLE users_new (
            id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
            name VARCHAR NOT NULL,
            email VARCHAR NOT NULL,
            email_verified_at DATETIME,
            password VARCHAR NOT NULL,
            role VARCHAR NOT NULL DEFAULT \'buyer\' CHECK (role IN (\'super_admin\', \'admin\', \'seller\', \'buyer\', \'government\')),
            phone VARCHAR,
            avatar VARCHAR,
            is_active TINYINT NOT NULL DEFAULT 1,
            locale VARCHAR NOT NULL DEFAULT \'en\',
            remember_token VARCHAR,
            created_at DATETIME,
            updated_at DATETIME,
            deleted_at DATETIME,
            is_online TINYINT NOT NULL DEFAULT 0,
            last_seen_at DATETIME
        )');

        DB::statement('INSERT INTO users_new SELECT * FROM users');
        DB::statement('DROP TABLE users');
        DB::statement('ALTER TABLE users_new RENAME TO users');
        DB::statement('CREATE UNIQUE INDEX users_email_unique ON users (email)');
        DB::statement('CREATE INDEX users_is_active_index ON users (is_active)');
        DB::statement('CREATE INDEX users_role_index ON users (role)');

        DB::statement('PRAGMA foreign_keys=ON');
    }

    public function down(): void
    {
        // Irreversible on SQLite without data loss for government users.
    }
};
