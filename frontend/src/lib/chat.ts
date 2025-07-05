
import { User } from '@/types/chat';
import { Chat, Message } from '@/types/chat';
const API_BASE_URL = 'http://localhost:3001';

export async function getUsers(): Promise<User[]> {
    const response = await fetch(`${API_BASE_URL}/api/users`, {
        credentials: 'include',
    });

    if (!response.ok) {
        throw new Error('Failed to fetch users');
    }

    return response.json();
}

export async function initializeChat(receiverId: string): Promise<Chat> {
    const response = await fetch(`${API_BASE_URL}/api/chat/start`, {
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
    const response = await fetch(`${API_BASE_URL}/api/chat/${chatId}/messages`, {
        credentials: 'include',
    });

    if (!response.ok) {
        throw new Error('Failed to fetch messages');
    }

    return response.json();
}

export async function getUserChats(): Promise<Chat[]> {
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
        credentials: 'include',
    });

    if (!response.ok) {
        throw new Error('Failed to fetch chats');
    }

    return response.json();
}
