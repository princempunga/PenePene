import React, { useState, useRef } from 'react';
import { Send, Paperclip, X, Image as ImageIcon, Film } from 'lucide-react';

export default function MessageInput({ onSendMessage, isSending, editingMessage, onCancelEdit }) {
    const [body, setBody] = useState('');
    const [attachment, setAttachment] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const fileInputRef = useRef(null);

    // If editingMessage changes, update the body
    React.useEffect(() => {
        if (editingMessage) {
            setBody(editingMessage.body || '');
            setAttachment(null);
            setPreviewUrl(null);
        }
    }, [editingMessage]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Basic validation
        if (file.type.startsWith('image/') && file.size > 5 * 1024 * 1024) {
            alert('Image must be less than 5MB');
            return;
        }
        if (file.type.startsWith('video/') && file.size > 25 * 1024 * 1024) {
            alert('Video must be less than 25MB');
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

        onSendMessage({ body, attachment });
        setBody('');
        clearAttachment();
    };

    return (
        <div className="bg-white border-t border-gray-200 p-3 flex flex-col gap-2 relative">
            {/* Editing indicator */}
            {editingMessage && (
                <div className="flex items-center justify-between bg-blue-50 text-blue-800 text-sm px-3 py-1.5 rounded-md mb-1">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold">Editing message</span>
                        <span className="truncate max-w-[200px] text-blue-600 italic">"{editingMessage.body}"</span>
                    </div>
                    <button type="button" onClick={onCancelEdit} className="text-blue-500 hover:text-blue-700">
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* Attachment preview */}
            {previewUrl && (
                <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 mb-2 group">
                    {attachment?.type.startsWith('video/') ? (
                        <video src={previewUrl} className="w-full h-full object-cover" />
                    ) : (
                        <img src={previewUrl} alt="preview" className="w-full h-full object-cover" />
                    )}
                    <button 
                        type="button" 
                        onClick={clearAttachment}
                        className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <X size={14} />
                    </button>
                </div>
            )}

            <form onSubmit={handleSubmit} className="flex items-end gap-2">
                {!editingMessage && (
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
                            title="Attach File"
                        >
                            <Paperclip size={20} />
                        </button>
                    </div>
                )}

                <div className="flex-1 bg-gray-100 rounded-2xl relative flex items-center">
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

                <button 
                    type="submit" 
                    disabled={(!body.trim() && !attachment) || isSending}
                    className="shrink-0 p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center focus:outline-none"
                >
                    <Send size={20} className={isSending ? "animate-pulse" : ""} />
                </button>
            </form>
        </div>
    );
}
