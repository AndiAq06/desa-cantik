<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$response = $kernel->handle(
    $request = Illuminate\Http\Request::capture()
);

use App\Models\TeamMember;

try {
    $count = TeamMember::count();
    echo "Team Member Count: " . $count;
    if ($count > 0) {
        echo "\nFirst Member: " . TeamMember::first()->name;
    }
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage();
}
