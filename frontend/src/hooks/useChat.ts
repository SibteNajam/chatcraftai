import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { fetchUsers, startChat, fetchChatMessages, fetchUserChats, setActiveChat, addMessage, clearError, clearActiveChat } from '@/store/chatSlice';
import { User, Chat, Message } from '@/types/chat';

export const useChat = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { users, chats, activeChat, messages, isLoading, error } = useSelector((state: RootState) => state.chat);

    const loadUsers = async () => {
        return dispatch(fetchUsers());
    };

    const initializeChat = async (receiverId: string) => {
        return dispatch(startChat(receiverId));
    };

    const loadChatMessages = async (chatId: string) => {
        return dispatch(fetchChatMessages(chatId));
    };

    const loadUserChats = async () => {
        return dispatch(fetchUserChats());
    };

    const selectChat = (chat: Chat) => {
        dispatch(setActiveChat(chat));
    };

    const addNewMessage = (message: Message) => {
        dispatch(addMessage(message));
    };

    const clearChatError = () => {
        dispatch(clearError());
    };

    const closeChat = () => {
        dispatch(clearActiveChat());
    };

    return {
        users,
        chats,
        activeChat,
        messages,
        isLoading,
        error,
        loadUsers,
        initializeChat,
        loadChatMessages,
        loadUserChats,
        selectChat,
        addNewMessage,
        clearChatError,
        closeChat,
    };
};