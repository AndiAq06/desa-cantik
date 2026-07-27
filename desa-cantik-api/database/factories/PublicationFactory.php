<?php

namespace Database\Factories;

use App\Models\Publication;
use App\Models\User;
use App\Models\Village;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Publication>
 */
class PublicationFactory extends Factory
{
    protected $model = Publication::class;

    public function definition(): array
    {
        return [
            'village_id' => Village::factory(),
            'title' => fake()->sentence(4),
            'description' => fake()->paragraph(),
            'file_path' => null, // Factory cannot create real files; set to null
            'file_name' => fake()->lexify('document_????').'.pdf',
            'file_type' => 'pdf',
            'file_size_bytes' => fake()->numberBetween(10_000, 1_000_000),
            'published_at' => fake()->date(),
            'uploaded_by' => User::factory(),
            'status' => 'Draft',
            'category' => fake()->randomElement(['Statistik Desa', 'Sosial', 'Ekonomi Lokal', 'Pemerintahan']),
        ];
    }
}
