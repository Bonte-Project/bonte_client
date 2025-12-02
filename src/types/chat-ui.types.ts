export type ChatType = 'ai' | 'human' | 'group';

export interface ChatContact {
  id: string;
  type: ChatType;
  name: string;
  avatar?: string;
  status: 'online' | 'offline' | 'typing';
  lastMessage?: string;
  lastSeen?: string;
}

export interface UIMessage {
  id: string | number;
  message: string;
  sentAt: string;
  sender: 'me' | 'partner';
  status?: 'sending' | 'sent' | 'error';
  isTyping?: boolean;
}
