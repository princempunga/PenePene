<?php

namespace App\Console\Commands;

use App\Services\SubscriptionService;
use Illuminate\Console\Command;

class ExpireSubscriptions extends Command
{
    protected $signature = 'subscriptions:expire';

    protected $description = 'Marque les abonnements arrivés à échéance comme expirés, repasse les vendeurs au plan Gratuit et désactive les produits excédentaires.';

    public function handle(SubscriptionService $subscriptions): int
    {
        $stats = $subscriptions->expireSubscriptions();

        $this->info("Abonnements expirés : {$stats['expired']}. Vendeurs repassés au plan Gratuit : {$stats['downgraded']}.");

        return self::SUCCESS;
    }
}
