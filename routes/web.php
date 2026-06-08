<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\SellerController;
use App\Http\Controllers\PageController;
use App\Http\Controllers\CartController;

// ─── Public Routes ───────────────────────────────────────────────────────────
Route::get('/', [HomeController::class, 'index'])->name('home');

// Generic /dashboard redirect — sends users to their role-specific dashboard
Route::get('/dashboard', function () {
    $user = auth()->user();
    if (!$user) return redirect()->route('login');
    return match ($user->role) {
        'super_admin', 'admin' => redirect()->route('admin.dashboard'),
        'seller'               => redirect()->route('seller.dashboard'),
        default                => redirect()->route('buyer.dashboard'),
    };
})->middleware('auth')->name('dashboard');


// Products
Route::get('/products', [ProductController::class, 'index'])->name('products.index');
Route::get('/products/{product:slug}', [ProductController::class, 'show'])->name('products.show');

// Categories
Route::get('/categories', [CategoryController::class, 'index'])->name('categories.index');
Route::get('/categories/{category:slug}', [CategoryController::class, 'show'])->name('categories.show');

// Search
Route::get('/search', [SearchController::class, 'index'])->name('search');

// Sellers public store
Route::get('/sellers/{seller:slug}', [SellerController::class, 'publicStore'])->name('sellers.store');

// ─── Cart (Guest-Accessible) ─────────────────────────────────────────────────
Route::get('/cart',           [CartController::class, 'index'])->name('cart.index');
Route::post('/cart/add',      [CartController::class, 'add'])->name('cart.add');
Route::patch('/cart/update',  [CartController::class, 'update'])->name('cart.update');
Route::delete('/cart/remove', [CartController::class, 'remove'])->name('cart.remove');
Route::post('/cart/checkout', [CartController::class, 'checkout'])->name('cart.checkout');

// Static Pages
Route::get('/about',           [PageController::class, 'about'])->name('about');
Route::get('/contact',         [PageController::class, 'contact'])->name('contact');
Route::get('/faq',             [PageController::class, 'faq'])->name('faq');
Route::get('/pricing',         [PageController::class, 'pricing'])->name('pricing');
Route::get('/become-a-seller', [PageController::class, 'becomeSeller'])->name('become-seller');
Route::get('/terms',           [PageController::class, 'terms'])->name('terms');
Route::get('/privacy',         [PageController::class, 'privacy'])->name('privacy');
Route::get('/help-center',     [PageController::class, 'helpCenter'])->name('help-center');


// ─── Auth (Guest Only) ───────────────────────────────────────────────────────
Route::middleware('guest')->group(function () {
    Route::get('/register',            [\App\Http\Controllers\Auth\RegisterController::class, 'create'])->name('register');
    Route::post('/register',           [\App\Http\Controllers\Auth\RegisterController::class, 'store']);
    Route::get('/login',               [\App\Http\Controllers\Auth\LoginController::class, 'create'])->name('login');
    Route::post('/login',              [\App\Http\Controllers\Auth\LoginController::class, 'store']);
    Route::get('/forgot-password',     [\App\Http\Controllers\Auth\PasswordController::class, 'requestForm'])->name('password.request');
    Route::post('/forgot-password',    [\App\Http\Controllers\Auth\PasswordController::class, 'sendResetLink'])->name('password.email');
    Route::get('/reset-password/{token}', [\App\Http\Controllers\Auth\PasswordController::class, 'resetForm'])->name('password.reset');
    Route::post('/reset-password',     [\App\Http\Controllers\Auth\PasswordController::class, 'reset'])->name('password.store');

    // Seller Registration (also guest-only)
    Route::get('/seller/register',  [\App\Http\Controllers\Seller\Auth\RegisterController::class, 'create'])->name('seller.register');
    Route::post('/seller/register', [\App\Http\Controllers\Seller\Auth\RegisterController::class, 'store']);
});


