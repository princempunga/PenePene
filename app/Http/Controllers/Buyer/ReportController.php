<?php

namespace App\Http\Controllers\Buyer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'seller_id'   => 'required|exists:sellers,id',
            'category'    => 'required|string|max:255',
            'description' => 'required|string|max:2000',
            'evidence.*'  => 'nullable|file|mimes:jpeg,png,jpg,pdf,mp4,mov|max:10240', // max 10MB
        ]);

        $evidencePaths = [];
        if ($request->hasFile('evidence')) {
            foreach ($request->file('evidence') as $file) {
                $evidencePaths[] = $file->store('reports/evidence', 'public');
            }
        }

        \App\Models\SellerReport::create([
            'reporter_id'        => $request->user()->id,
            'reported_seller_id' => $request->seller_id,
            'category'           => $request->category,
            'description'        => $request->description,
            'evidence_files'     => $evidencePaths,
            'status'             => 'pending',
        ]);

        return back()->with('success', 'Report submitted successfully. Our Trust & Safety team will investigate.');
    }
}
