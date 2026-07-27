<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FooterSetting extends Model
{
    protected $fillable = [
        'email',
        'phone',
        'bps_torut',
        'bps_sulsel',
        'bps_ri',
    ];
}
