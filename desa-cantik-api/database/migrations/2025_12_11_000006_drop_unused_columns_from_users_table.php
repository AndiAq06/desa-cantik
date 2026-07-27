<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Drop unused columns from users table:
     * - phone_number: Collected but never displayed
     * - email_verified_at: Never validated
     * - remember_token: Legacy Laravel, Sanctum used instead
     * - is_active: Dashboard logic updated to use deleted_at instead
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $columnsToDrop = [];
            foreach (['phone_number', 'email_verified_at', 'remember_token', 'is_active'] as $column) {
                if (Schema::hasColumn('users', $column)) {
                    $columnsToDrop[] = $column;
                }
            }
            if (!empty($columnsToDrop)) {
                $table->dropColumn($columnsToDrop);
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone_number', 255)->nullable()->after('email');
            $table->boolean('is_active')->default(true)->after('village_id');
            $table->timestamp('email_verified_at')->nullable()->after('password');
            $table->string('remember_token', 100)->nullable()->after('email_verified_at');
        });
    }
};
