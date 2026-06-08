import React from 'react';
import { Head, usePage } from '@inertiajs/react';
import SellerLayout from '@/Layouts/SellerLayout';
import ConversationList from '@/Components/Chat/ConversationList';
import ChatWindow from '@/Components/Chat/ChatWindow';

export default function MessageShow({ conversations, conversation }) {
    const { auth } = usePage().props;

    return (
        <SellerLayout title={`Chat with ${conversation.buyer?.user?.name}`}>
            <Head title={`Chat with ${conversation.buyer?.user?.name}`} />
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex h-[70vh] min-h-[500px]">
                {/* Conversation List Sidebar (hidden on mobile when a chat is open) */}
                <div className="hidden md:block w-80 lg:w-96 border-r border-gray-200 shrink-0 h-full">
                    <ConversationList 
                        conversations={conversations} 
                        currentConversationId={conversation.id} 
                        userType="seller" 
                    />
                </div>

                {/* Chat Window */}
                <div className="flex-1 flex flex-col h-full bg-gray-50">
                    <ChatWindow 
                        conversationId={conversation.id}
                        currentUserId={auth.user?.id}
                        otherUser={conversation.buyer.user}
                    />
                </div>
            </div>
        </SellerLayout>
    );
}
