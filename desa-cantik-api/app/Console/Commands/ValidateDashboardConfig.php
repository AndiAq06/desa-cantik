<?php

namespace App\Console\Commands;

use App\Services\DashboardConfigValidator;
use Illuminate\Console\Command;

class ValidateDashboardConfig extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'dashboard:validate-config';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Validate dashboard configuration against database';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Validating dashboard configuration...');
        $this->newLine();

        $report = DashboardConfigValidator::getValidationReport();

        $this->table(
            ['Metric', 'Value'],
            [
                ['Total Configured Codes', $report['total_codes']],
                ['Valid Codes', count($report['valid_codes'])],
                ['Missing Codes', count($report['missing_codes'])],
                ['Status', $report['is_valid'] ? '✓ Valid' : '✗ Invalid'],
            ]
        );

        if (count($report['missing_codes']) > 0) {
            $this->newLine();
            $this->error('The following statistic codes are configured but do not exist in the database:');
            foreach ($report['missing_codes'] as $code) {
                $this->line("  - {$code}");
            }
            $this->newLine();
            $this->warn('Please create these statistic types or update the dashboard configuration.');

            return self::FAILURE;
        }

        $this->newLine();
        $this->info('✓ Dashboard configuration is valid!');

        return self::SUCCESS;
    }
}
