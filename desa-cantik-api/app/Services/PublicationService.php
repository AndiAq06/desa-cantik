<?php

namespace App\Services;

use App\Exceptions\FileUploadException;
use App\Models\Village;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class PublicationService
{
    public function storeFile(UploadedFile $file, Village $village): array
    {
        $directory = $this->buildDirectory($village->id, (int) now()->year);
        $filename = $this->buildFilename($file);
        $expectedPath = $directory . '/' . $filename;

        \Log::debug('PublicationService::storeFile - file info', [
            'directory' => $directory,
            'filename' => $filename,
            'expected_path' => $expectedPath,
            'file_size' => $file->getSize(),
            'file_valid' => $file->isValid(),
            'file_error' => $file->getError(),
        ]);

        // Ensure directory exists
        if (!Storage::disk('public')->exists($directory)) {
            Storage::disk('public')->makeDirectory($directory);
            \Log::debug('PublicationService::storeFile - created directory', ['directory' => $directory]);
        }

        // Try using Storage::putFileAs
        $path = Storage::disk('public')->putFileAs($directory, $file, $filename);

        \Log::debug('PublicationService::storeFile - after putFileAs', [
            'path' => $path,
            'path_type' => gettype($path),
        ]);

        // Workaround: On Windows with Podman/Docker mounts, putFileAs may return false
        // even when the file is actually saved. Check if the file exists.
        if ($path === false || empty($path)) {
            \Log::debug('PublicationService::storeFile - putFileAs returned false, checking if file exists anyway');
            
            if (Storage::disk('public')->exists($expectedPath)) {
                \Log::info('PublicationService::storeFile - file exists despite false return, using expected path', [
                    'expected_path' => $expectedPath,
                ]);
                $path = $expectedPath;
            } else {
                \Log::error('PublicationService::storeFile - file storage FAILED', [
                    'directory' => $directory,
                    'filename' => $filename,
                    'expected_path' => $expectedPath,
                    'file_error' => $file->getError(),
                    'file_error_message' => $file->getErrorMessage(),
                ]);
                throw new \RuntimeException('Failed to store publication file. Please check server storage permissions.');
            }
        }

        return [
            'file_path' => $path,
            'file_name' => $file->getClientOriginalName(),
            'file_type' => strtolower($file->getClientOriginalExtension()),
            'file_size_bytes' => $file->getSize(),
        ];
    }

    public function deleteFile(?string $path): void
    {
        if (! $path) {
            return;
        }

        $candidates = array_unique([
            $path,
            ltrim($path, '/'),
            preg_replace('#^public[\\/]+#', '', $path),
            preg_replace('#^storage[\\/]+#', '', $path),
            'public/' . ltrim($path, '/'),
        ]);

        foreach ($candidates as $candidate) {
            if (! empty($candidate) && Storage::disk('public')->exists($candidate)) {
                Storage::disk('public')->delete($candidate);
            }
        }
    }

    protected function buildDirectory(int $villageId, int $year): string
    {
        return "publications/village_{$villageId}/{$year}";
    }

    protected function buildFilename(UploadedFile $file): string
    {
        $extension = $file->getClientOriginalExtension();

        return Str::uuid()->toString() . '.' . $extension;
    }
}
