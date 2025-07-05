'use client';

import { useEffect } from 'react';
import { useChat } from '@/hooks/useChat';
import { User } from '@/types/chat';

interface UserListProps {
    onUserSelect: (user: User) => void;
}
export default function UserList({ onUserSelect }: UserListProps) {
    const { users, isLoading, error, loadUsers } = useChat();

    useEffect(() => {
        loadUsers();
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-800">Error loading users: {error}</p>
            </div>
        );
    }

    return (
        <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Available Users
                </h3>
                <div className="space-y-3">
                    {users.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No other users found</p>
                    ) : (
                        users.map((user) => (
                            <div
                                key={user.id}
                                onClick={() => onUserSelect(user)}
                                className="flex items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
                            >
                                <div className="flex-shrink-0">
                                    <div className="h-10 w-10 bg-indigo-500 rounded-full flex items-center justify-center">
                                        <span className="text-white font-medium text-sm">
                                            {user.displayName.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                                <div className="ml-3 flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {user.displayName}
                                    </p>
                                    <p className="text-sm text-gray-500 truncate">
                                        {user.email}
                                    </p>
                                </div>
                                <div className="flex-shrink-0">
                                    <svg
                                        className="h-5 w-5 text-gray-400"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                        />
                                    </svg>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}