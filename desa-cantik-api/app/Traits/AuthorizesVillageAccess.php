<?php

namespace App\Traits;

use App\Enums\UserRole;
use App\Exceptions\VillageAccessDeniedException;
use App\Models\User;
use App\Models\Village;

trait AuthorizesVillageAccess
{
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
}
