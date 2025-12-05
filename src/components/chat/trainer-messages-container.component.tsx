import { useEffect, useState } from 'react';
import { useTrainerMessagesStore } from '@/store/trainer-messages.store';
import { useUserStore } from '@/store/user.store';
import { useTrainerStore } from '@/store/trainer.store';
import { useAuthStore } from '@/store/auth.store';
import { TrainerMessagesWindow } from './trainer-messages-window.component';

interface TrainerMessagesContainerProps {
  partnerId: string;
}

export const TrainerMessagesContainer = ({ partnerId }: TrainerMessagesContainerProps) => {
  const {
    messages,
    isLoading,
    isSending,
    sendMessage,
    getMessagesWith,
    setCurrentChat,
    startPolling,
    stopPolling,
  } = useTrainerMessagesStore();
  const { user } = useAuthStore();
  const { getUserById } = useUserStore();
  const { getTrainerById } = useTrainerStore();

  const [partnerInfo, setPartnerInfo] = useState<{
    name: string;
    avatar?: string;
  } | null>(null);

  useEffect(() => {
    setCurrentChat(partnerId);
    getMessagesWith(partnerId).catch(console.error);
  }, [partnerId, setCurrentChat, getMessagesWith]);

  useEffect(() => {
    startPolling();

    return () => {
      stopPolling();
    };
  }, [startPolling, stopPolling]);

  useEffect(() => {
    const loadPartnerInfo = async () => {
      try {
        if (user?.role === 'user') {
          const trainer = await getTrainerById(partnerId);
          if (trainer) {
            const trainerUser = await getUserById(trainer.userId);
            setPartnerInfo({
              name: trainerUser?.fullName || 'Unknown Trainer',
              avatar: trainerUser?.avatarUrl,
            });
          }
        } else if (user?.role === 'trainer') {
          const partner = await getUserById(partnerId);
          setPartnerInfo({
            name: partner?.fullName || 'Unknown User',
            avatar: partner?.avatarUrl,
          });
        }
      } catch (error) {
        console.error('Failed to load partner info:', error);
      }
    };

    loadPartnerInfo();
  }, [partnerId, user?.role, getTrainerById, getUserById]);

  if (!partnerInfo) {
    return (
      <div className='flex-1 bg-[#1e1416] flex items-center justify-center text-gray-500'>
        <div className='text-center'>
          <p>Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <TrainerMessagesWindow
      partnerId={partnerId}
      partnerName={partnerInfo.name}
      partnerAvatar={partnerInfo.avatar}
      messages={messages}
      isLoading={isLoading}
      isSending={isSending}
      onSendMessage={text => sendMessage(partnerId, text)}
    />
  );
};
