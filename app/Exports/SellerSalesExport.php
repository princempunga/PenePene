<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use Illuminate\Support\Collection;

class SellerSalesExport implements FromCollection, WithHeadings, WithStyles
{
    protected Collection $data;
    protected string $type;

    private const ORDER_STATUS_LABELS = [
        'pending'   => 'En attente',
        'confirmed' => 'Confirmée',
        'shipped'   => 'Expédiée',
        'delivered' => 'Livrée',
        'cancelled' => 'Annulée',
    ];

    private const PRODUCT_STATUS_LABELS = [
        'pending'  => 'En attente',
        'active'   => 'Actif',
        'inactive' => 'Inactif',
        'rejected' => 'Rejeté',
    ];

    public function __construct(Collection $data, string $type)
    {
        $this->data = $data;
        $this->type = $type;
    }

    public function collection(): Collection
    {
        if ($this->type === 'sales') {
            return $this->data->map(fn ($order) => [
                $order->order_number,
                $order->created_at->format('Y-m-d'),
                optional(optional($order->buyer)->user)->name ?? 'N/D',
                $order->items->count(),
                number_format($order->subtotal, 0, ',', ' '),
                number_format($order->shipping_cost, 0, ',', ' '),
                number_format($order->total_amount, 0, ',', ' '),
                self::ORDER_STATUS_LABELS[$order->status] ?? $order->status,
            ]);
        }

        if ($this->type === 'products') {
            return $this->data->map(fn ($p) => [
                $p->name,
                optional($p->category)->name ?? 'N/D',
                number_format($p->price, 0, ',', ' '),
                $p->available_stock,
                self::PRODUCT_STATUS_LABELS[$p->status] ?? $p->status,
                $p->view_count,
            ]);
        }

        return collect();
    }

    public function headings(): array
    {
        if ($this->type === 'sales') {
            return ['N° commande', 'Date', 'Acheteur', 'Articles', 'Sous-total (FC)', 'Livraison (FC)', 'Total (FC)', 'Statut'];
        }

        if ($this->type === 'products') {
            return ['Produit', 'Catégorie', 'Prix (FC)', 'Stock disponible', 'Statut', 'Vues'];
        }

        return [];
    }

    public function styles(Worksheet $sheet): array
    {
        return [
            1 => ['font' => ['bold' => true, 'size' => 12]],
        ];
    }
}
