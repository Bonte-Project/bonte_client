import { useEffect, useRef, useState } from 'react';
import { X, Menu } from 'lucide-react';
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

  const [chatSidebarOpen, setChatSidebarOpen] = useState(false);
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
      <div className='flex h-screen overflow-hidden relative'>
        <button
          onClick={() => setChatSidebarOpen(!chatSidebarOpen)}
          className='fixed top-4 left-18 z-50 lg:hidden p-3 rounded-full bg-[#D98A9D] hover:bg-[#c87b8f] text-white transition-all duration-300 active:scale-95 shadow-lg hover:shadow-lg hover:shadow-[#D98A9D]/50'
          aria-label='Toggle chat sidebar'
          title='Open chat contacts'
        >
          <div className='relative w-6 h-6'>
            {chatSidebarOpen ? (
              <X size={24} key='x-icon-chat' className='icon-enter' />
            ) : (
              <Menu size={24} key='menu-icon-chat' className='icon-enter' />
            )}
          </div>
        </button>

        {chatSidebarOpen && (
          <div
            className='fixed inset-0 bg-black/50 z-40 lg:hidden'
            onClick={() => setChatSidebarOpen(false)}
          />
        )}

        <div
          className={`fixed inset-y-0 left-0 z-45 w-80 lg:static lg:z-auto transition-transform duration-300 lg:translate-x-0 pt-20 lg:pt-0 ${
            chatSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <ChatSidebar />
        </div>

        <div className='flex-1 w-full overflow-hidden'>
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
      </div>

      <style>{`
        .icon-enter {
          animation: iconEnter 0.2s ease-in-out;
        }
        @keyframes iconEnter {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </ChatLayout>
  );
};
