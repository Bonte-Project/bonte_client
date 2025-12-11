import { useEffect, useRef, useState } from 'react';
import { Send, User, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import Markdown from 'markdown-to-jsx';
import { MarkdownComponents } from './markdown.component';
import { format } from 'date-fns';
import type { TrainerMessage } from '@/types/trainer-messages.types';
import { useAuthStore } from '@/store/auth.store';
import { Link } from '@tanstack/react-router';
import { TrainingSessionModal } from '@/components/trainer-profile/training-session-modal.component';

interface TrainerMessagesWindowProps {
  partnerId: string;
  partnerName: string;
  partnerAvatar?: string;
  messages: TrainerMessage[];
  isLoading: boolean;
  isSending: boolean;
  onSendMessage: (text: string) => void;
}

export const TrainerMessagesWindow = ({
  partnerId,
  partnerName,
  partnerAvatar,
  messages,
  isLoading,
  isSending,
  onSendMessage,
}: TrainerMessagesWindowProps) => {
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user: currentUser } = useAuthStore();

  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!inputMessage.trim() || isSending) return;
    onSendMessage(inputMessage);
    setInputMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isMessageFromMe = (msg: TrainerMessage) => {
    if (currentUser?.role === 'user') {
      return msg.to_from === true;
    } else if (currentUser?.role === 'trainer') {
      return msg.to_from === false;
    }
    return false;
  };

  const getMessageAvatar = (msg: TrainerMessage) => {
    if (isMessageFromMe(msg)) {
      return currentUser?.avatarUrl;
    } else {
      return partnerAvatar;
    }
  };

  const isTrainer = currentUser?.role === 'trainer';

  return (
    <div className='flex-1 flex flex-col h-full bg-[#1e1416] overflow-hidden'>
      <div className='h-20 bg-[#1a0F16] border-b border-white/10 flex items-center justify-between flex-shrink-0 px-30'>
        <div className='flex items-center gap-4 flex-1 min-w-0'>
          {isTrainer ? (
            <Link
              to='/user/$id'
              params={{ id: partnerId }}
              className='block flex items-center gap-4'
            >
              <div className='w-12 h-12 rounded-full bg-gradient-to-br from-[#D98A9D] to-[#ec1380] flex items-center justify-center overflow-hidden flex-shrink-0'>
                {partnerAvatar ? (
                  <img
                    src={partnerAvatar}
                    alt={partnerName}
                    className='w-full h-full object-cover'
                  />
                ) : (
                  <User className='w-7 h-7 text-white' />
                )}
              </div>
              <div className='min-w-0'>
                <h2 className='text-white font-semibold text-lg truncate'>{partnerName}</h2>
                <p className='text-green-400 text-sm'>Online</p>
              </div>
            </Link>
          ) : (
            <Link
              to='/trainer/$id'
              params={{ id: partnerId }}
              className='block flex items-center gap-4'
            >
              <div className='w-12 h-12 rounded-full bg-gradient-to-br from-[#D98A9D] to-[#ec1380] flex items-center justify-center overflow-hidden flex-shrink-0'>
                {partnerAvatar ? (
                  <img
                    src={partnerAvatar}
                    alt={partnerName}
                    className='w-full h-full object-cover'
                  />
                ) : (
                  <User className='w-7 h-7 text-white' />
                )}
              </div>
              <div className='min-w-0'>
                <h2 className='text-white font-semibold text-lg truncate'>{partnerName}</h2>
                <p className='text-green-400 text-sm'>Online</p>
              </div>
            </Link>
          )}
        </div>

        {isTrainer && (
          <Button
            onClick={() => setIsSessionModalOpen(true)}
            className='flex items-center gap-1.5 bg-[#D98A9D]/20 hover:bg-[#D98A9D]/30 text-[#D98A9D] font-semibold px-3 py-2 rounded-xl transition-all ml-[150px] mt-10 whitespace-nowrap'
            size='sm'
            title='Create session with this user'
          >
            <Plus size={16} />
            <span className='hidden sm:inline text-xs'>Session</span>
          </Button>
        )}
      </div>

      {/* Messages Area */}
      <div className='flex-1 overflow-y-auto p-6 space-y-4 min-w-0'>
        {isLoading && messages.length === 0 ? (
          <div className='flex justify-center items-center h-full text-gray-500'>
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div className='flex items-center justify-center h-full'>
            <div className='text-center'>
              <h3 className='text-white text-xl font-semibold mb-2'>No messages yet</h3>
              <p className='text-gray-400'>Start the conversation!</p>
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = isMessageFromMe(msg);
            const prevMsg = idx > 0 ? messages[idx - 1] : null;
            const showAvatar = !prevMsg || isMessageFromMe(prevMsg) !== isMe;
            const msgAvatar = getMessageAvatar(msg);

            return (
              <div
                key={msg.id}
                className={`flex items-end gap-2 min-w-0 ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                {!isMe && showAvatar && (
                  <div className='w-8 h-8 rounded-full bg-gradient-to-br from-[#D98A9D] to-[#ec1380] flex items-center justify-center flex-shrink-0 overflow-hidden'>
                    {msgAvatar ? (
                      <img
                        src={msgAvatar}
                        alt={partnerName}
                        className='w-full h-full object-cover'
                      />
                    ) : (
                      <User className='w-4 h-4 text-white' />
                    )}
                  </div>
                )}
                {!isMe && !showAvatar && <div className='w-8 flex-shrink-0' />}

                <div
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} min-w-0`}
                  style={{ maxWidth: 'calc(100% - 40px)' }}
                >
                  <div
                    className={`px-4 py-3 rounded-2xl text-sm leading-relaxed break-words ${
                      isMe
                        ? 'bg-gradient-to-br from-[#D98A9D] to-[#ec1380] text-white rounded-br-none'
                        : 'bg-[#2a1f24] text-white border border-white/10 rounded-bl-none'
                    }`}
                    style={{
                      wordBreak: 'break-word',
                      overflowWrap: 'break-word',
                      maxWidth: '100%',
                    }}
                  >
                    <Markdown
                      options={{ overrides: MarkdownComponents }}
                      className='text-sm whitespace-pre-wrap break-words'
                      style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
                    >
                      {msg.message}
                    </Markdown>
                  </div>

                  <div className='flex items-center gap-1 text-[10px] text-gray-500 mt-1 ml-1'>
                    {msg.sent_at && <span>{format(new Date(msg.sent_at), 'HH:mm')}</span>}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className='p-6 bg-[#1a0F16] border-t border-white/10 flex-shrink-0'>
        <div className='flex items-end gap-3'>
          <Textarea
            value={inputMessage}
            onChange={e => setInputMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder='Type a message...'
            disabled={isLoading}
            className='min-h-[56px] max-h-32 bg-[#322840]/60 border-white/10 text-white placeholder:text-gray-500 resize-none pr-4 disabled:opacity-50 focus-visible:ring-[#D98A9D] break-words overflow-x-hidden'
            style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
            rows={1}
          />
          <Button
            onClick={handleSend}
            disabled={!inputMessage.trim() || isSending || isLoading}
            className='bg-gradient-to-br from-[#D98A9D] to-[#ec1380] hover:from-[#c87b8f] hover:to-[#d11371] text-white h-14 px-6 rounded-xl font-semibold shadow-lg shadow-[#D98A9D]/20 transition-all flex-shrink-0'
          >
            <Send className='w-5 h-5' />
          </Button>
        </div>
      </div>

      <TrainingSessionModal
        isOpen={isSessionModalOpen}
        onClose={() => setIsSessionModalOpen(false)}
        onSave={() => {
          setIsSessionModalOpen(false);
        }}
        initialData={undefined}
        isEditing={false}
        users={[{ id: partnerId, name: partnerName }]}
      />
    </div>
  );
};
