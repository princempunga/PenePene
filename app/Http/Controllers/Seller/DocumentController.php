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
        'national_id'           => 'National ID',
        'passport'              => 'Passport',
        'business_registration' => 'Business Registration',
        'tax_certificate'       => 'Tax Certificate',
        'other'                 => 'Other Document',
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
        ]);

        $path = $request->file('document_file')->store('seller_documents', 'public');

        $seller->documents()->create([
            'document_type'   => $request->document_type,
            'document_number' => $request->document_number,
            'document_file'   => $path,
            'status'          => 'pending',
        ]);

        return back()->with('success', 'Document uploaded successfully. It will be reviewed shortly.');
    }

    public function destroy(Request $request, SellerDocument $document)
    {
        if ($document->seller_id !== $request->user()->seller->id) {
            abort(403);
        }

        if ($document->status === 'verified') {
            return back()->with('error', 'Verified documents cannot be removed.');
        }

        Storage::disk('public')->delete($document->document_file);
        $document->delete();

        return back()->with('success', 'Document removed.');
    }
}
