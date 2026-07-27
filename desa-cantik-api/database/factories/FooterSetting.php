<?php

namespace Database\Factories;

use App\Models\FooterSetting;
use Illuminate\Database\Eloquent\Factories\Factory;

class FooterSettingFactory extends Factory
{
    protected $model = FooterSetting::class;

    public function definition(): array
    {
        return [
            'email'      => $this->faker->email(),
            'phone'      => $this->faker->phoneNumber(),
            'bps_torut'  => $this->faker->phoneNumber(),
            'bps_sulsel' => $this->faker->phoneNumber(),
            'bps_ri'     => $this->faker->phoneNumber(),
        ];
    }
}
