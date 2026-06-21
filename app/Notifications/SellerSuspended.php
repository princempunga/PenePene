<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class SellerSuspended extends Notification implements ShouldQueue
{
    use Queueable;

    public $reason;

    public function __construct(string $reason)
    {
        $this->reason = $reason;
    }

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
                    ->error()
                    ->subject('Avis Important : Suspension de votre compte Vendeur')
                    ->greeting('Bonjour ' . $notifiable->name . ',')
                    ->line('Votre compte vendeur a été temporairement suspendu en raison de : ' . $this->reason)
                    ->line('Si vous pensez qu\'il s\'agit d\'une erreur, veuillez contacter l\'assistance.')
                    ->action('Contacter le Support', url('/contact'))
                    ->line('Merci de votre compréhension.');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type'    => 'seller_suspended',
            'title'   => 'Compte Suspendu',
            'message' => 'Votre compte vendeur a été suspendu : ' . $this->reason,
            'action_url' => '/contact',
        ];
    }
}
