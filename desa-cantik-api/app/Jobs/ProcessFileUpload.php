<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Job to process file uploads asynchronously.
 */
class ProcessFileUpload implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Number of times the job may be attempted.
     */
    public int $tries = 3;

    /**
     * Number of seconds to wait before retrying.
     */
    public int $backoff = 30;

    public function __construct(
        public string $modelClass,
        public int $modelId,
        public string $tempPath,
        public string $originalName,
        public string $targetDirectory
    ) {}

    public function handle(): void
    {
        // Verify temp file still exists
        if (!Storage::disk('local')->exists($this->tempPath)) {
            $this->fail(new \Exception("Temporary file not found: {$this->tempPath}"));
            return;
        }

        // Generate final filename
        $extension = pathinfo($this->originalName, PATHINFO_EXTENSION);
        $filename = Str::uuid()->toString() . '.' . $extension;
        $finalPath = $this->targetDirectory . '/' . $filename;

        // Move file from temp to public storage
        $contents = Storage::disk('local')->get($this->tempPath);
        Storage::disk('public')->put($finalPath, $contents);
        Storage::disk('local')->delete($this->tempPath);

        // Update the model with file information
        $model = $this->modelClass::find($this->modelId);
        if ($model) {
            $model->update([
                'file_path' => $finalPath,
                'file_name' => $this->originalName,
                'file_url' => Storage::disk('public')->url($finalPath),
                'file_size_bytes' => Storage::disk('public')->size($finalPath),
            ]);
        }
    }

    public function failed(\Throwable $exception): void
    {
        // Clean up temp file if it exists
        if (Storage::disk('local')->exists($this->tempPath)) {
            Storage::disk('local')->delete($this->tempPath);
        }

        \Log::error('ProcessFileUpload failed', [
            'model' => $this->modelClass,
            'model_id' => $this->modelId,
            'temp_path' => $this->tempPath,
            'error' => $exception->getMessage(),
        ]);
    }
}
