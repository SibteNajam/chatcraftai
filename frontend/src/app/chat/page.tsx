'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/auth';
import ChatLayout from '@/components/chat/ChatLayout';

export default function ChatPage() {
    const { isAuthenticated, isLoading, fetchCurrentUser } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            //commented for now to check check chat page through url becauses backend is not ready
            // router.push('/login');
        }
    }, [isAuthenticated, isLoading, router]);
    //fetch users on load page 
    useEffect(() => {
        if (!isAuthenticated && !isLoading) {
            fetchCurrentUser();
        }
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null; // Will redirect to login
    }

    return <ChatLayout />;
}