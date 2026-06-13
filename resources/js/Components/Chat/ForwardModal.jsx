import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { X, Forward } from 'lucide-react';

export default function ForwardModal({ message, currentConversationId, onClose, onForwarded }) {
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [forwarding, setForwarding] = useState(null);

    useEffect(() => {
        axios.get('/chat/conversations', { headers: { Accept: 'application/json' } })
            .then((res) => setConversations(res.data.conversations || []))
            .catch(() => setConversations([]))
            .finally(() => setLoading(false));
    }, []);

    const handleForward = async (targetId) => {
        if (forwarding) return;
        setForwarding(targetId);
        try {
            const res = await axios.post(`/chat/conversations/${currentConversationId}/forward`, {
                message_id: message.id,
                target_conversation_id: targetId,
            });
            onForwarded?.(res.data);
            onClose();
        } catch {
            alert('Could not forward message. Please try again.');
        } finally {
            setForwarding(null);
        }
    };

    const getLabel = (conv) => {
        if (conv.seller?.business_name) return conv.seller.business_name;
        if (conv.buyer?.name) return conv.buyer.name;
        return `Conversation #${conv.id}`;
    };

    const available = conversations.filter((c) => c.id !== currentConversationId);

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[70vh] flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <Forward size={18} className="text-primary-600" />
                        <h3 className="font-bold text-gray-900">Forward message</h3>
                    </div>
                    <button type="button" onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500">
                        <X size={18} />
                    </button>
                </div>

                <div className="overflow-y-auto flex-1 p-2">
                    {loading ? (
                        <p className="text-center text-gray-500 py-8 text-sm">Loading conversations...</p>
                    ) : available.length === 0 ? (
                        <p className="text-center text-gray-500 py-8 text-sm">No other conversations available.</p>
                    ) : (
                        available.map((conv) => (
                            <button
                                key={conv.id}
                                type="button"
                                onClick={() => handleForward(conv.id)}
                                disabled={forwarding === conv.id}
                                className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-3 disabled:opacity-50"
                            >
                                <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold shrink-0">
                                    {getLabel(conv).charAt(0)}
                                </div>
                                <span className="font-medium text-gray-900 truncate">
                                    {forwarding === conv.id ? 'Forwarding...' : getLabel(conv)}
                                </span>
                            </button>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
