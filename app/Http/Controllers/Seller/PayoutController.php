<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Commission;
use App\Models\Payout;

class PayoutController extends Controller
{
    public function index(Request $request)
    {
        $seller = $request->user()->seller;

        $payouts = Payout::where('seller_id', $seller->id)
            ->latest('requested_at')
            ->paginate(15);

        $confirmedEarnings = Commission::where('seller_id', $seller->id)
            ->whereIn('status', ['confirmed', 'paid'])
            ->sum('seller_payout');

        $totalPaidOut = Payout::where('seller_id', $seller->id)
            ->where('status', 'completed')
            ->sum('amount');

        $pendingRequests = Payout::where('seller_id', $seller->id)
            ->whereIn('status', ['pending', 'processing'])
            ->sum('amount');

        $hasPendingRequest = Payout::where('seller_id', $seller->id)
            ->whereIn('status', ['pending', 'processing'])
            ->exists();

        return Inertia::render('Seller/Payouts/Index', [
            'payouts' => $payouts,
            'summary' => [
                'available_balance'   => max(0, $confirmedEarnings - $totalPaidOut - $pendingRequests),
                'pending_requests'    => $pendingRequests,
                'total_paid_out'      => $totalPaidOut,
                'has_pending_request' => $hasPendingRequest,
                'currency'            => 'CDF',
            ],
        ]);
    }

    public function store(Request $request)
    {
        $seller = $request->user()->seller;

        $confirmedEarnings = Commission::where('seller_id', $seller->id)
            ->whereIn('status', ['confirmed', 'paid'])
            ->sum('seller_payout');

        $totalPaidOut = Payout::where('seller_id', $seller->id)
            ->where('status', 'completed')
            ->sum('amount');

        $pendingRequests = Payout::where('seller_id', $seller->id)
            ->whereIn('status', ['pending', 'processing'])
            ->sum('amount');

        $available = max(0, $confirmedEarnings - $totalPaidOut - $pendingRequests);

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

        if (Payout::where('seller_id', $seller->id)->whereIn('status', ['pending', 'processing'])->exists()) {
            return back()->with('error', 'Vous avez déjà une demande de retrait en cours de traitement.');
        }

        Payout::create([
            'seller_id'      => $seller->id,
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
    }
}
