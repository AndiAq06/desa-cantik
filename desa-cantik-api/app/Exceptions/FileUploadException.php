<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Http\JsonResponse;

class FileUploadException extends Exception
{
    protected string $errorCode;

    public function __construct(string $message, string $errorCode = 'FILE_UPLOAD_ERROR', int $code = 400)
    {
        parent::__construct($message, $code);
        $this->errorCode = $errorCode;
    }

    public function render($request): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $this->getMessage(),
            'error_code' => $this->errorCode,
        ], $this->getCode());
    }
}
