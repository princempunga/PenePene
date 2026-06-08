<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>PenePene Sales Report</title>
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
        .footer { padding: 16px 32px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 10px; text-align: center; }
        .summary { display: flex; gap: 16px; margin: 16px 0; }
        .summary-card { flex: 1; background: #f1f5f9; border-radius: 8px; padding: 12px 16px; }
        .summary-card label { font-size: 10px; color: #64748b; text-transform: uppercase; }
        .summary-card p { font-size: 20px; font-weight: bold; color: #1e293b; margin-top: 2px; }
    </style>
</head>
<body>
    <div class="header">
        <div>
            <h1>PenePene</h1>
            <p>Sales Report — {{ $seller->business_name }}</p>
        </div>
        <div style="text-align: right;">
            <p>Generated: {{ now()->format('d M Y H:i') }}</p>
            <p>Period: {{ $from->format('d M Y') }} – {{ $to->format('d M Y') }}</p>
        </div>
    </div>

    <div class="meta">
        <div class="summary">
            <div class="summary-card">
                <label>Total Orders</label>
                <p>{{ $data->count() }}</p>
            </div>
            <div class="summary-card">
                <label>Total Revenue</label>
                <p>TZS {{ number_format($data->sum('total'), 2) }}</p>
            </div>
            <div class="summary-card">
                <label>Delivered</label>
                <p>{{ $data->where('status', 'delivered')->count() }}</p>
            </div>
            <div class="summary-card">
                <label>Pending</label>
                <p>{{ $data->where('status', 'pending')->count() }}</p>
            </div>
        </div>
    </div>

    <div class="content">
        <table>
            <thead>
                <tr>
                    <th>Order #</th>
                    <th>Date</th>
                    <th>Buyer</th>
                    <th>Items</th>
                    <th>Total (TZS)</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                @forelse($data as $order)
                <tr>
                    <td><strong>{{ $order->order_number }}</strong></td>
                    <td>{{ $order->created_at->format('d M Y') }}</td>
                    <td>{{ optional(optional($order->buyer)->user)->name ?? 'N/A' }}</td>
                    <td>{{ $order->items->count() }}</td>
                    <td>{{ number_format($order->total_amount, 2) }}</td>
                    <td><span class="badge badge-{{ $order->status }}">{{ ucfirst($order->status) }}</span></td>
                </tr>
                @empty
                <tr><td colspan="6" style="text-align: center; padding: 24px; color: #94a3b8;">No orders in this period.</td></tr>
                @endforelse
            </tbody>
        </table>
    </div>

    <div class="footer">
        PenePene Marketplace — Confidential Seller Report — Generated {{ now()->format('d M Y') }}
    </div>
</body>
</html>
