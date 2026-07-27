<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('surat_pengantar', function (Blueprint $table) {
            $table->id();
            $table->foreignId('village_id')->constrained('villages')->onDelete('cascade');
            $table->string('jenis_surat');
            $table->string('nik', 16);
            $table->string('nama_lengkap');
            $table->text('alamat_lengkap');
            $table->string('tempat_lahir');
            $table->date('tanggal_lahir');
            $table->string('jenis_kelamin');
            $table->string('pekerjaan');
            $table->string('nomor_hp');
            $table->string('email');
            $table->string('hari_pelaksanaan')->nullable();
            $table->date('tanggal_kegiatan')->nullable();
            $table->string('tempat_kegiatan')->nullable();
            $table->string('jenis_kegiatan')->nullable();
            $table->string('status')->default('Menunggu Verifikasi');
            $table->text('keterangan')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('surat_pengantar');
    }
};
