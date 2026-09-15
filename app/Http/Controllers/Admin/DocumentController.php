<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\SellerDocument;
use Illuminate\Http\Request;

class DocumentController extends Controller
{
    private const DOCUMENT_TYPES = [
        'national_id'           => 'Carte d\'identité nationale',
        'passport'              => 'Passeport',
        'business_registration' => 'Immatriculation d\'entreprise',
        'tax_certificate'       => 'Certificat fiscal',
        'other'                 => 'Autre document',
    ];

    public function verify(Request $request, SellerDocument $document)
    {
        $document->update([
            'status'            => 'verified',
            // Un document ré-approuvé après un rejet ne doit pas garder
            // l'ancien motif affiché.
            'rejection_reason'  => null,
            'verified_at'       => now(),
            'verified_by'       => $request->user()->id,
        ]);

        $this->notifySeller($document, verified: true);

        return back()->with('success', 'Document vérifié avec succès.');
    }

    public function reject(Request $request, SellerDocument $document)
    {
        $request->validate([
            'reason' => 'required|string|max:500',
        ], [
            'reason.required' => 'Le motif du rejet est obligatoire.',
        ]);

        $document->update([
            'status'            => 'rejected',
            'rejection_reason'  => $request->reason,
            'verified_at'       => now(),
            'verified_by'       => $request->user()->id,
        ]);

        $this->notifySeller($document, verified: false);

        return back()->with('success', 'Document rejeté et vendeur notifié.');
    }

    private function notifySeller(SellerDocument $document, bool $verified): void
    {
        $seller = $document->seller;

        if (! $seller) {
            return;
        }

        $typeLabel = self::DOCUMENT_TYPES[$document->document_type] ?? $document->document_type;

        Notification::create([
            'user_id'    => $seller->user_id,
            'type'       => 'document',
            'title'      => $verified ? 'Document vérifié' : 'Document rejeté',
            'body'       => $verified
                ? "Votre document {$typeLabel} a été vérifié."
                : "Votre document {$typeLabel} a été rejeté : {$document->rejection_reason}",
            'action_url' => '/seller/documents',
        ]);
    }
}
