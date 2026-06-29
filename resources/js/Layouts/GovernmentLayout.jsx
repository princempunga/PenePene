import React from 'react';
import { usePage } from '@inertiajs/react';
import {
    LayoutDashboard, ClipboardCheck, Landmark, Archive,
} from 'lucide-react';
import AdminShell from '@/Components/Layout/AdminShell';
import useTranslation from '@/hooks/useTranslation';

const levelLabels = {
    commune: 'Administration communale',
    territory: 'Administration urbaine',
    provincial: 'Administration provinciale',
    national: 'Administration nationale',
};

const NAV_BY_PORTAL = {
    expert: [
        { key: 'government.expert_review', href: '/government/expert/projects', icon: ClipboardCheck },
        { key: 'government.all_projects', href: '/projects/archive', icon: Archive },
    ],
    tutelage: [
        { key: 'government.tutelage', href: '/government/tutelage/projects', icon: Landmark },
        { key: 'government.all_projects', href: '/projects/archive', icon: Archive },
    ],
    commune: [
        { key: 'government.dashboard', href: '/government/dashboard', icon: LayoutDashboard },
        { key: 'government.all_projects', href: '/projects/archive', icon: Archive },
    ],
    territory: [
        { key: 'government.dashboard', href: '/government/dashboard', icon: LayoutDashboard },
        { key: 'government.all_projects', href: '/projects/archive', icon: Archive },
    ],
    provincial: [
        { key: 'government.dashboard', href: '/government/dashboard', icon: LayoutDashboard },
        { key: 'government.all_projects', href: '/projects/archive', icon: Archive },
    ],
    national: [
        { key: 'government.dashboard', href: '/government/dashboard', icon: LayoutDashboard },
        { key: 'government.all_projects', href: '/projects/archive', icon: Archive },
    ],
};

export default function GovernmentLayout({ children, title, subtitle }) {
    const { t } = useTranslation();
    const { auth, active_portal, active_portal_label } = usePage().props;
    const profile = auth?.user?.government_profile;
    const officerLevel = profile?.officer_level;
    const portal = active_portal || 'national';

    const navItems = NAV_BY_PORTAL[portal] ?? NAV_BY_PORTAL.national;
    const homeHref = navItems[0]?.href ?? '/government/dashboard';

    const navSections = [
        {
            labelKey: 'government.section_overview',
            items: navItems,
        },
    ];

    return (
        <AdminShell
            title={title}
            subtitle={subtitle}
            navSections={navSections}
            logoHref={homeHref}
            brandVariant="rdc"
            consoleLabelKey="government.console_label"
            consoleSubtitle={active_portal_label || profile?.department || levelLabels[officerLevel] || t('government.console_label')}
            profile={{
                name: auth?.user?.name ?? 'Agent',
                subtitle: profile?.title ?? auth?.user?.email,
                avatar: auth?.user?.avatar ? `/storage/${auth.user.avatar}` : null,
                initials: auth?.user?.name?.[0]?.toUpperCase() ?? 'G',
                badge: { label: active_portal_label || levelLabels[officerLevel] || 'Gouvernement RDC' },
            }}
        >
            {children}
        </AdminShell>
    );
}
