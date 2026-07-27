<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Http\JsonResponse;

class DashboardAccessDeniedException extends Exception
{
    protected $message = 'Access to this dashboard is denied';

    protected $code = 403;

    public function __construct(?string $message = null, int $code = 403)
    {
        parent::__construct($message ?? $this->message, $code);
    }

    public function render(): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $this->message,
            'error' => 'DASHBOARD_ACCESS_DENIED',
        ], $this->code);
    }
}
