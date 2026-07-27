<?php

namespace App\Observers;

use App\Models\Publication;
use Illuminate\Support\Facades\Storage;

class PublicationObserver
{
    public function deleted(Publication $publication): void
    {
        if ($publication->isForceDeleting()) {
            $this->deleteFile($publication);
        }
    }

    public function forceDeleted(Publication $publication): void
    {
        $this->deleteFile($publication);
    }

    protected function deleteFile(Publication $publication): void
    {
        if ($publication->file_path) {
            Storage::disk('public')->delete($publication->file_path);
        }
    }
}
