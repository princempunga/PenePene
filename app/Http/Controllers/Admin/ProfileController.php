<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class ProfileController extends Controller
{
    public function edit(Request $request)
    {
        $user = $request->user();

        return Inertia::render('Admin/Profile', [
            'user' => $user,
        ]);
    }

    public function update(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'name'   => 'required|string|max:255',
            'phone'  => 'nullable|string|max:30',
            'avatar' => 'nullable|image|max:5120',
        ], [
            'name.required' => 'The name field is required.',
            'name.max'      => 'The name may not be greater than 255 characters.',
            'phone.max'     => 'The phone number may not be greater than 30 characters.',
            'avatar.image'  => 'The profile photo must be an image.',
            'avatar.max'    => 'The profile photo may not be greater than 5 MB.',
        ]);

        $data = [
            'name'  => $request->name,
            'phone' => $request->phone,
        ];

        if ($request->hasFile('avatar')) {
            if ($user->avatar) {
                Storage::disk('public')->delete($user->avatar);
            }
            $data['avatar'] = $request->file('avatar')->store('avatars', 'public');
        }

        $user->update($data);

        return back()->with('success', 'Profile updated successfully.');
    }

    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required|current_password',
            'password'         => ['required', 'confirmed', Password::min(8)],
        ], [
            'current_password.required'         => 'The current password field is required.',
            'current_password.current_password' => 'The provided password is incorrect.',
            'password.required'                 => 'The new password field is required.',
            'password.confirmed'                => 'The password confirmation does not match.',
            'password.min'                      => 'The password must be at least 8 characters.',
        ]);

        $request->user()->update([
            'password' => Hash::make($request->password),
        ]);

        return back()->with('success', 'Password changed successfully.');
    }
}
