import { create } from 'zustand';
import { ApiError, apiRequest } from '@/api/client';
import type {
  AiChatState,
  AiChatHistoryResponse,
  AiSendMessageResponse,
} from '@/types/ai-chat.types';

interface Message {
  id: string | number;
  message: string;
  sentAt: string;
  sender: 'user' | 'ai';
  index: number;
  status?: 'sending' | 'sent' | 'error';
  isOptimistic?: boolean;
}

interface AiChatStore extends AiChatState {
  messages: Message[];
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  hasConversation: boolean;

  createAiConversation: () => Promise<void>;
  getVisibleHistory: () => Promise<void>;
  sendAiMessage: (messageText: string) => Promise<void>;
  clearError: () => void;
  resetChat: () => void;
}

export const useAiChatStore = create<AiChatStore>((set, get) => ({
  messages: [],
  isLoading: false,
  isSending: false,
  error: null,
  hasConversation: false,

  createAiConversation: async () => {
    set({ isLoading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      await apiRequest('/ai/create-chat', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: 'Health Chat' }),
      });

      set({ hasConversation: true });
      await get().getVisibleHistory();
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        set({ hasConversation: true });
        await get().getVisibleHistory();
      } else {
        const message = error instanceof ApiError ? error.message : 'Failed to create conversation';
        set({ error: message, isLoading: false });
      }
    }
  },

  getVisibleHistory: async () => {
    set({ isLoading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      const response = await apiRequest<AiChatHistoryResponse>('/ai/chat/visible-history', {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });

      set({
        messages: response.messages || [],
        hasConversation: true,
        isLoading: false,
      });
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Failed to fetch messages';
      set({ error: message, isLoading: false });
    }
  },

  sendAiMessage: async (messageText: string) => {
    if (!messageText.trim() || get().isSending) return;

    const tempUserId = `temp-${Date.now()}`;
    const tempAiId = `temp-ai-${Date.now()}`;

    const optimisticUserMessage: Message = {
      id: tempUserId,
      message: messageText,
      sentAt: new Date().toISOString(),
      sender: 'user',
      index: get().messages.length,
      status: 'sending',
      isOptimistic: true,
    };

    const optimisticAiMessage: Message = {
      id: tempAiId,
      message: '',
      sentAt: new Date().toISOString(),
      sender: 'ai',
      index: get().messages.length + 1,
      status: 'sending',
      isOptimistic: true,
    };

    set(state => ({
      messages: [...state.messages, optimisticUserMessage, optimisticAiMessage],
      isSending: true,
      error: null,
    }));

    try {
      const token = localStorage.getItem('token');
      const response = await apiRequest<AiSendMessageResponse>('/ai/send-message', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: messageText }),
      });

      const { userMessage, aiResponse } = response;

      set(state => ({
        messages: state.messages.map(msg => {
          if (msg.id === tempUserId) {
            return {
              ...userMessage,
              sender: 'user' as const,
              status: 'sent' as const,
              isOptimistic: false,
            };
          }
          if (msg.id === tempAiId) {
            return {
              ...aiResponse,
              sender: 'ai' as const,
              status: 'sent' as const,
              isOptimistic: false,
            };
          }
          return msg;
        }),
        isSending: false,
      }));
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Failed to send message';

      set(state => ({
        messages: state.messages.map(msg => {
          if (msg.id === tempUserId || msg.id === tempAiId) {
            return { ...msg, status: 'error' as const };
          }
          return msg;
        }),
        error: message,
        isSending: false,
      }));
    }
  },

  clearError: () => set({ error: null }),

  resetChat: () =>
    set({
      messages: [],
      hasConversation: false,
      error: null,
    }),
}));
