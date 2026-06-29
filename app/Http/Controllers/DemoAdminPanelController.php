<?php

namespace App\Http\Controllers;

use App\Models\PlatformSetting;
use App\Services\DemoSimulationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class DemoAdminPanelController extends Controller
{
    public function index()
    {
        abort_unless(DemoSimulationService::enabled(), 404);
        abort_unless(
            in_array(auth()->user()?->role, ['super_admin', 'admin'], true),
            403
        );

        $demo = DemoSimulationService::demoAdminPanelData();

        return Inertia::render('Demo/AdminPanel', [
            'stats'           => $demo['stats'],
            'salesChart'      => $demo['salesChart'],
            'trafficSources'  => $demo['trafficSources'],
            'pendingSellers'  => $demo['pendingSellers'],
            'recentOrders'    => $demo['recentOrders'],
            'topProducts'     => $demo['topProducts'],
            'activityFeed'    => $demo['activityFeed'],
            'regions'         => $demo['regions'],
            'maintenanceMode' => (bool) Cache::get('demo_admin_maintenance', false),
            'quickLinks'      => DemoSimulationService::adminQuickLinks(),
        ]);
    }

    public function toggleMaintenance(Request $request)
    {
        abort_unless(DemoSimulationService::enabled(), 404);
        abort_unless(
            in_array(auth()->user()?->role, ['super_admin', 'admin'], true),
            403
        );

        $request->validate(['enabled' => 'required|boolean']);

        $enabled = (bool) $request->enabled;
        Cache::forever('demo_admin_maintenance', $enabled);

        PlatformSetting::where('key', 'maintenance_mode')->update([
            'value' => $enabled ? '1' : '0',
        ]);

        return back()->with(
            'success',
            $enabled ? 'Mode maintenance activé (simulation).' : 'Mode maintenance désactivé (simulation).'
        );
    }
}
