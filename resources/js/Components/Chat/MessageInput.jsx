import React, { useState, useRef } from 'react';
import { Send, Paperclip, X } from 'lucide-react';
import useTranslation from '@/hooks/useTranslation';

export default function MessageInput({ onSendMessage, isSending, replyTo, onCancelReply }) {
    const { t } = useTranslation();
    const [body, setBody] = useState('');
    const [attachment, setAttachment] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.type.startsWith('image/') && file.size > 5 * 1024 * 1024) {
            alert('Image is too large. Maximum allowed size is 5MB.');
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }
        if (file.type.startsWith('video/') && file.size > 50 * 1024 * 1024) {
            alert('Video is too large. Maximum allowed size is 50MB.');
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        setAttachment(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const clearAttachment = () => {
        setAttachment(null);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if ((!body.trim() && !attachment) || isSending) return;

        onSendMessage({
            body: body.trim(),
            attachment,
            replyToMessageId: replyTo?.id ?? null,
        });
        setBody('');
        clearAttachment();
        onCancelReply?.();
    };

    return (
        <div className="bg-white border-t border-gray-200 p-3 flex flex-col gap-2">
            {replyTo && (
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
                    <div className="flex-1 min-w-0 border-l-2 border-primary-500 pl-2">
                        <p className="text-xs font-semibold text-primary-600 truncate">
                            {t('chat.replying_to', { name: replyTo.sender?.name || 'User' })}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                            {replyTo.is_deleted ? t('chat.message_deleted') : replyTo.body || t('chat.sent_attachment')}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onCancelReply}
                        className="p-1 rounded-full hover:bg-gray-200 text-gray-500 shrink-0"
                    >
                        <X size={16} />
                    </button>
                </div>
            )}

            {previewUrl && (
                <div className="relative w-28 h-28 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 group">
                    {attachment?.type.startsWith('video/') ? (
                        <video src={previewUrl} className="w-full h-full object-cover" />
                    ) : (
                        <img src={previewUrl} alt="preview" className="w-full h-full object-cover" />
                    )}
                    <button
                        type="button"
                        onClick={clearAttachment}
                        className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <X size={12} />
                    </button>
                </div>
            )}

            <form onSubmit={handleSubmit} className="flex items-end gap-2">
                <div className="shrink-0">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-3 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-colors"
                        title={t('chat.attach_file')}
                    >
                        <Paperclip size={20} />
                    </button>
                </div>

                <div className="flex-1 bg-gray-100 rounded-2xl flex items-center">
                    <textarea
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        placeholder={t('chat.type_message')}
                        className="w-full bg-transparent border-0 focus:ring-0 resize-none max-h-32 py-3 px-4 rounded-2xl text-sm"
                        rows="1"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit(e);
                            }
                        }}
                    />
                </div>

                <button
                    type="submit"
                    disabled={(!body.trim() && !attachment) || isSending}
                    className="shrink-0 p-3 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Send size={20} className={isSending ? 'animate-pulse' : ''} />
                </button>
            </form>
        </div>
    );
}
