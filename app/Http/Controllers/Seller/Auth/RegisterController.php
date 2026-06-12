<?php

namespace App\Http\Controllers\Seller\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Seller;
use App\Models\SubscriptionPlan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Auth\Events\Registered;
use Inertia\Inertia;
use Illuminate\Support\Str;

class RegisterController extends Controller
{
    public function create()
    {
        $plans = SubscriptionPlan::where('is_active', true)->get();
        return Inertia::render('Seller/Auth/Register', [
            'plans' => $plans,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'           => 'required|string|max:255',
            'email'          => 'required|string|email|max:255|unique:users',
            'password'       => 'required|string|min:8|confirmed',
            'phone'          => 'required|string|max:30',
            'business_name'  => 'required|string|max:255',
            'description'    => 'nullable|string',
            'address'        => 'required|string',
            'city'           => 'required|string',
            'country'        => 'required|string',
            'document'       => 'required|file|mimes:pdf,jpg,png|max:5120',
            'plan_id'        => 'required|exists:subscription_plans,id',
        ], [
            'name.required'          => 'Le nom est obligatoire.',
            'email.required'         => 'L\'adresse e-mail est obligatoire.',
            'email.email'            => 'L\'adresse e-mail doit être valide.',
            'email.unique'           => 'Cette adresse e-mail est déjà utilisée.',
            'password.required'      => 'Le mot de passe est obligatoire.',
            'password.min'           => 'Le mot de passe doit contenir au moins :min caractères.',
            'password.confirmed'     => 'La confirmation du mot de passe ne correspond pas.',
            'phone.required'         => 'Le numéro de téléphone est obligatoire.',
            'business_name.required' => 'Le nom de la boutique est obligatoire.',
            'address.required'       => 'L\'adresse est obligatoire.',
            'city.required'          => 'La ville est obligatoire.',
            'country.required'       => 'Le pays est obligatoire.',
            'document.required'      => 'Le document de vérification est obligatoire.',
            'document.file'          => 'Le document téléversé est invalide.',
            'document.mimes'         => 'Le document doit être au format PDF, JPG ou PNG.',
            'document.max'           => 'Le document ne doit pas dépasser 5 Mo.',
            'plan_id.required'       => 'Veuillez sélectionner un plan d\'abonnement.',
            'plan_id.exists'         => 'Le plan sélectionné est invalide.',
        ]);

        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'phone'    => $request->phone,
            'password' => Hash::make($request->password),
            'role'     => 'seller',
        ]);

        // Upload verification document
        $documentPath = $request->file('document')->store('seller_documents', 'public');

        $seller = Seller::create([
            'user_id'            => $user->id,
            'business_name'      => $request->business_name,
            'slug'               => Str::slug($request->business_name) . '-' . uniqid(),
            'description'        => $request->description,
            'address'            => $request->address,
            'city'               => $request->city,
            'country'            => $request->country,
            'verification_document' => $documentPath,
            'is_verified'        => false, // Requires admin approval
            'status'             => 'pending',
            'subscription_plan_id' => $request->plan_id,
            'subscription_expires_at' => now()->addMonth(), // 1 month trial/initial
        ]);

        event(new Registered($user));

        Auth::login($user);

        return redirect()->route('seller.dashboard')
            ->with('success', 'Compte vendeur créé ! Veuillez patienter pendant la vérification par l\'administrateur.');
    }
}
