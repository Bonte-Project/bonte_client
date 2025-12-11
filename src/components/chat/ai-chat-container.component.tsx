import { useAiChatStore } from '@/store/ai-chat.store';
import type { UIMessage } from '@/types/chat-ui.types';
import { Bot } from 'lucide-react';
import { ChatWindow } from './chat-window.component';

export const AiChatContainer = () => {
  const { messages, isLoading, isSending, sendAiMessage } = useAiChatStore();

  const uiMessages: UIMessage[] = messages.map(msg => ({
    id: msg.id,
    message: msg.message,
    sentAt: msg.sentAt,
    sender: msg.sender === 'user' ? 'me' : 'partner',
    status: msg.status,
    isTyping: msg.isOptimistic && msg.sender === 'ai' && !msg.message,
  }));

  return (
    <ChatWindow
      title='Bonté AI Assistant'
      status='Online'
      messages={uiMessages}
      isLoading={isLoading}
      isSending={isSending}
      onSendMessage={sendAiMessage}
      partnerAvatar={<Bot className='w-7 h-7 text-white' />}
    />
  );
};
