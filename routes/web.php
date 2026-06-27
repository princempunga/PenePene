<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\SellerController;
use App\Http\Controllers\PageController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\CheckoutSimulationController;
use App\Http\Controllers\DemoSellerPanelController;

// ─── Locale ──────────────────────────────────────────────────────────────────
Route::post('/locale/{locale}', [\App\Http\Controllers\LocaleController::class, 'update'])->name('locale.update');

// ─── Public Routes ───────────────────────────────────────────────────────────
Route::get('/', [HomeController::class, 'index'])->name('home');

// Generic /dashboard redirect — sends users to their role-specific dashboard
Route::get('/dashboard', function () {
    $user = auth()->user();
    if (! $user) {
        return redirect()->route('login');
    }

    $portal = session('active_portal') ?? app(\App\Services\PortalAccessService::class)->detectPortalForUser($user);
    if ($portal) {
        return redirect()->to(app(\App\Services\PortalAccessService::class)->redirectFor($portal));
    }

    return match ($user->role) {
        'super_admin', 'admin' => redirect()->route('admin.dashboard'),
        'seller'               => redirect()->route('seller.dashboard'),
        default                => redirect()->route('buyer.messages.index'),
    };
})->middleware('auth')->name('dashboard');


// Products
Route::get('/products', [ProductController::class, 'index'])->name('products.index');
Route::get('/flash-deals', fn () => redirect()->route('products.index', ['filter' => 'sale']))->name('flash-deals');
Route::get('/products/{slug}', [ProductController::class, 'show'])
    ->where('slug', '[^/]+')
    ->name('products.show');

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

// Demo / simulation (testing only)
Route::middleware('auth')->group(function () {
    Route::get('/checkout/simulate', [CheckoutSimulationController::class, 'show'])->name('checkout.simulate');
    Route::post('/checkout/simulate/pay', [CheckoutSimulationController::class, 'pay'])->name('checkout.simulate.pay');

        Route::prefix('demo')->name('demo.')->group(function () {
        Route::get('/seller-panel', [DemoSellerPanelController::class, 'index'])->name('seller-panel');
        Route::post('/seller-panel/online', [DemoSellerPanelController::class, 'toggleOnline'])->name('seller-panel.online');
        Route::get('/seller-panel/conversations/{conversation}/messages', [DemoSellerPanelController::class, 'messages'])->name('seller-panel.messages');
        Route::post('/seller-panel/conversations/{conversation}/reply', [DemoSellerPanelController::class, 'reply'])->name('seller-panel.reply');
        Route::patch('/seller-panel/orders/{order}/status', [DemoSellerPanelController::class, 'updateOrderStatus'])->name('seller-panel.order-status');

        Route::get('/admin-panel', [\App\Http\Controllers\DemoAdminPanelController::class, 'index'])->name('admin-panel');
        Route::post('/admin-panel/maintenance', [\App\Http\Controllers\DemoAdminPanelController::class, 'toggleMaintenance'])->name('admin-panel.maintenance');

        Route::get('/buyer-panel', [\App\Http\Controllers\DemoBuyerPanelController::class, 'index'])->name('buyer-panel');
    });
});

// Static Pages
Route::get('/about',           [PageController::class, 'about'])->name('about');
Route::get('/contact',         [PageController::class, 'contact'])->name('contact');
Route::get('/faq',             [PageController::class, 'faq'])->name('faq');
Route::get('/pricing',           [PageController::class, 'pricing'])->name('pricing');
Route::get('/seller-resources',  [PageController::class, 'sellerResources'])->name('seller-resources');
Route::get('/community-forum',  [PageController::class, 'communityForum'])->name('community-forum');
Route::get('/blog',              [PageController::class, 'blog'])->name('blog');
Route::get('/cookies',           [PageController::class, 'cookies'])->name('cookies');
Route::get('/become-a-seller',   fn () => redirect()->route('seller.register'))->name('become-seller');
Route::redirect('/seller/resources', '/seller-resources');
Route::redirect('/seller/community', '/community-forum');
Route::get('/terms',             [PageController::class, 'terms'])->name('terms');
Route::get('/privacy',           [PageController::class, 'privacy'])->name('privacy');
Route::get('/help-center',       [PageController::class, 'helpCenter'])->name('help-center');

