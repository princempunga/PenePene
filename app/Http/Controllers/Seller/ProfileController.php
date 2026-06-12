<?php

namespace App\Http\Controllers\Seller;

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

        return Inertia::render('Seller/Profile', [
            'user' => $user,
        ]);
    }

    public function update(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'name'   => 'required|string|max:255',
            'phone'  => 'nullable|string|max:30',
            'avatar' => 'nullable|image|max:2048',
        ], [
            'name.required' => 'Le nom est obligatoire.',
            'name.max'      => 'Le nom ne peut pas dépasser 255 caractères.',
            'phone.max'     => 'Le numéro de téléphone ne peut pas dépasser 30 caractères.',
            'avatar.image'  => 'La photo de profil doit être une image.',
            'avatar.max'    => 'La photo de profil ne peut pas dépasser 2 Mo.',
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

        return back()->with('success', 'Profil mis à jour avec succès.');
    }

    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required|current_password',
            'password'         => ['required', 'confirmed', Password::min(8)],
        ], [
            'current_password.required'        => 'Le mot de passe actuel est obligatoire.',
            'current_password.current_password' => 'Le mot de passe actuel est incorrect.',
            'password.required'                => 'Le nouveau mot de passe est obligatoire.',
            'password.confirmed'               => 'La confirmation du mot de passe ne correspond pas.',
            'password.min'                     => 'Le mot de passe doit contenir au moins 8 caractères.',
        ]);

        $request->user()->update([
            'password' => Hash::make($request->password),
        ]);

        return back()->with('success', 'Mot de passe modifié avec succès.');
    }
}
