<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PlatformSetting;
use App\Services\AdminDemoDataService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PlatformSettingController extends Controller
{
    use SimulatesData;

    public function index()
    {
        $settings = PlatformSetting::all()->groupBy('group');

        $usingDemo = $this->adminDemoEnabled() && $settings->isEmpty();

        if ($usingDemo) {
            $settings = AdminDemoDataService::platformSettings();
        }

        return Inertia::render('Admin/Settings/Index', [
            'settings'      => $settings,
            'usingDemoData' => $usingDemo,
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'settings'   => 'required|array',
            'settings.*' => 'nullable|string',
        ]);

        foreach ($request->settings as $key => $value) {
            PlatformSetting::where('key', $key)->update(['value' => $value ?? '']);
        }

        return back()->with('success', 'Platform settings saved successfully.');
    }
}
