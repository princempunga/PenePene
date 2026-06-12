<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\SellerDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class DocumentController extends Controller
{
    private const DOCUMENT_TYPES = [
        'national_id'           => 'Carte d\'identité nationale',
        'passport'              => 'Passeport',
        'business_registration' => 'Immatriculation d\'entreprise',
        'tax_certificate'       => 'Certificat fiscal',
        'other'                 => 'Autre document',
    ];

    public function index(Request $request)
    {
        $seller = $request->user()->seller;

        return Inertia::render('Seller/Documents/Index', [
            'documents'     => $seller->documents()->latest()->get(),
            'documentTypes' => self::DOCUMENT_TYPES,
        ]);
    }

    public function store(Request $request)
    {
        $seller = $request->user()->seller;

        $request->validate([
            'document_type'   => 'required|in:' . implode(',', array_keys(self::DOCUMENT_TYPES)),
            'document_number' => 'nullable|string|max:100',
            'document_file'   => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ], [
            'document_type.required' => 'Le type de document est obligatoire.',
            'document_type.in'       => 'Le type de document sélectionné est invalide.',
            'document_number.max'    => 'Le numéro du document ne peut pas dépasser :max caractères.',
            'document_file.required' => 'Le fichier est obligatoire.',
            'document_file.file'     => 'Le fichier téléversé est invalide.',
            'document_file.mimes'    => 'Le fichier doit être au format PDF, JPG ou PNG.',
            'document_file.max'      => 'Le fichier ne doit pas dépasser 5 Mo.',
        ]);

        $path = $request->file('document_file')->store('seller_documents', 'public');

        $seller->documents()->create([
            'document_type'   => $request->document_type,
            'document_number' => $request->document_number,
            'document_file'   => $path,
            'status'          => 'pending',
        ]);

        return back()->with('success', 'Document téléversé avec succès. Il sera examiné sous peu.');
    }

    public function destroy(Request $request, SellerDocument $document)
    {
        if ($document->seller_id !== $request->user()->seller->id) {
            abort(403);
        }

        if ($document->status === 'verified') {
            return back()->with('error', 'Les documents approuvés ne peuvent pas être supprimés.');
        }

        Storage::disk('public')->delete($document->document_file);
        $document->delete();

        return back()->with('success', 'Document supprimé.');
    }
}
