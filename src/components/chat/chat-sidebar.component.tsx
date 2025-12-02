import { Search, MessageSquare, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useChatListStore } from '@/store/chats-list.store';
import type { ChatContact } from '@/types/chat.types';

export const ChatSidebar = () => {
  const { chats, selectedChatId, selectChat } = useChatListStore();

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
        {chats.map(contact => (
          <button
            key={contact.id}
            onClick={() => selectChat(contact.id)}
            className={`w-full p-4 flex items-center gap-3 transition-colors ${
              selectedChatId === contact.id
                ? 'bg-[#D98A9D]/20 border-l-4 border-[#D98A9D]'
                : 'hover:bg-white/5 border-l-4 border-transparent'
            }`}
          >
            <div className='relative'>
              {renderAvatar(contact)}
              {contact.status === 'online' && (
                <div className='absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#1a0F16] rounded-full'></div>
              )}
            </div>

            <div className='flex-1 text-left min-w-0'>
              <div className='flex items-center justify-between mb-1'>
                <h3 className='text-white font-medium text-sm truncate'>{contact.name}</h3>
              </div>
              <p className='text-xs text-gray-400 truncate'>{contact.lastMessage}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
