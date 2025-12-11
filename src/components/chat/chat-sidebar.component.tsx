import { Search, MessageSquare, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useChatListStore } from '@/store/chats-list.store';
import { useTrainerMessagesStore } from '@/store/trainer-messages.store';
import { useAuthStore } from '@/store/auth.store';
import { useUserStore } from '@/store/user.store';
import { useTrainerStore } from '@/store/trainer.store';
import type { ChatContact } from '@/types/chat.types';
import { useEffect, useState } from 'react';

export const ChatSidebar = () => {
  const { chats, selectedChatId, selectChat } = useChatListStore();
  const {
    chatPartnerIds,
    currentChatId: selectedTrainerChatId,
    setCurrentChat: setTrainerChat,
  } = useTrainerMessagesStore();
  const { user } = useAuthStore();
  const { getUserById } = useUserStore();
  const { getTrainerById } = useTrainerStore();

  const [trainerChats, setTrainerChats] = useState<ChatContact[]>([]);
  const [loadingTrainerChats, setLoadingTrainerChats] = useState(false);

  useEffect(() => {
    const loadTrainerChats = async () => {
      if (!chatPartnerIds.length) return;

      setLoadingTrainerChats(true);
      const loaded: ChatContact[] = [];

      for (const partnerId of chatPartnerIds) {
        try {
          if (user?.role === 'user') {
            const trainer = await getTrainerById(partnerId);
            if (trainer) {
              const trainerUser = await getUserById(trainer.userId);
              loaded.push({
                id: trainer.id,
                type: 'trainer',
                name: trainerUser?.fullName || 'Unknown Trainer',
                avatar: trainerUser?.avatarUrl || undefined,
                status: 'online',
                lastMessage: 'Click to view messages', // Добавляем дефолтное сообщение
              });
            }
          } else if (user?.role === 'trainer') {
            const partner = await getUserById(partnerId);
            if (partner) {
              loaded.push({
                id: partner.id,
                type: 'human',
                name: partner.fullName,
                avatar: partner.avatarUrl,
                status: 'online',
                lastMessage: 'Click to view messages', // Добавляем дефолтное сообщение
              });
            }
          }
        } catch (error) {
          console.error('Failed to load chat partner:', error);
        }
      }

      setTrainerChats(loaded);
      setLoadingTrainerChats(false);
    };

    loadTrainerChats();
  }, [chatPartnerIds, user?.role, getTrainerById, getUserById]);

  const renderAvatar = (contact: ChatContact) => {
    if (contact.type === 'ai') {
      return (
        <div className='w-12 h-12 rounded-full bg-gradient-to-br from-[#D98A9D] to-[#ec1380] flex items-center justify-center text-2xl'>
          <MessageSquare className='w-6 h-6 text-white' />
        </div>
      );
    }
    if (contact.avatar) {
      return (
        <img
          src={contact.avatar}
          alt={contact.name}
          className='w-12 h-12 rounded-full object-cover'
        />
      );
    }
    return (
      <div className='w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center'>
        <User className='w-6 h-6 text-white' />
      </div>
    );
  };

  const handleSelectChat = (contact: ChatContact) => {
    if (contact.type === 'ai') {
      selectChat(contact.id);
      setTrainerChat(null);
    } else {
      selectChat(null as any);
      setTrainerChat(contact.id);
    }
  };

  const isTrainerChatSelected = (contact: ChatContact) => {
    return contact.type !== 'ai' && contact.id === selectedTrainerChatId;
  };

  const isAiChatSelected = (contact: ChatContact) => {
    return contact.type === 'ai' && contact.id === selectedChatId;
  };

  const allChats = user?.role === 'trainer' ? trainerChats : [...chats, ...trainerChats];

  return (
    <div className='w-80 bg-[#1a0F16] border-r border-white/10 flex flex-col h-full'>
      <div className='p-4 border-b border-white/10'>
        <div className='relative'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500' />
          <Input
            placeholder='Search contacts...'
            className='pl-10 bg-[#322840]/60 border-white/10 text-white placeholder:text-gray-500'
          />
        </div>
      </div>

      <div className='flex-1 overflow-y-auto'>
        {loadingTrainerChats ? (
          <div className='p-4 text-center text-gray-400 text-sm'>Loading chats...</div>
        ) : allChats.length === 0 ? (
          <div className='p-4 text-center text-gray-400 text-sm'>No chats yet</div>
        ) : (
          allChats.map(contact => (
            <button
              key={contact.id}
              onClick={() => handleSelectChat(contact)}
              className={`w-full p-4 flex items-center gap-3 transition-colors ${
                isAiChatSelected(contact) || isTrainerChatSelected(contact)
                  ? 'bg-[#D98A9D]/20 border-l-4 border-[#D98A9D]'
                  : 'hover:bg-white/5 border-l-4 border-transparent'
              }`}
            >
              <div className='relative flex-shrink-0'>
                {renderAvatar(contact)}
                {contact.status === 'online' && (
                  <div className='absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#1a0F16] rounded-full'></div>
                )}
              </div>

              <div className='flex-1 text-left min-w-0'>
                <div className='flex items-center justify-between mb-1'>
                  <h3 className='text-white font-medium text-sm truncate'>{contact.name}</h3>
                </div>
                <p className='text-xs text-gray-400 truncate'>
                  {contact.lastMessage || 'Start conversation'}
                </p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};
