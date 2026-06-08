<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class StoreSettingsController extends Controller
{
    public function edit(Request $request)
    {
        $seller = $request->user()->seller;

        return Inertia::render('Seller/Store/Settings', [
            'seller' => $seller,
        ]);
    }

    public function update(Request $request)
    {
        $seller = $request->user()->seller;

        $validated = $request->validate([
            'business_name'   => 'required|string|max:255',
            'description'     => 'nullable|string|max:5000',
            'phone'           => 'nullable|string|max:30',
            'whatsapp'        => 'nullable|string|max:30',
            'email'           => 'nullable|email|max:255',
            'website'         => 'nullable|url|max:255',
            'address'         => 'nullable|string|max:500',
            'city'            => 'nullable|string|max:100',
            'country'         => 'nullable|string|max:100',
            'logo'            => 'nullable|image|max:2048',
            'banner'          => 'nullable|image|max:4096',
            'business_hours'  => 'nullable|array',
            'business_hours.*.open'   => 'nullable|string|max:5',
            'business_hours.*.close'  => 'nullable|string|max:5',
            'business_hours.*.closed' => 'nullable|boolean',
        ]);

        $data = collect($validated)->except(['logo', 'banner'])->toArray();

        if ($request->hasFile('logo')) {
            if ($seller->logo) {
                Storage::disk('public')->delete($seller->logo);
            }
            $data['logo'] = $request->file('logo')->store('seller_logos', 'public');
        }

        if ($request->hasFile('banner')) {
            if ($seller->banner) {
                Storage::disk('public')->delete($seller->banner);
            }
            $data['banner'] = $request->file('banner')->store('seller_banners', 'public');
        }

        if ($request->filled('business_name') && $request->business_name !== $seller->business_name) {
            $slug = Str::slug($request->business_name);
            $request->validate([
                'business_name' => [Rule::unique('sellers', 'slug')->ignore($seller->id)],
            ], [
                'business_name.unique' => 'A store with a similar name already exists.',
            ]);
            $data['slug'] = $slug;
        }

        $seller->update($data);

        return back()->with('success', 'Store settings saved successfully.');
    }
}
