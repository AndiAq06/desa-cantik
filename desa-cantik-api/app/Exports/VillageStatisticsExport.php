<?php

namespace App\Exports;

use App\Models\VillageStatistic;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class VillageStatisticsExport implements FromQuery, WithHeadings, WithMapping
{
    public function __construct(
        protected \Illuminate\Database\Query\Builder $query,
    ) {}

    public function query()
    {
        return $this->query;
    }

    public function headings(): array
    {
        return [
            'module_name',
            'indicator_name',
            'value',
            'unit',
            'year',
            'source',
            'status',
        ];
    }

    /**
     * @param  VillageStatistic  $statistic
     */
    public function map($statistic): array
    {
        return [
            $statistic->module?->module_name,
            $statistic->indicator_name,
            $statistic->value,
            $statistic->unit,
            $statistic->year,
            $statistic->source,
            $statistic->status,
        ];
    }
}
