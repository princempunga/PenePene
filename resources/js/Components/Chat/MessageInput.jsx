import React, { useState, useRef } from 'react';
import { Send, Paperclip, X } from 'lucide-react';

export default function MessageInput({ onSendMessage, isSending }) {
    const [body, setBody]           = useState('');
    const [attachment, setAttachment] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const fileInputRef              = useRef(null);

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

        onSendMessage({ body: body.trim(), attachment });
        setBody('');
        clearAttachment();
    };

    return (
        <div className="bg-white border-t border-gray-200 p-3 flex flex-col gap-2">
            {/* Attachment preview */}
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
                {/* Attach button */}
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
                        className="p-3 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors focus:outline-none"
                        title="Attach file"
                    >
                        <Paperclip size={20} />
                    </button>
                </div>

                {/* Textarea */}
                <div className="flex-1 bg-gray-100 rounded-2xl flex items-center">
                    <textarea
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        placeholder="Type a message..."
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

                {/* Send button */}
                <button
                    type="submit"
                    disabled={(!body.trim() && !attachment) || isSending}
                    className="shrink-0 p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center focus:outline-none"
                >
                    <Send size={20} className={isSending ? 'animate-pulse' : ''} />
                </button>
            </form>
        </div>
    );
}
