<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OrderController extends Controller
{
    private const STATUS_LABELS_FR = [
        'pending'    => 'en attente',
        'confirmed'  => 'confirmée',
        'processing' => 'en traitement',
        'shipped'    => 'expédiée',
        'delivered'  => 'livrée',
        'cancelled'  => 'annulée',
        'rejected'   => 'refusée',
    ];

    private const ALLOWED_TRANSITIONS = [
        'pending'   => ['confirmed', 'cancelled'],
        'confirmed' => ['shipped', 'cancelled'],
        'shipped'   => ['delivered'],
        'delivered' => [],
        'cancelled' => [],
        'processing'=> ['shipped', 'cancelled'],
        'rejected'  => [],
    ];

    public function index(Request $request)
    {
        $seller = $request->user()->seller;

        $query = Order::with(['buyer.user', 'items.product', 'conversation'])
            ->where('seller_id', $seller->id)
            ->latest();

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $orders = $query->paginate(15)->withQueryString();

        return Inertia::render('Seller/Orders/Index', [
            'orders'  => $orders,
            'filters' => $request->only(['status', 'date_from', 'date_to']),
        ]);
    }

    public function show(Request $request, Order $order)
    {
        $seller = $request->user()->seller;

        if ($order->seller_id !== $seller->id) {
            abort(403);
        }

        $order->load(['items.product.images', 'buyer.user', 'conversation']);

        return Inertia::render('Seller/Orders/Show', [
            'order' => $order,
        ]);
    }

    public function updateStatus(Request $request, Order $order)
    {
        $seller = $request->user()->seller;

        if ($order->seller_id !== $seller->id) {
            abort(403);
        }

        $request->validate([
            'status' => 'required|in:pending,confirmed,shipped,delivered,cancelled',
        ]);

        $newStatus = $request->status;
        $allowed   = self::ALLOWED_TRANSITIONS[$order->status] ?? [];

        if (! in_array($newStatus, $allowed, true)) {
            $from = self::STATUS_LABELS_FR[$order->status] ?? $order->status;
            $to   = self::STATUS_LABELS_FR[$newStatus] ?? $newStatus;

            return back()->withErrors([
                'status' => "Impossible de passer la commande de « {$from} » à « {$to} ».",
            ]);
        }

        $oldStatus = $order->status;
        $updates   = ['status' => $newStatus];

        if ($newStatus === 'confirmed') {
            $updates['confirmed_at'] = now();
        }

        if ($newStatus === 'delivered') {
            $updates['delivered_at'] = now();
        }

        $order->update($updates);

        if ($oldStatus !== $newStatus) {
            $order->load('buyer.user');

            $statusLabel = self::STATUS_LABELS_FR[$newStatus] ?? $newStatus;

            Notification::create([
                'user_id'    => $order->buyer->user->id,
                'type'       => 'order',
                'title'      => 'Mise à jour de votre commande',
                'body'       => "Votre commande {$order->order_number} est maintenant {$statusLabel}.",
                'action_url' => "/buyer/orders/{$order->id}",
            ]);
        }

        return back()->with('success', 'Le statut de la commande a été mis à jour avec succès.');
    }
}
