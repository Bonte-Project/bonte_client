export interface ChatContact {
  id: string;
  type: 'ai' | 'trainer' | 'human';
  name: string;
  avatar: string;
  status: 'online' | 'offline' | 'typing';
  lastMessage?: string;
  lastSeen?: string;
}

export interface GenericMessage {
  id: string | number;
  message: string;
  sentAt: string;
  sender: 'me' | 'partner';
  status?: 'sending' | 'sent' | 'error';
  isTyping?: boolean;
}
