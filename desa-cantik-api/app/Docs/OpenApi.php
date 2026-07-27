<?php

namespace App\Docs;

use OpenApi\Attributes as OA;

#[OA\Info(title: 'Desa Cantik API', version: '1.0.0', description: 'API specification for Desa Cantik backend services (Laravel 12, Sanctum).')]
#[OA\Server(url: 'http://localhost/api')]
#[OA\Tag(name: 'Auth', description: 'Authentication & profile')]
#[OA\Tag(name: 'Villages', description: 'Directory and profile data for villages')]
#[OA\SecurityScheme(securityScheme: 'sanctum', type: 'http', scheme: 'bearer', bearerFormat: 'Token', description: 'Use the Sanctum bearer token returned by the authentication endpoints.')]
class OpenApi
{
    // Intentionally empty - serves as the root description for OpenAPI generation.
}
