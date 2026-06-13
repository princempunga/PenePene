import React from 'react';
import { Head, usePage } from '@inertiajs/react';
import BuyerLayout from '@/Layouts/BuyerLayout';
import ConversationList from '@/Components/Chat/ConversationList';
import ChatWindow from '@/Components/Chat/ChatWindow';

export default function MessageShow({ conversations, conversation, otherUser }) {
    const { auth } = usePage().props;

    const chatPartner = otherUser || {
        ...conversation.seller?.user,
        business_name: conversation.seller?.business_name,
        logo: conversation.seller?.logo,
    };

    return (
        <>
            <Head title={`Chat with ${conversation.seller?.business_name}`} />
            <BuyerLayout
                title="Messages"
                subtitle={`Conversation with ${conversation.seller?.business_name || 'seller'}`}
            >
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col md:flex-row min-h-[480px] sm:min-h-[560px]">
                    <div className="hidden md:block w-80 lg:w-96 border-r border-gray-200 shrink-0">
                        <ConversationList
                            conversations={conversations}
                            currentConversationId={conversation.id}
                            userType="buyer"
                        />
                    </div>

                    <div className="flex-1 min-w-0 min-h-[420px] md:min-h-0">
                        <ChatWindow
                            conversationId={conversation.id}
                            currentUserId={auth.user?.id}
                            otherUser={chatPartner}
                        />
                    </div>
                </div>
            </BuyerLayout>
        </>
    );
}
