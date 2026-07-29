<?php

namespace App\Http\Controllers\Api;

use App\Enums\UserRole;
use App\Exceptions\VillageAccessDeniedException;
use App\Http\Controllers\Controller;
use App\Http\Requests\ImportVillageStatisticsRequest;
use App\Http\Requests\StoreVillageStatisticRequest;
use App\Http\Requests\UpdateVillageStatisticRequest;
use App\Http\Resources\VillageStatisticResource;
use App\Models\Module;
use App\Models\User;
use App\Models\Village;
use App\Models\VillageStatistic;
use App\Services\ActivityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;
use OpenApi\Attributes as OA;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class VillageStatisticController extends Controller
{
    public function __construct() {}

    #[OA\Get(
        path: '/api/v1/villages/{village}/statistics',
        summary: 'List village statistics',
        description: 'Get paginated list of village statistics with optional filters',
        tags: ['Village Statistics'],
        parameters: [
            new OA\Parameter(name: 'village', in: 'path', required: true, description: 'Village ID', schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(name: 'per_page', in: 'query', description: 'Items per page (max 100)', schema: new OA\Schema(type: 'integer', default: 15)),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Successful operation', content: new OA\JsonContent(properties: [
                new OA\Property(property: 'success', type: 'boolean', example: true),
                new OA\Property(property: 'data', type: 'array', items: new OA\Items),
                new OA\Property(property: 'meta', type: 'object'),
            ])),
        ],
    )]
    public function index(Request $request, Village $village): JsonResponse
    {
        $perPage = (int) $request->query('per_page', 15);
        $perPage = $perPage > 0 ? min($perPage, 100) : 15;

        $statistics = VillageStatistic::query()
            ->select([
                'id',
                'village_id',
                'module_id',
                'indicator_name',
                'value',
                'unit',
                'year',
                'source',
                'status',
                'rejection_reason',
                'file_name',
                'created_by',
                'created_at',
                'updated_at',
                'is_published',
            ])
            ->with([
                'module:id,module_name,is_active',
                'creator:id,full_name',
                'village:id,name,village_code,kecamatan',
            ])
            ->where('village_id', $village->id)
            ->when(!auth()->guard('sanctum')->check(), fn($query) => $query->where('is_published', true))
            ->when($request->filled('year'), fn($query) => $query->where('year', $request->query('year')))
            ->orderByDesc('year')
            ->orderBy('indicator_name')
            ->paginate($perPage)
            ->appends($request->query());

        $data = VillageStatisticResource::collection($statistics->getCollection())->resolve();

        return $this->paginated($statistics, null, $data);
    }

    /**
     * Admin listing: List all statistics across villages for BPS Admin
     */
    public function adminIndex(Request $request): JsonResponse
    {

        $perPage = (int) $request->query('per_page', 15);
        $perPage = $perPage > 0 ? min($perPage, 100) : 15;

        $statistics = VillageStatistic::query()
            ->select([
                'id',
                'village_id',
                'module_id',
                'indicator_name',
                'value',
                'unit',
                'year',
                'source',
                'status',
                'file_name',
                'created_by',
                'created_at',
                'updated_at',
                'is_published',
            ])
            ->with([
                'module:id,module_name,is_active',
                'creator:id,full_name',
                'village:id,name,village_code,kecamatan',
            ])
            ->when($request->filled('village_id'), fn($query) => $query->where('village_id', $request->query('village_id')))
            ->when($request->filled('status'), fn($query) => $query->where('status', $request->query('status')))
            ->when($request->filled('year'), fn($query) => $query->where('year', $request->query('year')))
            ->when($request->filled('q'), function ($query) use ($request) {
                $q = trim($request->query('q'));
                $query->where(function ($qBuilder) use ($q) {
                    $qBuilder->where('indicator_name', 'like', "%{$q}%")
                        ->orWhereHas('village', fn($v) => $v->where('name', 'like', "%{$q}%"))
                        ->orWhereHas('module', fn($m) => $m->where('module_name', 'like', "%{$q}%"));
                });
            })
            ->orderByDesc('year')
            ->orderBy('indicator_name')
            ->paginate($perPage)
            ->appends($request->query());

        $data = VillageStatisticResource::collection($statistics->getCollection())->resolve();

        return $this->paginated($statistics, null, $data);
    }

    public function summary(Request $request, Village $village): JsonResponse
    {
        $year = $request->query('year');

        $statistics = VillageStatistic::query()
            ->select(['id', 'village_id', 'module_id', 'indicator_name', 'value', 'unit', 'year', 'is_published'])
            ->with('module:id,module_name,is_active')
            ->where('village_id', $village->id)
            ->when(!auth()->guard('sanctum')->check(), fn($query) => $query->where('is_published', true))
            ->when($year, fn($query) => $query->where('year', $year))
            ->get();

        $effectiveYear = $year ?? $statistics->max('year');

        $categories = $statistics
            ->groupBy(function (VillageStatistic $statistic) {
                return $statistic->module?->module_name ?? 'lainnya';
            })
            ->map(function (Collection $items) {
                return [
                    'total_indicators' => $items->count(),
                    'statistics' => $items->map(function (VillageStatistic $statistic) {
                        return [
                            'indicator_name' => $statistic->indicator_name,
                            'value' => $statistic->value !== null ? (float) $statistic->value : null,
                            'unit' => $statistic->unit,
                        ];
                    })->values(),
                ];
            });

        return $this->success([
            'year' => $effectiveYear,
            'categories' => $categories,
        ]);
    }

    public function store(StoreVillageStatisticRequest $request, Village $village): JsonResponse
    {
        $user = $this->user();
        $this->authorizeVillageAccess($village, $user);

        $data = $request->validated();

        // Validate that the module exists, belongs to this village, and is active
        $moduleId = $data['module_id'] ?? null;
        if ($moduleId) {
            $module = Module::where('id', $moduleId)
                ->where('village_id', $village->id)
                ->where('is_active', true)
                ->first();

            if (!$module) {
                return $this->error(
                    'Modul statistik tidak aktif atau tidak ditemukan. Tidak dapat menambahkan data statistik.',
                    422,
                    ['module_id' => ['Modul tidak aktif atau tidak ditemukan.']],
                    'MODULE_INACTIVE'
                );
            }
        }

        $fileName = $request->input('link') ?? null;

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $name = time() . '_' . $file->getClientOriginalName();
            $file->storeAs('statistics', $name, 'public');
            $fileName = $name;
        }

        $statistic = VillageStatistic::create([
            'village_id' => $village->id,
            'module_id' => $moduleId,
            'indicator_name' => $data['indicator_name'],
            'value' => $data['value'] ?? 0,
            'unit' => $data['unit'] ?? null,
            'year' => $data['year'] ?? (int) date('Y'),
            'source' => $data['source'] ?? null,
            'status' => 'Terverifikasi', // Auto-verify to bypass BPS approval
            'file_name' => $fileName,
            'rejection_reason' => null,
            'created_by' => $user->id,
            'is_published' => isset($data['is_published']) ? (bool) $data['is_published'] : false,
        ]);

        $statistic->load([
            'module:id,module_name,is_active',
            'creator:id,full_name',
            'village:id,name,village_code,kecamatan',
        ]);

        ActivityLogger::log(
            'create',
            $statistic,
            sprintf('Menambahkan data statistik %s', $statistic->indicator_name),
            ['new_data' => $statistic->toArray()]
        );

        return $this->success(VillageStatisticResource::make($statistic), 'Data statistik berhasil ditambahkan', 201);
    }

    public function update(UpdateVillageStatisticRequest $request, Village $village, int $statistic): JsonResponse
    {
        $user = $this->user();
        $this->authorizeVillageAccess($village, $user);

        $statistic = $this->findStatisticOrFail($village, $statistic);

        $data = $request->validated();

        // Validate module if being updated
        if (isset($data['module_id'])) {
            $module = Module::where('id', $data['module_id'])
                ->where('village_id', $village->id)
                ->where('is_active', true)
                ->first();

            if (!$module) {
                return $this->error(
                    'Modul statistik tidak aktif atau tidak ditemukan. Tidak dapat memperbarui data statistik.',
                    422,
                    ['module_id' => ['Modul tidak aktif atau tidak ditemukan.']],
                    'MODULE_INACTIVE'
                );
            }
        }

        if ($request->has('link')) {
            $data['file_name'] = $request->input('link');
        }

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $name = time() . '_' . $file->getClientOriginalName();
            $file->storeAs('statistics', $name, 'public');
            $data['file_name'] = $name;
        }

        $data['status'] = 'Terverifikasi'; // Always Verified on update
        $data['value'] = $data['value'] ?? $statistic->value ?? 0;
        $data['year'] = $data['year'] ?? $statistic->year ?? (int) date('Y');

        $original = $statistic->toArray();
        $statistic->fill($data);
        $statistic->save();
        $statistic->load([
            'module:id,module_name,is_active',
            'creator:id,full_name',
            'village:id,name,village_code,kecamatan',
        ]);

        ActivityLogger::log(
            'update',
            $statistic,
            sprintf('Memperbarui data statistik %s', $statistic->indicator_name),
            [
                'old_data' => $original,
                'new_data' => $statistic->toArray(),
            ]
        );

        return $this->success(VillageStatisticResource::make($statistic), 'Data statistik berhasil diperbarui');
    }

    public function destroy(Village $village, int $statistic): JsonResponse
    {
        $user = $this->user();
        $this->authorizeVillageAccess($village, $user);

        $statistic = $this->findStatisticOrFail($village, $statistic);
        $snapshot = $statistic->toArray();
        $indicatorName = $statistic->indicator_name;

        ActivityLogger::log(
            'delete',
            $statistic,
            sprintf('Menghapus data statistik %s', $indicatorName),
            ['old_data' => $snapshot]
        );

        // Fetch and delete all related rows for this indicator in this village (e.g. from Excel imports)
        $relatedStats = VillageStatistic::where('village_id', $village->id)
            ->where('indicator_name', $indicatorName)
            ->get();

        foreach ($relatedStats as $stat) {
            if ($stat->file_name && !str_starts_with($stat->file_name, 'http')) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete('statistics/' . $stat->file_name);
            }
            $stat->delete();
        }

        return $this->success(null, 'Data statistik berhasil dihapus');
    }

    public function approve(Village $village, int $statistic): JsonResponse
    {
        $user = $this->user();
        $this->authorizeVillageAccess($village, $user);

        $statistic = $this->findStatisticOrFail($village, $statistic);
        $original = $statistic->toArray();

        $statistic->status = 'Terverifikasi';
        $statistic->rejection_reason = null;
        $statistic->save();
        $statistic->load([
            'module:id,module_name,is_active',
            'creator:id,full_name',
            'village:id,name,village_code,kecamatan',
        ]);

        ActivityLogger::log(
            'update',
            $statistic,
            sprintf('Menyetujui data statistik %s', $statistic->indicator_name),
            [
                'old_data' => $original,
                'new_data' => $statistic->toArray(),
            ]
        );

        return $this->success(VillageStatisticResource::make($statistic), 'Data statistik berhasil disetujui');
    }

    public function reject(Request $request, Village $village, int $statistic): JsonResponse
    {
        $user = $this->user();
        $this->authorizeVillageAccess($village, $user);

        $data = $request->validate([
            'reason' => ['required', 'string', 'max:500'],
        ]);

        $reason = trim($data['reason']);
        if ($reason === '') {
            throw ValidationException::withMessages([
                'reason' => 'Alasan penolakan wajib diisi.',
            ]);
        }

        $statistic = $this->findStatisticOrFail($village, $statistic);
        $original = $statistic->toArray();

        $statistic->status = 'Ditolak';
        $statistic->rejection_reason = $reason;
        $statistic->save();
        $statistic->load([
            'module:id,module_name,is_active',
            'creator:id,full_name',
            'village:id,name,village_code,kecamatan',
        ]);

        ActivityLogger::log(
            'update',
            $statistic,
            sprintf('Menolak data statistik %s', $statistic->indicator_name),
            [
                'old_data' => $original,
                'new_data' => $statistic->toArray(),
            ]
        );

        return $this->success(VillageStatisticResource::make($statistic), 'Data statistik berhasil ditolak');
    }

    public function import(ImportVillageStatisticsRequest $request, Village $village): JsonResponse
    {
        $user = $this->user();
        $this->authorizeVillageAccess($village, $user);

        $file = $request->file('file');
        $path = $file->getRealPath();

        // Open and read CSV
        $handle = fopen($path, 'r');
        if (! $handle) {
            return $this->error('Gagal membuka file uploaded', 500);
        }

        // Detect delimiter (comma or semicolon)
        $firstLine = fgets($handle);
        rewind($handle);
        $delimiter = (strpos($firstLine, ';') !== false) ? ';' : ',';

        $header = fgetcsv($handle, 1000, $delimiter);
        if (! $header || count($header) < 2) {
            fclose($handle);

            return $this->error('Format CSV tidak valid atau kosong. Pastikan menggunakan delimiter koma (,) atau titik koma (;)', 422);
        }

        // Normalize header to lowercase
        $header = array_map(function ($h) {
            return strtolower(trim($h));
        }, $header);

        $stats = ['imported' => 0, 'errors' => []];
        $rowNum = 1;

        // Fetch active modules for this village
        $modules = Module::where('village_id', $village->id)
            ->where('is_active', true)
            ->get()
            ->keyBy(function ($item) {
                return strtolower($item->module_name);
            });

        while (($row = fgetcsv($handle, 1000, $delimiter)) !== false) {
            $rowNum++;
            // Skip empty rows
            if (count($row) < 1 || (count($row) === 1 && trim($row[0]) === '')) {
                continue;
            }

            // Map row to header
            // If row has fewer columns than header, pad with null
            $data = [];
            foreach ($header as $index => $key) {
                $data[$key] = isset($row[$index]) ? trim($row[$index]) : '';
            }

            // Extract values using possible column names
            $moduleName = $data['modul'] ?? $data['kategori'] ?? '';
            $indicator = $data['indikator'] ?? $data['nama data'] ?? '';
            $value = $data['nilai'] ?? $data['value'] ?? '';
            $unit = $data['satuan'] ?? $data['unit'] ?? '';
            $year = $data['tahun'] ?? $data['year'] ?? date('Y');
            $source = $data['sumber'] ?? $data['source'] ?? 'Import CSV';

            // Validations
            if (empty($indicator)) {
                $stats['errors'][] = "Baris $rowNum: Indikator/Nama Data kosong";
                continue;
            }

            if ($value === '') {
                // If value is missing, we might still import it as null or skip? 
                // Let's skip if no value.
                // $stats['errors'][] = "Baris $rowNum: Nilai kosong";
                // continue;
                $value = null; // Allow null values? DB column is nullable?
            }

            // Determine Module ID
            $moduleId = null;
            if (! empty($moduleName)) {
                $module = $modules->get(strtolower($moduleName));
                if ($module) {
                    $moduleId = $module->id;
                } else {
                    // Start: Auto-create module if it doesn't exist?
                    // For now, strict mode: must exist.
                    $stats['errors'][] = "Baris $rowNum: Modul '$moduleName' tidak ditemukan atau tidak aktif";

                    continue;
                }
            }

            try {
                VillageStatistic::create([
                    'village_id' => $village->id,
                    'module_id' => $moduleId,
                    'indicator_name' => $indicator,
                    'value' => $value,
                    'unit' => $unit,
                    'year' => (int) $year,
                    'source' => $source,
                    'status' => ($user->role === UserRole::BPS_ADMIN) ? 'Terverifikasi' : 'Menunggu Validasi',
                    'file_name' => $file->getClientOriginalName(),
                    'created_by' => $user->id,
                    'is_published' => false,
                ]);
                $stats['imported']++;
            } catch (\Exception $e) {
                $stats['errors'][] = "Baris $rowNum: Gagal simpan - ".$e->getMessage();
            }
        }

        fclose($handle);

        $message = "Impor selesai. {$stats['imported']} data berhasil ditambahkan.";
        if (count($stats['errors']) > 0) {
            $message .= ' Terdapat '.count($stats['errors']).' data gagal.';
        }

        return $this->success($stats, $message);
    }

    public function export(Request $request, Village $village): BinaryFileResponse|JsonResponse
    {
        $year = $request->query('year');
        $format = $request->query('format', 'csv');

        try {
            // return $this->service->export($village, $format, $year ? (int) $year : null);
            return $this->error('Export not implemented', 501);
        } catch (\Illuminate\Validation\ValidationException $e) {
            $message = Arr::first(Arr::flatten($e->errors())) ?? $e->getMessage();

            return $this->error($message, $e->status ?? 422, $e->errors(), 'VALIDATION_ERROR');
        }
    }

    /**
     * Get validation flow steps
     * Returns the standard workflow for village data validation
     */
    public function validationFlow(): JsonResponse
    {
        $steps = [
            [
                'id' => 1,
                'order' => 1,
                'title' => 'Input Data Statistik',
                'description' => 'Petugas desa menginput data statistik melalui sistem berdasarkan data lapangan yang dikumpulkan.',
                'role' => 'Petugas Desa',
                'sla_days' => 7,
            ],
            [
                'id' => 2,
                'order' => 2,
                'title' => 'Verifikasi Internal Desa',
                'description' => 'Kepala desa atau koordinator data melakukan pengecekan kelengkapan dan keakuratan data yang diinput.',
                'role' => 'Koordinator Desa',
                'sla_days' => 3,
            ],
            [
                'id' => 3,
                'order' => 3,
                'title' => 'Review BPS Kecamatan',
                'description' => 'Petugas BPS tingkat kecamatan melakukan review metodologi dan konsistensi data dengan wilayah sekitar.',
                'role' => 'BPS Kecamatan',
                'sla_days' => 5,
            ],
            [
                'id' => 4,
                'order' => 4,
                'title' => 'Validasi BPS Kabupaten',
                'description' => 'Tim validasi BPS kabupaten melakukan pemeriksaan akhir dan memberikan persetujuan publikasi data.',
                'role' => 'BPS Kabupaten',
                'sla_days' => 5,
            ],
            [
                'id' => 5,
                'order' => 5,
                'title' => 'Publikasi Data',
                'description' => 'Data yang telah tervalidasi dipublikasikan di portal Desa Cantik dan tersedia untuk publik.',
                'role' => 'Sistem',
                'sla_days' => 1,
            ],
        ];

        return $this->success($steps);
    }

    protected function user(): User
    {
        $user = auth()->user();

        if (! $user) {
            abort(401, 'Unauthenticated.');
        }

        return $user;
    }

    protected function authorizeVillageAccess(Village $village, User $user): void
    {
        // Direct enum comparison - role is now a UserRole enum
        if ($user->role === UserRole::BPS_ADMIN) {
            return;
        }

        if ($user->role === UserRole::VILLAGE_OFFICER && (int) $user->village_id === (int) $village->id) {
            return;
        }

        throw new VillageAccessDeniedException;
    }

    protected function findStatisticOrFail(Village $village, int $statisticId): VillageStatistic
    {
        return VillageStatistic::where('village_id', $village->id)->findOrFail($statisticId);
    }
}
