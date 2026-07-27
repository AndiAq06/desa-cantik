<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Http\JsonResponse;

class InvalidDashboardRequestException extends Exception
{
    protected $message = 'Invalid dashboard request';

    protected $code = 422;

    public function __construct(?string $message = null, int $code = 422)
    {
        parent::__construct($message ?? $this->message, $code);
    }

    public function render(): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $this->message,
            'error' => 'INVALID_DASHBOARD_REQUEST',
        ], $this->code);
    }
}
