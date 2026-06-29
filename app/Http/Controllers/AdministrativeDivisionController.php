<?php

namespace App\Http\Controllers;

use App\Models\AdministrativeDivision;
use Illuminate\Http\Request;

class AdministrativeDivisionController extends Controller
{
    public function index(Request $request)
    {
        $request->validate([
            'parent_id' => 'nullable|integer|exists:administrative_divisions,id',
            'level'     => 'nullable|in:province,ville,territoire,commune,secteur,quartier',
        ]);

        $query = AdministrativeDivision::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('name');

        if ($request->filled('parent_id')) {
            $query->where('parent_id', $request->parent_id);
        } else {
            $query->whereNull('parent_id');
        }

        if ($request->filled('level')) {
            $query->where('level', $request->level);
        }

        return response()->json($query->get(['id', 'parent_id', 'level', 'name', 'code']));
    }

    public function path(AdministrativeDivision $division)
    {
        $division->load('parent.parent.parent.parent');

        $path = [];
        $current = $division;

        while ($current) {
            array_unshift($path, [
                'id'    => $current->id,
                'name'  => $current->name,
                'level' => $current->level,
            ]);
            $current = $current->parent;
        }

        return response()->json(['path' => $path]);
    }
}
