<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Http\JsonResponse;

class VillageAccessDeniedException extends Exception
{
    public function __construct(string $message = 'Anda tidak memiliki akses ke desa ini')
    {
        parent::__construct($message, 403);
    }

    public function render($request): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $this->getMessage(),
            'error_code' => 'VILLAGE_ACCESS_DENIED',
        ], 403);
    }
}