// ─── Authenticated Routes ────────────────────────────────────────────────────
Route::middleware('auth')->group(function () {
    Route::post('/logout', [\App\Http\Controllers\Auth\LoginController::class, 'destroy'])->name('logout');

    // Email Verification
    Route::get('/email/verify', [\App\Http\Controllers\Auth\EmailVerificationController::class, 'notice'])->name('verification.notice');
    Route::get('/email/verify/{id}/{hash}', [\App\Http\Controllers\Auth\EmailVerificationController::class, 'verify'])
        ->middleware('signed')->name('verification.verify');
    Route::post('/email/verification-notification', [\App\Http\Controllers\Auth\EmailVerificationController::class, 'resend'])
        ->middleware('throttle:6,1')->name('verification.send');

    // ─── Internal Chat System (with /chat prefix to match frontend URLs) ──────
    Route::prefix('chat')->group(function () {
        Route::get('/conversations', [\App\Http\Controllers\ChatController::class, 'index'])->name('conversations.index');
        Route::post('/conversations/start', [\App\Http\Controllers\ChatController::class, 'startConversation'])->name('conversations.start');
        Route::get('/conversations/{conversation}', [\App\Http\Controllers\ChatController::class, 'show'])->name('conversations.show');
        Route::post('/conversations/{conversation}/messages', [\App\Http\Controllers\ChatController::class, 'sendMessage'])->name('conversations.messages.send');
        Route::patch('/messages/{message}', [\App\Http\Controllers\ChatController::class, 'editMessage'])->name('messages.edit');
        Route::delete('/messages/{message}', [\App\Http\Controllers\ChatController::class, 'deleteMessage'])->name('messages.delete');
        Route::post('/messages/{message}/read', [\App\Http\Controllers\ChatController::class, 'markAsRead'])->name('messages.read');
        Route::post('/conversations/{conversation}/messages/{message}/pin', [\App\Http\Controllers\ChatController::class, 'pinMessage'])->name('messages.pin');
        Route::delete('/conversations/{conversation}/messages/{message}/pin', [\App\Http\Controllers\ChatController::class, 'unpinMessage'])->name('messages.unpin');
    });

    // Keep old /conversations routes as aliases for dashboard links
    Route::get('/conversations', [\App\Http\Controllers\ChatController::class, 'index']);
    Route::get('/conversations/{conversation}', [\App\Http\Controllers\ChatController::class, 'show']);
    Route::post('/conversations/{conversation}/messages', [\App\Http\Controllers\ChatController::class, 'sendMessage']);
    Route::patch('/messages/{message}', [\App\Http\Controllers\ChatController::class, 'editMessage']);
    Route::delete('/messages/{message}', [\App\Http\Controllers\ChatController::class, 'deleteMessage']);
    Route::post('/messages/{message}/read', [\App\Http\Controllers\ChatController::class, 'markAsRead']);

    // Buyer messages → redirect to conversations system
    Route::get('/buyer/messages', fn() => redirect('/conversations'))->name('buyer.messages.index');
    Route::get('/buyer/messages/{conversation}', fn($c) => redirect("/conversations/{$c}"))->name('buyer.messages.show');
    // Seller messages → same
    Route::get('/seller/messages', fn() => redirect('/conversations'))->name('seller.messages.index');
    Route::get('/seller/messages/{conversation}', fn($c) => redirect("/conversations/{$c}"))->name('seller.messages.show');

    // ─── Buyer Routes ─────────────────────────────────────────────────────────
    Route::middleware('role:buyer')->prefix('buyer')->name('buyer.')->group(function () {
        Route::get('/dashboard', [\App\Http\Controllers\Buyer\DashboardController::class, 'index'])->name('dashboard');

        // Wishlist
        Route::get('/wishlist',              [\App\Http\Controllers\Buyer\WishlistController::class, 'index'])->name('wishlist');
        Route::post('/wishlist/{product}',   [\App\Http\Controllers\Buyer\WishlistController::class, 'toggle'])->name('wishlist.toggle');
        Route::delete('/wishlist/{favorite}',[\App\Http\Controllers\Buyer\WishlistController::class, 'destroy'])->name('wishlist.destroy');

        // Orders
        Route::get('/orders',                 [\App\Http\Controllers\Buyer\OrderController::class, 'index'])->name('orders.index');
        Route::post('/orders',                [\App\Http\Controllers\Buyer\OrderController::class, 'store'])->name('orders.store');
        Route::get('/orders/{order}',         [\App\Http\Controllers\Buyer\OrderController::class, 'show'])->name('orders.show');
        Route::patch('/orders/{order}/cancel',[\App\Http\Controllers\Buyer\OrderController::class, 'cancel'])->name('orders.cancel');


        // Reviews
        Route::get('/reviews',                [\App\Http\Controllers\Buyer\ReviewController::class, 'index'])->name('reviews.index');
        Route::get('/orders/{order}/review',  [\App\Http\Controllers\Buyer\ReviewController::class, 'create'])->name('reviews.create');
        Route::post('/orders/{order}/review', [\App\Http\Controllers\Buyer\ReviewController::class, 'store'])->name('reviews.store');

        // Notifications
        Route::get('/notifications',                                 [\App\Http\Controllers\Buyer\NotificationController::class, 'index'])->name('notifications.index');
        Route::patch('/notifications/{notification}/read',           [\App\Http\Controllers\Buyer\NotificationController::class, 'markAsRead'])->name('notifications.read');
        Route::post('/notifications/read-all',                       [\App\Http\Controllers\Buyer\NotificationController::class, 'markAllRead'])->name('notifications.read-all');

        // Profile
        Route::get('/profile',              [\App\Http\Controllers\Buyer\ProfileController::class, 'edit'])->name('profile');
        Route::patch('/profile',            [\App\Http\Controllers\Buyer\ProfileController::class, 'update'])->name('profile.update');
        Route::patch('/profile/password',   [\App\Http\Controllers\Buyer\ProfileController::class, 'updatePassword'])->name('profile.password');

        // Support Tickets (Buyer)
        Route::get('/support',              [\App\Http\Controllers\Buyer\SupportController::class, 'index'])->name('support.index');
        Route::get('/support/create',       [\App\Http\Controllers\Buyer\SupportController::class, 'create'])->name('support.create');
        Route::post('/support',             [\App\Http\Controllers\Buyer\SupportController::class, 'store'])->name('support.store');
        Route::get('/support/{ticket}',     [\App\Http\Controllers\Buyer\SupportController::class, 'show'])->name('support.show');
        Route::post('/support/{ticket}/reply', [\App\Http\Controllers\Buyer\SupportController::class, 'reply'])->name('support.reply');
    });

    // ─── Seller Routes ────────────────────────────────────────────────────────
    Route::middleware('role:seller')->prefix('seller')->name('seller.')->group(function () {
        Route::get('/dashboard', [\App\Http\Controllers\Seller\DashboardController::class, 'index'])->name('dashboard');

        // Products
        Route::get('/products',                      [\App\Http\Controllers\Seller\ProductController::class, 'index'])->name('products.index');
        Route::get('/products/create',               [\App\Http\Controllers\Seller\ProductController::class, 'create'])->name('products.create');
        Route::post('/products',                     [\App\Http\Controllers\Seller\ProductController::class, 'store'])->name('products.store');
        Route::get('/products/{product:id}',         [\App\Http\Controllers\Seller\ProductController::class, 'show'])->name('products.show');
        Route::get('/products/{product:id}/edit',    [\App\Http\Controllers\Seller\ProductController::class, 'edit'])->name('products.edit');
        Route::put('/products/{product:id}',         [\App\Http\Controllers\Seller\ProductController::class, 'update'])->name('products.update');
        Route::delete('/products/{product:id}',      [\App\Http\Controllers\Seller\ProductController::class, 'destroy'])->name('products.destroy');
        Route::post('/products/{product:id}/images', [\App\Http\Controllers\Seller\ProductController::class, 'uploadImage'])->name('products.images.upload');
        Route::delete('/images/{image}',           [\App\Http\Controllers\Seller\ProductController::class, 'deleteImage'])->name('products.images.destroy');
        Route::patch('/images/{image}/primary',    [\App\Http\Controllers\Seller\ProductController::class, 'setPrimaryImage'])->name('products.images.primary');

        // Orders
        Route::get('/orders',                [\App\Http\Controllers\Seller\OrderController::class, 'index'])->name('orders.index');
        Route::get('/orders/{order}',        [\App\Http\Controllers\Seller\OrderController::class, 'show'])->name('orders.show');
        Route::patch('/orders/{order}/status', [\App\Http\Controllers\Seller\OrderController::class, 'updateStatus'])->name('orders.status');


        // Notifications
        Route::get('/notifications',                                 [\App\Http\Controllers\Seller\NotificationController::class, 'index'])->name('notifications.index');
        Route::patch('/notifications/{notification}/read',           [\App\Http\Controllers\Seller\NotificationController::class, 'markAsRead'])->name('notifications.read');
        Route::post('/notifications/read-all',                       [\App\Http\Controllers\Seller\NotificationController::class, 'markAllRead'])->name('notifications.read-all');

        // Profile
        Route::get('/profile',            [\App\Http\Controllers\Seller\ProfileController::class, 'edit'])->name('profile');
        Route::post('/profile',           [\App\Http\Controllers\Seller\ProfileController::class, 'update'])->name('profile.update');
        Route::patch('/profile/password', [\App\Http\Controllers\Seller\ProfileController::class, 'updatePassword'])->name('profile.password');

        // Store Settings
        Route::get('/store/settings',  [\App\Http\Controllers\Seller\StoreSettingsController::class, 'edit'])->name('store.settings');
        Route::post('/store/settings', [\App\Http\Controllers\Seller\StoreSettingsController::class, 'update'])->name('store.settings.update');

        // Sponsored Products
        Route::get('/sponsored',         [\App\Http\Controllers\Seller\SponsoredProductController::class, 'index'])->name('sponsored.index');
        Route::get('/sponsored/create',  [\App\Http\Controllers\Seller\SponsoredProductController::class, 'create'])->name('sponsored.create');
        Route::post('/sponsored',        [\App\Http\Controllers\Seller\SponsoredProductController::class, 'store'])->name('sponsored.store');
        Route::delete('/sponsored/{sponsored}', [\App\Http\Controllers\Seller\SponsoredProductController::class, 'destroy'])->name('sponsored.destroy');

        // Subscriptions
        Route::get('/subscriptions',     [\App\Http\Controllers\Seller\SubscriptionController::class, 'index'])->name('subscriptions.index');
        Route::post('/subscriptions/{plan}/subscribe', [\App\Http\Controllers\Seller\SubscriptionController::class, 'subscribe'])->name('subscriptions.subscribe');

        // Reviews
        Route::get('/reviews', [\App\Http\Controllers\Seller\ReviewController::class, 'index'])->name('reviews.index');

        // Documents
        Route::get('/documents',                    [\App\Http\Controllers\Seller\DocumentController::class, 'index'])->name('documents.index');
        Route::post('/documents',                   [\App\Http\Controllers\Seller\DocumentController::class, 'store'])->name('documents.store');
        Route::delete('/documents/{document}',      [\App\Http\Controllers\Seller\DocumentController::class, 'destroy'])->name('documents.destroy');

        // Commissions & Payouts
        Route::get('/commissions', [\App\Http\Controllers\Seller\CommissionController::class, 'index'])->name('commissions.index');
        Route::get('/payouts',     [\App\Http\Controllers\Seller\PayoutController::class, 'index'])->name('payouts.index');
        Route::post('/payouts',    [\App\Http\Controllers\Seller\PayoutController::class, 'store'])->name('payouts.store');

        // Reports
        Route::get('/reports',           [\App\Http\Controllers\Seller\ReportController::class, 'index'])->name('reports.index');
        Route::post('/reports/generate', [\App\Http\Controllers\Seller\ReportController::class, 'generate'])->name('reports.generate');
        Route::get('/reports/{report}/download', [\App\Http\Controllers\Seller\ReportController::class, 'download'])->name('reports.download');

        // Support Tickets (Seller)
        Route::get('/support',                     [\App\Http\Controllers\Buyer\SupportController::class, 'index'])->name('support.index');
        Route::get('/support/create',              [\App\Http\Controllers\Buyer\SupportController::class, 'create'])->name('support.create');
        Route::post('/support',                    [\App\Http\Controllers\Buyer\SupportController::class, 'store'])->name('support.store');
        Route::get('/support/{ticket}',            [\App\Http\Controllers\Buyer\SupportController::class, 'show'])->name('support.show');
        Route::post('/support/{ticket}/reply',     [\App\Http\Controllers\Buyer\SupportController::class, 'reply'])->name('support.reply');
    });

    // ─── Admin Routes ─────────────────────────────────────────────────────────
    Route::middleware('role:super_admin,admin')->prefix('admin')->name('admin.')->group(function () {
        Route::get('/dashboard', [\App\Http\Controllers\Admin\DashboardController::class, 'index'])->name('dashboard');

        // Sellers (Verification & Management)
        Route::get('/sellers',                      [\App\Http\Controllers\Admin\SellerController::class, 'index'])->name('sellers.index');
        Route::get('/sellers/{seller}',             [\App\Http\Controllers\Admin\SellerController::class, 'show'])->name('sellers.show');
        Route::patch('/sellers/{seller}/verify',    [\App\Http\Controllers\Admin\SellerController::class, 'verify'])->name('sellers.verify');
        Route::patch('/sellers/{seller}/reject',    [\App\Http\Controllers\Admin\SellerController::class, 'reject'])->name('sellers.reject');
        Route::patch('/sellers/{seller}/status',    [\App\Http\Controllers\Admin\SellerController::class, 'updateStatus'])->name('sellers.status');

        // Product Moderation
        Route::get('/products',                       [\App\Http\Controllers\Admin\ProductModerationController::class, 'index'])->name('products.index');
        Route::get('/products/{product}',             [\App\Http\Controllers\Admin\ProductModerationController::class, 'show'])->name('products.show');
        Route::patch('/products/{product}/approve',   [\App\Http\Controllers\Admin\ProductModerationController::class, 'approve'])->name('products.approve');
        Route::patch('/products/{product}/reject',    [\App\Http\Controllers\Admin\ProductModerationController::class, 'reject'])->name('products.reject');
        Route::patch('/products/{product}/ban',       [\App\Http\Controllers\Admin\ProductModerationController::class, 'ban'])->name('products.ban');

        // Order Oversight
        Route::get('/orders',         [\App\Http\Controllers\Admin\OrderController::class, 'index'])->name('orders.index');
        Route::get('/orders/{order}', [\App\Http\Controllers\Admin\OrderController::class, 'show'])->name('orders.show');

        // Review Moderation
        Route::get('/reviews',              [\App\Http\Controllers\Admin\ReviewModerationController::class, 'index'])->name('reviews.index');
        Route::delete('/reviews/{review}',  [\App\Http\Controllers\Admin\ReviewModerationController::class, 'destroy'])->name('reviews.destroy');

        // Advertisement (Sponsored Products) Management
        Route::get('/advertisements',                       [\App\Http\Controllers\Admin\AdvertisementController::class, 'index'])->name('advertisements.index');
        Route::patch('/advertisements/{sponsored}/approve', [\App\Http\Controllers\Admin\AdvertisementController::class, 'approve'])->name('advertisements.approve');
        Route::patch('/advertisements/{sponsored}/reject',  [\App\Http\Controllers\Admin\AdvertisementController::class, 'reject'])->name('advertisements.reject');

        // Categories
        Route::get('/categories',              [\App\Http\Controllers\Admin\CategoryController::class, 'index'])->name('categories.index');
        Route::post('/categories',             [\App\Http\Controllers\Admin\CategoryController::class, 'store'])->name('categories.store');
        Route::put('/categories/{category}',   [\App\Http\Controllers\Admin\CategoryController::class, 'update'])->name('categories.update');
        Route::delete('/categories/{category}',[\App\Http\Controllers\Admin\CategoryController::class, 'destroy'])->name('categories.destroy');

        // Subscription Plans
        Route::get('/plans',            [\App\Http\Controllers\Admin\SubscriptionPlanController::class, 'index'])->name('plans.index');
        Route::post('/plans',           [\App\Http\Controllers\Admin\SubscriptionPlanController::class, 'store'])->name('plans.store');
        Route::put('/plans/{plan}',     [\App\Http\Controllers\Admin\SubscriptionPlanController::class, 'update'])->name('plans.update');
        Route::delete('/plans/{plan}',  [\App\Http\Controllers\Admin\SubscriptionPlanController::class, 'destroy'])->name('plans.destroy');

        // Reports
        Route::get('/reports',                   [\App\Http\Controllers\Admin\ReportController::class, 'index'])->name('reports.index');
        Route::post('/reports/generate',         [\App\Http\Controllers\Admin\ReportController::class, 'generate'])->name('reports.generate');
        Route::get('/reports/{report}/download', [\App\Http\Controllers\Admin\ReportController::class, 'download'])->name('reports.download');

        // Support Tickets (Admin)
        Route::get('/support',                          [\App\Http\Controllers\Admin\SupportController::class, 'index'])->name('support.index');
        Route::get('/support/{ticket}',                 [\App\Http\Controllers\Admin\SupportController::class, 'show'])->name('support.show');
        Route::post('/support/{ticket}/reply',          [\App\Http\Controllers\Admin\SupportController::class, 'reply'])->name('support.reply');
        Route::patch('/support/{ticket}/status',        [\App\Http\Controllers\Admin\SupportController::class, 'updateStatus'])->name('support.status');
        Route::patch('/support/{ticket}/assign',        [\App\Http\Controllers\Admin\SupportController::class, 'assign'])->name('support.assign');

        // Platform Settings (Super Admin Only)
        Route::middleware('role:super_admin')->group(function () {
            Route::get('/settings',  [\App\Http\Controllers\Admin\PlatformSettingController::class, 'index'])->name('settings.index');
            Route::post('/settings', [\App\Http\Controllers\Admin\PlatformSettingController::class, 'update'])->name('settings.update');
        });

        // Sub-Admins (Super Admin Only)
        Route::middleware('role:super_admin')->group(function () {
            Route::get('/admins',            [\App\Http\Controllers\Admin\SubAdminController::class, 'index'])->name('admins.index');
            Route::post('/admins',           [\App\Http\Controllers\Admin\SubAdminController::class, 'store'])->name('admins.store');
            Route::delete('/admins/{user}',  [\App\Http\Controllers\Admin\SubAdminController::class, 'destroy'])->name('admins.destroy');
        });
    });
});

