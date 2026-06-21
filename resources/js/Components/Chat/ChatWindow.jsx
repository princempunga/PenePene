import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { router } from '@inertiajs/react';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import OnlineStatusBadge from './OnlineStatusBadge';
import MediaPreviewModal from './MediaPreviewModal';
import ForwardModal from './ForwardModal';
import { deriveMessageStatus, withDeliveryStatus } from '@/utils/messageStatus';
import { X, User, ArrowLeft, Pin, MoreVertical, Trash2, Eraser, Archive, ChevronDown } from 'lucide-react';

const jsonHeaders = { headers: { Accept: 'application/json' } };

const CONVERSATION_STATUSES = [
    { value: 'inquiry',     label: 'Demande',     color: 'bg-blue-100 text-blue-700' },
    { value: 'negotiating', label: 'Négociation', color: 'bg-amber-100 text-amber-700' },
    { value: 'confirmed',   label: 'Confirmé',    color: 'bg-indigo-100 text-indigo-700' },
    { value: 'sold',        label: 'Vendu',       color: 'bg-green-100 text-green-700' },
    { value: 'cancelled',   label: 'Annulé',      color: 'bg-red-100 text-red-700' },
];

export default function ChatWindow({ conversationId, currentUserId, otherUser, onClose, isModal = false, onConversationDeleted, conversationStatus, onStatusChange, isSeller = false }) {
    const [messages, setMessages] = useState([]);
    const [pinnedMessages, setPinnedMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [toast, setToast] = useState(null);
    const [replyTo, setReplyTo] = useState(null);
    const [mediaPreview, setMediaPreview] = useState(null);
    const [forwardMessage, setForwardMessage] = useState(null);
    const [openMenuId, setOpenMenuId] = useState(null);
    const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
    const [headerMenuOpen, setHeaderMenuOpen] = useState(false);
    const [statusMenuOpen, setStatusMenuOpen] = useState(false);
    const [currentStatus, setCurrentStatus] = useState(conversationStatus || 'inquiry');
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const statusMenuRef = useRef(null);
    const messagesEndRef = useRef(null);
    const pollingIntervalRef = useRef(null);
    const messageRefs = useRef({});
    const headerMenuRef = useRef(null);

    const handleStatusChange = async (newStatus) => {
        setUpdatingStatus(true);
        setStatusMenuOpen(false);
        try {
            await axios.patch(`/chat/conversations/${conversationId}/status`, { status: newStatus }, jsonHeaders);
            setCurrentStatus(newStatus);
            onStatusChange && onStatusChange(newStatus);
            showToast('Statut mis à jour', 'success');
        } catch {
            showToast('Impossible de mettre à jour le statut', 'error');
        } finally {
            setUpdatingStatus(false);
        }
    };

    const showToast = useCallback((msg, type = 'info') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 2500);
    }, []);

    const fetchMessages = async () => {
        try {
            const res = await axios.get(`/chat/conversations/${conversationId}`, jsonHeaders);
            const serverMessages = withDeliveryStatus(res.data.messages || [], currentUserId);

            setMessages((prev) => {
                const tempMessages = prev.filter((m) => String(m.id).startsWith('temp_'));
                const merged = [...serverMessages, ...tempMessages];
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
            el.classList.add('ring-2', 'ring-primary-400', 'rounded-2xl');
            setTimeout(() => el.classList.remove('ring-2', 'ring-primary-400', 'rounded-2xl'), 1500);
        }
    };

    useEffect(() => {
        fetchMessages();
        pollingIntervalRef.current = setInterval(fetchMessages, 1000);
        return () => { if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current); };
    }, [conversationId]);

    useEffect(() => {
        if (!loading) scrollToBottom();
    }, [messages.length, loading]);

    useEffect(() => {
        const handleClick = (e) => {
            if (headerMenuRef.current && !headerMenuRef.current.contains(e.target)) {
                setHeaderMenuOpen(false);
            }
            if (statusMenuRef.current && !statusMenuRef.current.contains(e.target)) {
                setStatusMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const handleOpenMenu = (messageId, position) => {
        const adjusted = { ...position, top: (position.top || 0) + 28 };
        setOpenMenuId(messageId);
        setMenuPosition(adjusted);
    };

    const handleSendMessage = async ({ body, attachment, replyToMessageId }) => {
        setSending(true);

        const tempId = 'temp_' + Date.now();
        let previewUrl = null;
        let messageType = 'text';

        if (attachment) {
            previewUrl = URL.createObjectURL(attachment);
            if (attachment.type.startsWith('image/')) messageType = 'image';
            else if (attachment.type.startsWith('video/')) messageType = 'video';
            else messageType = 'file';
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
            reply_to: replyTo || null,
            _payload: { body, attachment, replyToMessageId },
        };

        setMessages((prev) => [...prev, optimisticMsg]);
        setReplyTo(null);
        setSending(false);
        scrollToBottom();
        await performUpload(optimisticMsg);
    };

    const performUpload = async (msg) => {
        try {
            const formData = new FormData();
            if (msg._payload.body) formData.append('body', msg._payload.body);
            if (msg._payload.attachment) formData.append('attachment', msg._payload.attachment);
            if (msg._payload.replyToMessageId) formData.append('reply_to_message_id', msg._payload.replyToMessageId);
            if (msg.message_type) formData.append('message_type', msg.message_type);

            const res = await axios.post(`/chat/conversations/${conversationId}/messages`, formData, {
                headers: { Accept: 'application/json' },
                onUploadProgress: (e) => {
                    const pct = Math.round((e.loaded * 100) / e.total);
                    setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, upload_progress: pct } : m));
                },
            });
            setMessages((prev) => prev.map((m) => {
                if (m.id !== msg.id) return m;
                const saved = res.data.message;
                return {
                    ...saved,
                    status: deriveMessageStatus(saved, currentUserId),
                };
            }));
        } catch (error) {
            console.error('Upload failed:', error.response?.data || error.message);
            showToast(error.response?.data?.message || 'Failed to send message', 'error');
            setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, status: 'failed' } : m));
        }
    };

    const handleRetryMessage = async (msg) => {
        setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, status: 'sending', upload_progress: 0 } : m));
        await performUpload(msg);
    };

    const handleReply = (message) => setReplyTo(message);

    const handleCopy = async (message) => {
        if (!message.body) return;
        try {
            await navigator.clipboard.writeText(message.body);
            showToast('Message copied', 'success');
        } catch {
            showToast('Could not copy message', 'error');
        }
    };

    const handleReact = async (message, emoji) => {
        if (String(message.id).startsWith('temp_')) return;
        try {
            const res = emoji
                ? await axios.post(`/messages/${message.id}/react`, { emoji }, jsonHeaders)
                : await axios.delete(`/messages/${message.id}/react`, jsonHeaders);
            setMessages((prev) => prev.map((m) => m.id === message.id ? { ...m, reactions: res.data.reactions } : m));
        } catch {
            showToast('Could not update reaction', 'error');
        }
    };

    const handleForward = (message) => setForwardMessage(message);

    const handlePin = async (message) => {
        const isPinned = pinnedMessages.some((p) => p.message_id === message.id);
        try {
            if (isPinned) {
                await axios.delete(`/chat/conversations/${conversationId}/messages/${message.id}/pin`, jsonHeaders);
                setPinnedMessages((prev) => prev.filter((p) => p.message_id !== message.id));
                showToast('Message unpinned', 'success');
            } else {
                const res = await axios.post(`/chat/conversations/${conversationId}/messages/${message.id}/pin`, {}, jsonHeaders);
                setPinnedMessages((prev) => [res.data.pinned_message, ...prev]);
                showToast('Message pinned', 'success');
            }
        } catch {
            showToast('Could not update pin', 'error');
        }
    };

    const handleStar = async (message) => {
        try {
            if (message.is_starred) {
                await axios.delete(`/messages/${message.id}/star`, jsonHeaders);
                setMessages((prev) => prev.map((m) => m.id === message.id ? { ...m, is_starred: false } : m));
                showToast('Message unstarred', 'success');
            } else {
                await axios.post(`/messages/${message.id}/star`, {}, jsonHeaders);
                setMessages((prev) => prev.map((m) => m.id === message.id ? { ...m, is_starred: true } : m));
                showToast('Message starred', 'success');
            }
        } catch {
            showToast('Could not update star', 'error');
        }
    };

    const handleEdit = async (message) => {
        const newBody = window.prompt('Edit message:', message.body);
        if (!newBody || newBody.trim() === message.body) return;
        try {
            const res = await axios.patch(`/messages/${message.id}`, { body: newBody.trim() }, jsonHeaders);
            setMessages((prev) => prev.map((m) => m.id === message.id ? { ...m, ...res.data.message } : m));
            showToast('Message updated', 'success');
        } catch {
            showToast('Could not edit message', 'error');
        }
    };

    const handleDelete = async (message, deleteType) => {
        try {
            await axios.delete(`/messages/${message.id}`, { data: { delete_type: deleteType }, ...jsonHeaders });
            if (deleteType === 'everyone') {
                setMessages((prev) => prev.map((m) => m.id === message.id
                    ? { ...m, is_deleted: true, body: null, attachment_path: null }
                    : m));
            } else {
                setMessages((prev) => prev.filter((m) => m.id !== message.id));
            }
            showToast(deleteType === 'everyone' ? 'Deleted for everyone' : 'Deleted for you', 'success');
        } catch {
            showToast('Could not delete message', 'error');
        }
    };

    const handleConversationAction = async (action) => {
        setHeaderMenuOpen(false);
        const labels = { delete: 'Conversation deleted', clear: 'Chat cleared', archive: 'Conversation archived' };
        try {
            await axios.post(`/chat/conversations/${conversationId}/${action}`, {}, jsonHeaders);
            showToast(labels[action], 'success');
            if (action === 'delete' || action === 'archive') {
                onConversationDeleted?.();
                router.visit('/chat/conversations');
            } else {
                setMessages([]);
                fetchMessages();
            }
        } catch {
            showToast('Action failed. Please try again.', 'error');
        }
    };

    const pinnedPreview = (msg) => {
        if (!msg) return '';
        if (msg.is_deleted) return 'Deleted message';
        if (msg.message_type === 'image') return '📷 Photo';
        if (msg.message_type === 'video') return '🎬 Video';
        return msg.body || 'Attachment';
    };

    return (
        <div className={`relative flex flex-col bg-[#e8edf3] overflow-hidden ${isModal ? 'h-[600px] max-h-[85vh] rounded-2xl shadow-2xl border border-gray-200' : 'h-full'}`}>

            {toast && (
                <div className={`absolute top-4 left-1/2 -translate-x-1/2 z-[100] px-4 py-2 rounded-full text-sm font-medium shadow-lg
                    ${toast.type === 'success' ? 'bg-green-600 text-white' : toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-gray-800 text-white'}`}>
                    {toast.msg}
                </div>
            )}

            {/* Header */}
            <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between shrink-0 shadow-sm z-10">
                <div className="flex items-center gap-3 min-w-0">
                    {onClose && !isModal && (
                        <button type="button" onClick={onClose} className="md:hidden text-gray-500 hover:bg-gray-100 p-2 rounded-full">
                            <ArrowLeft size={20} />
                        </button>
                    )}
                    <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center shrink-0 overflow-hidden">
                        {otherUser?.avatar || otherUser?.logo ? (
                            <img src={`/storage/${otherUser.avatar || otherUser.logo}`} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <User size={20} />
                        )}
                    </div>
                    <div className="min-w-0">
                        <h3 className="font-bold text-gray-900 truncate">{otherUser?.business_name || otherUser?.name}</h3>
                        {isSeller && (
                            <div className="relative" ref={statusMenuRef}>
                                <button
                                    type="button"
                                    onClick={() => setStatusMenuOpen(v => !v)}
                                    disabled={updatingStatus}
                                    className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full mt-0.5 cursor-pointer transition-all ${(CONVERSATION_STATUSES.find(s => s.value === currentStatus) || CONVERSATION_STATUSES[0]).color}`}
                                >
                                    {(CONVERSATION_STATUSES.find(s => s.value === currentStatus) || CONVERSATION_STATUSES[0]).label}
                                    <ChevronDown size={10} />
                                </button>
                                {statusMenuOpen && (
                                    <div className="absolute left-0 top-full mt-1 w-40 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50">
                                        {CONVERSATION_STATUSES.map(s => (
                                            <button
                                                key={s.value}
                                                type="button"
                                                onClick={() => handleStatusChange(s.value)}
                                                className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold hover:bg-gray-50 ${currentStatus === s.value ? 'opacity-50 cursor-default' : ''}`}
                                            >
                                                <span className={`w-2 h-2 rounded-full ${s.color.split(' ')[0]}`} />
                                                {s.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                        <OnlineStatusBadge isOnline={otherUser?.is_online} lastSeenText={otherUser?.last_seen_text} />
                    </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                    <div className="relative" ref={headerMenuRef}>
                        <button
                            type="button"
                            onClick={() => setHeaderMenuOpen((v) => !v)}
                            className="p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
                            aria-label="Conversation options"
                        >
                            <MoreVertical size={20} />
                        </button>
                        {headerMenuOpen && (
                            <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50 text-sm">
                                <button type="button" onClick={() => handleConversationAction('clear')} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-gray-800">
                                    <Eraser size={16} /> Clear chat
                                </button>
                                <button type="button" onClick={() => handleConversationAction('archive')} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-gray-800">
                                    <Archive size={16} /> Archive conversation
                                </button>
                                <button type="button" onClick={() => handleConversationAction('delete')} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 text-red-600">
                                    <Trash2 size={16} /> Delete conversation
                                </button>
                            </div>
                        )}
                    </div>
                    {isModal && onClose && (
                        <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full">
                            <X size={20} />
                        </button>
                    )}
                </div>
            </div>

            {/* Pinned messages bar */}
            {pinnedMessages.length > 0 && (
                <div className="bg-primary-50 border-b border-primary-100 px-4 py-2 shrink-0">
                    {pinnedMessages.slice(0, 2).map((pin) => (
                        <button
                            key={pin.id}
                            type="button"
                            onClick={() => scrollToMessage(pin.message_id)}
                            className="w-full flex items-center gap-2 text-left text-sm hover:bg-primary-100/60 rounded-lg px-2 py-1.5 transition-colors"
                        >
                            <Pin size={14} className="text-primary-600 shrink-0" />
                            <span className="text-primary-800 font-medium truncate">{pinnedPreview(pin.message)}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* Messages */}
            <div
                className="flex-1 overflow-y-auto p-3 sm:p-4 custom-scrollbar relative"
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23d1d5db\' fill-opacity=\'0.15\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}
                onClick={() => setOpenMenuId(null)}
            >
                {loading ? (
                    <div className="h-full flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500">
                        <div className="bg-white p-4 rounded-full mb-3 shadow-sm">
                            <User size={32} className="text-primary-200" />
                        </div>
                        <p className="font-medium text-gray-800">No messages yet</p>
                        <p className="text-sm">Say hello to start the conversation!</p>
                    </div>
                ) : (
                    <div className="space-y-0.5 pb-4">
                        {messages.map((message) => (
                            <MessageBubble
                                key={message.id}
                                message={message}
                                isOwnMessage={message.sender_id === currentUserId}
                                currentUserId={currentUserId}
                                onRetry={handleRetryMessage}
                                messageRef={(el) => { if (el) messageRefs.current[message.id] = el; }}
                                isPinned={pinnedMessages.some((p) => p.message_id === message.id)}
                                openMenuId={openMenuId}
                                menuPosition={menuPosition}
                                onOpenMenu={handleOpenMenu}
                                onCloseMenu={() => setOpenMenuId(null)}
                                onReply={handleReply}
                                onCopy={handleCopy}
                                onReact={handleReact}
                                onForward={handleForward}
                                onPin={handlePin}
                                onStar={handleStar}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onMediaClick={setMediaPreview}
                            />
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            <div className="shrink-0">
                <MessageInput
                    onSendMessage={handleSendMessage}
                    isSending={sending}
                    replyTo={replyTo}
                    onCancelReply={() => setReplyTo(null)}
                />
            </div>

            {mediaPreview && (
                <MediaPreviewModal media={mediaPreview} onClose={() => setMediaPreview(null)} />
            )}

            {forwardMessage && (
                <ForwardModal
                    message={forwardMessage}
                    currentConversationId={conversationId}
                    onClose={() => setForwardMessage(null)}
                    onForwarded={() => showToast('Message forwarded', 'success')}
                />
            )}

            <style>{`
                @keyframes fadeSlideDown {
                    from { opacity: 0; transform: translateY(-6px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .chat-bubble-own::after {
                    content: '';
                    position: absolute;
                    bottom: 0;
                    right: -6px;
                    width: 0; height: 0;
                    border: 6px solid transparent;
                    border-left-color: var(--color-primary-600, #2563eb);
                    border-bottom: 0;
                    border-right: 0;
                }
                .chat-bubble-other::after {
                    content: '';
                    position: absolute;
                    bottom: 0;
                    left: -6px;
                    width: 0; height: 0;
                    border: 6px solid transparent;
                    border-right-color: #fff;
                    border-bottom: 0;
                    border-left: 0;
                }
            `}</style>
        </div>
    );
}
