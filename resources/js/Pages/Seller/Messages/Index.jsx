import React from 'react';
import { Head } from '@inertiajs/react';
import SellerLayout from '@/Layouts/SellerLayout';
import ConversationList from '@/Components/Chat/ConversationList';
import { MessageSquare } from 'lucide-react';

export default function MessagesIndex({ conversations }) {
    return (
        <SellerLayout>
            <Head title="Customer Messages" />

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex h-[calc(100vh-14rem)] min-h-[500px]">
                <div className="w-full md:w-80 lg:w-96 border-r border-gray-200 shrink-0 h-full">
                    <ConversationList
                        conversations={conversations}
                        currentConversationId={null}
                        userType="seller"
                    />
                </div>

                <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50 flex-col text-gray-500">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <MessageSquare className="w-10 h-10 text-gray-300" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Customer Messages</h3>
                    <p className="text-center max-w-md px-4">
                        Select a conversation to chat with your customers.
                    </p>
                </div>
            </div>
        </SellerLayout>
    );
}
