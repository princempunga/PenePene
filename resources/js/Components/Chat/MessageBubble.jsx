import React, { useState, useRef, useCallback } from 'react';
import { format } from 'date-fns';
import {
    Check, CheckCheck, File, Download, Clock, AlertCircle, RefreshCw, ChevronDown, Star,
} from 'lucide-react';
import MessageActionsMenu from './MessageActionsMenu';
import ProductCardBubble from './ProductCardBubble';

const LONG_PRESS_MS = 500;

export default function MessageBubble({
    message,
    isOwnMessage,
    currentUserId,
    onRetry,
    messageRef,
    isPinned,
    openMenuId,
    menuPosition,
    onOpenMenu,
    onCloseMenu,
    onReply,
    onCopy,
    onReact,
    onForward,
    onPin,
    onStar,
    onEdit,
    onDelete,
    onMediaClick,
}) {
    const [showDeleteSubmenu, setShowDeleteSubmenu] = useState(false);
    const longPressTimer = useRef(null);
    const bubbleRef = useRef(null);

    let timeDate = new Date(message.created_at);
    if (isNaN(timeDate)) timeDate = new Date();

    const attachSrc = message.local_preview || (message.attachment_path ? `/storage/${message.attachment_path}` : null);
    const isMenuOpen = openMenuId === message.id;
    const isDeleted = message.is_deleted;

    const openMenuAtBubble = useCallback((e) => {
        if (String(message.id).startsWith('temp_') || message.status === 'sending') return;
        e?.stopPropagation();
        const rect = bubbleRef.current?.getBoundingClientRect();
        if (!rect) return;

        onOpenMenu(message.id, {
            top: isOwnMessage ? rect.top + 4 : rect.top + 4,
            right: isOwnMessage ? window.innerWidth - rect.right + 4 : undefined,
            left: isOwnMessage ? undefined : rect.left,
        });
        setShowDeleteSubmenu(false);
    }, [message.id, message.status, isOwnMessage, onOpenMenu]);

    const handleTouchStart = () => {
        longPressTimer.current = setTimeout(() => openMenuAtBubble(), LONG_PRESS_MS);
    };

    const handleTouchEnd = () => {
        if (longPressTimer.current) clearTimeout(longPressTimer.current);
    };

    const handleMediaClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!attachSrc || message.status === 'sending') return;
        onMediaClick?.({
            src: attachSrc,
            type: message.message_type,
            senderName: message.sender?.name,
            created_at: message.created_at,
        });
    };

    const replyPreview = message.reply_to || message.replyTo;

    return (
        <div
            ref={messageRef}
            className={`flex w-full mb-1 px-1 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
        >
            <div className={`relative flex flex-col group max-w-[82%] sm:max-w-[68%] ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                <div
                    ref={bubbleRef}
                    className={`relative rounded-2xl px-3 pt-2 pb-1.5 shadow-sm transition-shadow
                        ${isOwnMessage
                            ? 'bg-primary-600 text-white rounded-br-md chat-bubble-own'
                            : 'bg-white border border-gray-100 text-gray-800 rounded-bl-md chat-bubble-other'
                        }
                        ${isMenuOpen ? 'ring-2 ring-primary-300/60' : 'hover:shadow-md'}
                    `}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                    onTouchCancel={handleTouchEnd}
                >
                    {/* Hover arrow */}
                    {!isDeleted && message.status !== 'sending' && !String(message.id).startsWith('temp_') && (
                        <button
                            type="button"
                            onClick={openMenuAtBubble}
                            className={`absolute -top-1 ${isOwnMessage ? 'left-0 -translate-x-full' : 'right-0 translate-x-full'}
                                opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity
                                w-7 h-7 flex items-center justify-center rounded-full
                                bg-white shadow-md border border-gray-100 text-gray-600 hover:bg-gray-50 z-10`}
                            aria-label="Message actions"
                        >
                            <ChevronDown size={14} />
                        </button>
                    )}

                    {message.is_starred && (
                        <Star size={12} className={`absolute top-1.5 ${isOwnMessage ? 'left-2' : 'right-2'} text-amber-400 fill-amber-400`} />
                    )}

                    {/* Reply quote */}
                    {replyPreview && !isDeleted && (
                        <div className={`mb-1.5 pl-2 border-l-2 rounded-sm text-xs py-1 pr-1
                            ${isOwnMessage ? 'border-white/50 bg-white/10' : 'border-primary-400 bg-gray-50'}`}>
                            <p className={`font-semibold truncate ${isOwnMessage ? 'text-white/90' : 'text-primary-600'}`}>
                                {replyPreview.sender?.name || 'User'}
                            </p>
                            <p className={`truncate ${isOwnMessage ? 'text-white/75' : 'text-gray-500'}`}>
                                {replyPreview.is_deleted
                                    ? 'Message deleted'
                                    : replyPreview.body || (replyPreview.message_type !== 'text' ? 'Attachment' : '')}
                            </p>
                        </div>
                    )}

                    {isDeleted ? (
                        <p className={`text-sm italic py-1 ${isOwnMessage ? 'text-white/70' : 'text-gray-400'}`}>
                            This message was deleted
                        </p>
                    ) : (
                        <div className="relative">
                            {message.message_type === 'product' && message.product_snapshot && (
                                <ProductCardBubble product={message.product_snapshot} isOwnMessage={isOwnMessage} />
                            )}

                            {attachSrc && message.message_type !== 'product' && (
                                <div className={`mb-1 rounded-xl overflow-hidden relative
                                    ${message.message_type === 'file' ? 'w-full' : 'max-w-[280px]'}`}>
                                    {message.message_type === 'image' && (
                                        <button type="button" onClick={handleMediaClick} className="block w-full cursor-zoom-in">
                                            <img
                                                src={attachSrc}
                                                alt="attachment"
                                                className={`w-full object-cover rounded-xl max-h-[320px] ${message.status === 'sending' ? 'opacity-50' : 'hover:opacity-95'}`}
                                            />
                                        </button>
                                    )}

                                    {message.message_type === 'video' && (
                                        <button type="button" onClick={handleMediaClick} className="block w-full relative">
                                            <video
                                                src={attachSrc}
                                                className={`w-full max-h-[320px] rounded-xl object-cover pointer-events-none ${message.status === 'sending' ? 'opacity-50' : ''}`}
                                                preload="metadata"
                                            />
                                            {message.status !== 'sending' && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-xl">
                                                    <div className="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center">
                                                        <div className="w-0 h-0 border-t-8 border-b-8 border-l-12 border-transparent border-l-white ml-1" />
                                                    </div>
                                                </div>
                                            )}
                                        </button>
                                    )}

                                    {message.message_type === 'file' && (
                                        <a
                                            href={attachSrc}
                                            download
                                            className={`flex items-center gap-3 p-3 w-full rounded-xl transition-colors
                                                ${isOwnMessage ? 'bg-white/15 hover:bg-white/25 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}`}
                                        >
                                            <File size={20} />
                                            <span className="text-sm truncate flex-1">Attachment</span>
                                            <Download size={16} />
                                        </a>
                                    )}

                                    {message.status === 'sending' && message.message_type !== 'file' && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 text-white rounded-xl">
                                            <div className="w-7 h-7 border-2 border-white/30 border-t-white rounded-full animate-spin mb-1" />
                                            <span className="text-[10px] font-bold">{message.upload_progress !== undefined ? message.upload_progress : 0}%</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {message.body && (
                                <p className="text-[15px] leading-[1.45] whitespace-pre-wrap break-words pr-14 pb-0.5">
                                    {message.body}
                                </p>
                            )}

                            <div className={`flex items-center gap-1 text-[10px] float-right ml-2 -mt-0.5
                                ${isOwnMessage ? 'text-white/75' : 'text-gray-400'}`}>
                                {message.is_edited && <span className="mr-0.5">edited</span>}
                                <span>{format(timeDate, 'HH:mm')}</span>
                                {isOwnMessage && (
                                    <span className="flex items-center ml-0.5">
                                        {message.status === 'sending' && <Clock size={11} />}
                                        {message.status === 'sent' && <Check size={13} />}
                                        {message.status === 'delivered' && (
                                            <CheckCheck size={13} className="text-white/60" />
                                        )}
                                        {message.status === 'read' && (
                                            <CheckCheck size={13} className="text-sky-300" />
                                        )}
                                        {message.status === 'failed' && <AlertCircle size={12} className="text-red-300" />}
                                    </span>
                                )}
                            </div>
                            <div className="clear-both h-0" />
                        </div>
                    )}
                </div>

                {/* Reactions */}
                {message.reactions?.length > 0 && (
                    <div className={`flex flex-wrap gap-1 mt-0.5 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                        {message.reactions.map((r) => (
                            <button
                                key={r.emoji}
                                type="button"
                                onClick={() => onReact(message, r.reacted_by_me ? null : r.emoji)}
                                className={`text-xs px-1.5 py-0.5 rounded-full border shadow-sm
                                    ${r.reacted_by_me ? 'bg-primary-50 border-primary-200' : 'bg-white border-gray-200'}`}
                            >
                                {r.emoji} {r.count > 1 && <span className="text-gray-500">{r.count}</span>}
                            </button>
                        ))}
                    </div>
                )}

                {message.status === 'failed' && (
                    <button
                        type="button"
                        onClick={() => onRetry(message)}
                        className="mt-1 flex items-center gap-1 text-xs text-red-500 hover:text-red-700"
                    >
                        <RefreshCw size={12} /> Retry
                    </button>
                )}

                {isMenuOpen && (
                    <MessageActionsMenu
                        message={message}
                        isOwnMessage={isOwnMessage}
                        isPinned={isPinned}
                        isStarred={message.is_starred}
                        position={menuPosition || { top: 0, left: 0 }}
                        onClose={onCloseMenu}
                        onReply={onReply}
                        onCopy={onCopy}
                        onReact={onReact}
                        onForward={onForward}
                        onPin={onPin}
                        onStar={onStar}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        showDeleteSubmenu={showDeleteSubmenu}
                        onToggleDeleteSubmenu={() => setShowDeleteSubmenu((v) => !v)}
                    />
                )}
            </div>
        </div>
    );
}
