<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\Order;
use App\Services\DemoSimulationService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DemoSellerPanelController extends Controller
{
    public function index()
    {
        abort_unless(DemoSimulationService::enabled(), 404);

        $seller = DemoSimulationService::demoSeller();

        if (! $seller) {
            abort(404, 'Demo seller not found. Run database seeders.');
        }

        return Inertia::render('Demo/SellerPanel', [
            'seller'         => [
                'id'            => $seller->id,
                'business_name' => $seller->business_name,
                'slug'          => $seller->slug,
            ],
            'isOnline'       => DemoSimulationService::isDemoSellerOnline(),
            'conversations'  => DemoSimulationService::demoConversationsForPanel(),
            'orders'         => DemoSimulationService::demoOrdersForPanel(),
            'orderStatuses'  => ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
        ]);
    }

    public function toggleOnline(Request $request)
    {
        abort_unless(DemoSimulationService::enabled(), 404);

        $request->validate(['online' => 'required|boolean']);

        DemoSimulationService::setDemoSellerOnline((bool) $request->online);

        return back()->with('success', $request->online ? 'Demo seller is now online.' : 'Demo seller is now offline.');
    }

    public function messages(Conversation $conversation)
    {
        abort_unless(DemoSimulationService::enabled(), 404);
        $this->authorizeDemoConversation($conversation);

        $messages = $conversation->messages()
            ->with('sender')
            ->oldest()
            ->take(50)
            ->get()
            ->map(fn (Message $m) => [
                'id'          => $m->id,
                'body'        => $m->body,
                'sender_id'   => $m->sender_id,
                'sender_name' => $m->sender?->name ?? 'User',
                'created_at'  => $m->created_at?->toISOString(),
                'is_seller'   => $m->sender_id === $conversation->seller?->user_id,
            ]);

        return response()->json(['messages' => $messages]);
    }

    public function reply(Request $request, Conversation $conversation)
    {
        abort_unless(DemoSimulationService::enabled(), 404);
        $this->authorizeDemoConversation($conversation);

        $request->validate(['body' => 'required|string|max:5000']);

        $seller = DemoSimulationService::demoSeller();

        if (! $seller?->user_id) {
            return response()->json(['message' => 'Demo seller user not found.'], 422);
        }

        $message = Message::create([
            'conversation_id' => $conversation->id,
            'sender_id'       => $seller->user_id,
            'receiver_id'     => $conversation->buyer_id,
            'body'            => $request->body,
            'message_type'    => 'text',
        ]);

        $conversation->update(['last_message_at' => now()]);

        return response()->json([
            'message' => [
                'id'          => $message->id,
                'body'        => $message->body,
                'sender_id'   => $message->sender_id,
                'sender_name' => $seller->user?->name ?? 'Demo Seller',
                'created_at'  => $message->created_at?->toISOString(),
                'is_seller'   => true,
            ],
        ]);
    }

    public function updateOrderStatus(Request $request, Order $order)
    {
        abort_unless(DemoSimulationService::enabled(), 404);

        $seller = DemoSimulationService::demoSeller();

        if (! $seller || (int) $order->seller_id !== (int) $seller->id) {
            abort(403);
        }

        $request->validate([
            'status' => 'required|in:pending,confirmed,shipped,delivered,cancelled',
        ]);

        $updates = ['status' => $request->status];

        if ($request->status === 'confirmed' && ! $order->confirmed_at) {
            $updates['confirmed_at'] = now();
        }

        if ($request->status === 'delivered') {
            $updates['delivered_at'] = now();
        }

        $order->update($updates);

        return back()->with('success', "Order {$order->order_number} updated to {$request->status}.");
    }

    private function authorizeDemoConversation(Conversation $conversation): void
    {
        $seller = DemoSimulationService::demoSeller();

        if (! $seller || (int) $conversation->seller_id !== (int) $seller->id) {
            abort(403);
        }
    }
}
