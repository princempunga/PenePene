import React from 'react';
import { format } from 'date-fns';
import { Check, CheckCheck, File, Download, Clock, AlertCircle, RefreshCw } from 'lucide-react';

export default function MessageBubble({ message, isOwnMessage, currentUserId, onRetry }) {
    // Safety check for date
    let timeDate = new Date(message.created_at);
    if (isNaN(timeDate)) timeDate = new Date(); // Fallback if invalid

    // Attachment src helper
    const attachSrc = message.local_preview || (message.attachment_path ? `/storage/${message.attachment_path}` : null);

    return (
        <div className={`flex w-full mb-2 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
            <div className={`relative flex flex-col group max-w-[85%] sm:max-w-[70%] ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                {/* Message bubble */}
                <div 
                    className={`relative rounded-2xl px-3 py-2 shadow-sm 
                        ${isOwnMessage 
                            ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-sm' 
                            : 'bg-white border border-gray-100 shadow-sm text-gray-800 rounded-bl-sm'
                        }`}
                >
                    <div className="relative">
                        {/* Attachments */}
                        {attachSrc && (
                            <div className={`mb-1.5 rounded-xl overflow-hidden relative bg-black/5 flex items-center justify-center
                                ${message.message_type === 'file' ? 'w-full' : 'max-w-[260px] sm:max-w-[320px] max-h-[350px]'}`}>
                                
                                {message.message_type === 'image' && (
                                    <div className="relative w-full h-full">
                                        <a href={attachSrc} target="_blank" rel="noreferrer" className="block w-full h-full">
                                            <img
                                                src={attachSrc}
                                                alt="attachment"
                                                className={`w-full h-full object-cover rounded-xl transition-opacity cursor-zoom-in ${message.status === 'sending' ? 'opacity-50' : 'hover:opacity-95'}`}
                                                style={{ maxHeight: '350px' }}
                                            />
                                        </a>
                                        {message.status === 'sending' && (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 text-white rounded-xl backdrop-blur-sm">
                                                <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin mb-2"></div>
                                                <span className="text-[10px] font-bold">{message.upload_progress || 0}%</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {message.message_type === 'video' && (
                                    <div className="relative w-full h-full bg-black rounded-xl flex items-center justify-center group cursor-pointer">
                                        <video 
                                            src={attachSrc} 
                                            controls 
                                            className={`w-full h-full object-contain max-h-[350px] rounded-xl ${message.status === 'sending' ? 'opacity-50 pointer-events-none' : ''}`} 
                                            preload="metadata"
                                        />
                                        {message.status === 'sending' && (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 text-white rounded-xl backdrop-blur-sm pointer-events-none z-10">
                                                <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin mb-2"></div>
                                                <span className="text-[10px] font-bold">{message.upload_progress || 0}%</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {message.message_type === 'file' && (
                                    <a href={attachSrc} target="_blank" rel="noreferrer" download 
                                        className={`flex items-center gap-3 p-3 w-full rounded-xl transition-colors
                                        ${isOwnMessage ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}`}>
                                        <div className={`p-2 rounded-lg ${isOwnMessage ? 'bg-white/20' : 'bg-white shadow-sm'}`}>
                                            <File size={20} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{message.local_preview ? 'Uploading file...' : 'Attachment Document'}</p>
                                            {!message.local_preview && <p className="text-[11px] opacity-80 mt-0.5">{(message.attachment_size / 1024 / 1024).toFixed(2)} MB</p>}
                                        </div>
                                        {!message.local_preview && <Download size={16} className="opacity-70" />}
                                    </a>
                                )}
                            </div>
                        )}

                        {/* Text Body */}
                        {message.body && (
                            <div className="text-[15px] leading-[1.4] whitespace-pre-wrap break-words px-0.5">
                                {message.body}
                                {/* Invisible spacer to prevent time from overlapping text on the last line */}
                                <span className="inline-block w-[70px] h-1" aria-hidden="true"></span>
                            </div>
                        )}

                        {/* Meta footer (Time & Status) positioned at bottom right */}
                        <div className={`absolute bottom-0 right-0 flex items-center gap-1 text-[10px] 
                            ${isOwnMessage ? 'text-blue-100' : 'text-gray-400'}`}>
                            
                            <span className="font-medium">{format(timeDate, 'HH:mm')}</span>
                            
                            {isOwnMessage && (
                                <span className="flex items-center">
                                    {message.status === 'sending' && <Clock size={11} className="opacity-70" />}
                                    {message.status === 'sent'    && <Check size={13} className="opacity-90" />}
                                    {message.status === 'read'    && <CheckCheck size={13} className="text-blue-200 drop-shadow-sm" />}
                                    {message.status === 'failed'  && <AlertCircle size={12} className="text-red-300" />}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Retry button for failed messages */}
                {message.status === 'failed' && (
                    <button
                        onClick={() => onRetry(message)}
                        className={`absolute top-2 lg:opacity-0 group-hover:opacity-100 transition-opacity z-10
                            p-1.5 rounded-full bg-white shadow-md border border-gray-100 hover:bg-gray-50
                            ${isOwnMessage ? '-left-10' : '-right-10'}`}
                        title="Retry send"
                    >
                        <RefreshCw size={14} className="text-red-500" />
                    </button>
                )}
            </div>
        </div>
    );
}
