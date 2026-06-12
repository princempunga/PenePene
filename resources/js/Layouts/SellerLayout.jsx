import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard, Package, ShoppingCart, MessageCircle, Bell,
    Star, User, LogOut, ChevronRight, Store, CreditCard, FileDown,
    Wallet, FileText, Settings, Menu, X,
} from 'lucide-react';

const navItems = [
    { label: 'Tableau de bord',       href: '/seller/dashboard',        icon: LayoutDashboard, badge: null },
    { label: 'Produits',              href: '/seller/products',         icon: Package,         badge: null },
    { label: 'Commandes',             href: '/seller/orders',           icon: ShoppingCart,    badge: null },
    { label: 'Messages',              href: '/seller/messages',         icon: MessageCircle,   badge: 'messages' },
    { label: 'Notifications',         href: '/seller/notifications',    icon: Bell,            badge: 'notifications' },
    { label: 'Avis',                  href: '/seller/reviews',          icon: Star,            badge: null },
    { label: 'Paiements',             href: '/seller/payouts',          icon: Wallet,          badge: null },
    { label: 'Documents',             href: '/seller/documents',        icon: FileText,        badge: null },
    { label: 'Rapports',              href: '/seller/reports',          icon: FileDown,        badge: null },
    { label: 'Paramètres de la boutique', href: '/seller/store/settings', icon: Settings,    badge: null },
    { label: 'Profil',                href: '/seller/profile',          icon: User,            badge: null },
    { label: 'Abonnements',           href: '/seller/subscriptions',    icon: CreditCard,      badge: null },
];

const sellerStatusLabels = {
    verified:  'Vérifié',
    pending:   'En attente',
    rejected:  'Rejeté',
    suspended: 'Suspendu',
};

function isNavActive(currentPath, href) {
    if (href === '/seller/dashboard') {
        return currentPath === '/seller/dashboard';
    }
    return currentPath === href || currentPath.startsWith(`${href}/`);
}

function NavLink({ item, currentPath, badges, onNavigate }) {
    const { label, href, icon: Icon, badge } = item;
    const isActive = isNavActive(currentPath, href);
    const count = badge === 'messages' ? badges.messages : badge === 'notifications' ? badges.notifications : 0;

    return (
        <Link
            href={href}
            onClick={onNavigate}
            className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors border-l-2 ${
                isActive
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
        >
            <Icon size={18} className="shrink-0" />
            <span className="flex-1">{label}</span>
            {count > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold min-w-5 h-5 px-1 flex items-center justify-center rounded-full">
                    {count > 9 ? '9+' : count}
                </span>
            )}
            {isActive && <ChevronRight size={14} className="text-primary-500 shrink-0" />}
        </Link>
    );
}

export default function SellerLayout({ children, title }) {
    const page = usePage();
    const currentPath = (page.url ?? '').split('?')[0];
    const { auth, seller, unread_notifications, unread_messages } = page.props;
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const badges = {
        messages: typeof unread_messages === 'number' ? unread_messages : 0,
        notifications: unread_notifications ?? 0,
    };

    const closeSidebar = () => setSidebarOpen(false);

    const SidebarContent = () => (
        <>
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm mb-4">
                <div className="flex items-center gap-3 mb-3">
                    {seller?.logo ? (
                        <img
                            src={`/storage/${seller.logo}`}
                            alt={seller.business_name}
                            className="w-14 h-14 rounded-full object-cover border border-gray-200 shrink-0"
                        />
                    ) : auth.user?.avatar ? (
                        <img
                            src={`/storage/${auth.user.avatar}`}
                            alt=""
                            className="w-14 h-14 rounded-full object-cover shrink-0"
                        />
                    ) : (
                        <div className="w-14 h-14 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold text-2xl shrink-0">
                            {seller?.business_name?.charAt(0)?.toUpperCase() || auth.user?.name?.charAt(0)?.toUpperCase()}
                        </div>
                    )}
                    <div className="min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{seller?.business_name || 'Portail vendeur'}</p>
                        <p className="text-xs text-gray-500 truncate">{auth.user?.email}</p>
                    </div>
                </div>
                {seller?.status && (
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
                        seller.status === 'verified' ? 'bg-green-100 text-green-700' :
                        seller.status === 'pending'  ? 'bg-amber-100 text-amber-700' :
                        'bg-gray-100 text-gray-600'
                    }`}>
                        <Store size={12} />
                        {sellerStatusLabels[seller.status] || seller.status}
                    </span>
                )}
            </div>

            <nav className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                {navItems.map((item) => (
                    <NavLink
                        key={item.href}
                        item={item}
                        currentPath={currentPath}
                        badges={badges}
                        onNavigate={closeSidebar}
                    />
                ))}

                <Link
                    href="/logout"
                    method="post"
                    as="button"
                    onClick={closeSidebar}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 border-l-2 border-transparent transition-colors"
                >
                    <LogOut size={18} className="shrink-0" />
                    Déconnexion
                </Link>
            </nav>
        </>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white border-b border-gray-200 shadow-sm flex items-center px-4 gap-4">
                <button
                    type="button"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="lg:hidden p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label={sidebarOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
                >
                    {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
                </button>

                <Link href="/seller/dashboard" className="text-xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                    PenePene
                    <span className="text-xs font-semibold bg-primary-600 text-white px-2 py-0.5 rounded-md">Vendeur</span>
                </Link>

                <div className="flex-1" />

                <div className="flex items-center gap-2 sm:gap-3">
                    <Link href="/" className="hidden sm:block text-sm text-gray-500 hover:text-primary-600 transition-colors">
                        Voir le site
                    </Link>
                    <Link
                        href="/seller/notifications"
                        className="relative p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        aria-label="Notifications"
                    >
                        <Bell size={20} />
                        {badges.notifications > 0 && (
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                        )}
                    </Link>
                    <Link
                        href="/seller/profile"
                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 rounded-lg p-1"
                    >
                        <span className="hidden sm:block font-medium truncate max-w-[120px]">{auth.user?.name}</span>
                        <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm shrink-0">
                            {auth.user?.name?.charAt(0)?.toUpperCase()}
                        </div>
                    </Link>
                </div>
            </header>

            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={closeSidebar}
                    aria-hidden="true"
                />
            )}

            <div className="flex pt-16 min-h-screen">
                <aside className={`
                    fixed top-16 left-0 bottom-0 z-40 w-72 overflow-y-auto p-4 bg-gray-50 border-r border-gray-200
                    transform transition-transform duration-300 ease-in-out
                    lg:translate-x-0 lg:static lg:z-auto
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                `}>
                    <SidebarContent />
                </aside>

                <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 max-w-7xl">
                    {title && (
                        <h1 className="text-2xl font-bold text-gray-900 mb-6">{title}</h1>
                    )}
                    {children}
                </main>
            </div>
        </div>
    );
}
