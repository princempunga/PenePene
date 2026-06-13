import React from 'react';
import { Clock } from 'lucide-react';
import useTranslation from '@/hooks/useTranslation';

export default function OnlineStatusBadge({ isOnline, lastSeenText, className = '' }) {
    const { t } = useTranslation();
    const isCurrentlyOnline = isOnline || lastSeenText === t('chat_ext.online_now') || lastSeenText === 'Online now';

    return (
        <div className={`flex items-center gap-1.5 ${className}`}>
            <span className="relative flex h-2.5 w-2.5">
                {isCurrentlyOnline && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                )}
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isCurrentlyOnline ? 'bg-green-500' : 'bg-gray-400'}`}></span>
            </span>
            <span className={`text-xs font-medium ${isCurrentlyOnline ? 'text-green-600' : 'text-gray-500'}`}>
                {isCurrentlyOnline ? t('chat_ext.online_now') : (lastSeenText || t('chat.offline'))}
            </span>
        </div>
    );
}
