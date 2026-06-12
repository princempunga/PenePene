<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>PenePene — Rapport des produits</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: DejaVu Sans, sans-serif; font-size: 12px; color: #1a202c; }
        .header { background: #1e293b; color: white; padding: 24px 32px; }
        .header h1 { font-size: 24px; font-weight: bold; }
        .header p { font-size: 11px; opacity: 0.8; margin-top: 4px; }
        .content { padding: 24px 32px; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        thead tr { background: #1e293b; color: white; }
        thead th { padding: 10px 12px; text-align: left; font-size: 11px; text-transform: uppercase; }
        tbody tr:nth-child(even) { background: #f8fafc; }
        tbody td { padding: 9px 12px; border-bottom: 1px solid #e2e8f0; }
        .footer { padding: 16px 32px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 10px; text-align: center; }
    </style>
</head>
<body>
    @php
        $statusLabels = [
            'pending'  => 'En attente',
            'active'   => 'Actif',
            'inactive' => 'Inactif',
            'rejected' => 'Rejeté',
        ];
    @endphp

    <div class="header">
        <div>
            <h1>PenePene</h1>
            <p>Rapport des produits — {{ $seller->business_name }} — Généré le {{ now()->locale('fr')->translatedFormat('d M Y') }}</p>
        </div>
    </div>
    <div class="content">
        <table>
            <thead>
                <tr>
                    <th>Produit</th>
                    <th>Catégorie</th>
                    <th>Prix (FC)</th>
                    <th>Stock</th>
                    <th>Vues</th>
                    <th>Statut</th>
                </tr>
            </thead>
            <tbody>
                @forelse($data as $product)
                <tr>
                    <td><strong>{{ $product->name }}</strong></td>
                    <td>{{ optional($product->category)->name ?? 'N/D' }}</td>
                    <td>{{ number_format($product->price, 0, ',', ' ') }}</td>
                    <td>{{ $product->available_stock }}</td>
                    <td>{{ $product->view_count }}</td>
                    <td>{{ $statusLabels[$product->status] ?? ucfirst($product->status) }}</td>
                </tr>
                @empty
                <tr><td colspan="6" style="text-align: center; padding: 24px; color: #94a3b8;">Aucun produit trouvé.</td></tr>
                @endforelse
            </tbody>
        </table>
    </div>
    <div class="footer">PenePene Marketplace — Rapport vendeur confidentiel — {{ now()->locale('fr')->translatedFormat('d M Y') }}</div>
</body>
</html>
