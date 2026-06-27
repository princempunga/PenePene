import React from 'react';
import { usePage } from '@inertiajs/react';
import {
    LayoutDashboard, Package, ShoppingCart, MessageCircle, Bell,
    Star, User, Store, CreditCard, FileDown, Wallet, FileText, Settings,
} from 'lucide-react';
import DashboardShell from '@/Components/Layout/DashboardShell';
import useTranslation from '@/hooks/useTranslation';

const sellerStatusKeys = {
    verified:  'layouts.seller.status_verified',
    pending:   'layouts.seller.status_pending',
    rejected:  'layouts.seller.status_rejected',
    suspended: 'layouts.seller.status_suspended',
};

export default function SellerLayout({ children, title, subtitle }) {
    const { t } = useTranslation();
    const page = usePage();
    const { auth, seller, unread_notifications, unread_messages, demo_enabled } = page.props;

    const badges = {
        messages: typeof unread_messages === 'number' ? unread_messages : 0,
        notifications: unread_notifications ?? 0,
    };

    const navSections = [
        {
            labelKey: 'layouts.seller.section_main',
            items: [
                { key: 'layouts.seller.dashboard', href: '/seller/dashboard', icon: LayoutDashboard, badge: null },
                { key: 'layouts.seller.products', href: '/seller/products', icon: Package, badge: null },
                { key: 'layouts.seller.orders', href: '/seller/orders', icon: ShoppingCart, badge: null },
                { key: 'layouts.seller.messages', href: '/seller/messages', icon: MessageCircle, badge: 'messages' },
                { key: 'layouts.seller.notifications', href: '/seller/notifications', icon: Bell, badge: 'notifications' },
            ],
        },
        {
            labelKey: 'layouts.seller.section_business',
            items: [
                { key: 'layouts.seller.reviews', href: '/seller/reviews', icon: Star, badge: null },
                { key: 'layouts.seller.payouts', href: '/seller/payouts', icon: Wallet, badge: null },
                { key: 'layouts.seller.reports', href: '/seller/reports', icon: FileDown, badge: null },
                { key: 'layouts.seller.documents', href: '/seller/documents', icon: FileText, badge: null },
            ],
        },
        {
            labelKey: 'layouts.seller.section_account',
            items: [
                { key: 'layouts.seller.store_settings', href: '/seller/store/settings', icon: Settings, badge: null },
                { key: 'layouts.seller.profile', href: '/seller/profile', icon: User, badge: null },
                { key: 'layouts.seller.subscriptions', href: '/seller/subscriptions', icon: CreditCard, badge: null },
            ],
        },
    ];

    const statusTone =
        seller?.status === 'verified' ? 'success' :
        seller?.status === 'pending' ? 'warning' : undefined;

    return (
        <DashboardShell
            variant="seller"
            title={title}
            subtitle={subtitle}
            navSections={navSections}
            headerBadgeKey="layouts.seller.seller_badge"
            demoHref={demo_enabled ? '/demo/seller-panel' : null}
            demoLabelKey="layouts.demo.seller_panel"
            badges={badges}
            profile={{
                name: seller?.business_name || auth.user?.name || t('layouts.seller.seller_portal'),
                subtitle: auth.user?.email,
                avatar: seller?.logo ? `/storage/${seller.logo}` : auth.user?.avatar ? `/storage/${auth.user.avatar}` : null,
                initials: seller?.business_name?.charAt(0)?.toUpperCase() || auth.user?.name?.charAt(0)?.toUpperCase() || 'V',
                badge: seller?.status ? {
                    label: t(sellerStatusKeys[seller.status] || seller.status),
                    icon: <Store size={11} />,
                    tone: statusTone,
                } : null,
            }}
        >
            <div className="dashboard-content space-y-6">
                {children}
            </div>
        </DashboardShell>
    );
}
