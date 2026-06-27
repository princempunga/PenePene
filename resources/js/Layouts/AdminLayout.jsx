import React from 'react';
import { usePage } from '@inertiajs/react';
import {
    LayoutDashboard, Users, UserCheck, Shield, ListTree, Package, ShoppingCart,
    Megaphone, Ticket, FileDown, Settings, Star,
} from 'lucide-react';
import AdminShell from '@/Components/Layout/AdminShell';
import AdminDemoBanner from '@/Components/Admin/AdminDemoBanner';
import useTranslation from '@/hooks/useTranslation';

export default function AdminLayout({ children, title, subtitle, usingDemoData: usingDemoProp }) {
    const { t } = useTranslation();
    const page = usePage();
    const { auth, usingDemoData: usingDemoPage } = page.props;
    const usingDemoData = usingDemoProp ?? usingDemoPage;
    const userRole = auth?.user?.role ?? '';

    const allSections = [
        {
            labelKey: 'layouts.admin.section_overview',
            roles: ['super_admin', 'admin'],
            items: [
                { key: 'layouts.admin.dashboard', href: '/admin/dashboard', icon: LayoutDashboard, roles: ['super_admin', 'admin'] },
            ],
        },
        {
            labelKey: 'layouts.admin.section_marketplace',
            roles: ['super_admin', 'admin'],
            items: [
                { key: 'layouts.admin.products', href: '/admin/products', icon: Package, roles: ['super_admin', 'admin'] },
                { key: 'layouts.admin.orders', href: '/admin/orders', icon: ShoppingCart, roles: ['super_admin', 'admin'] },
                { key: 'layouts.admin.sellers', href: '/admin/sellers', icon: UserCheck, roles: ['super_admin', 'admin'] },
                { key: 'layouts.admin.categories', href: '/admin/categories', icon: ListTree, roles: ['super_admin', 'admin'] },
                { key: 'layouts.admin.reviews', href: '/admin/reviews', icon: Star, roles: ['super_admin', 'admin'] },
            ],
        },
        {
            labelKey: 'layouts.admin.section_operations',
            roles: ['super_admin', 'admin'],
            items: [
                { key: 'layouts.admin.sponsored_ads', href: '/admin/advertisements', icon: Megaphone, roles: ['super_admin', 'admin'] },
                { key: 'layouts.admin.support_desk', href: '/admin/support', icon: Ticket, roles: ['super_admin', 'admin'] },
                { key: 'layouts.admin.reports', href: '/admin/reports', icon: FileDown, roles: ['super_admin', 'admin'] },
            ],
        },
        {
            labelKey: 'layouts.admin.section_system',
            roles: ['super_admin'],
            items: [
                { key: 'layouts.admin.sub_admins', href: '/admin/admins', icon: Users, roles: ['super_admin'] },
                { key: 'layouts.admin.subscription_plans', href: '/admin/plans', icon: Shield, roles: ['super_admin'] },
                { key: 'layouts.admin.settings', href: '/admin/settings', icon: Settings, roles: ['super_admin'] },
            ],
        },
    ];

    const navSections = allSections
        .filter((section) => section.roles.includes(userRole))
        .map((section) => ({
            labelKey: section.labelKey,
            items: section.items.filter((item) => item.roles.includes(userRole)),
        }))
        .filter((section) => section.items.length > 0);

    const roleKey = userRole === 'super_admin'
        ? 'layouts.admin.role_super_admin'
        : 'layouts.admin.role_admin';

    return (
        <AdminShell
            title={title}
            subtitle={subtitle}
            navSections={navSections}
            profile={{
                name: auth?.user?.name ?? 'Admin',
                subtitle: auth?.user?.email,
                avatar: auth?.user?.avatar ? `/storage/${auth.user.avatar}` : null,
                initials: auth?.user?.name?.[0]?.toUpperCase() ?? 'A',
                badge: { label: t(roleKey) },
            }}
        >
            {(usingDemoData) && <AdminDemoBanner />}
            {children}
        </AdminShell>
    );
}
