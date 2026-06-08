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

    public function __construct(Collection $data, string $type)
    {
        $this->data = $data;
        $this->type = $type;
    }

    public function collection(): Collection
    {
        if ($this->type === 'sales') {
            return $this->data->map(fn($order) => [
                $order->order_number,
                $order->created_at->format('Y-m-d'),
                optional(optional($order->buyer)->user)->name ?? 'N/A',
                $order->items->count(),
                number_format($order->subtotal, 2),
                number_format($order->shipping_cost, 2),
                number_format($order->total_amount, 2),
                ucfirst($order->status),
            ]);
        }

        if ($this->type === 'products') {
            return $this->data->map(fn($p) => [
                $p->name,
                optional($p->category)->name ?? 'N/A',
                number_format($p->price, 2),
                $p->available_stock,
                ucfirst($p->status),
                $p->view_count,
            ]);
        }

        return collect();
    }

    public function headings(): array
    {
        if ($this->type === 'sales') {
            return ['Order #', 'Date', 'Buyer', 'Items', 'Subtotal (TZS)', 'Shipping (TZS)', 'Total (TZS)', 'Status'];
        }

        if ($this->type === 'products') {
            return ['Product', 'Category', 'Price (TZS)', 'Available Stock', 'Status', 'Views'];
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
