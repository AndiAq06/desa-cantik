<?php

namespace App\Imports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class VillageStatisticRowsImport implements ToCollection, WithHeadingRow
{
    public Collection $rows;

    public function collection(Collection $rows): void
    {
        if (! isset($this->rows)) {
            $this->rows = collect();
        }

        $this->rows = $this->rows->merge($rows);
    }
}
