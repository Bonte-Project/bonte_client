export interface AiMessage {
  id: string | number;
  message: string;
  sentAt: string;
  sender: 'user' | 'ai';
  index: number;
  status?: 'sending' | 'sent' | 'error';
  isOptimistic?: boolean;
}

export interface AiChatHistoryResponse {
  messages: AiMessage[];
}

export interface AiSendMessageResponse {
  message: string;
  userMessage: {
    id: string;
    message: string;
    sentAt: string;
    toFrom: boolean;
    index: number;
  };
  aiResponse: {
    id: string;
    message: string;
    sentAt: string;
    toFrom: boolean;
    index: number;
  };
}

export interface AiChatState {
  messages: AiMessage[];
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  hasConversation: boolean;
}
