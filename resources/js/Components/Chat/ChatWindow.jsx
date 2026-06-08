import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import OnlineStatusBadge from './OnlineStatusBadge';
import { X, User, ArrowLeft, Pin, ChevronDown } from 'lucide-react';

export default function ChatWindow({ conversationId, currentUserId, otherUser, onClose, isModal = false }) {
    const [messages, setMessages]           = useState([]);
    const [pinnedMessages, setPinnedMessages] = useState([]);
    const [loading, setLoading]             = useState(true);
    const [sending, setSending]             = useState(false);
    const [toast, setToast]                 = useState(null);
    const messagesEndRef                    = useRef(null);
    const pollingIntervalRef                = useRef(null);
    const messageRefs                       = useRef({});

    // ─── Toast helper ──────────────────────────────────────────
    const showToast = useCallback((msg, type = 'info') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 2500);
    }, []);

    // ─── Fetch ─────────────────────────────────────────────────
    const fetchMessages = async () => {
        try {
            const res = await axios.get(`/chat/conversations/${conversationId}`);
            const serverMessages = res.data.messages.map(m => ({
                ...m,
                status: m.is_read ? 'read' : 'sent'
            }));

            setMessages(prev => {
                const tempMessages = prev.filter(m => String(m.id).startsWith('temp_'));
                const merged = [...serverMessages];
                tempMessages.forEach(tm => merged.push(tm));
                return merged.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
            });

            setPinnedMessages(res.data.pinned_messages || []);
        } catch (error) {
            console.error('Failed to fetch messages', error);
        } finally {
            setLoading(false);
        }
    };

    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

    const scrollToMessage = (messageId) => {
        const el = messageRefs.current[messageId];
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.classList.add('ring-2', 'ring-blue-400', 'rounded-2xl');
            setTimeout(() => el.classList.remove('ring-2', 'ring-blue-400', 'rounded-2xl'), 1500);
        }
    };

    useEffect(() => {
        fetchMessages();
        pollingIntervalRef.current = setInterval(fetchMessages, 3000);
        return () => { if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current); };
    }, [conversationId]);

    useEffect(() => {
        if (!loading) scrollToBottom();
    }, [messages.length, loading]);

    // ─── Send Message (Optimistic) ──────────────────────────────
    const handleSendMessage = async ({ body, attachment }) => {
        setSending(true);

        const tempId = 'temp_' + Date.now();
        let previewUrl = null;
        let messageType = 'text';

        if (attachment) {
            previewUrl = URL.createObjectURL(attachment);
            if (attachment.type.startsWith('image/'))      messageType = 'image';
            else if (attachment.type.startsWith('video/')) messageType = 'video';
            else                                           messageType = 'file';
        }

        const optimisticMsg = {
            id: tempId,
            conversation_id: conversationId,
            sender_id: currentUserId,
            body,
            message_type: messageType,
            attachment_path: null,
            local_preview: previewUrl,
            created_at: new Date().toISOString(),
            status: 'sending',
            upload_progress: 0,
            _payload: { body, attachment }
        };

        setMessages(prev => [...prev, optimisticMsg]);
        setSending(false);
        scrollToBottom();
        await performUpload(optimisticMsg);
    };

    const performUpload = async (msg) => {
        try {
            const formData = new FormData();
            if (msg._payload.body)       formData.append('body', msg._payload.body);
            if (msg._payload.attachment) formData.append('attachment', msg._payload.attachment);

            const res = await axios.post(`/chat/conversations/${conversationId}/messages`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, upload_progress: pct } : m));
                }
            });
            setMessages(prev => prev.map(m => m.id === msg.id ? { ...res.data.message, status: 'sent' } : m));
        } catch {
            setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, status: 'failed' } : m));
        }
    };

    const handleRetryMessage = async (msg) => {
        setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, status: 'sending', upload_progress: 0 } : m));
        await performUpload(msg);
    };

    return (
        <div className={`flex flex-col bg-gray-50 overflow-hidden ${isModal ? 'h-[600px] max-h-[85vh] rounded-2xl shadow-2xl border border-gray-200' : 'h-full rounded-2xl border border-gray-200'}`}>

            {/* ── Toast Notification ── */}
            {toast && (
                <div className={`absolute top-4 left-1/2 -translate-x-1/2 z-[100] px-4 py-2 rounded-full text-sm font-medium shadow-lg transition-all
                    ${toast.type === 'success' ? 'bg-green-600 text-white' : toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-gray-800 text-white'}`}>
                    {toast.msg}
                </div>
            )}

            {/* ── Header ── */}
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

            {/* ── Messages Area ── */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-[#E5E5E5] bg-opacity-30 relative">
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
                    <div className="space-y-1 pb-4">
                        {messages.map((message) => (
                            <MessageBubble
                                key={message.id}
                                message={message}
                                isOwnMessage={message.sender_id === currentUserId}
                                currentUserId={currentUserId}
                                onRetry={handleRetryMessage}
                                messageRef={(el) => { if (el) messageRefs.current[message.id] = el; }}
                            />
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* ── Input ── */}
            <div className="shrink-0">
                <MessageInput
                    onSendMessage={handleSendMessage}
                    isSending={sending}
                />
            </div>

            <style>{`
                @keyframes fadeSlideDown {
                    from { opacity: 0; transform: translateY(-6px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
