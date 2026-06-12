import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import ConversationList from '@/Components/Chat/ConversationList';
import { MessageSquare } from 'lucide-react';

export default function MessagesIndex({ conversations }) {
    return (
        <AppLayout>
            <Head title="Messages" />
            
            <div className="max-w-7xl mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Messages</h1>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex h-[70vh] min-h-[500px]">
                    <div className="w-full md:w-80 lg:w-96 border-r border-gray-200 shrink-0 h-full">
                    <ConversationList 
                        conversations={conversations} 
                        currentConversationId={null} 
                        userType="buyer" 
                    />
                </div>
                
                <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50 flex-col text-gray-500">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <MessageSquare className="w-10 h-10 text-gray-300" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Your Messages</h3>
                    <p className="text-center max-w-md">Select a conversation from the sidebar to view your message history or start a new chat with a seller from their store page.</p>
                </div>
                </div>
            </div>
        </AppLayout>
    );
}
