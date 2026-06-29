import React, { useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Bell, ExternalLink, LogOut, Menu, Shield, X } from 'lucide-react';
import Logo from '@/Components/Brand/Logo';
import RdcGovLogo from '@/Components/Brand/RdcGovLogo';
import useTranslation from '@/hooks/useTranslation';

function isNavActive(currentPath, href) {
    if (href === '/admin/dashboard' || href === '/government/dashboard') return currentPath === href;
    return currentPath === href || currentPath.startsWith(`${href}/`);
}

function AdminNavLink({ item, currentPath, onNavigate, t }) {
    const { key, href, icon: Icon } = item;
    const isActive = isNavActive(currentPath, href);

    return (
        <Link
            href={href}
            onClick={onNavigate}
            className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-300 ${
                isActive
                    ? 'bg-[#002E5D]/[0.07] text-[#002E5D] shadow-sm ring-1 ring-[#002E5D]/10'
                    : 'text-slate-600 hover:bg-[#002E5D]/[0.04] hover:text-[#002E5D]'
            }`}
        >
            {isActive && (
                <span className="absolute left-0 top-1/2 h-7 w-[3px] -translate-y-1/2 rounded-r-full bg-[#FFB300] shadow-[0_0_8px_rgba(255,179,0,0.45)]" />
            )}
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all duration-300 ${
                isActive
                    ? 'bg-[#002E5D] text-[#FFB300]'
                    : 'bg-slate-100 text-[#0056B3]/75 group-hover:bg-[#002E5D]/5'
            }`}>
                <Icon size={17} strokeWidth={isActive ? 2.25 : 2} />
            </span>
            <span className="flex-1 truncate">{t(key)}</span>
        </Link>
    );
}

