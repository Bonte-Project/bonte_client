import type { ChatContact } from '@/types/chat.types';
import { create } from 'zustand';

interface ChatListStore {
  chats: ChatContact[];
  selectedChatId: string | null;
  isLoading: boolean;

  fetchChats: () => void;
  selectChat: (id: string) => void;
  getSelectedChat: () => ChatContact | undefined;
}

export const useChatListStore = create<ChatListStore>((set, get) => ({
  chats: [],
  selectedChatId: null,
  isLoading: false,

  fetchChats: () => {
    set({ isLoading: true });

    const aiChat: ChatContact = {
      id: 'ai-assistant',
      type: 'ai',
      name: 'Bonté AI Assistant',
      status: 'online',
      avatar: '🤖',
      lastMessage: 'Ready to assist...',
    };

    try {
      const userChats: ChatContact[] = [];

      set({
        chats: [aiChat, ...userChats],
        selectedChatId: get().selectedChatId || aiChat.id,
      });
    } catch (error) {
      console.error('Failed to fetch chat list', error);
      set({ chats: [aiChat] });
    } finally {
      set({ isLoading: false });
    }
  },

  selectChat: (id: string) => set({ selectedChatId: id }),

  getSelectedChat: () => {
    const { chats, selectedChatId } = get();
    return chats.find(c => c.id === selectedChatId);
  },
}));
