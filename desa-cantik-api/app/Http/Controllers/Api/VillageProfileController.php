<?php

namespace App\Http\Controllers\Api;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\Village;
use App\Services\ActivityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use OpenApi\Attributes as OA;

/**
 * Controller for village profile operations.
 * Profile data is now stored directly in the villages table (denormalized).
 */
class VillageProfileController extends Controller
{
    #[OA\Get(
        path: '/api/v1/villages/{village_id}/profile',
        summary: 'Get village profile',
        description: 'Returns the complete profile for a village including description, vision, mission, demographics, and contact information. Publicly accessible.',
        tags: ['Village Profile'],
        parameters: [
            new OA\Parameter(
                name: 'village_id',
                description: 'Village ID',
                in: 'path',
                required: true,
                schema: new OA\Schema(type: 'integer', example: 10)
            ),
        ]
    )]
    #[OA\Response(
        response: 200,
        description: 'Village profile retrieved successfully',
        content: new OA\JsonContent(ref: '#/components/schemas/VillageProfileResponse')
    )]
    #[OA\Response(
        response: 404,
        description: 'Village not found',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'success', type: 'boolean', example: false),
                new OA\Property(property: 'message', type: 'string', example: 'Village not found'),
            ]
        )
    )]
    public function show($villageId): JsonResponse
    {
        $village = Village::findOrFail($villageId);

        $logoUrl = $this->normalizeLogoUrl($village->logo_url);

        return $this->success([
            'id' => $village->id,
            'village_id' => $village->id,
            'name' => $village->name,
            'description' => $village->deskripsi,
            'vision' => $village->visi,
            'mission' => $village->misi ? json_decode($village->misi, true) : [],
            'area' => $village->area,
            'population' => $village->population,
            'address' => $village->address,
            'phone' => $village->phone,
            'email' => $village->email,
            'logo_url' => $logoUrl,
            'image_url' => $logoUrl,
            'photo_url' => $logoUrl,
            'district' => $village->kecamatan,
            'regency' => $village->kabupaten,
            'created_at' => $village->created_at,
            'updated_at' => $village->updated_at,
        ]);
    }

    #[OA\Put(
        path: '/api/v1/villages/{village_id}/profile',
        summary: 'Update village profile',
        description: 'Updates village profile information. BPS Admins can update any village, Village Officers can only update their own village.',
        security: [['sanctum' => []]],
        tags: ['Village Profile'],
        parameters: [
            new OA\Parameter(
                name: 'village_id',
                description: 'Village ID',
                in: 'path',
                required: true,
                schema: new OA\Schema(type: 'integer', example: 10)
            ),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(ref: '#/components/schemas/UpdateVillageProfileRequest')
        )
    )]
    #[OA\Response(
        response: 200,
        description: 'Profile updated successfully',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'success', type: 'boolean', example: true),
                new OA\Property(property: 'message', type: 'string', example: 'Village profile updated successfully'),
                new OA\Property(property: 'data', ref: '#/components/schemas/VillageProfile'),
            ]
        )
    )]
    #[OA\Response(response: 401, description: 'Unauthenticated')]
    #[OA\Response(response: 403, description: 'Forbidden')]
    #[OA\Response(response: 404, description: 'Village not found')]
    #[OA\Response(response: 422, description: 'Validation error')]
    public function update(Request $request, $villageId): JsonResponse
    {
        $village = Village::findOrFail($villageId);

        // Check authorization using UserRole enum
        $user = $request->user();

        if ($user->role === UserRole::VILLAGE_OFFICER && $user->village_id !== $village->id) {
            return $this->forbidden('You do not have permission to update this village profile');
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|nullable|string',
            'description' => 'sometimes|nullable|string',
            'vision' => 'sometimes|nullable|string',
            'mission' => 'sometimes|nullable|array',
            'area' => 'sometimes|nullable|numeric|min:0',
            'population' => 'sometimes|nullable|integer|min:0',
            'address' => 'sometimes|nullable|string',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email',
            'logo_url' => 'nullable|url',
            'logo' => 'nullable|file|mimes:jpeg,jpg,png,webp|max:5120',
            'district' => 'sometimes|nullable|string|max:255',
            'regency' => 'sometimes|nullable|string|max:255',
            'code' => 'sometimes|nullable|string|max:50',
        ]);

        if ($validator->fails()) {
            return $this->validationError($validator);
        }

        $oldData = $village->toArray();

        // Map spec fields to model fields (profile now in villages table)
        if ($request->has('name')) {
            $village->name = $request->name;
        }
        if ($request->has('description')) {
            $village->deskripsi = $request->description;
        }
        if ($request->has('vision')) {
            $village->visi = $request->vision;
        }
        if ($request->has('mission')) {
            $village->misi = json_encode($request->mission);
        }
        if ($request->has('area')) {
            $village->area = $request->area;
        }
        if ($request->has('population')) {
            $village->population = $request->population;
        }
        if ($request->has('address')) {
            $village->address = $request->address;
        }
        if ($request->has('phone')) {
            $village->phone = $request->phone;
        }
        if ($request->has('email')) {
            $village->email = $request->email;
        }
        if ($request->has('logo_url')) {
            $village->logo_url = $request->logo_url;
        }
        if ($request->hasFile('logo')) {
            $this->deleteLogoFile($village->logo_url);
            $village->logo_url = $this->storeLogoAndReturnUrl($village, $request->file('logo'));
        }
        if ($request->has('district')) {
            $village->kecamatan = $request->district;
        }
        if ($request->has('regency')) {
            $village->kabupaten = $request->regency;
        }
        if ($request->has('code')) {
            $village->village_code = $request->code;
        }



        $village->save();

        ActivityLogger::log('update', $village, 'Memperbarui profil desa', [
            'old_data' => $oldData,
            'new_data' => $village->toArray(),
        ]);

        $logoUrl = $this->normalizeLogoUrl($village->logo_url);

        return $this->success([
            'id' => $village->id,
            'village_id' => $village->id,
            'name' => $village->name,
            'description' => $village->deskripsi,
            'vision' => $village->visi,
            'mission' => $village->misi ? json_decode($village->misi, true) : [],
            'area' => $village->area,
            'population' => $village->population,
            'address' => $village->address,
            'phone' => $village->phone,
            'email' => $village->email,
            'logo_url' => $logoUrl,
            'image_url' => $logoUrl,
            'photo_url' => $logoUrl,
            'district' => $village->kecamatan,
            'regency' => $village->kabupaten,
        ], 'Village profile updated successfully');
    }

    #[OA\Post(
        path: '/api/v1/villages/{village_id}/profile/logo',
        tags: ['Village Profile'],
        summary: 'Upload village logo',
        security: [['sanctum' => []]],
        parameters: [new OA\Parameter(name: 'village_id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))],
        responses: [new OA\Response(response: 200, description: 'Logo uploaded'), new OA\Response(response: 422, description: 'Validation error')]
    )]
    public function uploadLogo(Request $request, $villageId): JsonResponse
    {
        $village = Village::findOrFail($villageId);

        // Check authorization using UserRole enum
        $user = $request->user();

        if ($user->role === UserRole::VILLAGE_OFFICER && $user->village_id !== $village->id) {
            return $this->forbidden('You do not have permission to update this village profile');
        }

        $validator = Validator::make($request->all(), [
            'logo' => 'required|file|mimes:jpeg,jpg,png|max:5120',
        ]);

        if ($validator->fails()) {
            return $this->validationError($validator);
        }

        $this->deleteLogoFile($village->logo_url);

        $village->logo_url = $this->storeLogoAndReturnUrl($village, $request->file('logo'));
        $village->save();

        ActivityLogger::log('update', $village, 'Mengunggah logo desa');

        return $this->success([
            'logo_url' => $this->normalizeLogoUrl($village->logo_url),
        ], 'Logo uploaded successfully');
    }

    private function storeLogoAndReturnUrl(Village $village, UploadedFile $file): string
    {
        $filename = $this->generateLogoFilename($village, $file);
        Storage::disk('public')->putFileAs('village-logos', $file, $filename);
        $path = 'village-logos/'.$filename;

        return $this->buildPublicUrlFromStoragePath($path);
    }

    private function generateLogoFilename(Village $village, UploadedFile $file): string
    {
        $baseName = Str::slug($village->name ?? '') ?: 'village-'.$village->id;
        $extension = strtolower($file->getClientOriginalExtension() ?: $file->extension() ?: 'jpg');

        return "{$baseName}-{$village->id}.{$extension}";
    }

    private function deleteLogoFile(?string $url): void
    {
        if (! $url) {
            return;
        }

        if ($path = $this->extractStoragePath($url)) {
            if (Storage::disk('public')->exists($path)) {
                Storage::disk('public')->delete($path);
            }
        }
    }

    private function buildPublicUrlFromStoragePath(string $path): string
    {
        $normalizedPath = str_replace('\\', '/', $path);
        $relativePath = 'storage/'.ltrim($normalizedPath, '/');

        return rtrim(config('app.url'), '/').'/'.ltrim($relativePath, '/');
    }

    private function normalizeLogoUrl(?string $url): ?string
    {
        $url = $this->stripDuplicateSchemes($url);

        if (! $url) {
            return null;
        }

        if (filter_var($url, FILTER_VALIDATE_URL)) {
            return $url;
        }

        $path = $this->extractStoragePath($url);

        if (! $path) {
            return null;
        }

        return rtrim(config('app.url'), '/').'/storage/'.ltrim($path, '/');
    }

    private function extractStoragePath(?string $url): ?string
    {
        $url = $this->stripDuplicateSchemes($url);

        if (! $url) {
            return null;
        }

        $path = parse_url($url, PHP_URL_PATH) ?: $url;
        $path = ltrim($path, '/');

        if ($path === '') {
            return null;
        }

        if (str_starts_with($path, 'storage/')) {
            $path = substr($path, strlen('storage/'));
        } elseif (str_starts_with($path, 'public/')) {
            $path = substr($path, strlen('public/'));
        }

        return $path ?: null;
    }

    private function stripDuplicateSchemes(?string $url): ?string
    {
        if (! $url) {
            return null;
        }

        if (preg_match_all('#https?://#i', $url, $matches, PREG_OFFSET_CAPTURE) > 1 && isset($matches[0][1][1])) {
            $url = substr($url, $matches[0][1][1]);
        }

        return $url;
    }
}
