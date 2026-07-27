<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();

            // Username digunakan untuk login
            $table->string('username')->unique();

            // Nama lengkap user
            $table->string('full_name')->nullable();

            // Email unik
            $table->string('email')->unique();

            // Nomor HP (opsional)
            $table->string('phone_number')->nullable();

            // Role reference
            $table->foreignId('role_id')->constrained('roles');

            // Village (boleh null)
            $table->unsignedBigInteger('village_id')->nullable();

            // Status akun
            $table->boolean('is_active')->default(true);

            // Password
            $table->string('password');

            $table->rememberToken();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('users');
    }
};
