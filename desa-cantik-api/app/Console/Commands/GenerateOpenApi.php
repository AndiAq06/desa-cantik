<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use OpenApi\Generator;

class GenerateOpenApi extends Command
{
    protected $signature = 'openapi:generate {--yaml : Save a YAML copy}';

    protected $description = 'Generate OpenAPI documentation JSON (and YAML optionally)';

    public function handle()
    {
        $this->info('Scanning for OpenAPI attributes...');

        // Use config paths from config/swagger.php
        $scanPaths = config('swagger.scan.paths', [base_path('app/Http/Controllers/Api'), base_path('app/Docs')]);
        $scanExclude = config('swagger.scan.exclude', []);

        $analysis = Generator::scan($scanPaths, ['exclude' => $scanExclude]);

        $json = $analysis->toJson();

        $docsPath = config('swagger.output.dir', storage_path('api-docs'));
        if (! File::exists($docsPath)) {
            File::makeDirectory($docsPath, 0755, true);
        }

        File::put(config('swagger.output.json', $docsPath.'/api-docs.json'), $json);
        $this->info('Generated: '.$docsPath.'/api-docs.json');

        if ($this->option('yaml')) {
            try {
                $yaml = $analysis->toYaml();
                File::put(config('swagger.output.yaml', $docsPath.'/api-docs.yaml'), $yaml);
                $this->info('Generated: '.config('swagger.output.yaml'));
            } catch (\Throwable $e) {
                $this->error('Failed to generate YAML: '.$e->getMessage());
            }
        }

        return 0;
    }
}
