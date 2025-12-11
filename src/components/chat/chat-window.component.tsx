import { useEffect, useRef, useState } from 'react';
import { Send, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import Markdown from 'markdown-to-jsx';
import { MarkdownComponents } from './markdown.component';
import { format } from 'date-fns';
import type { UIMessage } from '@/types/chat-ui.types';

interface ChatWindowProps {
  title: string;
  status: string;
  messages: UIMessage[];
  isLoading: boolean;
  isSending: boolean;
  onSendMessage: (text: string) => void;
  partnerAvatar?: React.ReactNode;
}

export const ChatWindow = ({
  title,
  status,
  messages,
  isLoading,
  isSending,
  onSendMessage,
  partnerAvatar,
}: ChatWindowProps) => {
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className='flex-1 flex flex-col h-full bg-[#1e1416] overflow-hidden'>
      <div className='h-20 bg-[#1a0F16] border-b border-white/10 px-6 flex items-center justify-between flex-shrink-0'>
        <div className='flex items-center gap-4'>
          <div className='w-12 h-12 rounded-full bg-gradient-to-br from-[#D98A9D] to-[#ec1380] flex items-center justify-center overflow-hidden'>
            {partnerAvatar || <User className='w-7 h-7 text-white' />}
          </div>
          <div className='min-w-0'>
            <h2 className='text-white font-semibold text-lg truncate'>{title}</h2>
            <p className='text-green-400 text-sm'>{status}</p>
          </div>
        </div>
      </div>

      <div className='flex-1 overflow-y-auto p-6 space-y-4 min-w-0'>
        {isLoading && messages.length === 0 ? (
          <div className='flex justify-center items-center h-full text-gray-500'>
            Loading history...
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
            const isMe = msg.sender === 'me';
            const showAvatar = idx === 0 || messages[idx - 1].sender !== msg.sender;

            return (
              <div
                key={msg.id}
                className={`flex items-end gap-2 min-w-0 ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                {!isMe && showAvatar && (
                  <div className='w-8 h-8 rounded-full bg-gradient-to-br from-[#D98A9D] to-[#ec1380] flex items-center justify-center flex-shrink-0 overflow-hidden'>
                    {partnerAvatar || <User className='w-4 h-4 text-white' />}
                  </div>
                )}
                {!isMe && !showAvatar && <div className='w-8 flex-shrink-0' />}

                <div
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} min-w-0`}
                  style={{ maxWidth: 'calc(100% - 40px)' }}
                >
                  <div
                    className={`px-4 py-3 rounded-2xl text-sm leading-relaxed break-all ${
                      isMe
                        ? 'bg-gradient-to-br from-[#D98A9D] to-[#ec1380] text-white rounded-br-none'
                        : 'bg-[#2a1f24] text-white border border-white/10 rounded-bl-none'
                    }`}
                    style={{ wordBreak: 'break-all', overflowWrap: 'break-word', maxWidth: '100%' }}
                  >
                    {msg.isTyping ? (
                      <div className='flex gap-1.5 py-1'>
                        <div className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'></div>
                        <div className='w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]'></div>
                        <div className='w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]'></div>
                      </div>
                    ) : (
                      <Markdown
                        options={{ overrides: MarkdownComponents }}
                        className='text-sm whitespace-pre-wrap break-all'
                        style={{ wordBreak: 'break-all', overflowWrap: 'break-word' }}
                      >
                        {msg.message}
                      </Markdown>
                    )}
                  </div>

                  <div className='flex items-center gap-1 text-[10px] text-gray-500 mt-1 ml-1'>
                    {!msg.isTyping && msg.sentAt && (
                      <span>{format(new Date(msg.sentAt), 'HH:mm')}</span>
                    )}
                    {msg.status === 'error' && <span className='text-red-400'>Error</span>}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className='p-6 bg-[#1a0F16] border-t border-white/10 flex-shrink-0'>
        <div className='flex items-end gap-3'>
          <Textarea
            value={inputMessage}
            onChange={e => setInputMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder='Type a message...'
            disabled={isLoading}
            className='min-h-[56px] max-h-32 bg-[#322840]/60 border-white/10 text-white placeholder:text-gray-500 resize-none pr-4 disabled:opacity-50 focus-visible:ring-[#D98A9D] break-all overflow-x-hidden'
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
    </div>
  );
};
