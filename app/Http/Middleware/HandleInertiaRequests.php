<?php

namespace App\Http\Middleware;

use App\Models\Message;
use App\Models\Notification;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     * These are available on every page via usePage().props
     */
    public function share(Request $request): array
    {
        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $request->user() ? (function () use ($request) {
                    $user = $request->user();
                    $data = [
                        'id'                => $user->id,
                        'name'              => $user->name,
                        'email'             => $user->email,
                        'role'              => $user->role,
                        'phone'             => $user->phone,
                        'avatar'            => $user->avatar,
                        'email_verified_at' => $user->email_verified_at,
                    ];

                    if ($user->isSeller() && $user->seller) {
                        $data['seller'] = $user->seller->only([
                            'id', 'business_name', 'status', 'average_rating', 'slug',
                        ]);
                    }

                    return $data;
                })() : null,
            ],
            'flash' => [
                'success' => $request->session()->get('success'),
                'error'   => $request->session()->get('error'),
                'info'    => $request->session()->get('info'),
                'status'  => $request->session()->get('status'),
            ],
            'unread_notifications' => $request->user()
                ? Notification::where('user_id', $request->user()->id)->where('is_read', false)->count()
                : 0,
            'cart_count' => collect(session('cart', []))->sum('quantity'),
            'unread_messages' => function () use ($request) {
                $user = $request->user();
                if (! $user || ! $user->isSeller() || ! $user->seller) {
                    return 0;
                }

                return Message::whereHas('conversation', fn ($q) => $q->where('seller_id', $user->seller->id))
                    ->whereNull('read_at')
                    ->where('sender_id', '!=', $user->id)
                    ->count();
            },
            'seller' => $request->user()?->seller ? [
                'id'            => $request->user()->seller->id,
                'business_name' => $request->user()->seller->business_name,
                'slug'          => $request->user()->seller->slug,
                'status'        => $request->user()->seller->status,
                'logo'          => $request->user()->seller->logo,
            ] : null,
            'locale'   => 'fr',
            'currency' => 'CDF',
        ]);
    }
}
