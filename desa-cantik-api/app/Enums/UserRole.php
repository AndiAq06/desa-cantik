<?php

namespace App\Enums;

/**
 * User Role Enum - replaces roles table
 * Used for role-based access control throughout the application
 */
enum UserRole: string
{
    case BPS_ADMIN = 'bps_admin';
    case VILLAGE_OFFICER = 'village_officer';
    case GUEST = 'guest';

    /**
     * Get the display name for this role
     */
    public function displayName(): string
    {
        return match ($this) {
            self::BPS_ADMIN => 'Admin BPS',
            self::VILLAGE_OFFICER => 'Perangkat Desa',
            self::GUEST => 'Guest',
        };
    }

    /**
     * Check if this role is an admin role
     */
    public function isAdmin(): bool
    {
        return $this === self::BPS_ADMIN;
    }

    /**
     * Check if user has village-scoped access only
     */
    public function isVillageScoped(): bool
    {
        return $this === self::VILLAGE_OFFICER;
    }
}