export default function AdminShell({
    title,
    subtitle,
    children,
    navSections,
    profile,
    logoHref = '/admin/dashboard',
    brandVariant = 'default',
    consoleLabelKey = 'layouts.admin.console_label',
    consoleSubtitle = null,
}) {
    const { t } = useTranslation();
    const page = usePage();
    const currentPath = (page.url ?? '').split('?')[0];
    const { auth, active_portal_label } = page.props;
    const [sidebarOpen, setSidebarOpen] = React.useState(false);

    useEffect(() => setSidebarOpen(false), [currentPath]);
    useEffect(() => {
        document.body.style.overflow = sidebarOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [sidebarOpen]);

    const closeSidebar = () => setSidebarOpen(false);
    const isSuperAdmin = auth?.user?.role === 'super_admin';

    const isRdc = brandVariant === 'rdc';

    const SidebarContent = () => (
        <div className="flex h-full flex-col min-h-0">
            {/* Profil — carte blanche style vendeur */}
            <div className="mx-1 mb-5 shrink-0 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                <div className="h-12 bg-gradient-to-r from-[#002E5D] via-[#003366] to-[#0056B3]" />
                <div className="px-4 pb-4 -mt-7">
                    <div className="relative inline-block">
                        <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[#002E5D] to-[#0056B3] text-lg font-bold text-[#FFB300] shadow-md ring-4 ring-[#FFB300]/30 ring-offset-2 ring-offset-white">
                            {profile.avatar ? (
                                <img src={profile.avatar} alt="" className="h-full w-full object-cover" />
                            ) : (
                                profile.initials
                            )}
                        </div>
                        <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#FFB300] text-[#002E5D] ring-2 ring-white">
                            <Shield size={10} strokeWidth={2.5} />
                        </span>
                    </div>
                    <p className="mt-3 truncate text-[15px] font-bold text-[#002E5D]">{profile.name}</p>
                    <p className="mt-0.5 truncate text-xs text-gray-500">{profile.subtitle}</p>
                    {profile.badge && (
                        <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-[#FFB300]/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#B8860B] ring-1 ring-[#FFB300]/25">
                            {profile.badge.label}
                        </span>
                    )}
                </div>
            </div>

            <nav className="admin-sidebar-nav flex-1 space-y-5 overflow-y-auto pb-3 pr-0.5">
                {navSections.map((section) => (
                    <div key={section.labelKey || section.label || 'main'}>
                        {(section.labelKey || section.label) && (
                            <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#002E5D]/40">
                                {section.labelKey ? t(section.labelKey) : section.label}
                            </p>
                        )}
                        <div className="space-y-0.5 px-1">
                            {section.items.map((item) => (
                                <AdminNavLink
                                    key={item.href}
                                    item={item}
                                    currentPath={currentPath}
                                    onNavigate={closeSidebar}
                                    t={t}
                                />
                            ))}
                        </div>
                    </div>
                ))}

            </nav>

            <div className="mt-auto shrink-0 border-t border-gray-100 pt-3">
                {isRdc && active_portal_label && (
                    <div className="mb-3 rounded-xl border border-[#007FFF]/15 bg-[#007FFF]/5 px-3 py-2.5">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#007FFF]/70">Groupe actif</p>
                        <p className="text-xs font-semibold text-[#002E5D] mt-0.5">{active_portal_label}</p>
                        <Link href="/logout" method="post" as="button" className="mt-1.5 text-[11px] font-medium text-[#007FFF] hover:underline">
                            Changer de groupe
                        </Link>
                    </div>
                )}
                <div className="mb-3 hidden rounded-xl bg-slate-50 px-3 py-2 lg:block">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[#0056B3]/70">
                        {t('layouts.admin.console_label')}
                    </p>
                    <p className="mt-0.5 text-[11px] text-gray-400">PenePene · v1.0</p>
                </div>
                <Link
                    href="/logout"
                    method="post"
                    as="button"
                    onClick={closeSidebar}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium text-red-600 transition-all duration-300 hover:bg-red-50"
                >
                    <LogOut size={17} className="shrink-0" />
                    {t('layouts.admin.sign_out')}
                </Link>
            </div>
        </div>
    );

    return (
        <div className={`admin-shell flex h-dvh flex-col overflow-hidden ${isRdc ? 'bg-[#eef4fb]' : 'bg-[#f0f4fa]'}`}>
            <header className={`admin-header fixed inset-x-0 top-0 z-50 flex h-16 items-center gap-3 border-b px-4 ${isRdc ? 'rdc-admin-header border-[#007FFF]/20' : 'border-[#FFB300]/15'}`}>
                <button
                    type="button"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="rounded-xl p-2 text-blue-200 transition-colors hover:bg-white/10 hover:text-white lg:hidden"
                    aria-label={sidebarOpen ? t('layouts.common.close_menu') : t('layouts.common.open_menu')}
                >
                    {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
                </button>

                <div className="flex min-w-0 items-center gap-3">
                    {isRdc ? (
                        <RdcGovLogo href={logoHref} variant="compact" onDark className="max-w-[220px]" />
                    ) : (
                        <Logo href={logoHref} surface className="h-8 w-auto max-w-[130px]" />
                    )}
                    <div className="hidden h-5 w-px bg-white/15 sm:block" />
                    <div className="hidden min-w-0 sm:block">
                        <p className={`truncate text-[10px] font-bold uppercase tracking-[0.14em] ${isRdc ? 'text-[#F7D618]' : 'text-[#FFB300]/80'}`}>
                            {t(consoleLabelKey)}
                        </p>
                        <p className="truncate text-xs text-blue-100/60">
                            {consoleSubtitle ?? (isSuperAdmin ? t('layouts.admin.role_super_admin') : t('layouts.admin.role_admin'))}
                        </p>
                    </div>
                </div>

                <div className="flex-1" />

                <div className="flex items-center gap-1 sm:gap-2">
                    <Link
                        href="/"
                        className="hidden items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-blue-100 transition-colors hover:bg-white/10 hover:text-white sm:inline-flex"
                    >
                        <ExternalLink size={14} />
                        {t('layouts.admin.view_site')}
                    </Link>

                    <button type="button" className="relative rounded-xl p-2 text-blue-100 transition hover:bg-white/10 hover:text-white" aria-label="Notifications">
                        <Bell size={20} />
                        <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#FFB300] text-[9px] font-bold text-[#002E5D]">3</span>
                    </button>

                    <div className="flex items-center gap-2 rounded-xl p-1 pl-2">
                        <span className="hidden max-w-[120px] truncate text-sm font-medium text-blue-100 sm:block">
                            {auth.user?.name}
                        </span>
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#FFB300] to-[#F9A825] text-sm font-bold text-[#002E5D] ring-2 ring-[#FFB300]/30">
                            {auth.user?.name?.charAt(0)?.toUpperCase()}
                        </div>
                    </div>
                </div>
            </header>

            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-[#001428]/50 backdrop-blur-sm lg:hidden"
                    onClick={closeSidebar}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar mobile (drawer) */}
            <aside
                className={`
                    admin-sidebar-light fixed bottom-0 left-0 top-16 z-40 flex w-[17.5rem] flex-col border-r border-gray-200/80 bg-white p-4
                    shadow-xl shadow-[#002E5D]/10 transition-transform duration-300 ease-out lg:hidden
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                `}
            >
                <SidebarContent />
            </aside>

            {/* Sidebar desktop — fixe, ne défile pas avec la page */}
            <aside className="admin-sidebar-light fixed bottom-0 left-0 top-16 z-30 hidden w-[17.5rem] flex-col border-r border-gray-200/80 bg-white p-4 shadow-[4px_0_24px_-12px_rgba(0,46,93,0.08)] lg:flex">
                <SidebarContent />
            </aside>

            {/* Contenu — seule zone scrollable */}
            <main className="admin-main min-h-0 flex-1 overflow-y-auto overscroll-contain pt-16 lg:ml-[17.5rem]">
                <div className="mx-auto max-w-[1600px] p-4 sm:p-6 lg:p-8">
                    {(title || subtitle) && (
                        <header className="admin-page-header mb-6 sm:mb-8">
                            {subtitle && (
                                <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#FFB300]">
                                    {subtitle}
                                </p>
                            )}
                            {title && (
                                <h1 className="text-2xl font-bold tracking-tight text-[#002E5D] sm:text-3xl">
                                    {title}
                                </h1>
                            )}
                            <div className="admin-page-header-accent mt-4" />
                        </header>
                    )}
                    <div key={currentPath} className="admin-page-enter space-y-6">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
