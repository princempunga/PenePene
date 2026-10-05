import React from 'react';
import { usePage } from '@inertiajs/react';
import {
    Package, Heart, MessageCircle, Star, Bell, User, ShieldCheck,
} from 'lucide-react';
import DashboardShell from '@/Components/Layout/DashboardShell';
import useTranslation from '@/hooks/useTranslation';

export default function BuyerLayout({ children, title, subtitle }) {
    const { t } = useTranslation();
    const page = usePage();
    const { auth, unread_notifications } = page.props;
    const user = auth?.user;

    const badges = {
        notifications: unread_notifications ?? 0,
        messages: 0,
    };

    const initials = user?.name
        ?.split(' ')
        .map((part) => part.charAt(0))
        .join('')
        .slice(0, 2)
        .toUpperCase() || 'A';

    const navSections = [
        {
            labelKey: 'layouts.buyer.section_shopping',
            items: [
                { key: 'buyer.my_orders', href: '/buyer/orders', icon: Package, badge: null },
                { key: 'buyer.wishlist', href: '/buyer/wishlist', icon: Heart, badge: null },
                { key: 'buyer.messages', href: '/buyer/messages', icon: MessageCircle, badge: null },
            ],
        },
        {
            labelKey: 'layouts.buyer.section_account',
            items: [
                { key: 'buyer.my_reviews', href: '/buyer/reviews', icon: Star, badge: null },
                { key: 'buyer.support_tickets', href: '/buyer/support', icon: ShieldCheck, badge: null },
                { key: 'buyer.notifications', href: '/buyer/notifications', icon: Bell, badge: 'notifications' },
                { key: 'buyer.profile', href: '/buyer/profile', icon: User, badge: null },
            ],
        },
    ];

    return (
        <DashboardShell
            variant="buyer"
            title={title}
            subtitle={subtitle}
            navSections={navSections}
            headerBadgeKey="layouts.buyer.buyer_badge"
            headerHomeHref="/"
            dashboardHref="/buyer/orders"
            brandVariant="default"
            badges={badges}
            profile={{
                name: user?.name || t('buyer.buyer_account'),
                subtitle: user?.email,
                avatar: user?.avatar ? `/storage/${user.avatar}` : null,
                initials,
                badge: {
                    label: t('buyer.active_buyer'),
                    icon: <ShieldCheck size={11} />,
                    tone: 'success',
                },
            }}
        >
            <div className="dashboard-content space-y-6">{children}</div>
        </DashboardShell>
    );
}

