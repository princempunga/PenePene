<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class OrderStatusUpdated extends Notification
{
    use Queueable;

    public function __construct(public Order $order) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title'    => 'Order Status Updated',
            'body'     => "Your order {$this->order->order_number} is now {$this->order->status}.",
            'type'     => 'order',
            'order_id' => $this->order->id,
        ];
    }
}
