import { create } from 'zustand';
import { ApiError, apiRequest } from '@/api/client';
import type {
  TrainerMessage,
  GetMessagesResponse,
  SendMessageRequest,
  SendMessageResponse,
  PollNewMessageResponse,
  GetChatsListResponse,
  TrainerMessagesState,
} from '@/types/trainer-messages.types';
import { useAuthStore } from '@/store/auth.store';

interface TrainerMessagesStore extends TrainerMessagesState {
  messagesByChat: Record<string, TrainerMessage[]>;
  getChatsListIds: () => Promise<void>;
  getMessagesWith: (partnerId: string) => Promise<void>;
  sendMessage: (partnerId: string, messageText: string) => Promise<void>;
  sendFirstMessage: (partnerId: string, messageText: string) => Promise<boolean>;
  startPolling: () => void;
  stopPolling: () => void;
  setCurrentChat: (partnerId: string | null) => void;
  clearError: () => void;
  resetMessages: () => void;
}

export const useTrainerMessagesStore = create<TrainerMessagesStore>((set, get) => ({
  messages: [],
  messagesByChat: {},
  chatPartnerIds: [],
  isLoading: false,
  isSending: false,
  isPolling: false,
  error: null,
  currentChatId: null,
  pollingAbortController: null,

  getChatsListIds: async () => {
    set({ isLoading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      const response = await apiRequest<GetChatsListResponse>('/trainer-messages/chats/list', {
        headers: { Authorization: `Bearer ${token}` },
      });

      set({
        chatPartnerIds: response.data || [],
        isLoading: false,
      });
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Failed to fetch chat list';
      set({ error: message, isLoading: false });
    }
  },

  getMessagesWith: async (partnerId: string) => {
    set({ isLoading: true, error: null, currentChatId: partnerId });
    try {
      const token = localStorage.getItem('token');
      const response = await apiRequest<GetMessagesResponse>(`/trainer-messages/${partnerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      set(state => ({
        messagesByChat: {
          ...state.messagesByChat,
          [partnerId]: response.data || [],
        },
        messages: response.data || [],
        isLoading: false,
      }));
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Failed to fetch messages';
      set({ error: message, isLoading: false });
    }
  },

  sendMessage: async (partnerId: string, messageText: string) => {
    if (!messageText.trim() || get().isSending) return;

    const user = useAuthStore.getState().user;
    if (!user) return;

    const isUserToTrainer = user.role === 'user';

    const tempMessageId = `temp-${Date.now()}`;
    const optimisticMessage: TrainerMessage = {
      id: tempMessageId,
      user_id: isUserToTrainer ? user.id : partnerId,
      trainer_id: isUserToTrainer ? partnerId : user.id,
      message: messageText,
      sent_at: new Date().toISOString(),
      to_from: isUserToTrainer,
    };

    set(state => ({
      messagesByChat: {
        ...state.messagesByChat,
        [partnerId]: [...(state.messagesByChat[partnerId] || []), optimisticMessage],
      },
      messages: [...state.messages, optimisticMessage],
      isSending: true,
      error: null,
    }));

    try {
      const token = localStorage.getItem('token');
      const payload: SendMessageRequest = {
        message: messageText,
        to_from: isUserToTrainer,
      };

      const response = await apiRequest<SendMessageResponse>(`/trainer-messages/${partnerId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      set(state => ({
        messagesByChat: {
          ...state.messagesByChat,
          [partnerId]: state.messagesByChat[partnerId].map(msg =>
            msg.id === tempMessageId ? response.data : msg
          ),
        },
        messages: state.messages.map(msg => (msg.id === tempMessageId ? response.data : msg)),
        isSending: false,
      }));
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Failed to send message';

      set(state => ({
        messagesByChat: {
          ...state.messagesByChat,
          [partnerId]: state.messagesByChat[partnerId].filter(msg => msg.id !== tempMessageId),
        },
        messages: state.messages.filter(msg => msg.id !== tempMessageId),
        error: message,
        isSending: false,
      }));
    }
  },

  sendFirstMessage: async (partnerId: string, messageText: string) => {
    if (!messageText.trim()) return false;

    const user = useAuthStore.getState().user;
    if (!user) return false;

    set({ isSending: true, error: null });

    try {
      const token = localStorage.getItem('token');
      const isUserToTrainer = user.role === 'user';

      const payload: SendMessageRequest = {
        message: messageText,
        to_from: isUserToTrainer,
      };

      const response = await apiRequest<SendMessageResponse>(`/trainer-messages/${partnerId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      set(state => ({
        messagesByChat: {
          ...state.messagesByChat,
          [partnerId]: [response.data],
        },
        chatPartnerIds: [...new Set([...state.chatPartnerIds, partnerId])],
        currentChatId: partnerId,
        isSending: false,
      }));

      return true;
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Failed to send message';
      set({ error: message, isSending: false });
      return false;
    }
  },

  startPolling: () => {
    const currentAbort = get().pollingAbortController;
    if (currentAbort) {
      currentAbort.abort();
    }

    const abortController = new AbortController();
    set({
      isPolling: true,
      pollingAbortController: abortController,
    });

    const poll = async () => {
      if (abortController.signal.aborted) {
        set({ isPolling: false });
        return;
      }

      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_API_URL}/trainer-messages/poll/new`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          signal: abortController.signal,
        });

        if (response.status === 204) {
          if (!abortController.signal.aborted) {
            setTimeout(() => poll(), 0);
          }
          return;
        }

        if (response.ok) {
          const newMessage: PollNewMessageResponse = await response.json();
          const { currentChatId, chatPartnerIds } = get();
          const user = useAuthStore.getState().user;

          if (!user) return;

          const partnerId = user.role === 'user' ? newMessage.trainer_id : newMessage.user_id;

          set(state => {
            const updated = { ...state };

            updated.messagesByChat = {
              ...state.messagesByChat,
              [partnerId]: [
                ...(state.messagesByChat[partnerId] || []),
                newMessage as TrainerMessage,
              ],
            };

            if (!chatPartnerIds.includes(partnerId)) {
              updated.chatPartnerIds = [...chatPartnerIds, partnerId];
            }

            if (partnerId === currentChatId) {
              updated.messages = [...state.messages, newMessage as TrainerMessage];
            }

            return updated;
          });

          if (!abortController.signal.aborted) {
            setTimeout(() => poll(), 0);
          }
        } else {
          const errorData = await response.json();
          throw new ApiError(response.status, errorData.message || 'Polling failed');
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          set({ isPolling: false });
          return;
        }

        console.error('Polling error:', error);
        set({ isPolling: false });

        setTimeout(() => {
          if (!abortController.signal.aborted) {
            poll();
          }
        }, 5000);
      }
    };

    poll();
  },

  stopPolling: () => {
    const abortController = get().pollingAbortController;
    if (abortController) {
      abortController.abort();
      set({
        isPolling: false,
        pollingAbortController: null,
      });
    }
  },

  setCurrentChat: (partnerId: string | null) => {
    set(state => {
      const updated: Partial<TrainerMessagesStore> = { currentChatId: partnerId };

      if (partnerId) {
        updated.messages = state.messagesByChat[partnerId] || [];
      }

      return updated;
    });
  },

  clearError: () => set({ error: null }),

  resetMessages: () =>
    set({
      messages: [],
      messagesByChat: {},
      chatPartnerIds: [],
      isPolling: false,
      error: null,
      currentChatId: null,
    }),
}));
