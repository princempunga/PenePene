import React, { useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Bell, LogOut, Menu, X } from 'lucide-react';
import Logo from '@/Components/Brand/Logo';
import RdcGovLogo from '@/Components/Brand/RdcGovLogo';
import useTranslation from '@/hooks/useTranslation';

function isNavActive(currentPath, href, variant) {
    if (href === '/seller/dashboard' || href === '/admin/dashboard') {
        return currentPath === href;
    }
    if (href === '/buyer/messages' || href === '/seller/messages') {
        const chatPrefix = variant === 'seller' ? '/seller/messages' : '/buyer/messages';
        return currentPath.startsWith(chatPrefix) || currentPath.startsWith('/chat/conversations');
    }
    if (href === '/projects') {
        return currentPath.startsWith('/projects') && !currentPath.startsWith('/projects/archive');
    }
    return currentPath === href || currentPath.startsWith(`${href}/`);
}

function navStyles(variant, isActive) {
    if (variant === 'admin') {
        return isActive
            ? 'bg-white/10 text-white shadow-sm ring-1 ring-white/10'
            : 'text-slate-400 hover:bg-white/5 hover:text-white';
    }
    if (variant === 'seller') {
        return isActive
            ? 'bg-[#002E5D]/[0.07] text-[#002E5D] shadow-sm ring-1 ring-[#002E5D]/10'
            : 'text-slate-600 hover:bg-[#002E5D]/[0.04] hover:text-[#002E5D]';
    }
    if (variant === 'buyer') {
        return isActive
            ? 'bg-[#0056B3] text-white shadow-sm'
            : 'text-slate-600 hover:bg-blue-50 hover:text-[#002E5D]';
    }
    return isActive
        ? 'border-[#FFB300] bg-amber-50 text-[#002E5D]'
        : 'text-gray-600 hover:bg-gray-50';
}

function iconStyles(variant, isActive) {
    if (variant === 'admin') {
        return isActive ? 'bg-[#FFB300]/20 text-[#FFB300]' : 'bg-white/5 text-slate-500 group-hover:text-slate-200';
    }
    if (variant === 'seller') {
        return isActive ? 'bg-[#002E5D] text-[#FFB300]' : 'bg-slate-100 text-[#0056B3]/75 group-hover:bg-[#002E5D]/5';
    }
    if (variant === 'buyer') {
        return isActive ? 'bg-white/20 text-[#FFB300]' : 'bg-blue-50 text-[#0056B3]/70 group-hover:bg-blue-100';
    }
    return isActive ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500';
}

function NavLink({ item, currentPath, badges, onNavigate, variant, t }) {
    const { key, href, icon: Icon, badge } = item;
    const isActive = isNavActive(currentPath, href, variant);
    const count =
        badge === 'messages' ? badges.messages :
        badge === 'notifications' ? badges.notifications : 0;
    const isDark = variant === 'admin' || variant === 'seller';

    return (
        <Link
            href={href}
            onClick={onNavigate}
            className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-300 ${navStyles(variant, isActive)}`}
        >
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all duration-300 ${iconStyles(variant, isActive)}`}>
                <Icon size={17} strokeWidth={isActive ? 2.25 : 2} />
            </span>
            <span className="flex-1 truncate">{t(key)}</span>
            {count > 0 && (
                <span className={`text-[10px] font-bold min-w-5 h-5 px-1.5 flex items-center justify-center rounded-full ${
                    isActive && isDark ? 'bg-[#FFB300] text-[#002E5D]' : 'bg-red-500 text-white'
                }`}>
                    {count > 9 ? '9+' : count}
                </span>
            )}
        </Link>
    );
}

