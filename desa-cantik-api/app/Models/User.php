<?php

namespace App\Models;

use App\Enums\UserRole;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    protected $fillable = [
        'username',
        'full_name',
        'email',
        'password',
        'role',
        'village_id',
    ];

    protected $hidden = [
        'password',
    ];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'role' => UserRole::class,
        ];
    }

    /**
     * Check if user is BPS Admin
     */
    public function isAdmin(): bool
    {
        return $this->role === UserRole::BPS_ADMIN;
    }

    /**
     * Check if user is Village Officer
     */
    public function isVillageOfficer(): bool
    {
        return $this->role === UserRole::VILLAGE_OFFICER;
    }

    /**
     * Get display name for the role
     */
    public function getRoleDisplayNameAttribute(): string
    {
        return $this->role?->displayName() ?? 'Unknown';
    }

    public function village(): BelongsTo
    {
        return $this->belongsTo(Village::class, 'village_id');
    }

    public function activityLogs(): HasMany
    {
        return $this->hasMany(ActivityLog::class);
    }
}
