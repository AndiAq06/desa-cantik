<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BukuTamu;
use App\Models\Pengaduan;
use App\Models\SuratPengantar;
use App\Models\Village;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class OnlineServiceController extends Controller
{
    // ==========================================
    // ENDPOINT PUBLIK - SURAT PENGANTAR
    // ==========================================

    public function storeSuratPengantar(Request $request, $villageId): JsonResponse
    {
        $village = Village::findOrFail($villageId);

        $validator = Validator::make($request->all(), [
            'jenis_surat' => 'required|string|max:255',
            'nik' => 'required|string|size:16',
            'nama_lengkap' => 'required|string|max:255',
            'alamat_lengkap' => 'required|string',
            'tempat_lahir' => 'required|string|max:255',
            'tanggal_lahir' => 'required|date',
            'jenis_kelamin' => 'required|string|in:Laki-laki,Perempuan',
            'pekerjaan' => 'required|string|max:255',
            'nomor_hp' => 'required|string|max:20',
            'email' => 'required|email|max:255',
            'hari_pelaksanaan' => 'nullable|string|max:50',
            'tanggal_kegiatan' => 'nullable|date',
            'tempat_kegiatan' => 'nullable|string|max:255',
            'jenis_kegiatan' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $surat = SuratPengantar::create(array_merge(
            $validator->validated(),
            ['village_id' => $village->id]
        ));

        return response()->json([
            'success' => true,
            'message' => 'Permohonan surat pengantar berhasil dikirim',
            'data' => $surat
        ], 201);
    }

    public function checkSuratPengantarStatus(Request $request, $villageId): JsonResponse
    {
        $village = Village::findOrFail($villageId);
        $nik = $request->query('nik');

        if (!$nik) {
            return response()->json([
                'success' => false,
                'message' => 'NIK diperlukan untuk pengecekan'
            ], 400);
        }

        $items = SuratPengantar::where('village_id', $village->id)
            ->where('nik', $nik)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($item) {
                if ($item->file_hasil_path) {
                    $item->file_hasil_url = Storage::disk('public')->url($item->file_hasil_path);
                }
                return $item;
            });

        return response()->json([
            'success' => true,
            'data' => $items
        ]);
    }

    // ==========================================
    // ENDPOINT PUBLIK - PENGADUAN
    // ==========================================

    public function storePengaduan(Request $request, $villageId): JsonResponse
    {
        $village = Village::findOrFail($villageId);

        $validator = Validator::make($request->all(), [
            'nama_lengkap' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'nomor_telepon' => 'required|string|max:20',
            'alamat' => 'required|string',
            'judul_pengaduan' => 'required|string|max:255',
            'uraian' => 'required|string',
            'lampiran' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240', // max 10MB
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $validator->validated();
        unset($data['lampiran']);

        if ($request->hasFile('lampiran')) {
            $file = $request->file('lampiran');
            $filename = Str::uuid()->toString() . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs("complaints/village_{$village->id}", $filename, 'public');
            $data['lampiran_path'] = $path;
        }

        $pengaduan = Pengaduan::create(array_merge(
            $data,
            ['village_id' => $village->id]
        ));

        // Format storage URL for response
        if (isset($pengaduan->lampiran_path)) {
            $pengaduan->lampiran_url = Storage::disk('public')->url($pengaduan->lampiran_path);
        }

        return response()->json([
            'success' => true,
            'message' => 'Pengaduan berhasil dikirim',
            'data' => $pengaduan
        ], 201);
    }

    public function checkPengaduanStatus(Request $request, $villageId): JsonResponse
    {
        $village = Village::findOrFail($villageId);
        $email = $request->query('email');

        if (!$email) {
            return response()->json([
                'success' => false,
                'message' => 'Email diperlukan untuk pengecekan'
            ], 400);
        }

        $items = Pengaduan::where('village_id', $village->id)
            ->where('email', $email)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($item) {
                if ($item->lampiran_path) {
                    $item->lampiran_url = Storage::disk('public')->url($item->lampiran_path);
                }
                return $item;
            });

        return response()->json([
            'success' => true,
            'data' => $items
        ]);
    }

    // ==========================================
    // ENDPOINT PUBLIK - BUKU TAMU
    // ==========================================

    public function storeBukuTamu(Request $request, $villageId): JsonResponse
    {
        $village = Village::findOrFail($villageId);

        $validator = Validator::make($request->all(), [
            'nama_lengkap' => 'required|string|max:255',
            'jabatan' => 'required|string|max:255',
            'asal_instansi' => 'required|string|max:255',
            'tanggal_kunjungan' => 'required|date',
            'keperluan' => 'required|string',
            'tanda_tangan' => 'nullable|string', // base64 representation of PNG
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $validator->validated();
        unset($data['tanda_tangan']);

        if ($request->filled('tanda_tangan')) {
            $base64Image = $request->input('tanda_tangan');
            // Parse base64 string
            if (preg_match('/^data:image\/(\w+);base64,/', $base64Image, $type)) {
                $image = substr($base64Image, strpos($base64Image, ',') + 1);
                $image = str_replace(' ', '+', $image);
                $image = base64_decode($image);
                
                $filename = 'sig_' . Str::uuid()->toString() . '.png';
                $path = "signatures/village_{$village->id}/" . $filename;
                Storage::disk('public')->put($path, $image);
                $data['tanda_tangan_path'] = $path;
            }
        }

        $bukuTamu = BukuTamu::create(array_merge(
            $data,
            ['village_id' => $village->id]
        ));

        if (isset($bukuTamu->tanda_tangan_path)) {
            $bukuTamu->tanda_tangan_url = Storage::disk('public')->url($bukuTamu->tanda_tangan_path);
        }

        return response()->json([
            'success' => true,
            'message' => 'Buku tamu berhasil diisi',
            'data' => $bukuTamu
        ], 201);
    }

    public function listBukuTamu(Request $request, $villageId): JsonResponse
    {
        $village = Village::findOrFail($villageId);

        $items = BukuTamu::where('village_id', $village->id)
            ->orderBy('tanggal_kunjungan', 'desc')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($item) {
                if ($item->tanda_tangan_path) {
                    $item->tanda_tangan_url = Storage::disk('public')->url($item->tanda_tangan_path);
                }
                return $item;
            });

        return response()->json([
            'success' => true,
            'data' => $items
        ]);
    }

    // ==========================================
    // ENDPOINT INTERNAL - MANAGEMENT
    // ==========================================

    public function adminListSuratPengantar(Request $request, $villageId): JsonResponse
    {
        $village = Village::findOrFail($villageId);
        
        $items = SuratPengantar::where('village_id', $village->id)
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        $data = collect($items->items())->map(function ($item) {
            if ($item->file_hasil_path) {
                $item->file_hasil_url = Storage::disk('public')->url($item->file_hasil_path);
            }
            return $item;
        });

        return response()->json([
            'success' => true,
            'data' => $data,
            'meta' => [
                'current_page' => $items->currentPage(),
                'last_page' => $items->lastPage(),
                'per_page' => $items->perPage(),
                'total' => $items->total(),
            ]
        ]);
    }

    public function adminUpdateSuratPengantar(Request $request, $villageId, $id): JsonResponse
    {
        $village = Village::findOrFail($villageId);
        $surat = SuratPengantar::where('village_id', $village->id)->findOrFail($id);

        \Illuminate\Support\Facades\Log::debug('adminUpdateSuratPengantar request method: ' . $request->method());
        \Illuminate\Support\Facades\Log::debug('adminUpdateSuratPengantar request all:', $request->all());
        \Illuminate\Support\Facades\Log::debug('adminUpdateSuratPengantar request files:', $request->allFiles());

        $validator = Validator::make($request->all(), [
            'status' => 'required|string|in:Menunggu Verifikasi,Disetujui,Ditolak',
            'keterangan' => 'nullable|string',
            'file_hasil' => 'nullable|file|mimes:pdf|max:10240', // max 10MB PDF
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $validator->validated();
        unset($data['file_hasil']);

        if ($request->hasFile('file_hasil')) {
            // Delete old file if it exists
            if ($surat->file_hasil_path) {
                Storage::disk('public')->delete($surat->file_hasil_path);
            }
            $file = $request->file('file_hasil');
            $filename = Str::uuid()->toString() . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs("results/village_{$village->id}", $filename, 'public');
            $data['file_hasil_path'] = $path;
        }

        $surat->update($data);

        if ($surat->file_hasil_path) {
            $surat->file_hasil_url = Storage::disk('public')->url($surat->file_hasil_path);
        }

        return response()->json([
            'success' => true,
            'message' => 'Status surat permohonan berhasil diperbarui',
            'data' => $surat
        ]);
    }

    public function adminListPengaduan(Request $request, $villageId): JsonResponse
    {
        $village = Village::findOrFail($villageId);

        $items = Pengaduan::where('village_id', $village->id)
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        $data = collect($items->items())->map(function ($item) {
            if ($item->lampiran_path) {
                $item->lampiran_url = Storage::disk('public')->url($item->lampiran_path);
            }
            return $item;
        });

        return response()->json([
            'success' => true,
            'data' => $data,
            'meta' => [
                'current_page' => $items->currentPage(),
                'last_page' => $items->lastPage(),
                'per_page' => $items->perPage(),
                'total' => $items->total(),
            ]
        ]);
    }

    public function adminUpdatePengaduan(Request $request, $villageId, $id): JsonResponse
    {
        $village = Village::findOrFail($villageId);
        $pengaduan = Pengaduan::where('village_id', $village->id)->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'status' => 'required|string|in:Menunggu Verifikasi,Diproses,Selesai,Ditolak',
            'keterangan' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $pengaduan->update($validator->validated());

        if ($pengaduan->lampiran_path) {
            $pengaduan->lampiran_url = Storage::disk('public')->url($pengaduan->lampiran_path);
        }

        return response()->json([
            'success' => true,
            'message' => 'Status pengaduan berhasil diperbarui',
            'data' => $pengaduan
        ]);
    }

    public function adminListBukuTamu(Request $request, $villageId): JsonResponse
    {
        $village = Village::findOrFail($villageId);

        $items = BukuTamu::where('village_id', $village->id)
            ->orderBy('tanggal_kunjungan', 'desc')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($item) {
                if ($item->tanda_tangan_path) {
                    $item->tanda_tangan_url = Storage::disk('public')->url($item->tanda_tangan_path);
                }
                return $item;
            });

        return response()->json([
            'success' => true,
            'data' => $items
        ]);
    }

    public function adminDestroySuratPengantar($villageId, $id): JsonResponse
    {
        $village = Village::findOrFail($villageId);
        $surat = SuratPengantar::where('village_id', $village->id)->findOrFail($id);
        
        if ($surat->file_hasil_path) {
            Storage::disk('public')->delete($surat->file_hasil_path);
        }
        
        $surat->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Permohonan surat pengantar berhasil dihapus'
        ]);
    }

    public function adminDestroyPengaduan($villageId, $id): JsonResponse
    {
        $village = Village::findOrFail($villageId);
        $pengaduan = Pengaduan::where('village_id', $village->id)->findOrFail($id);
        
        if ($pengaduan->lampiran_path) {
            Storage::disk('public')->delete($pengaduan->lampiran_path);
        }
        
        $pengaduan->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Pengaduan berhasil dihapus'
        ]);
    }

    public function adminDestroyBukuTamu($villageId, $id): JsonResponse
    {
        $village = Village::findOrFail($villageId);
        $bukuTamu = BukuTamu::where('village_id', $village->id)->findOrFail($id);
        
        if ($bukuTamu->tanda_tangan_path) {
            Storage::disk('public')->delete($bukuTamu->tanda_tangan_path);
        }
        
        $bukuTamu->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Catatan buku tamu berhasil dihapus'
        ]);
    }
}