export default function DashboardShell({
    variant = 'seller',
    title,
    subtitle,
    children,
    navSections,
    profile,
    headerBadgeKey,
    headerHomeHref = '/',
    dashboardHref,
    profileHref,
    notificationsHref,
    viewSiteKey,
    signOutKey,
    badges = {},
    demoHref = null,
    demoLabelKey = null,
    brandVariant = 'default',
}) {
    const { t } = useTranslation();
    const page = usePage();
    const currentPath = (page.url ?? '').split('?')[0];
    const { auth, active_portal_label } = page.props;
    const [sidebarOpen, setSidebarOpen] = React.useState(false);

    const isAdmin = variant === 'admin';
    const isBuyer = variant === 'buyer';
    const isSeller = variant === 'seller';
    const isDarkSidebar = isAdmin;

    const homeHref = dashboardHref || (isAdmin ? '/admin/dashboard' : isBuyer ? '/buyer/orders' : '/seller/dashboard');
    const userProfileHref = profileHref || (isAdmin ? '/admin/dashboard' : isBuyer ? '/buyer/profile' : '/seller/profile');
    const notifHref = notificationsHref || (isBuyer ? '/buyer/notifications' : '/seller/notifications');
    const siteKey = viewSiteKey || (isAdmin ? 'layouts.admin.view_site' : isBuyer ? 'layouts.buyer.view_site' : 'layouts.seller.view_site');
    const logoutKey = signOutKey || (isAdmin ? 'layouts.admin.sign_out' : isBuyer ? 'layouts.buyer.sign_out' : 'layouts.seller.sign_out');

    const isRdc = brandVariant === 'rdc';

    useEffect(() => setSidebarOpen(false), [currentPath]);
    useEffect(() => {
        document.body.style.overflow = sidebarOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [sidebarOpen]);

    const closeSidebar = () => setSidebarOpen(false);

    const headerClass = isAdmin
        ? 'bg-[#001a33]/95 border-[#003366] backdrop-blur-md text-white'
        : isBuyer || isSeller
            ? 'bg-[#002E5D]/95 border-[#003366] backdrop-blur-md text-white'
            : 'bg-white/95 border-gray-200 backdrop-blur-md';

    const sidebarClass = isAdmin
        ? 'bg-[#001a33] border-[#003366]'
        : isSeller || isBuyer
            ? 'bg-white border-gray-200/80 shadow-[4px_0_24px_-12px_rgba(0,46,93,0.08)]'
            : 'bg-gray-50 border-gray-200';

    const pageBg = isAdmin
        ? 'bg-[#eef2f7]'
        : isSeller || isBuyer
            ? 'bg-[#f4f7fb]'
            : 'bg-gray-50';

    const SidebarContent = () => (
        <div className="flex h-full flex-col min-h-0">
            {/* Profil boutique */}
            <div className={`shrink-0 mb-5 ${isDarkSidebar ? 'px-1' : 'mx-1 rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden'}`}>
                {isDarkSidebar ? (
                    <div className="rounded-2xl bg-white/[0.06] ring-1 ring-white/10 p-4 backdrop-blur-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 ring-2 ring-[#FFB300]/40 shadow-lg bg-[#003366] flex items-center justify-center text-lg font-bold text-[#FFB300]">
                                {profile.avatar ? (
                                    <img src={profile.avatar} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    profile.initials
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="font-bold text-white truncate text-[15px] leading-tight">{profile.name}</p>
                                <p className="text-[11px] text-blue-200/60 truncate mt-0.5">{profile.subtitle}</p>
                                {profile.badge && (
                                    <span className={`inline-flex items-center gap-1 mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                        profile.badge.tone === 'success'
                                            ? 'bg-emerald-400/15 text-emerald-300 ring-1 ring-emerald-400/20'
                                            : profile.badge.tone === 'warning'
                                                ? 'bg-[#FFB300]/15 text-[#FFB300] ring-1 ring-[#FFB300]/25'
                                                : 'bg-white/10 text-blue-200'
                                    }`}>
                                        {profile.badge.icon}
                                        {profile.badge.label}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className={`h-12 ${
                            isSeller
                                ? 'bg-gradient-to-r from-[#002E5D] via-[#003366] to-[#0056B3]'
                                : 'bg-gradient-to-r from-[#002E5D] via-[#003366] to-[#0056B3]'
                        }`} />
                        <div className="px-4 pb-4 -mt-7">
                            <div className={`w-14 h-14 rounded-xl overflow-hidden shadow-md flex items-center justify-center text-lg font-bold ${
                                isSeller
                                    ? 'ring-4 ring-[#FFB300]/35 ring-offset-2 ring-offset-white bg-gradient-to-br from-[#002E5D] to-[#0056B3] text-[#FFB300]'
                                    : 'ring-4 ring-white bg-gradient-to-br from-[#002E5D] to-[#0056B3] text-[#FFB300]'
                            }`}>
                                {profile.avatar ? (
                                    <img src={profile.avatar} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    profile.initials
                                )}
                            </div>
                            <p className="font-bold text-[#002E5D] truncate mt-3 text-[15px]">{profile.name}</p>
                            <p className="text-xs text-gray-500 truncate mt-0.5">{profile.subtitle}</p>
                            {profile.badge && (
                                <span className={`inline-flex items-center gap-1 mt-2 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                    profile.badge.tone === 'success'
                                        ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100'
                                        : profile.badge.tone === 'warning'
                                            ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-100'
                                            : 'bg-slate-100 text-slate-600'
                                }`}>
                                    {profile.badge.icon}
                                    {profile.badge.label}
                                </span>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Navigation */}
            <nav className={`flex-1 overflow-y-auto dashboard-scrollbar space-y-5 pb-3 ${isDarkSidebar ? 'pr-0.5' : ''}`}>
                {navSections.map((section) => (
                    <div key={section.labelKey || section.label || 'main'}>
                        {(section.labelKey || section.label) && (
                            <p className={`px-2 mb-2 text-[10px] font-bold uppercase tracking-[0.14em] ${
                                isDarkSidebar ? 'text-[#FFB300]/55' : isSeller ? 'text-[#002E5D]/45' : 'text-gray-400'
                            }`}>
                                {section.labelKey ? t(section.labelKey) : section.label}
                            </p>
                        )}
                        <div className={`space-y-1 ${isDarkSidebar ? '' : 'px-1'}`}>
                            {section.items.map((item) => (
                                <NavLink
                                    key={item.href}
                                    item={item}
                                    currentPath={currentPath}
                                    badges={badges}
                                    onNavigate={closeSidebar}
                                    variant={variant}
                                    t={t}
                                />
                            ))}
                        </div>
                    </div>
                ))}

                {demoHref && demoLabelKey && (
                    <div className="pt-1">
                        <p className={`px-2 mb-2 text-[10px] font-bold uppercase tracking-[0.14em] ${
                            isDarkSidebar ? 'text-[#FFB300]/55' : 'text-gray-400'
                        }`}>
                            {t('layouts.demo.section')}
                        </p>
                        <Link
                            href={demoHref}
                            onClick={closeSidebar}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-300 ${
                                currentPath.startsWith(demoHref)
                                    ? navStyles(variant, true)
                                    : navStyles(variant, false)
                            }`}
                        >
                            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-black ${
                                isDarkSidebar ? 'bg-violet-400/15 text-violet-300' : 'bg-violet-50 text-violet-600'
                            }`}>β</span>
                            <span className="flex-1">{t(demoLabelKey)}</span>
                        </Link>
                    </div>
                )}
            </nav>

            {/* Déconnexion */}
            <div className={`shrink-0 pt-3 mt-auto border-t ${isDarkSidebar ? 'border-white/10' : 'border-gray-100'}`}>
                {isRdc && active_portal_label && (
                    <div className="mb-3 rounded-xl border border-[#007FFF]/15 bg-[#007FFF]/5 px-3 py-2.5">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#007FFF]/70">Groupe actif</p>
                        <p className="text-xs font-semibold text-[#002E5D] mt-0.5">{active_portal_label}</p>
                        <Link href="/logout" method="post" as="button" className="mt-1.5 text-[11px] font-medium text-[#007FFF] hover:underline">
                            Changer de groupe
                        </Link>
                    </div>
                )}
                <Link
                    href="/logout"
                    method="post"
                    as="button"
                    onClick={closeSidebar}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-300 ${
                        isDarkSidebar
                            ? 'text-red-300/90 hover:bg-red-500/10 hover:text-red-200'
                            : 'text-red-600 hover:bg-red-50'
                    }`}
                >
                    <LogOut size={17} className="shrink-0" />
                    {t(logoutKey)}
                </Link>
            </div>
        </div>
    );

    return (
        <div className={`flex h-dvh flex-col overflow-hidden ${pageBg}`}>
            <header className={`fixed inset-x-0 top-0 z-50 h-16 border-b flex items-center px-4 gap-3 transition-colors duration-300 ${headerClass}`}>
                <button
                    type="button"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className={`lg:hidden p-2 rounded-xl transition-colors duration-300 ${
                        isDarkSidebar || isBuyer || isSeller
                            ? 'text-blue-200 hover:text-white hover:bg-white/10'
                            : 'text-gray-500 hover:bg-gray-100'
                    }`}
                    aria-label={sidebarOpen ? t('layouts.common.close_menu') : t('layouts.common.open_menu')}
                >
                    {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
                </button>

                <div className="flex items-center gap-2.5 min-w-0">
                    {isRdc ? (
                        <RdcGovLogo href={homeHref} variant="compact" onDark className="max-w-[200px]" />
                    ) : (
                        <Logo href={homeHref} surface className="h-8 w-auto max-w-[140px]" />
                    )}
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider bg-[#FFB300] text-[#002E5D] shrink-0">
                        {t(headerBadgeKey)}
                    </span>
                </div>

                <div className="flex-1" />

                <div className="flex items-center gap-1 sm:gap-2">
                    <Link
                        href={headerHomeHref}
                        className="hidden sm:block text-sm px-3 py-1.5 rounded-lg text-blue-100 hover:text-white hover:bg-white/10 transition-colors duration-300"
                    >
                        {t(siteKey)}
                    </Link>

                    {!isAdmin && (
                        <Link href={notifHref} className="relative p-2 rounded-xl text-blue-100 hover:text-white hover:bg-white/10 transition-all duration-300">
                            <Bell size={20} />
                            {badges.notifications > 0 && (
                                <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-[#FFB300] text-[#002E5D] text-[10px] font-bold">
                                    {badges.notifications > 9 ? '9+' : badges.notifications}
                                </span>
                            )}
                        </Link>
                    )}

                    <Link href={userProfileHref} className="flex items-center gap-2 text-sm rounded-xl p-1 text-blue-100 hover:text-white transition-colors duration-300">
                        <span className="hidden sm:block font-medium truncate max-w-[120px]">{auth.user?.name}</span>
                        <div className="w-8 h-8 rounded-full bg-[#FFB300] text-[#002E5D] flex items-center justify-center font-bold text-sm shrink-0">
                            {auth.user?.name?.charAt(0)?.toUpperCase()}
                        </div>
                    </Link>
                </div>
            </header>

            {sidebarOpen && (
                <div className="fixed inset-0 z-40 bg-[#001a33]/60 backdrop-blur-sm lg:hidden" onClick={closeSidebar} aria-hidden="true" />
            )}

            {/* Sidebar mobile */}
            <aside className={`
                fixed top-16 left-0 bottom-0 z-40 w-[18.5rem] p-4 border-r
                transform transition-transform duration-300 ease-out lg:hidden
                ${sidebarClass}
                ${isDarkSidebar ? 'sidebar-dark' : ''}
                ${sidebarOpen ? `translate-x-0 ${isDarkSidebar ? 'shadow-2xl shadow-black/30' : 'shadow-xl shadow-[#002E5D]/10'}` : '-translate-x-full'}
            `}>
                <SidebarContent />
            </aside>

            {/* Sidebar desktop — fixe */}
            <aside className={`
                fixed top-16 left-0 bottom-0 z-30 hidden w-[18.5rem] p-4 border-r lg:flex lg:flex-col
                ${sidebarClass}
                ${isDarkSidebar ? 'sidebar-dark' : ''}
            `}>
                <SidebarContent />
            </aside>

            <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain pt-16 lg:ml-[18.5rem]">
                <div className="mx-auto max-w-[1600px] p-4 sm:p-6 lg:p-8">
                    {(title || subtitle) && (
                        <header className="mb-6 sm:mb-8 dashboard-page-enter">
                            {subtitle && (
                                <p className="text-xs font-semibold uppercase tracking-wider text-[#0056B3] mb-1">{subtitle}</p>
                            )}
                            {title && (
                                <h1 className="text-2xl sm:text-3xl font-bold text-[#002E5D] tracking-tight">{title}</h1>
                            )}
                            <div className="mt-4 h-px bg-gradient-to-r from-[#003366]/20 via-[#FFB300]/30 to-transparent" />
                        </header>
                    )}
                    <div key={currentPath} className="dashboard-page-enter">{children}</div>
                </div>
            </main>
        </div>
    );
}
