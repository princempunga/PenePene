<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use Illuminate\Support\Collection;

class AdminReportExport implements FromCollection, WithHeadings, WithStyles
{
    protected $data;
    protected string $type;

    public function __construct($data, string $type)
    {
        $this->data = $data;
        $this->type = $type;
    }

    public function collection(): Collection
    {
        if ($this->type === 'sales') {
            return $this->data->map(fn($o) => [
                $o->order_number,
                $o->created_at->format('Y-m-d'),
                optional(optional($o->buyer)->user)->name ?? 'N/A',
                optional($o->seller)->business_name ?? 'N/A',
                number_format($o->total_amount, 2),
                ucfirst($o->status),
            ]);
        }

        if ($this->type === 'sellers') {
            return $this->data->map(fn($s) => [
                $s->business_name,
                $s->city,
                $s->total_sales,
                number_format($s->average_rating, 2),
                ucfirst($s->status),
            ]);
        }

        if ($this->type === 'products') {
            return $this->data->map(fn($p) => [
                $p->name,
                optional($p->seller)->business_name ?? 'N/A',
                optional($p->category)->name ?? 'N/A',
                number_format($p->price, 2),
                $p->available_stock,
                ucfirst($p->status),
            ]);
        }

        return collect();
    }

    public function headings(): array
    {
        return match ($this->type) {
            'sales'    => ['Order #', 'Date', 'Buyer', 'Seller', 'Total (TZS)', 'Status'],
            'sellers'  => ['Business Name', 'City', 'Total Sales', 'Rating', 'Status'],
            'products' => ['Product', 'Seller', 'Category', 'Price (TZS)', 'Stock', 'Status'],
            default    => [],
        };
    }

    public function styles(Worksheet $sheet): array
    {
        return [
            1 => ['font' => ['bold' => true, 'size' => 12]],
        ];
    }
}
