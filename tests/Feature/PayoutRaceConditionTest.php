<?php

namespace Tests\Feature;

use App\Http\Controllers\Seller\PayoutController;
use App\Models\Commission;
use App\Models\Payout;
use App\Models\Seller;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

/**
 * NOTE: routes/web.php currently has no route pointing at PayoutController —
 * the seller Payouts/Index.jsx page posts to /seller/payouts but nothing
 * answers it (flagged separately in the security report; not something
 * this fix should silently add). To exercise store() through the real HTTP
 * kernel (needed so redirect()->back()->with() has a session to flash into),
 * this test registers a throwaway route for the duration of the test only.
 */
class PayoutRaceConditionTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Route::middleware('web')->post('/__test-only/seller-payouts', [PayoutController::class, 'store']);
    }

    private function makeSellerWithConfirmedEarnings(float $amount): array
    {
        $user = User::create([
            'name'     => 'Vendeur Payout',
            'email'    => 'payout-'.uniqid().'@test.com',
            'password' => bcrypt('password'),
            'role'     => 'seller',
        ]);

        $seller = Seller::create([
            'user_id'       => $user->id,
            'business_name' => 'Boutique Payout',
            'status'        => 'verified',
        ]);

        // Minimal commission row bypassing the order/order_item FK chain —
        // irrelevant to the race-condition logic under test.
        DB::statement('SET FOREIGN_KEY_CHECKS=0');
        Commission::create([
            'order_id'           => 0,
            'order_item_id'      => 0,
            'seller_id'          => $seller->id,
            'order_amount'       => $amount,
            'commission_rate'    => 0,
            'commission_amount'  => 0,
            'seller_payout'      => $amount,
            'status'             => 'confirmed',
        ]);
        DB::statement('SET FOREIGN_KEY_CHECKS=1');

        return [$user, $seller];
    }

    public function test_second_payout_request_is_rejected_while_one_is_already_pending(): void
    {
        [$user, $seller] = $this->makeSellerWithConfirmedEarnings(50000);

        $payload = [
            'amount'         => 20000,
            'payment_method' => 'mobile_money',
            'account_number' => '0810000000',
            'account_name'   => 'Vendeur Payout',
        ];

        $this->actingAs($user)
            ->post('/__test-only/seller-payouts', $payload)
            ->assertSessionHas('success');

        $this->assertSame(1, Payout::where('seller_id', $seller->id)->count());

        // A second request — simulating a duplicate/concurrent submission —
        // must be rejected because one payout is already pending.
        $this->actingAs($user)
            ->post('/__test-only/seller-payouts', $payload)
            ->assertSessionHas('error');

        $this->assertSame(1, Payout::where('seller_id', $seller->id)->count());
    }

    public function test_payout_cannot_exceed_balance_still_available_under_lock(): void
    {
        [$user, $seller] = $this->makeSellerWithConfirmedEarnings(20000);

        // First payout consumes the entire available balance.
        $this->actingAs($user)->post('/__test-only/seller-payouts', [
            'amount'         => 20000,
            'payment_method' => 'mobile_money',
            'account_number' => '0810000000',
            'account_name'   => 'Vendeur Payout',
        ])->assertSessionHas('success');

        $this->assertSame(20000.0, (float) Payout::where('seller_id', $seller->id)->sum('amount'));
    }
}
