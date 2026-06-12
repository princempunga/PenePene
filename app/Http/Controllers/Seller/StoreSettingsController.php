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
        ], [
            'business_name.required' => 'Le nom de la boutique est obligatoire.',
            'business_name.max'      => 'Le nom de la boutique ne peut pas dépasser 255 caractères.',
            'description.max'        => 'La description ne peut pas dépasser 5000 caractères.',
            'phone.max'              => 'Le numéro de téléphone ne peut pas dépasser 30 caractères.',
            'whatsapp.max'           => 'Le numéro WhatsApp ne peut pas dépasser 30 caractères.',
            'email.email'            => 'L\'adresse e-mail n\'est pas valide.',
            'email.max'              => 'L\'adresse e-mail ne peut pas dépasser 255 caractères.',
            'website.url'            => 'L\'URL du site web n\'est pas valide.',
            'website.max'            => 'L\'URL du site web ne peut pas dépasser 255 caractères.',
            'address.max'            => 'L\'adresse ne peut pas dépasser 500 caractères.',
            'city.max'               => 'La ville ne peut pas dépasser 100 caractères.',
            'country.max'            => 'Le pays ne peut pas dépasser 100 caractères.',
            'logo.image'             => 'Le logo doit être une image.',
            'logo.max'               => 'Le logo ne peut pas dépasser 2 Mo.',
            'banner.image'           => 'La bannière doit être une image.',
            'banner.max'             => 'La bannière ne peut pas dépasser 4 Mo.',
            'business_hours.array'   => 'Les heures d\'ouverture doivent être un tableau valide.',
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
                'business_name.unique' => 'Une boutique avec un nom similaire existe déjà.',
            ]);
            $data['slug'] = $slug;
        }

        $seller->update($data);

        return back()->with('success', 'Paramètres de la boutique enregistrés avec succès.');
    }
}
