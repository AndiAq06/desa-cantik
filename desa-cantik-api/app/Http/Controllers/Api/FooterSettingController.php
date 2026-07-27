<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FooterSetting;
use Illuminate\Http\Request;

class FooterSettingController extends Controller
{
    public function get()
    {
        $footer = FooterSetting::first();

        // Return existing data or defaults
        $data = $footer ? $footer->toArray() : [
            'email' => '',
            'phone' => '',
            'bps_torut' => 'https://torutkab.bps.go.id/',
            'bps_sulsel' => 'https://sulsel.bps.go.id',
            'bps_ri' => 'https://www.bps.go.id',
        ];

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'email' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:50',
            'bps_torut' => 'nullable|string|max:255',
            'bps_sulsel' => 'nullable|string|max:255',
            'bps_ri' => 'nullable|string|max:255',
        ]);

        // Use updateOrCreate: update existing record or create new one
        $footer = FooterSetting::updateOrCreate(
            ['id' => FooterSetting::first()?->id ?? 1],
            $validated
        );

        return response()->json([
            'success' => true,
            'message' => 'Footer berhasil diperbarui',
            'data' => $footer,
        ]);
    }
}
