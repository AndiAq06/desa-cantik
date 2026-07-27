<?php

namespace App\Http\Controllers;

use Illuminate\Contracts\Validation\Validator as ValidatorContract;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Bus\DispatchesJobs;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Routing\Controller as BaseController;

class Controller extends BaseController
{
    use AuthorizesRequests, DispatchesJobs, ValidatesRequests;

    /**
     * Return a successful JSON response
     */
    protected function success(mixed $data = null, ?string $message = null, int $statusCode = 200, array $headers = []): JsonResponse
    {
        $response = ['success' => true];

        if ($message !== null) {
            $response['message'] = $message;
        }

        if ($data !== null) {
            $response['data'] = $data;
        }

        return response()->json($response, $statusCode, $headers);
    }

    /**
     * Return a paginated list response
     */
    protected function paginated(LengthAwarePaginator $paginator, ?string $message = null, mixed $data = null, array $headers = []): JsonResponse
    {
        $response = [
            'success' => true,
            'data' => $data ?? $paginator->getCollection(),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'last_page' => $paginator->lastPage(),
            ],
        ];

        if ($message !== null) {
            $response['message'] = $message;
        }

        return response()->json($response, 200, $headers);
    }

    /**
     * Return an error JSON response
     */
    protected function error(string $message, int $statusCode = 400, ?array $errors = null, ?string $errorCode = null, array $headers = []): JsonResponse
    {
        $response = [
            'success' => false,
            'message' => $message,
        ];

        if ($errors !== null) {
            $response['errors'] = $errors;
        }

        if ($errorCode !== null) {
            $response['error_code'] = $errorCode;
        }

        return response()->json($response, $statusCode, $headers);
    }

    /**
     * Return a validation error response
     */
    protected function validationError(ValidatorContract $validator, string $message = 'Validation failed', array $headers = []): JsonResponse
    {
        return $this->error($message, 422, $validator->errors()->toArray(), null, $headers);
    }

    /**
     * Return a 401 unauthorized response
     */
    protected function unauthorized(string $message = 'Unauthenticated', array $headers = []): JsonResponse
    {
        return $this->error($message, 401, null, 'UNAUTHORIZED', $headers);
    }

    /**
     * Return a 403 forbidden response
     */
    protected function forbidden(string $message = 'Forbidden', array $headers = []): JsonResponse
    {
        return $this->error($message, 403, null, 'FORBIDDEN', $headers);
    }

    /**
     * Return a 404 not found response
     */
    protected function notFound(string $message = 'Resource not found', ?string $resource = null, array $headers = []): JsonResponse
    {
        if ($resource) {
            $message = "{$resource} not found";
        }

        return $this->error($message, 404, null, 'NOT_FOUND', $headers);
    }

    /**
     * Handle and return exception response
     */
    protected function handleException(\Exception $exception, ?string $message = null, int $statusCode = 500, array $headers = []): JsonResponse
    {
        $message ??= 'An error occurred';

        $response = [
            'success' => false,
            'message' => $message,
        ];

        if (config('app.debug')) {
            $response['exception'] = [
                'type' => $exception::class,
                'message' => $exception->getMessage(),
                'file' => $exception->getFile(),
                'line' => $exception->getLine(),
            ];
        }

        return response()->json($response, $statusCode, $headers);
    }
}
