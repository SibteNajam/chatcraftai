
import { User } from '@/types/chat';
import { Chat, Message } from '@/types/chat';
const API_BASE_URL = 'http://localhost:3001';

export async function getUsers(): Promise<User[]> {
    const response = await fetch('http://localhost:3000/user', {
        credentials: 'include',
    });

    console.log('🔍 Users response status:', response.status);

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        console.error('🔍 Users fetch error:', error);
        throw new Error(error.message || 'Failed to fetch users');
    }

    const data = await response.json();
    console.log('🔍 Raw users response:', data);

    // Handle the backend response structure
    if (data.status === 'Success' && data.data && data.data.users) {
        console.log(' Extracted users:', data.data.users);
        return data.data.users;
    } else {
        console.error('Unexpected users response structure:', data);
        throw new Error('Unexpected response structure');
    }
}

export async function initializeChat(receiverId: string): Promise<Chat> {
    const response = await fetch(`${API_BASE_URL}/chat/start`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ receiverId }),
    });

    if (!response.ok) {
        throw new Error('Failed to start chat');
    }

    return response.json();
}

export async function getChatMessages(chatId: string): Promise<Message[]> {
    const response = await fetch(`${API_BASE_URL}/chat/${chatId}/messages`, {
        credentials: 'include',
    });

    if (!response.ok) {
        throw new Error('Failed to fetch messages');
    }

    return response.json();
}

export async function getUserChats(): Promise<Chat[]> {
    const response = await fetch(`${API_BASE_URL}/chat`, {
        credentials: 'include',
    });

    if (!response.ok) {
        throw new Error('Failed to fetch chats');
    }

    return response.json();
}
