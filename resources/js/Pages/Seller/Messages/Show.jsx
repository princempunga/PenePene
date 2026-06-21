import React from 'react';
import { Head, usePage } from '@inertiajs/react';
import SellerLayout from '@/Layouts/SellerLayout';
import ConversationList from '@/Components/Chat/ConversationList';
import ChatWindow from '@/Components/Chat/ChatWindow';

export default function MessageShow({ conversations, conversation, otherUser }) {
    const { auth } = usePage().props;

    const chatPartner = otherUser || conversation.buyer;

    return (
        <SellerLayout>
            <Head title={`Chat with ${chatPartner?.name}`} />

            <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-12rem)] min-h-[500px]">
                <div className="hidden lg:block w-80 shrink-0 h-full rounded-xl border border-gray-200 overflow-hidden">
                    <ConversationList
                        conversations={conversations}
                        currentConversationId={conversation.id}
                        userType="seller"
                    />
                </div>

                <div className="flex-1 min-w-0 rounded-xl border border-gray-200 overflow-hidden">
                    <ChatWindow
                        conversationId={conversation.id}
                        currentUserId={auth.user?.id}
                        otherUser={chatPartner}
                        isSeller={true}
                        conversationStatus={conversation.status}
                    />
                </div>
            </div>
        </SellerLayout>
    );
}
