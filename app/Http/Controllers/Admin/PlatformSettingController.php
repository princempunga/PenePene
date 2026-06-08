<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\PlatformSetting;

class PlatformSettingController extends Controller
{
    public function index()
    {
        $settings = PlatformSetting::all()->groupBy('group');

        return Inertia::render('Admin/Settings/Index', ['settings' => $settings]);
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
