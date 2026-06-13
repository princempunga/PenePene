import React from 'react';
import { Link } from '@inertiajs/react';
import OnlineStatusBadge from './OnlineStatusBadge';
import { User, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import useTranslation from '@/hooks/useTranslation';

export default function ConversationList({ conversations, currentConversationId, userType }) {
    const { t } = useTranslation();

    if (!conversations || conversations.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 p-6 text-center">
                <MessageSquare className="w-12 h-12 mb-4 opacity-50" />
                <p>{t('chat.no_conversations_yet')}</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white border-r border-gray-200 w-full md:w-80 lg:w-96 shrink-0 overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">{t('buyer.messages')}</h2>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {conversations.map((conv) => {
                    const otherUser = userType === 'buyer' ? conv.seller.user : conv.buyer;
                    const businessName = userType === 'buyer' ? conv.seller.business_name : otherUser.name;
                    const avatar = userType === 'buyer' ? conv.seller.logo : otherUser.avatar;
                    const isActive = currentConversationId === conv.id;
                    const latestMessage = conv.latest_message;

                    return (
                        <Link
                            key={conv.id}
                            href={`/chat/conversations/${conv.id}`}
                            className={`flex items-center gap-3 p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                                isActive ? 'bg-blue-50/50 border-l-4 border-l-blue-600' : 'border-l-4 border-l-transparent'
                            }`}
                            preserveState
                        >
                            <div className="relative">
                                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center shrink-0 overflow-hidden">
                                    {avatar ? (
                                        <img src={`/storage/${avatar}`} alt={businessName} className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-6 h-6 text-gray-400" />
                                    )}
                                </div>
                                {otherUser.is_online && (
                                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                                )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <h4 className="font-semibold text-gray-900 truncate pr-2">{businessName}</h4>
                                    {conv.last_message_at && (
                                        <span className="text-[10px] text-gray-500 shrink-0">
                                            {formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: true })}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-gray-500 truncate pr-2">
                                        {latestMessage ? (
                                            latestMessage.is_deleted ? <span className="italic">{t('chat.message_deleted')}</span> :
                                            latestMessage.message_type !== 'text' ? t('chat.sent_attachment') :
                                            latestMessage.body
                                        ) : t('chat.start_conversation')}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
