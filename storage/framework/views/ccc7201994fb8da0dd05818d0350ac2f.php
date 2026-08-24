<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>PenePene Admin Sales Report</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: DejaVu Sans, sans-serif; font-size: 12px; color: #1a202c; }
        .header { background: #0f172a; color: white; padding: 24px 32px; }
        .header h1 { font-size: 24px; font-weight: bold; }
        .header p { font-size: 11px; opacity: 0.8; margin-top: 4px; }
        .content { padding: 24px 32px; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        thead tr { background: #0f172a; color: white; }
        thead th { padding: 10px 12px; text-align: left; font-size: 11px; text-transform: uppercase; }
        tbody tr:nth-child(even) { background: #f8fafc; }
        tbody td { padding: 9px 12px; border-bottom: 1px solid #e2e8f0; }
        .footer { padding: 16px 32px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 10px; text-align: center; }
    </style>
</head>
<body>
    <div class="header">
        <div>
            <h1>PenePene Admin</h1>
            <p>Platform Sales Report — <?php echo e($from->format('d M Y')); ?> to <?php echo e($to->format('d M Y')); ?></p>
        </div>
        <p style="margin-top:8px; font-size:11px; opacity:0.7">Generated: <?php echo e(now()->format('d M Y H:i')); ?></p>
    </div>
    <div class="content">
        <table>
            <thead>
                <tr>
                    <th>Order #</th>
                    <th>Date</th>
                    <th>Buyer</th>
                    <th>Seller</th>
                    <th>Total (TZS)</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                <?php $__empty_1 = true; $__currentLoopData = $data; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $order): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); $__empty_1 = false; ?>
                <tr>
                    <td><strong><?php echo e($order->order_number); ?></strong></td>
                    <td><?php echo e($order->created_at->format('d M Y')); ?></td>
                    <td><?php echo e(optional(optional($order->buyer)->user)->name ?? 'N/A'); ?></td>
                    <td><?php echo e(optional($order->seller)->business_name ?? 'N/A'); ?></td>
                    <td><?php echo e(number_format($order->total_amount, 2)); ?></td>
                    <td><?php echo e(ucfirst($order->status)); ?></td>
                </tr>
                <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); if ($__empty_1): ?>
                <tr><td colspan="6" style="text-align: center; padding: 24px; color: #94a3b8;">No orders in this period.</td></tr>
                <?php endif; ?>
            </tbody>
        </table>
        <div style="margin-top: 24px; padding: 16px; background: #f1f5f9; border-radius: 8px;">
            <strong>Summary:</strong> <?php echo e($data->count()); ?> orders •
            Total Revenue: TZS <?php echo e(number_format($data->sum('total'), 2)); ?>

        </div>
    </div>
    <div class="footer">PenePene Marketplace — Confidential Admin Report — <?php echo e(now()->format('d M Y')); ?></div>
</body>
</html>
<?php /**PATH C:\Users\Michel\PenePene\resources\views\reports\admin\sales.blade.php ENDPATH**/ ?>