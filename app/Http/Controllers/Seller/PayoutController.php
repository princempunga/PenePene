<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Commission;
use App\Models\Payout;
use App\Models\Seller;
use Illuminate\Support\Facades\DB;

class PayoutController extends Controller
{
    public function index(Request $request)
    {
        $seller = $request->user()->seller;

        $payouts = Payout::where('seller_id', $seller->id)
            ->latest('requested_at')
            ->paginate(15);

        $pendingRequests = Payout::where('seller_id', $seller->id)
            ->whereIn('status', ['pending', 'processing'])
            ->sum('amount');

        $totalPaidOut = Payout::where('seller_id', $seller->id)
            ->where('status', 'completed')
            ->sum('amount');

        return Inertia::render('Seller/Payouts/Index', [
            'payouts' => $payouts,
            'summary' => [
                'available_balance'   => $this->availableBalance($seller->id),
                'pending_requests'    => $pendingRequests,
                'total_paid_out'      => $totalPaidOut,
                'has_pending_request' => $pendingRequests > 0,
                'currency'            => 'CDF',
            ],
        ]);
    }

    public function store(Request $request)
    {
        $seller = $request->user()->seller;

        // Première estimation, hors verrou, uniquement pour donner un message
        // de validation utile côté formulaire.
        $available = $this->availableBalance($seller->id);

        $request->validate([
            'amount'         => "required|numeric|min:1000|max:{$available}",
            'payment_method' => 'required|in:mobile_money,bank_transfer',
            'account_number' => 'required|string|max:50',
            'account_name'   => 'required|string|max:255',
            'notes'          => 'nullable|string|max:500',
        ], [
            'amount.required'         => 'Le montant est obligatoire.',
            'amount.numeric'          => 'Le montant doit être un nombre.',
            'amount.min'              => 'Le montant minimum de retrait est de 1 000,00 FC.',
            'amount.max'              => 'Le montant ne peut pas dépasser votre solde disponible.',
            'payment_method.required' => 'Le mode de paiement est obligatoire.',
            'payment_method.in'       => 'Le mode de paiement sélectionné est invalide.',
            'account_number.required' => 'Le numéro de compte est obligatoire.',
            'account_number.max'      => 'Le numéro de compte ne peut pas dépasser 50 caractères.',
            'account_name.required'   => 'Le nom du compte est obligatoire.',
            'account_name.max'        => 'Le nom du compte ne peut pas dépasser 255 caractères.',
            'notes.max'               => 'Les notes ne peuvent pas dépasser 500 caractères.',
        ]);

        return DB::transaction(function () use ($request, $seller) {
            // Verrouille la ligne du vendeur pour la durée de la transaction :
            // deux soumissions concurrentes de ce même vendeur sont ainsi
            // sérialisées, ce qui ferme la fenêtre entre la vérification
            // "pas de retrait en attente" et la création du nouveau retrait.
            $lockedSeller = Seller::whereKey($seller->id)->lockForUpdate()->first();

            if (Payout::where('seller_id', $lockedSeller->id)->whereIn('status', ['pending', 'processing'])->exists()) {
                return back()->with('error', 'Vous avez déjà une demande de retrait en cours de traitement.');
            }

            // Le solde disponible est recalculé sous verrou : une demande
            // créée par une requête concurrente juste avant l'acquisition du
            // verrou est maintenant visible et prise en compte ici.
            $availableUnderLock = $this->availableBalance($lockedSeller->id);
            if ((float) $request->amount > $availableUnderLock) {
                return back()
                    ->withInput()
                    ->with('error', 'Le montant ne peut pas dépasser votre solde disponible.');
            }

            Payout::create([
                'seller_id'      => $lockedSeller->id,
                'amount'         => $request->amount,
                'currency'       => 'CDF',
                'status'         => 'pending',
                'payment_method' => $request->payment_method,
                'account_number' => $request->account_number,
                'account_name'   => $request->account_name,
                'notes'          => $request->notes,
                'requested_at'   => now(),
            ]);

            return back()->with('success', 'Demande de retrait soumise avec succès.');
        });
    }

    private function availableBalance(int $sellerId): float
    {
        $confirmedEarnings = Commission::where('seller_id', $sellerId)
            ->whereIn('status', ['confirmed', 'paid'])
            ->sum('seller_payout');

        $totalPaidOut = Payout::where('seller_id', $sellerId)
            ->where('status', 'completed')
            ->sum('amount');

        $pendingRequests = Payout::where('seller_id', $sellerId)
            ->whereIn('status', ['pending', 'processing'])
            ->sum('amount');

        return max(0, $confirmedEarnings - $totalPaidOut - $pendingRequests);
    }
}
