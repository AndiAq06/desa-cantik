<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Phase 1.2: Convert roles table to enum - add role column, migrate data, drop FK
     */
    public function up(): void
    {
        // Step 1: Add role varchar column to users table
        Schema::table('users', function (Blueprint $table) {
            $table->string('role', 50)->nullable()->after('role_id')->index();
        });

        // Step 2: Migrate role_id to role string values based on roles table
        DB::statement("
            UPDATE users u
            INNER JOIN roles r ON u.role_id = r.id
            SET u.role = r.role_name
        ");

        // Step 3: Make role column required (after data migration)
        // Set any remaining nulls to 'guest'
        DB::statement("UPDATE users SET role = 'guest' WHERE role IS NULL");

        // Step 4: Drop the foreign key constraint and role_id column
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['role_id']);
            $table->dropColumn('role_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Step 1: Add role_id back
        Schema::table('users', function (Blueprint $table) {
            $table->unsignedBigInteger('role_id')->nullable()->after('email');
        });

        // Step 2: Try to map role strings back to role_id (assuming roles table exists)
        if (Schema::hasTable('roles')) {
            DB::statement("
                UPDATE users u
                INNER JOIN roles r ON u.role = r.role_name
                SET u.role_id = r.id
            ");

            // Step 3: Add back the foreign key
            Schema::table('users', function (Blueprint $table) {
                $table->foreign('role_id')->references('id')->on('roles');
            });
        }

        // Step 4: Drop the role column
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['role']);
            $table->dropColumn('role');
        });
    }
};