// Seller registration page (accessible to guests; authenticated sellers are redirected in controller)
Route::get('/seller/register', [\App\Http\Controllers\Seller\Auth\RegisterController::class, 'create'])->name('seller.register');


// ─── Auth (Guest Only) ───────────────────────────────────────────────────────
Route::middleware('guest')->group(function () {
    Route::get('/register',            fn() => \Inertia\Inertia::render('Auth/RegisterChoice'))->name('register');
    Route::get('/buyer/register',      [\App\Http\Controllers\Auth\RegisterController::class, 'create'])->name('buyer.register');
    Route::post('/buyer/register',     [\App\Http\Controllers\Auth\RegisterController::class, 'store']);
    Route::get('/login',               [\App\Http\Controllers\Auth\LoginController::class, 'create'])->name('login');
    Route::post('/login',              [\App\Http\Controllers\Auth\LoginController::class, 'store']);
    Route::post('/login/demo',         [\App\Http\Controllers\Auth\LoginController::class, 'demoLogin'])->name('login.demo');
    Route::get('/forgot-password',     [\App\Http\Controllers\Auth\PasswordController::class, 'requestForm'])->name('password.request');
    Route::post('/forgot-password',    [\App\Http\Controllers\Auth\PasswordController::class, 'sendResetLink'])->name('password.email');
    Route::get('/reset-password/{token}', [\App\Http\Controllers\Auth\PasswordController::class, 'resetForm'])->name('password.reset');
    Route::post('/reset-password',     [\App\Http\Controllers\Auth\PasswordController::class, 'reset'])->name('password.store');

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
        Route::post('/conversations/{conversation}/forward', [\App\Http\Controllers\ChatController::class, 'forwardMessage'])->name('conversations.forward');
        Route::post('/conversations/{conversation}/delete', [\App\Http\Controllers\ChatController::class, 'deleteConversation'])->name('conversations.delete');
        Route::post('/conversations/{conversation}/clear', [\App\Http\Controllers\ChatController::class, 'clearConversation'])->name('conversations.clear');
        Route::post('/conversations/{conversation}/archive', [\App\Http\Controllers\ChatController::class, 'archiveConversation'])->name('conversations.archive');
        Route::patch('/conversations/{conversation}/status', [\App\Http\Controllers\ChatController::class, 'updateStatus'])->name('conversations.status.update');
        Route::patch('/messages/{message}', [\App\Http\Controllers\ChatController::class, 'editMessage'])->name('messages.edit');
        Route::delete('/messages/{message}', [\App\Http\Controllers\ChatController::class, 'deleteMessage'])->name('messages.delete');
        Route::post('/messages/{message}/read', [\App\Http\Controllers\ChatController::class, 'markAsRead'])->name('messages.read');
        Route::post('/messages/{message}/react', [\App\Http\Controllers\ChatController::class, 'reactMessage'])->name('messages.react');
        Route::delete('/messages/{message}/react', [\App\Http\Controllers\ChatController::class, 'unreactMessage'])->name('messages.unreact');
        Route::post('/messages/{message}/star', [\App\Http\Controllers\ChatController::class, 'starMessage'])->name('messages.star');
        Route::delete('/messages/{message}/star', [\App\Http\Controllers\ChatController::class, 'unstarMessage'])->name('messages.unstar');
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
    Route::get('/buyer/messages', fn() => redirect('/chat/conversations'))->name('buyer.messages.index');
    Route::get('/buyer/messages/{conversation}', fn($c) => redirect("/chat/conversations/{$c}"))->name('buyer.messages.show');
    // Seller messages → same
    Route::get('/seller/messages', fn() => redirect('/conversations'))->name('seller.messages.index');
    Route::get('/seller/messages/{conversation}', fn($c) => redirect("/conversations/{$c}"))->name('seller.messages.show');

    Route::get('/orders/{order}/confirmation', [\App\Http\Controllers\Buyer\OrderController::class, 'confirmation'])
        ->name('orders.confirmation');

    // ─── Administrative divisions API ─────────────────────────────────────────
    Route::get('/api/divisions', [\App\Http\Controllers\AdministrativeDivisionController::class, 'index'])->name('divisions.index');
    Route::get('/api/divisions/{division}/path', [\App\Http\Controllers\AdministrativeDivisionController::class, 'path'])->name('divisions.path');

    // ─── Citizen Projects ───────────────────────────────────────────────────────
    Route::middleware('portal')->prefix('projects')->name('projects.')->group(function () {
        Route::get('/', [\App\Http\Controllers\ProjectController::class, 'index'])->name('index');
        Route::get('/create', [\App\Http\Controllers\ProjectController::class, 'create'])->name('create');
        Route::post('/', [\App\Http\Controllers\ProjectController::class, 'store'])->name('store');
        Route::get('/archive', [\App\Http\Controllers\ProjectArchiveController::class, 'index'])->name('archive');
        Route::get('/archive/{project}', [\App\Http\Controllers\ProjectArchiveController::class, 'show'])->name('archive.show');
        Route::post('/archive/{project}/copy', [\App\Http\Controllers\ProjectArchiveController::class, 'copy'])->name('archive.copy');
        Route::get('/{project}', [\App\Http\Controllers\ProjectController::class, 'show'])->name('show');
        Route::get('/{project}/edit', [\App\Http\Controllers\ProjectController::class, 'edit'])->name('edit');
        Route::put('/{project}', [\App\Http\Controllers\ProjectController::class, 'update'])->name('update');
        Route::post('/{project}/submit-experts', [\App\Http\Controllers\ProjectController::class, 'submitExperts'])->name('submit-experts');
        Route::get('/{project}/execution', [\App\Http\Controllers\ProjectController::class, 'executionDashboard'])->name('execution');
        Route::post('/{project}/final-report', [\App\Http\Controllers\ProjectController::class, 'submitFinalReport'])->name('final-report');
        Route::post('/{project}/tasks/{task}/report', [\App\Http\Controllers\ProjectTaskController::class, 'submitReport'])->name('tasks.report');
        Route::post('/{project}/tasks/{task}/delay', [\App\Http\Controllers\ProjectTaskController::class, 'reportDelay'])->name('tasks.delay');
    });

    Route::redirect('/proposals', '/projects');
    Route::redirect('/proposals/create', '/projects/create');

    // ─── Citizen Proposals (legacy) ─────────────────────────────────────────────
    Route::prefix('proposals')->name('proposals.')->group(function () {
        Route::get('/', [\App\Http\Controllers\ProposalController::class, 'index'])->name('index');
        Route::get('/create', [\App\Http\Controllers\ProposalController::class, 'create'])->name('create');
        Route::post('/', [\App\Http\Controllers\ProposalController::class, 'store'])->name('store');
        Route::get('/{proposal}', [\App\Http\Controllers\ProposalController::class, 'show'])->name('show');
        Route::post('/{proposal}/submit', [\App\Http\Controllers\ProposalController::class, 'submit'])->name('submit');
        Route::post('/{proposal}/reply', [\App\Http\Controllers\ProposalController::class, 'reply'])->name('reply');
    });

    // ─── Government Routes ──────────────────────────────────────────────────────
    Route::middleware(['role:government', 'portal'])->prefix('government')->name('government.')->group(function () {
        Route::get('/dashboard', [\App\Http\Controllers\Government\ProposalController::class, 'dashboard'])->name('dashboard');
        Route::get('/proposals', [\App\Http\Controllers\Government\ProposalController::class, 'index'])->name('proposals.index');
        Route::get('/proposals/{proposal}', [\App\Http\Controllers\Government\ProposalController::class, 'show'])->name('proposals.show');
        Route::post('/proposals/{proposal}/take-charge', [\App\Http\Controllers\Government\ProposalController::class, 'takeCharge'])->name('proposals.take-charge');
        Route::patch('/proposals/{proposal}/status', [\App\Http\Controllers\Government\ProposalController::class, 'updateStatus'])->name('proposals.status');
        Route::post('/proposals/{proposal}/comment', [\App\Http\Controllers\Government\ProposalController::class, 'comment'])->name('proposals.comment');

        // Expert group — project review
        Route::get('/expert/projects', [\App\Http\Controllers\Government\ExpertProjectController::class, 'index'])->name('expert.index');
        Route::get('/expert/projects/{project}', [\App\Http\Controllers\Government\ExpertProjectController::class, 'show'])->name('expert.show');
        Route::post('/expert/projects/{project}/review', [\App\Http\Controllers\Government\ExpertProjectController::class, 'review'])->name('expert.review');

        // Tutelage service
        Route::get('/tutelage/projects', [\App\Http\Controllers\Government\TutelageProjectController::class, 'index'])->name('tutelage.index');
        Route::get('/tutelage/projects/{project}', [\App\Http\Controllers\Government\TutelageProjectController::class, 'show'])->name('tutelage.show');
        Route::post('/tutelage/projects/{project}/submit', [\App\Http\Controllers\Government\TutelageProjectController::class, 'submitTutelage'])->name('tutelage.submit');
        Route::post('/tutelage/projects/{project}/documents', [\App\Http\Controllers\Government\TutelageProjectController::class, 'uploadDocument'])->name('tutelage.documents');
        Route::post('/tutelage/projects/{project}/execution', [\App\Http\Controllers\Government\TutelageProjectController::class, 'startExecution'])->name('tutelage.execution');
        Route::patch('/tutelage/projects/{project}/disbursement', [\App\Http\Controllers\Government\TutelageProjectController::class, 'updateDisbursement'])->name('tutelage.disbursement');
    });

    // Favorites / wishlist (buyer)
    Route::middleware('role:buyer')->group(function () {
        Route::get('/favorites', [\App\Http\Controllers\Buyer\WishlistController::class, 'index'])->name('favorites.index');
        Route::post('/favorites/toggle', [\App\Http\Controllers\Buyer\WishlistController::class, 'toggleItem'])->name('favorites.toggle');
        Route::post('/favorites/{product:id}', [\App\Http\Controllers\Buyer\WishlistController::class, 'store'])->name('favorites.store');
        Route::delete('/favorites/{product:id}', [\App\Http\Controllers\Buyer\WishlistController::class, 'destroyByProduct'])->name('favorites.destroy');
    });

    Route::redirect('/wishlist', '/favorites');

    // ─── Buyer Routes ─────────────────────────────────────────────────────────
    Route::middleware('role:buyer')->prefix('buyer')->name('buyer.')->group(function () {
        Route::redirect('/dashboard', '/buyer/messages')->name('dashboard');

        // Wishlist
        Route::get('/wishlist',              [\App\Http\Controllers\Buyer\WishlistController::class, 'index'])->name('wishlist');
        Route::post('/wishlist/{product}',   [\App\Http\Controllers\Buyer\WishlistController::class, 'toggle'])->name('wishlist.toggle');
        Route::delete('/wishlist/{favorite}',[\App\Http\Controllers\Buyer\WishlistController::class, 'destroy'])->name('wishlist.destroy');

        // Orders
        Route::get('/orders',                 [\App\Http\Controllers\Buyer\OrderController::class, 'index'])->name('orders.index');
        Route::post('/orders',                [\App\Http\Controllers\Buyer\OrderController::class, 'store'])->name('orders.store');
        Route::get('/orders/{order}',         [\App\Http\Controllers\Buyer\OrderController::class, 'show'])->name('orders.show');
        Route::post('/orders/{order}/contact-seller', [\App\Http\Controllers\Buyer\OrderController::class, 'contactSeller'])->name('orders.contact-seller');
        Route::patch('/orders/{order}/cancel',[\App\Http\Controllers\Buyer\OrderController::class, 'cancel'])->name('orders.cancel');


        // Reviews
        Route::get('/reviews',                [\App\Http\Controllers\Buyer\ReviewController::class, 'index'])->name('reviews.index');
        Route::get('/conversations/{conversation}/review',  [\App\Http\Controllers\Buyer\ReviewController::class, 'create'])->name('reviews.create');
        Route::post('/conversations/{conversation}/review', [\App\Http\Controllers\Buyer\ReviewController::class, 'store'])->name('reviews.store');
        Route::post('/reviews/{review}/vote', [\App\Http\Controllers\Buyer\ReviewVoteController::class, 'store'])->name('reviews.vote');
        Route::post('/reports', [\App\Http\Controllers\Buyer\ReportController::class, 'store'])->name('reports.store');

        // Notifications
        Route::get('/notifications',                                 [\App\Http\Controllers\Buyer\NotificationController::class, 'index'])->name('notifications.index');
        Route::patch('/notifications/{notification}/read',           [\App\Http\Controllers\Buyer\NotificationController::class, 'markAsRead'])->name('notifications.read');
        Route::post('/notifications/read-all',                       [\App\Http\Controllers\Buyer\NotificationController::class, 'markAllRead'])->name('notifications.read-all');

        // Profile
        Route::get('/profile',              [\App\Http\Controllers\Buyer\ProfileController::class, 'edit'])->name('profile');
        Route::patch('/profile',            [\App\Http\Controllers\Buyer\ProfileController::class, 'update'])->name('profile.update');
        Route::patch('/profile/password',   [\App\Http\Controllers\Buyer\ProfileController::class, 'updatePassword'])->name('profile.password');

        // Support Tickets (Buyer)
        Route::redirect('/support-tickets', '/buyer/support');
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

        // Messages
        Route::get('/messages', [\App\Http\Controllers\Seller\MessageController::class, 'index'])->name('messages.index');
        Route::get('/messages/{conversation}', [\App\Http\Controllers\Seller\MessageController::class, 'show'])->name('messages.show');
        Route::post('/messages/{conversation}/send', [\App\Http\Controllers\Seller\MessageController::class, 'send'])->name('messages.send');

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
        Route::post('/reviews/{review}/reply', [\App\Http\Controllers\Seller\ReviewController::class, 'reply'])->name('reviews.reply');

        // Documents
        Route::get('/documents',                    [\App\Http\Controllers\Seller\DocumentController::class, 'index'])->name('documents.index');
        Route::post('/documents',                   [\App\Http\Controllers\Seller\DocumentController::class, 'store'])->name('documents.store');
        Route::delete('/documents/{document}',      [\App\Http\Controllers\Seller\DocumentController::class, 'destroy'])->name('documents.destroy');

        // Payouts
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

        // Homepage Promotions (Featured Sellers)
        Route::get('/promotions',                           [\App\Http\Controllers\Admin\HomepagePromotionController::class, 'index'])->name('promotions.index');
        Route::post('/promotions',                          [\App\Http\Controllers\Admin\HomepagePromotionController::class, 'store'])->name('promotions.store');
        Route::put('/promotions/{promotion}',               [\App\Http\Controllers\Admin\HomepagePromotionController::class, 'update'])->name('promotions.update');
        Route::delete('/promotions/{promotion}',            [\App\Http\Controllers\Admin\HomepagePromotionController::class, 'destroy'])->name('promotions.destroy');
        Route::get('/promotions/sellers/{seller}/products', [\App\Http\Controllers\Admin\HomepagePromotionController::class, 'sellerProducts'])->name('promotions.seller-products');

        // Categories
        Route::get('/categories',              [\App\Http\Controllers\Admin\CategoryController::class, 'index'])->name('categories.index');
        Route::post('/categories',             [\App\Http\Controllers\Admin\CategoryController::class, 'store'])->name('categories.store');
        Route::put('/categories/{id}',   [\App\Http\Controllers\Admin\CategoryController::class, 'update'])->name('categories.update');
        Route::delete('/categories/{id}',[\App\Http\Controllers\Admin\CategoryController::class, 'destroy'])->name('categories.destroy');

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

        // Trust & Safety Center
        Route::get('/trust-center',                     [\App\Http\Controllers\Admin\TrustCenterController::class, 'index'])->name('trust-center.index');
        Route::get('/trust-center/{report}',            [\App\Http\Controllers\Admin\TrustCenterController::class, 'show'])->name('trust-center.show');
        Route::put('/trust-center/{report}',            [\App\Http\Controllers\Admin\TrustCenterController::class, 'updateStatus'])->name('trust-center.updateStatus');
        Route::post('/trust-center/sellers/{seller}/strike', [\App\Http\Controllers\Admin\TrustCenterController::class, 'issueStrike'])->name('trust-center.strike');
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

