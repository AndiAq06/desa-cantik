<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1) Copy villages.logo_url into village_profiles.logo_url where profile exists or create profile
        if (Schema::hasColumn('villages', 'logo_url')) {
            $villages = DB::table('villages')->select('id', 'logo_url')->whereNotNull('logo_url')->get();

            foreach ($villages as $v) {
                $profile = DB::table('village_profiles')->where('village_id', $v->id)->first();
                if ($profile) {
                    if (empty($profile->logo_url)) {
                        DB::table('village_profiles')->where('id', $profile->id)->update(['logo_url' => $v->logo_url]);
                    }
                } else {
                    DB::table('village_profiles')->insert([
                        'village_id' => $v->id,
                        'logo_url' => $v->logo_url,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        }

        // 2) Move any foto_url into thumbnail_url if thumbnail_url is null
        if (Schema::hasColumn('village_profiles', 'foto_url') && Schema::hasColumn('village_profiles', 'thumbnail_url')) {
            DB::table('village_profiles')
                ->whereNotNull('foto_url')
                ->whereNull('thumbnail_url')
                ->update(['thumbnail_url' => DB::raw('foto_url')]);
        }

        // 3) Drop foto_url and villages.logo_url columns
        Schema::table('village_profiles', function (Blueprint $table) {
            if (Schema::hasColumn('village_profiles', 'foto_url')) {
                $table->dropColumn('foto_url');
            }
        });

        Schema::table('villages', function (Blueprint $table) {
            if (Schema::hasColumn('villages', 'logo_url')) {
                $table->dropColumn('logo_url');
            }
        });
    }

    public function down(): void
    {
        // 1) Add villages.logo_url and village_profiles.foto_url back
        Schema::table('villages', function (Blueprint $table) {
            if (! Schema::hasColumn('villages', 'logo_url')) {
                $table->string('logo_url', 500)->nullable();
            }
        });

        Schema::table('village_profiles', function (Blueprint $table) {
            if (! Schema::hasColumn('village_profiles', 'foto_url')) {
                $table->string('foto_url', 500)->nullable();
            }
        });

        // 2) Copy data back: copy profile.logo_url to villages.logo_url, and thumbnail_url to foto_url where appropriate
        if (Schema::hasTable('village_profiles')) {
            $profiles = DB::table('village_profiles')->select('id', 'village_id', 'logo_url', 'thumbnail_url')->get();
            foreach ($profiles as $p) {
                if (! empty($p->logo_url)) {
                    DB::table('villages')->where('id', $p->village_id)->update(['logo_url' => $p->logo_url]);
                }
                if (! empty($p->thumbnail_url)) {
                    DB::table('village_profiles')->where('id', $p->id)->update(['foto_url' => $p->thumbnail_url]);
                }
            }
        }
    }
};
