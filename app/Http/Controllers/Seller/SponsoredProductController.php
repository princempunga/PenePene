<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\SponsoredProduct;
use App\Models\Product;
use Illuminate\Support\Facades\Auth;

class SponsoredProductController extends Controller
{
    protected function seller()
    {
        return Auth::user()->seller;
    }

    public function index()
    {
        $sponsored = SponsoredProduct::with('product')
            ->where('seller_id', $this->seller()->id)
            ->latest()
            ->paginate(15);

        return Inertia::render('Seller/Sponsored/Index', ['sponsored' => $sponsored]);
    }

    public function create()
    {
        $products = Product::where('seller_id', $this->seller()->id)
            ->where('status', 'active')
            ->get(['id', 'name']);

        return Inertia::render('Seller/Sponsored/Create', ['products' => $products]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'product_id'  => 'required|exists:products,id',
            'placement'   => 'required|in:homepage_banner,product_of_day,product_of_week,featured_listing,category_top',
            'starts_at'   => 'required|date|after:today',
            'expires_at'  => 'required|date|after:starts_at',
        ], [
            'product_id.required' => 'Veuillez sélectionner un produit.',
            'product_id.exists'   => 'Le produit sélectionné est invalide.',
            'placement.required'  => 'L\'emplacement est obligatoire.',
            'placement.in'        => 'L\'emplacement sélectionné est invalide.',
            'starts_at.required'  => 'La date de début est obligatoire.',
            'starts_at.date'      => 'La date de début doit être une date valide.',
            'starts_at.after'     => 'La date de début doit être postérieure à aujourd\'hui.',
            'expires_at.required' => 'La date de fin est obligatoire.',
            'expires_at.date'     => 'La date de fin doit être une date valide.',
            'expires_at.after'    => 'La date de fin doit être postérieure à la date de début.',
        ]);

        // Verify product belongs to this seller
        $product = Product::where('id', $request->product_id)
            ->where('seller_id', $this->seller()->id)
            ->firstOrFail();

        SponsoredProduct::create([
            'product_id'  => $product->id,
            'seller_id'   => $this->seller()->id,
            'placement'   => $request->placement,
            'starts_at'   => $request->starts_at,
            'expires_at'  => $request->expires_at,
            'amount_paid' => 0, // V1: admin sets price, not auto-charged
            'status'      => 'pending', // Admin must approve
        ]);

        return redirect()->route('seller.sponsored.index')
            ->with('success', 'Votre demande de produit sponsorisé a été soumise pour examen par l\'administrateur.');
    }

    public function destroy(SponsoredProduct $sponsored)
    {
        if ($sponsored->seller_id !== $this->seller()->id) {
            abort(403);
        }

        if ($sponsored->status === 'active') {
            return back()->withErrors(['error' => 'Impossible d\'annuler une campagne sponsorisée active.']);
        }

        $sponsored->delete();

        return back()->with('success', 'Demande de produit sponsorisé supprimée.');
    }
}
