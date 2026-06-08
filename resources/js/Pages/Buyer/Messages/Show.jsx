import React from 'react';
import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import ConversationList from '@/Components/Chat/ConversationList';
import ChatWindow from '@/Components/Chat/ChatWindow';

export default function MessageShow({ conversations, conversation }) {
    const { auth } = usePage().props;

    return (
        <AppLayout>
            <Head title={`Chat with ${conversation.seller?.business_name}`} />
            
            <div className="max-w-7xl mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Messages</h1>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex h-[70vh] min-h-[500px]">
                    {/* Conversation List Sidebar (hidden on mobile when a chat is open) */}
                    <div className="hidden md:block w-80 lg:w-96 border-r border-gray-200 shrink-0 h-full">
                    <ConversationList 
                        conversations={conversations} 
                        currentConversationId={conversation.id} 
                        userType="buyer" 
                    />
                </div>

                {/* Chat Window */}
                <div className="flex-1 flex flex-col h-full bg-gray-50">
                    <ChatWindow 
                        conversationId={conversation.id}
                        currentUserId={auth.user?.id}
                        otherUser={conversation.seller.user}
                    />
                </div>
                </div>
            </div>
        </AppLayout>
    );
}
