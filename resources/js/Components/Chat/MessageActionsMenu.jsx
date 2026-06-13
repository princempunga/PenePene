import React, { useEffect, useRef, useState } from 'react';
import {
    Reply, Copy, Smile, Forward, Pin, Star, Trash2, Pencil, ChevronRight,
} from 'lucide-react';

const REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

export default function MessageActionsMenu({
    message,
    isOwnMessage,
    isPinned,
    isStarred,
    position,
    onClose,
    onReply,
    onCopy,
    onReact,
    onForward,
    onPin,
    onStar,
    onEdit,
    onDelete,
    showDeleteSubmenu,
    onToggleDeleteSubmenu,
}) {
    const menuRef = useRef(null);
    const [showReactions, setShowReactions] = useState(false);

    useEffect(() => {
        const handleClick = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [onClose]);

    const canCopy = Boolean(message.body);
    const canEdit = isOwnMessage && message.body && !message.is_deleted;

    return (
        <div
            ref={menuRef}
            className="fixed z-[120] min-w-[180px] bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 text-sm animate-[fadeSlideDown_0.15s_ease-out]"
            style={{ top: position.top, left: position.left, right: position.right }}
        >
            <MenuItem icon={Reply} label="Reply" onClick={() => { onReply(message); onClose(); }} />

            {canCopy && (
                <MenuItem icon={Copy} label="Copy" onClick={() => { onCopy(message); onClose(); }} />
            )}

            <MenuItem
                icon={Smile}
                label="React"
                suffix={<ChevronRight size={14} className={`text-gray-400 transition-transform ${showReactions ? 'rotate-90' : ''}`} />}
                onClick={() => setShowReactions((v) => !v)}
            />
            {showReactions && (
                <div className="flex flex-wrap gap-1 px-3 py-2 border-b border-gray-100">
                    {REACTIONS.map((emoji) => (
                        <button
                            key={emoji}
                            type="button"
                            onClick={() => { onReact(message, emoji); onClose(); }}
                            className="w-8 h-8 hover:bg-gray-100 rounded-lg text-lg transition-colors"
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
            )}

            <MenuItem icon={Forward} label="Forward" onClick={() => { onForward(message); onClose(); }} />
            <MenuItem
                icon={Pin}
                label={isPinned ? 'Unpin' : 'Pin'}
                onClick={() => { onPin(message); onClose(); }}
            />
            <MenuItem
                icon={Star}
                label={isStarred ? 'Unstar' : 'Star'}
                onClick={() => { onStar(message); onClose(); }}
            />

            {canEdit && (
                <MenuItem icon={Pencil} label="Edit" onClick={() => { onEdit(message); onClose(); }} />
            )}

            <div className="border-t border-gray-100 my-1" />

            <div className="relative">
                <MenuItem
                    icon={Trash2}
                    label="Delete"
                    danger
                    suffix={<ChevronRight size={14} className="text-gray-400" />}
                    onClick={onToggleDeleteSubmenu}
                />
                {showDeleteSubmenu && (
                    <div className="absolute left-full top-0 ml-1 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 min-w-[160px]">
                        <MenuItem
                            label="Delete for Me"
                            onClick={() => { onDelete(message, 'me'); onClose(); }}
                        />
                        {isOwnMessage && (
                            <MenuItem
                                label="Delete for Everyone"
                                danger
                                onClick={() => { onDelete(message, 'everyone'); onClose(); }}
                            />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function MenuItem({ icon: Icon, label, onClick, danger, suffix }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors text-left
                ${danger ? 'text-red-600 hover:bg-red-50' : 'text-gray-800'}`}
        >
            {Icon && <Icon size={16} className="shrink-0 opacity-70" />}
            <span className="flex-1">{label}</span>
            {suffix}
        </button>
    );
}
