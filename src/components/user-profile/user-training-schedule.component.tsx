import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useUserStore } from '@/store/user.store';
import { useTrainerStore } from '@/store/trainer.store';
import type { TrainingSession } from '@/types/training-sessions.types';
import { SessionDetailsModal } from '@/components/trainer-profile/session-details-modal.component';
import { format } from 'date-fns';

interface TrainerInfo {
  name: string;
  avatar?: string;
}

export const UserTrainingScheduleComponent = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date().getDate());
  const [trainingSessions, setTrainingSessions] = useState<TrainingSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [trainerInfo, setTrainerInfo] = useState<Record<string, TrainerInfo>>({});
  const [showSessionDetailsModal, setShowSessionDetailsModal] = useState(false);
  const [selectedSessionForDetails, setSelectedSessionForDetails] =
    useState<TrainingSession | null>(null);

  const { user } = useAuthStore();
  const { getUserById } = useUserStore();
  const { getTrainerById } = useTrainerStore();

  useEffect(() => {
    const loadSessions = async () => {
      if (!user) return;

      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_API_URL}/training-sessions`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch sessions');
        }

        const data = (await response.json()) as {
          message: string;
          sessions: TrainingSession[];
        };
        setTrainingSessions(data.sessions);
      } catch (error) {
        console.error('Failed to load training sessions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSessions();
  }, [user]);

  useEffect(() => {
    const loadTrainerInfo = async () => {
      if (trainingSessions.length === 0) {
        return;
      }

      const trainerIds = new Set(trainingSessions.map(s => s.trainerId));
      const newTrainerInfo: Record<string, TrainerInfo> = { ...trainerInfo };
      let hasChanges = false;

      for (const trainerId of Array.from(trainerIds)) {
        if (newTrainerInfo[trainerId]) {
          continue;
        }

        try {
          const trainer = await getTrainerById(trainerId);
          if (trainer) {
            const trainerUser = await getUserById(trainer.userId);
            if (trainerUser) {
              newTrainerInfo[trainerId] = {
                name: trainerUser.fullName,
                avatar: trainerUser.avatarUrl,
              };
              hasChanges = true;
            }
          }
        } catch (error) {
          console.error('Failed to load trainer info for ID:', trainerId, error);
        }
      }

      if (hasChanges) {
        setTrainerInfo(newTrainerInfo);
      }
    };

    loadTrainerInfo();
  }, [trainingSessions]);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getSessionsForSelectedDate = (): TrainingSession[] => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const startOfDay = new Date(year, month, selectedDate, 0, 0, 0);
    const endOfDay = new Date(year, month, selectedDate, 23, 59, 59);

    return trainingSessions
      .filter(session => {
        const sessionDate = new Date(session.scheduledAt);
        return sessionDate >= startOfDay && sessionDate <= endOfDay;
      })
      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
  };

  const formatSessionDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return format(date, 'HH:mm');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'cancelled':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const handleViewSessionDetails = (session: TrainingSession) => {
    setSelectedSessionForDetails(session);
    setShowSessionDetailsModal(true);
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];
    const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className='text-gray-500/50 p-2'>
          {new Date(
            currentMonth.getFullYear(),
            currentMonth.getMonth(),
            -firstDay + i + 1
          ).getDate()}
        </div>
      );
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const isSelected = i === selectedDate;
      const hasSessionsOnDay = trainingSessions.some(session => {
        const sessionDate = new Date(session.scheduledAt);
        return (
          sessionDate.getDate() === i &&
          sessionDate.getMonth() === currentMonth.getMonth() &&
          sessionDate.getFullYear() === currentMonth.getFullYear()
        );
      });

      days.push(
        <button
          key={i}
          onClick={() => setSelectedDate(i)}
          className={`p-2 rounded-lg cursor-pointer transition-all relative ${
            isSelected
              ? 'bg-[#D98A9D] text-[#1e1416] font-bold'
              : 'hover:bg-[#D98A9D]/20 text-white'
          }`}
        >
          {i}
          {hasSessionsOnDay && !isSelected && (
            <div className='absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#D98A9D] rounded-full'></div>
          )}
        </button>
      );
    }

    return (
      <div className='space-y-4'>
        <div className='grid grid-cols-7 gap-2 text-center text-xs font-bold text-gray-400 pb-2'>
          {weekDays.map(day => (
            <div key={day}>{day}</div>
          ))}
        </div>
        <div className='grid grid-cols-7 gap-2'>{days}</div>
      </div>
    );
  };

  const sessionsForSelectedDate = getSessionsForSelectedDate();

  if (!user) {
    return (
      <div className='text-center py-8 text-gray-400'>
        <p>Loading schedule...</p>
      </div>
    );
  }

  return (
    <div className='rounded-2xl border border-white/10 bg-[#181114] backdrop-blur-md p-6 mb-8'>
      <div className='mb-8'>
        <h1 className='text-3xl sm:text-4xl font-black leading-tight tracking-tight text-white mb-2'>
          Training Schedule
        </h1>
        <p className='text-gray-400'>View your upcoming training sessions</p>
      </div>

      <div className='grid gap-6 lg:grid-cols-2'>
        {/* Calendar */}
        <div className='rounded-2xl border border-white/10 bg-[#181114] backdrop-blur-md p-6'>
          <h2 className='text-xl font-bold text-white mb-6'>Calendar</h2>

          <div className='flex items-center justify-between mb-6'>
            <button
              onClick={() =>
                setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
              }
              className='p-2 rounded-full hover:bg-white/10 transition-colors'
            >
              <ChevronLeft size={20} className='text-gray-400' />
            </button>
            <div className='flex items-center gap-4'>
              <button className='px-4 py-2 rounded-lg hover:bg-white/10 text-white font-semibold'>
                {currentMonth.toLocaleString('default', { month: 'long' })}
              </button>
              <button className='px-4 py-2 rounded-lg hover:bg-white/10 text-white font-semibold'>
                {currentMonth.getFullYear()}
              </button>
            </div>
            <button
              onClick={() =>
                setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
              }
              className='p-2 rounded-full hover:bg-white/10 transition-colors'
            >
              <ChevronRight size={20} className='text-gray-400' />
            </button>
          </div>

          {renderCalendar()}
        </div>

        {/* Sessions for selected date */}
        <div className='rounded-2xl border border-white/10 bg-[#181114] backdrop-blur-md p-6 flex flex-col'>
          <div>
            <h2 className='text-xl font-bold text-white'>
              {currentMonth.toLocaleString('default', { month: 'long' })} {selectedDate},{' '}
              {currentMonth.getFullYear()}
            </h2>
            <p className='text-gray-500 text-sm mt-1'>Training sessions for selected date</p>
          </div>

          <div className='space-y-3 mt-6 overflow-y-auto max-h-[500px] flex-1 pr-2 scrollbar-thin'>
            {isLoading ? (
              <div className='text-center py-8 text-gray-400'>Loading sessions...</div>
            ) : sessionsForSelectedDate.length === 0 ? (
              <div className='rounded-lg bg-[#D98A9D]/10 border border-[#D98A9D]/30 p-4 text-center'>
                <p className='text-[#D98A9D] text-sm font-semibold'>No sessions</p>
                <p className='text-gray-400 text-xs mt-1'>
                  You have no sessions scheduled for this date
                </p>
              </div>
            ) : (
              sessionsForSelectedDate.map(session => {
                const trainer = trainerInfo[session.trainerId];
                return (
                  <button
                    key={session.id}
                    onClick={() => handleViewSessionDetails(session)}
                    className='w-full text-left flex items-start gap-3 p-4 rounded-lg bg-black/30 border border-white/10 group hover:border-[#D98A9D]/30 transition-colors'
                  >
                    <div className='flex-shrink-0 mt-1'>
                      {trainer?.avatar ? (
                        <img
                          src={trainer.avatar}
                          alt={trainer.name}
                          className='w-10 h-10 rounded-full object-cover'
                        />
                      ) : (
                        <div className='w-10 h-10 rounded-full bg-[#D98A9D]/20 flex items-center justify-center flex-shrink-0'>
                          <span className='text-xs font-bold text-[#D98A9D]'>
                            {trainer?.name?.charAt(0).toUpperCase() || '?'}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-start justify-between gap-2 flex-wrap'>
                        <h3 className='text-sm text-white font-bold break-words line-clamp-1 sm:line-clamp-2'>
                          {session.name}
                        </h3>
                        <span
                          className={`text-[10px] px-2 py-1 rounded-full border font-semibold whitespace-nowrap flex-shrink-0 ${getStatusColor(session.status)}`}
                        >
                          {session.status}
                        </span>
                      </div>
                      <p className='text-xs text-gray-400 mt-1 truncate'>
                        Trainer: {trainer?.name || 'Unknown'}
                      </p>
                      <p className='text-xs text-gray-500 mt-2'>
                        {formatSessionDateTime(session.scheduledAt)}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      <SessionDetailsModal
        isOpen={showSessionDetailsModal}
        onClose={() => {
          setShowSessionDetailsModal(false);
          setSelectedSessionForDetails(null);
        }}
        session={selectedSessionForDetails}
        clientName={user?.fullName}
        trainerName={trainerInfo[selectedSessionForDetails?.trainerId || '']?.name}
      />
    </div>
  );
};
