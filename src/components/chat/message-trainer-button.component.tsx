import { useState } from 'react';
import { Send } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useTrainerMessagesStore } from '@/store/trainer-messages.store';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface MessageTrainerButtonProps {
  trainerId: string;
}

export const MessageTrainerButton = ({ trainerId }: MessageTrainerButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { sendFirstMessage, error, clearError } = useTrainerMessagesStore();

  const handleOpenModal = () => {
    setIsOpen(true);
    clearError();
  };

  const handleClose = () => {
    setIsOpen(false);
    setMessageText('');
    clearError();
  };

  const handleSend = async () => {
    if (!messageText.trim() || isLoading) return;

    setIsLoading(true);
    const success = await sendFirstMessage(trainerId, messageText);

    if (success) {
      await navigate({ to: '/chat' });
      handleClose();
    }

    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <Button
        onClick={handleOpenModal}
        className='bg-gradient-to-br from-[#D98A9D] to-[#ec1380] hover:from-[#c87b8f] hover:to-[#d11371] text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-[#D98A9D]/20 transition-all w-full'
      >
        <Send className='w-4 h-4 mr-2' />
        Message
      </Button>

      {isOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm'>
          <div className='bg-[#181114] border border-white/10 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl'>
            <h3 className='text-white font-semibold text-lg mb-4'>Send Message</h3>

            <div className='mb-4'>
              <Textarea
                value={messageText}
                onChange={e => setMessageText(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder='Write your message...'
                className='min-h-[120px] max-h-40 bg-[#322840]/60 border-white/10 text-white placeholder:text-gray-500 resize-none focus-visible:ring-[#D98A9D]'
              />
            </div>

            {error && <div className='text-red-400 text-sm mb-4'>{error}</div>}

            <div className='flex gap-3'>
              <button
                onClick={handleClose}
                disabled={isLoading}
                className='flex-1 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-colors disabled:opacity-50'
              >
                Cancel
              </button>
              <Button
                onClick={handleSend}
                disabled={!messageText.trim() || isLoading}
                className='flex-1 bg-gradient-to-br from-[#D98A9D] to-[#ec1380] hover:from-[#c87b8f] hover:to-[#d11371] text-white font-semibold shadow-lg shadow-[#D98A9D]/20 transition-all'
              >
                {isLoading ? 'Sending...' : 'Send'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
