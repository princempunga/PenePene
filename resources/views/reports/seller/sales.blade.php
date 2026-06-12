<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>PenePene — Rapport des ventes</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: DejaVu Sans, sans-serif; font-size: 12px; color: #1a202c; background: #fff; }
        .header { background: #1e293b; color: white; padding: 24px 32px; display: flex; justify-content: space-between; }
        .header h1 { font-size: 24px; font-weight: bold; }
        .header p { font-size: 11px; opacity: 0.8; margin-top: 4px; }
        .meta { padding: 16px 32px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; }
        .meta-grid { display: flex; gap: 32px; }
        .meta-item label { font-size: 10px; text-transform: uppercase; color: #64748b; }
        .meta-item p { font-weight: bold; font-size: 13px; }
        .content { padding: 24px 32px; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        thead tr { background: #1e293b; color: white; }
        thead th { padding: 10px 12px; text-align: left; font-size: 11px; text-transform: uppercase; }
        tbody tr:nth-child(even) { background: #f8fafc; }
        tbody td { padding: 9px 12px; border-bottom: 1px solid #e2e8f0; }
        .badge { padding: 2px 8px; border-radius: 9999px; font-size: 10px; font-weight: bold; }
        .badge-delivered { background: #dcfce7; color: #166534; }
        .badge-pending   { background: #fef3c7; color: #92400e; }
        .badge-shipped   { background: #ede9fe; color: #5b21b6; }
        .badge-cancelled { background: #fee2e2; color: #991b1b; }
        .badge-confirmed { background: #dbeafe; color: #1e40af; }
        .footer { padding: 16px 32px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 10px; text-align: center; }
        .summary { display: flex; gap: 16px; margin: 16px 0; }
        .summary-card { flex: 1; background: #f1f5f9; border-radius: 8px; padding: 12px 16px; }
        .summary-card label { font-size: 10px; color: #64748b; text-transform: uppercase; }
        .summary-card p { font-size: 20px; font-weight: bold; color: #1e293b; margin-top: 2px; }
    </style>
</head>
<body>
    @php
        $statusLabels = [
            'pending'   => 'En attente',
            'confirmed' => 'Confirmée',
            'shipped'   => 'Expédiée',
            'delivered' => 'Livrée',
            'cancelled' => 'Annulée',
        ];
    @endphp

    <div class="header">
        <div>
            <h1>PenePene</h1>
            <p>Rapport des ventes — {{ $seller->business_name }}</p>
        </div>
        <div style="text-align: right;">
            <p>Généré le : {{ now()->locale('fr')->translatedFormat('d M Y H:i') }}</p>
            <p>Période : {{ $from->locale('fr')->translatedFormat('d M Y') }} – {{ $to->locale('fr')->translatedFormat('d M Y') }}</p>
        </div>
    </div>

    <div class="meta">
        <div class="summary">
            <div class="summary-card">
                <label>Total commandes</label>
                <p>{{ $data->count() }}</p>
            </div>
            <div class="summary-card">
                <label>Revenus totaux</label>
                <p>{{ number_format($data->sum('total'), 0, ',', ' ') }} FC</p>
            </div>
            <div class="summary-card">
                <label>Livrées</label>
                <p>{{ $data->where('status', 'delivered')->count() }}</p>
            </div>
            <div class="summary-card">
                <label>En attente</label>
                <p>{{ $data->where('status', 'pending')->count() }}</p>
            </div>
        </div>
    </div>

    <div class="content">
        <table>
            <thead>
                <tr>
                    <th>N° commande</th>
                    <th>Date</th>
                    <th>Acheteur</th>
                    <th>Articles</th>
                    <th>Total (FC)</th>
                    <th>Statut</th>
                </tr>
            </thead>
            <tbody>
                @forelse($data as $order)
                <tr>
                    <td><strong>{{ $order->order_number }}</strong></td>
                    <td>{{ $order->created_at->locale('fr')->translatedFormat('d M Y') }}</td>
                    <td>{{ optional(optional($order->buyer)->user)->name ?? 'N/D' }}</td>
                    <td>{{ $order->items->count() }}</td>
                    <td>{{ number_format($order->total_amount, 0, ',', ' ') }}</td>
                    <td><span class="badge badge-{{ $order->status }}">{{ $statusLabels[$order->status] ?? ucfirst($order->status) }}</span></td>
                </tr>
                @empty
                <tr><td colspan="6" style="text-align: center; padding: 24px; color: #94a3b8;">Aucune commande sur cette période.</td></tr>
                @endforelse
            </tbody>
        </table>
    </div>

    <div class="footer">
        PenePene Marketplace — Rapport vendeur confidentiel — Généré le {{ now()->locale('fr')->translatedFormat('d M Y') }}
    </div>
</body>
</html>
