<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;

class BuyerController extends Controller
{
    public function index(Request $request)
    {
        // Bug fix: filter only users with role 'buyer' (previously returned sellers too)
        $query = User::where('role', 'buyer')
            ->with('buyer')
            ->latest();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->filled('is_active')) {
            $query->where('is_active', (bool) $request->is_active);
        }

        $buyers = $query->paginate(15)->withQueryString();

        return Inertia::render('Admin/Buyers/Index', [
            'buyers'  => $buyers,
            'filters' => $request->only(['search', 'is_active']),
        ]);
    }

    /**
     * Toggle a buyer's active status.
     */
    public function toggleActive(User $user)
    {
        abort_unless($user->role === 'buyer', 403, 'User is not a buyer.');

        $user->update(['is_active' => ! $user->is_active]);

        $status = $user->is_active ? 'activated' : 'deactivated';
        return back()->with('success', "Buyer account {$status}.");
    }

    /**
     * Bulk activate/deactivate buyers.
     */
    public function bulkAction(Request $request)
    {
        $request->validate([
            'ids'    => 'required|array|min:1',
            'ids.*'  => 'integer|exists:users,id',
            'action' => 'required|in:activate,deactivate',
        ]);

        $isActive = $request->action === 'activate';

        User::where('role', 'buyer')
            ->whereIn('id', $request->ids)
            ->update(['is_active' => $isActive]);

        $count = count($request->ids);
        $label = $isActive ? 'activated' : 'deactivated';

        return back()->with('success', "{$count} buyer(s) {$label} successfully.");
    }
}
