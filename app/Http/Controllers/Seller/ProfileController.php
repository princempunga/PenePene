<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    public function edit(Request $request)
    {
        $user   = $request->user();
        $seller = $user->seller;

        return Inertia::render('Seller/Profile', [
            'user'   => $user,
            'seller' => $seller,
        ]);
    }

    public function update(Request $request)
    {
        $user   = $request->user();
        $seller = $user->seller;

        $request->validate([
            'name'          => 'required|string|max:255',
            'phone'         => 'required|string|max:30',
            'business_name' => 'required|string|max:255',
            'description'   => 'nullable|string',
            'address'       => 'required|string|max:500',
            'city'          => 'required|string|max:100',
            'country'       => 'required|string|max:100',
            'banner'        => 'nullable|image|max:2048',
        ]);

        $user->update([
            'name'  => $request->name,
            'phone' => $request->phone,
        ]);

        $sellerData = [
            'business_name' => $request->business_name,
            'description'   => $request->description,
            'address'       => $request->address,
            'city'          => $request->city,
            'country'       => $request->country,
        ];

        if ($request->hasFile('banner')) {
            if ($seller->banner_path) {
                Storage::disk('public')->delete($seller->banner_path);
            }
            $sellerData['banner_path'] = $request->file('banner')->store('seller_banners', 'public');
        }

        $seller->update($sellerData);

        return back()->with('success', 'Profile updated successfully.');
    }

    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required|current_password',
            'password'         => ['required', 'confirmed', Password::min(8)],
        ]);

        $request->user()->update([
            'password' => Hash::make($request->password),
        ]);

        return back()->with('success', 'Password changed successfully.');
    }
}
