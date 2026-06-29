import React from 'react';
import AdminBadge from '@/Components/Admin/AdminBadge';
import { badgeVariant, statusLabel } from '@/lib/projectUi';

export default function ProjectStatusBadge({ status, className = '' }) {
    return (
        <AdminBadge variant={badgeVariant(status)} className={className}>
            {statusLabel(status)}
        </AdminBadge>
    );
}
