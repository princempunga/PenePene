import React from 'react';
import { Head } from '@inertiajs/react';
import BuyerLayout from '@/Layouts/BuyerLayout';
import ConversationList from '@/Components/Chat/ConversationList';
import { MessageSquare } from 'lucide-react';

export default function MessagesIndex({ conversations }) {
    return (
        <>
            <Head title="Messages" />
            <BuyerLayout
                title="Messages"
                subtitle="Chat with sellers about products, orders, and delivery."
            >
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col md:flex-row min-h-[480px] sm:min-h-[560px]">
                    <div className="w-full md:w-80 lg:w-96 border-b md:border-b-0 md:border-r border-gray-200 shrink-0 md:h-auto min-h-[280px] md:min-h-0">
                        <ConversationList
                            conversations={conversations}
                            currentConversationId={null}
                            userType="buyer"
                        />
                    </div>

                    <div className="hidden md:flex flex-1 items-center justify-center bg-gradient-to-br from-gray-50 to-primary-50/30 flex-col text-gray-500 p-8">
                        <div className="w-20 h-20 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mb-5">
                            <MessageSquare className="w-10 h-10 text-primary-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Your Messages</h3>
                        <p className="text-center max-w-md text-sm leading-relaxed">
                            Select a conversation to view your message history, or start a new chat from any seller store page.
                        </p>
                    </div>
                </div>
            </BuyerLayout>
        </>
    );
}
