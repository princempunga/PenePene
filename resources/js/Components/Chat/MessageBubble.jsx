import React from 'react';
import { format } from 'date-fns';
import { Check, CheckCheck, Ban, File, Download } from 'lucide-react';

export default function MessageBubble({ message, isOwnMessage, onEdit, onDelete }) {
    const time = new Date(message.created_at);
    
    return (
        <div className={`flex w-full mb-4 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] md:max-w-[60%] rounded-2xl px-4 py-2 shadow-sm relative group ${
                isOwnMessage 
                    ? 'bg-blue-600 text-white rounded-br-sm' 
                    : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm'
            }`}>
                
                {/* Deleted Message */}
                {message.is_deleted ? (
                    <div className="flex items-center gap-2 italic opacity-70">
                        <Ban size={14} />
                        <span className="text-sm">This message was deleted</span>
                    </div>
                ) : (
                    <>
                        {/* Attachments */}
                        {message.attachment_path && (
                            <div className="mb-2 mt-1 rounded-xl overflow-hidden bg-black/5">
                                {message.message_type === 'image' && (
                                    <a href={`/storage/${message.attachment_path}`} target="_blank" rel="noreferrer">
                                        <img src={`/storage/${message.attachment_path}`} alt="attachment" className="w-full max-h-64 object-cover hover:opacity-90 transition-opacity cursor-zoom-in" />
                                    </a>
                                )}
                                {message.message_type === 'video' && (
                                    <video src={`/storage/${message.attachment_path}`} controls className="w-full max-h-64 object-contain bg-black rounded-lg" />
                                )}
                                {message.message_type === 'file' && (
                                    <a href={`/storage/${message.attachment_path}`} target="_blank" rel="noreferrer" download className={`flex items-center gap-3 p-3 rounded-lg ${isOwnMessage ? 'bg-blue-700/50 hover:bg-blue-700/70' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}>
                                        <File size={24} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">Attachment</p>
                                            <p className="text-xs opacity-70">{(message.attachment_size / 1024 / 1024).toFixed(2)} MB</p>
                                        </div>
                                        <Download size={18} />
                                    </a>
                                )}
                            </div>
                        )}

                        {/* Text Body */}
                        {message.body && (
                            <p className="text-sm whitespace-pre-wrap break-words">{message.body}</p>
                        )}
                    </>
                )}

                {/* Meta footer */}
                <div className={`flex items-center justify-end gap-1.5 mt-1 text-[10px] ${isOwnMessage ? 'text-blue-100' : 'text-gray-400'}`}>
                    {message.is_edited && !message.is_deleted && (
                        <span className="italic mr-1">(edited)</span>
                    )}
                    <span>{format(time, 'HH:mm')}</span>
                    {isOwnMessage && (
                        <span>
                            {message.is_read ? <CheckCheck size={14} className="text-blue-200" /> : <Check size={14} />}
                        </span>
                    )}
                </div>

                {/* Hover Actions */}
                {isOwnMessage && !message.is_deleted && (
                    <div className="absolute top-2 -left-16 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
                        {!message.attachment_path && ( // Only allow editing text messages
                            <button onClick={() => onEdit(message)} className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full shadow-sm text-xs" title="Edit">
                                ✎
                            </button>
                        )}
                        <button onClick={() => onDelete(message)} className="p-1.5 bg-red-100 hover:bg-red-200 text-red-600 rounded-full shadow-sm text-xs" title="Delete">
                            ✕
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
