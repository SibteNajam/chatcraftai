
import { User } from '@/types/chat';
import { Chat, Message } from '@/types/chat';
import TokenStorage from './tokenStorage';
const API_BASE_URL = 'http://localhost:3000';

// Helper function to get headers with auth token
const getAuthHeaders = () => {
    const token = TokenStorage.getAccessToken();
    return {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
    };
};

export async function getUsers(): Promise<User[]> {
    const response = await fetch('http://localhost:3000/user', {
        credentials: 'include',
        headers: getAuthHeaders(),
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

export const getOrCreateChat = async (fromUserId: string, toUserId: string) => {
    try {
        const response = await fetch(`${API_BASE_URL}/chat/${fromUserId}/${toUserId}`, {
            method: 'POST',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to create/get chat: ${response.statusText} - ${errorText}`);
        }

        const result = await response.json();
        console.log('✅ API: Chat created/retrieved:', result);
        const chat = result.data.data;
        return chat;
    } catch (error) {
        console.error('❌ API: Error creating/getting chat:', error);
        throw error;
    }
};


// export async function initializeChat(receiverId: string): Promise<Chat> {
//     const response = await fetch(`${API_BASE_URL}/chat/start`, {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//         },
//         credentials: 'include',
//         body: JSON.stringify({ receiverId }),
//     });

//     if (!response.ok) {
//         throw new Error('Failed to start chat');
//     }

//     return response.json();
// }

export const getChatMessages = async (chatId: string) => {
    try {
        console.log('🔄 API: Getting messages for chat:', chatId);

        const response = await fetch(`${API_BASE_URL}/chat/chat/${chatId}/chat-messages`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error(`Failed to get chat messages: ${response.statusText}`);
        }

        const messages = await response.json();
        console.log('✅ API: Messages retrieved:', messages);
        return messages;
    } catch (error) {
        console.error('❌ API: Error getting chat messages:', error);
        throw error;
    }
};
export async function getUserChats(): Promise<Chat[]> {
    const response = await fetch(`${API_BASE_URL}/chat`, {
        credentials: 'include',
    });

    if (!response.ok) {
        throw new Error('Failed to fetch chats');
    }

    return response.json();
}
