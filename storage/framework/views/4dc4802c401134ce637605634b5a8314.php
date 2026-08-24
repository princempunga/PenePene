<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>PenePene — Alerte stock faible</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: DejaVu Sans, sans-serif; font-size: 12px; color: #1a202c; }
        .header { background: #b91c1c; color: white; padding: 24px 32px; }
        .header h1 { font-size: 24px; font-weight: bold; }
        .content { padding: 24px 32px; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        thead tr { background: #b91c1c; color: white; }
        thead th { padding: 10px 12px; text-align: left; font-size: 11px; text-transform: uppercase; }
        tbody tr:nth-child(even) { background: #fef2f2; }
        tbody td { padding: 9px 12px; border-bottom: 1px solid #fecaca; }
        .footer { padding: 16px 32px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 10px; text-align: center; }
    </style>
</head>
<body>
    <?php
        $statusLabels = [
            'pending'  => 'En attente',
            'active'   => 'Actif',
            'inactive' => 'Inactif',
            'rejected' => 'Rejeté',
        ];
    ?>

    <div class="header">
        <h1>PenePene — Alerte stock faible</h1>
        <p style="margin-top: 4px; font-size: 11px; opacity: 0.9"><?php echo e($seller->business_name); ?> — <?php echo e(now()->locale('fr')->translatedFormat('d M Y')); ?></p>
    </div>
    <div class="content">
        <table>
            <thead>
                <tr>
                    <th>Produit</th>
                    <th>Catégorie</th>
                    <th>Stock disponible</th>
                    <th>Seuil stock faible</th>
                    <th>Statut</th>
                </tr>
            </thead>
            <tbody>
                <?php $__empty_1 = true; $__currentLoopData = $data; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $product): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); $__empty_1 = false; ?>
                <tr>
                    <td><strong><?php echo e($product->name); ?></strong></td>
                    <td><?php echo e(optional($product->category)->name ?? 'N/D'); ?></td>
                    <td style="color: #b91c1c; font-weight: bold;"><?php echo e($product->available_stock); ?></td>
                    <td><?php echo e($product->low_stock_threshold); ?></td>
                    <td><?php echo e($statusLabels[$product->status] ?? ucfirst($product->status)); ?></td>
                </tr>
                <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); if ($__empty_1): ?>
                <tr><td colspan="5" style="text-align: center; padding: 24px; color: #94a3b8;">Aucun produit en stock faible. Parfait !</td></tr>
                <?php endif; ?>
            </tbody>
        </table>
    </div>
    <div class="footer">PenePene Marketplace — Rapport stock faible — <?php echo e(now()->locale('fr')->translatedFormat('d M Y')); ?></div>
</body>
</html>
<?php /**PATH C:\Users\Michel\PenePene\resources\views\reports\seller\stock.blade.php ENDPATH**/ ?>