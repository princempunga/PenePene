<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class SubAdminController extends Controller
{
    public function index()
    {
        $admins = User::where('role', 'admin')->latest()->get();

        return Inertia::render('Admin/SubAdmins/Index', [
            'admins' => $admins,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|string|email|max:255|unique:users',
            'phone'    => 'nullable|string|max:30',
            'password' => ['required', 'confirmed', Password::min(8)],
        ]);

        User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'phone'    => $request->phone,
            'password' => Hash::make($request->password),
            'role'     => 'admin',
        ]);

        return back()->with('success', 'Admin user created successfully.');
    }

    public function destroy(User $user)
    {
        if ($user->role !== 'admin') {
            abort(403, 'Can only delete sub-admins.');
        }

        $user->delete();

        return back()->with('success', 'Admin user removed.');
    }
}
