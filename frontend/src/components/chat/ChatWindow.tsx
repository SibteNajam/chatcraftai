'use client';

import { useState, useEffect, useRef } from 'react';
import { Chat } from '@/types/chat';
import { useAuth } from '@/hooks/auth';
import { useChat } from '@/hooks/useChat';

interface ChatWindowProps {
    chat: Chat;
    onClose: () => void;
}

export default function ChatWindow({ chat, onClose }: ChatWindowProps) {
    const [messageText, setMessageText] = useState('');
    const [isTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { user: currentUser } = useAuth();
    const { messages, loadChatMessages } = useChat();

    const otherUser = chat.participants.find(p => p.user.id !== currentUser?.id)?.user;

    useEffect(() => {
        loadChatMessages(chat.id);
    }, [chat.id, loadChatMessages]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!messageText.trim()) return;
        /// need implementation to send message to backend using websocket
        console.log('Sending message:', messageText);
        setMessageText('');
    };

    const formatMessageTime = (timestamp: string) => {
        return new Date(timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="bg-white shadow rounded-lg flex flex-col h-96">
            {/* Chat Header */}
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center">
                    <div className="h-8 w-8 bg-indigo-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-xs">
                            {otherUser?.displayName.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                            {otherUser?.displayName}
                        </p>
                        <p className="text-xs text-gray-500">
                            {isTyping ? 'Typing...' : 'Online'}
                        </p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                        <p>No messages yet. Start the conversation!</p>
                    </div>
                ) : (
                    messages.map((message) => {
                        const isCurrentUser = message.senderId === currentUser?.id;
                        return (
                            <div
                                key={message.id}
                                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${isCurrentUser
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-gray-200 text-gray-800'
                                        }`}
                                >
                                    <p className="text-sm">{message.content}</p>
                                    <p
                                        className={`text-xs mt-1 ${isCurrentUser ? 'text-indigo-200' : 'text-gray-500'
                                            }`}
                                    >
                                        {formatMessageTime(message.createdAt)}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="border-t border-gray-200 p-4">
                <form onSubmit={handleSendMessage} className="flex space-x-2">
                    <input
                        type="text"
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <button
                        type="submit"
                        disabled={!messageText.trim()}
                        className={`px-4 py-2 rounded-md font-medium ${messageText.trim()
                            ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                    >
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
}