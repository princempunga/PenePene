import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import OnlineStatusBadge from './OnlineStatusBadge';
import { X, User, ArrowLeft } from 'lucide-react';

export default function ChatWindow({ conversationId, currentUserId, otherUser, onClose, isModal = false }) {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [editingMessage, setEditingMessage] = useState(null);
    const messagesEndRef = useRef(null);
    const pollingIntervalRef = useRef(null);

    const fetchMessages = async () => {
        try {
            const res = await axios.get(`/chat/conversations/${conversationId}`);
            setMessages(res.data.messages);
        } catch (error) {
            console.error("Failed to fetch messages", error);
        } finally {
            setLoading(false);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        fetchMessages();
        // Polling every 3 seconds
        pollingIntervalRef.current = setInterval(fetchMessages, 3000);

        return () => {
            if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
        };
    }, [conversationId]);

    useEffect(() => {
        if (!loading) {
            scrollToBottom();
        }
    }, [messages.length, loading]);

    const handleSendMessage = async ({ body, attachment }) => {
        setSending(true);

        if (editingMessage) {
            // Handle Edit
            try {
                const res = await axios.patch(`/chat/messages/${editingMessage.id}`, { body });
                setMessages(messages.map(m => m.id === res.data.message.id ? res.data.message : m));
                setEditingMessage(null);
            } catch (err) {
                alert("Failed to edit message.");
            }
        } else {
            // Handle Send
            try {
                const formData = new FormData();
                if (body) formData.append('body', body);
                if (attachment) formData.append('attachment', attachment);

                const res = await axios.post(`/chat/conversations/${conversationId}/messages`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                setMessages([...messages, res.data.message]);
            } catch (err) {
                alert("Failed to send message. Check file size limits.");
            }
        }

        setSending(false);
        scrollToBottom();
    };

    const handleDeleteMessage = async (message) => {
        if (!confirm('Are you sure you want to delete this message?')) return;
        
        try {
            const res = await axios.delete(`/chat/messages/${message.id}`);
            setMessages(messages.map(m => m.id === res.data.message.id ? res.data.message : m));
        } catch (err) {
            alert('Failed to delete message.');
        }
    };

    return (
        <div className={`flex flex-col bg-gray-50 overflow-hidden ${isModal ? 'h-[600px] max-h-[85vh] rounded-2xl shadow-2xl border border-gray-200' : 'h-full rounded-2xl border border-gray-200'}`}>
            {/* Header */}
            <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between shrink-0 shadow-sm z-10">
                <div className="flex items-center gap-3">
                    {onClose && !isModal && (
                        <button onClick={onClose} className="md:hidden text-gray-500 hover:bg-gray-100 p-2 rounded-full">
                            <ArrowLeft size={20} />
                        </button>
                    )}
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 overflow-hidden">
                        {otherUser.avatar || otherUser.logo ? (
                            <img src={`/storage/${otherUser.avatar || otherUser.logo}`} alt={otherUser.name} className="w-full h-full object-cover" />
                        ) : (
                            <User size={20} />
                        )}
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">{otherUser.business_name || otherUser.name}</h3>
                        <OnlineStatusBadge isOnline={otherUser.is_online} lastSeenText={otherUser.last_seen_text} />
                    </div>
                </div>
                {isModal && onClose && (
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                )}
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-[#E5E5E5] bg-opacity-30">
                {loading ? (
                    <div className="h-full flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500">
                        <div className="bg-white p-4 rounded-full mb-3 shadow-sm">
                            <User size={32} className="text-blue-200" />
                        </div>
                        <p className="font-medium text-gray-800">No messages yet</p>
                        <p className="text-sm">Say hello to start the conversation!</p>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {messages.map((message) => (
                            <MessageBubble 
                                key={message.id} 
                                message={message} 
                                isOwnMessage={message.sender_id === currentUserId}
                                onEdit={setEditingMessage}
                                onDelete={handleDeleteMessage}
                            />
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="shrink-0">
                <MessageInput 
                    onSendMessage={handleSendMessage} 
                    isSending={sending}
                    editingMessage={editingMessage}
                    onCancelEdit={() => setEditingMessage(null)}
                />
            </div>
        </div>
    );
}
