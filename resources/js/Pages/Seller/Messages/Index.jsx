import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import SellerLayout from '@/Layouts/SellerLayout';
import { MessageCircle, Search, X } from 'lucide-react';

export default function MessagesIndex({ conversations, filters }) {
    const [search, setSearch] = useState(filters?.search ?? '');

    const totalUnread = conversations.reduce((sum, c) => sum + (c.unread_count || 0), 0);

    const formatTime = (dateStr) => {
        const d = new Date(dateStr);
        const now = new Date();
        const diffDays = Math.floor((now - d) / 86400000);
        if (diffDays === 0) return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        if (diffDays === 1) return 'Hier';
        if (diffDays < 7) return d.toLocaleDateString('fr-FR', { weekday: 'short' });
        return d.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/seller/messages', { search: search || undefined }, { preserveState: true, replace: true });
    };

    const clearSearch = () => {
        setSearch('');
        router.get('/seller/messages', {}, { preserveState: true, replace: true });
    };

    return (
        <>
            <Head title="Messages clients" />
            <SellerLayout title="Messages clients">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <p className="text-gray-500 text-sm">
                        {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
                        {totalUnread > 0 && (
                            <span className="ml-2 inline-flex items-center gap-1 text-amber-700 font-medium">
                                <span className="w-2 h-2 bg-amber-500 rounded-full" />
                                {totalUnread} non lu{totalUnread !== 1 ? 's' : ''}
                            </span>
                        )}
                    </p>

                    <form onSubmit={handleSearch} className="relative w-full sm:w-72">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Rechercher des clients ou des messages..."
                            className="w-full pl-9 pr-9 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none shadow-sm"
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={clearSearch}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </form>
                </div>

                {conversations.length > 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="divide-y divide-gray-100">
                            {conversations.map(conv => {
                                const lastMsg = conv.messages?.[0];
                                const hasUnread = conv.unread_count > 0;
                                return (
                                    <Link
                                        key={conv.id}
                                        href={`/seller/messages/${conv.id}`}
                                        className={`flex items-center gap-4 p-5 transition-colors ${
                                            hasUnread ? 'bg-amber-50/50 hover:bg-amber-50' : 'hover:bg-gray-50'
                                        }`}
                                    >
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold shrink-0 ${
                                            hasUnread ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'
                                        }`}>
                                            {conv.buyer?.name?.charAt(0)?.toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1 gap-2">
                                                <span className={`truncate ${hasUnread ? 'font-bold text-gray-900' : 'font-semibold text-gray-900'}`}>
                                                    {conv.buyer?.name}
                                                </span>
                                                <span className="text-xs text-gray-400 shrink-0">
                                                    {lastMsg ? formatTime(lastMsg.created_at) : ''}
                                                </span>
                                            </div>
                                            <p className={`text-sm truncate ${hasUnread ? 'text-gray-700 font-medium' : 'text-gray-500'}`}>
                                                {lastMsg?.body || 'Aucun message pour le moment'}
                                            </p>
                                        </div>
                                        {hasUnread && (
                                            <span className="bg-amber-500 text-white text-xs font-bold min-w-5 h-5 px-1.5 flex items-center justify-center rounded-full shrink-0">
                                                {conv.unread_count > 9 ? '9+' : conv.unread_count}
                                            </span>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-gray-200 p-16 text-center shadow-sm">
                        <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <MessageCircle size={32} className="text-amber-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {filters?.search ? 'Aucun résultat' : 'Aucun message pour le moment'}
                        </h3>
                        <p className="text-gray-500 max-w-sm mx-auto">
                            {filters?.search
                                ? 'Essayez un autre terme de recherche ou effacez le filtre.'
                                : 'Lorsque des clients vous contactent, leurs messages apparaîtront ici.'}
                        </p>
                        {filters?.search && (
                            <button
                                onClick={clearSearch}
                                className="mt-4 text-sm text-amber-600 hover:text-amber-700 font-medium"
                            >
                                Effacer la recherche
                            </button>
                        )}
                    </div>
                )}
            </SellerLayout>
        </>
    );
}
