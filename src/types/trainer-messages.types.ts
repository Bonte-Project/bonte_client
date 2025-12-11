export interface TrainerMessage {
  id: string;
  user_id: string;
  trainer_id: string;
  message: string;
  sent_at: string;
  to_from: boolean;
}

export interface GetMessagesResponse {
  message: string;
  data: TrainerMessage[];
}

export interface SendMessageRequest {
  message: string;
  to_from: boolean;
}

export interface SendMessageResponse {
  message: string;
  data: TrainerMessage;
}

export interface PollNewMessageResponse {
  id: string;
  user_id: string;
  trainer_id: string;
  message: string;
  sent_at: string;
  to_from: boolean;
}

export interface GetChatsListResponse {
  message: string;
  data: string[];
}

export interface TrainerMessagesState {
  messages: TrainerMessage[];
  chatPartnerIds: string[];
  isLoading: boolean;
  isSending: boolean;
  isPolling: boolean;
  error: string | null;
  currentChatId: string | null;
  pollingAbortController: AbortController | null;
}

export interface TrainerChatContact {
  id: string;
  name: string;
  avatar?: string;
  lastMessage?: string;
  lastSeen?: string;
}
