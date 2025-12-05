import { useEffect, useRef } from 'react';
import { useAiChatStore } from '@/store/ai-chat.store';
import ChatLayout from '@/components/chat-layout.component';
import { ChatSidebar } from '@/components/chat/chat-sidebar.component';
import { useChatListStore } from '@/store/chats-list.store';
import { useTrainerMessagesStore } from '@/store/trainer-messages.store';
import { useAuthStore } from '@/store/auth.store';
import { AiChatContainer } from '@/components/chat/ai-chat-container.component';
import { TrainerMessagesContainer } from '@/components/chat/trainer-messages-container.component';

export const ChatPage = () => {
  const { fetchChats, getSelectedChat } = useChatListStore();
  const { createAiConversation } = useAiChatStore();
  const { getChatsListIds, currentChatId: selectedTrainerChatId } = useTrainerMessagesStore();
  const { user } = useAuthStore();

  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      getChatsListIds().catch(console.error);

      if (user?.role === 'user') {
        fetchChats();
        createAiConversation().catch(console.error);
      }
    }
  }, [fetchChats, createAiConversation, getChatsListIds, user?.role]);

  const selectedChat = getSelectedChat();

  return (
    <ChatLayout>
      <div className='flex h-screen overflow-hidden'>
        <ChatSidebar />

        {selectedTrainerChatId ? (
          <TrainerMessagesContainer partnerId={selectedTrainerChatId} />
        ) : selectedChat?.type === 'ai' ? (
          <AiChatContainer />
        ) : selectedChat?.type === 'human' ? (
          <div className='flex-1 flex items-center justify-center text-white bg-[#1e1416]'>
            <div className='text-center'>
              <h3 className='text-xl'>Chat with {selectedChat.name}</h3>
              <p className='text-gray-500'>Coming soon...</p>
            </div>
          </div>
        ) : (
          <div className='flex-1 bg-[#1e1416] flex items-center justify-center text-gray-500'>
            Select a chat to start messaging
          </div>
        )}
      </div>
    </ChatLayout>
  );
};
