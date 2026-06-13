<?php

namespace App\Http\Controllers\Seller\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Seller;
use App\Models\SubscriptionPlan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Auth\Events\Registered;
use Inertia\Inertia;
use Illuminate\Support\Str;

class RegisterController extends Controller
{
    public function create()
    {
        $user = auth()->user();
        if ($user?->role === 'seller') {
            return redirect()->route('seller.dashboard');
        }

        $plans = SubscriptionPlan::where('is_active', true)->get();
        return Inertia::render('Seller/Auth/Register', [
            'plans' => $plans,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'              => 'required|string|max:255',
            'email'             => 'required|string|email|max:255|unique:users',
            'password'          => 'required|string|min:8|confirmed',
            'phone'             => 'required|string|max:30',
            'business_name'     => 'required|string|max:255',
            'description'       => 'nullable|string',
            'business_category' => 'nullable|string',
            'address'           => 'required|string',
            'city'              => 'required|string',
            'whatsapp'          => 'nullable|string|max:30',
            'logo'              => 'nullable|image|mimes:jpeg,png,jpg|max:5120',
            'cover_image'       => 'nullable|image|mimes:jpeg,png,jpg|max:5120',
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
        ]);

        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'phone'    => $request->phone,
            'password' => Hash::make($request->password),
            'role'     => 'seller',
            'locale'   => $request->session()->get('locale', config('app.locale')),
        ]);

        $logoPath = null;
        if ($request->hasFile('logo')) {
            $logoPath = $request->file('logo')->store('seller_logos', 'public');
        }

        $bannerPath = null;
        if ($request->hasFile('cover_image')) {
            $bannerPath = $request->file('cover_image')->store('seller_banners', 'public');
        }

        $fullDescription = $request->description;
        if ($request->business_category) {
            $fullDescription = 'Category: ' . $request->business_category . "\n\n" . $fullDescription;
        }

        $freePlan = SubscriptionPlan::where('is_active', true)->where('price', 0)->first()
                 ?? SubscriptionPlan::where('is_active', true)->first();

        Seller::create([
            'user_id'                 => $user->id,
            'business_name'           => $request->business_name,
            'slug'                    => Str::slug($request->business_name) . '-' . uniqid(),
            'description'             => $fullDescription,
            'address'                 => $request->address,
            'city'                    => $request->city,
            'country'                 => 'Tanzania',
            'whatsapp'                => $request->whatsapp,
            'logo'                    => $logoPath,
            'banner'                  => $bannerPath,
            'status'                  => 'pending',
            'subscription_plan_id'    => $freePlan ? $freePlan->id : null,
            'subscription_expires_at' => now()->addYears(10),
        ]);

        event(new Registered($user));

        Auth::login($user);

        return redirect()->route('seller.dashboard')
            ->with('success', 'Compte vendeur créé ! Veuillez patienter pendant la vérification par l\'administrateur.');
    }
}
