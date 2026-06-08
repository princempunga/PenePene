import React from 'react';
import { Clock } from 'lucide-react';

export default function OnlineStatusBadge({ isOnline, lastSeenText, className = '' }) {
    // Determine if we should show the "Online now" status based on exact text or boolean
    const isCurrentlyOnline = isOnline && lastSeenText === 'Online now';

    return (
        <div className={`flex items-center gap-1.5 ${className}`}>
            <span className="relative flex h-2.5 w-2.5">
                {isCurrentlyOnline && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                )}
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isCurrentlyOnline ? 'bg-green-500' : 'bg-gray-400'}`}></span>
            </span>
            <span className={`text-xs font-medium ${isCurrentlyOnline ? 'text-green-600' : 'text-gray-500'}`}>
                {lastSeenText || (isCurrentlyOnline ? 'Online now' : 'Offline')}
            </span>
        </div>
    );
}
