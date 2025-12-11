import { useState, useEffect } from 'react';
import { Edit2, Trash2, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTrainerStore } from '@/store/trainer.store';
import { useAuthStore } from '@/store/auth.store';
import { useCustomToast } from '@/hooks/use-custom-toast.hooks';
import { useTrainerMessagesStore } from '@/store/trainer-messages.store';
import { useUserStore } from '@/store/user.store';
import {
  EditTrainerModal,
  AddCertificationModal,
  ExperienceModal,
} from './trainer-modals.component';
import { TrainingSessionModal } from './training-session-modal.component';
import { SessionDetailsModal } from './session-details-modal.component';
import type { CreateExperienceRequest, UpdateExperienceRequest } from '@/types/trainer.types';
import type { TrainingSession } from '@/types/training-sessions.types';
import { format } from 'date-fns';

interface Certification {
  id: string;
  name: string;
  url: string;
}

interface UserOption {
  id: string;
  name: string;
  avatar?: string;
}

export const TrainerProfileComponent = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date().getDate());
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);
  const [showExperienceModal, setShowExperienceModal] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [editingExperienceId, setEditingExperienceId] = useState<string | null>(null);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [editingCertId, setEditingCertId] = useState<string | null>(null);
  const [editingExperienceData, setEditingExperienceData] = useState<
    UpdateExperienceRequest | undefined
  >();
  const [userOptions, setUserOptions] = useState<UserOption[]>([]);
  const [showSessionDetailsModal, setShowSessionDetailsModal] = useState(false);
  const [selectedSessionForDetails, setSelectedSessionForDetails] =
    useState<TrainingSession | null>(null);

  const {
    trainer,
    isLoading,
    addExperience,
    updateExperience,
    deleteExperience,
    getMyTrainer,
    updateTrainer,
    trainingSessions,
    getTrainingSessions,
    deleteTrainingSession,
  } = useTrainerStore();
  const { user } = useAuthStore();
  const { success, error: toastError } = useCustomToast();
  const { chatPartnerIds, getChatsListIds } = useTrainerMessagesStore();
  const { getUserById } = useUserStore();

  useEffect(() => {
    void getMyTrainer();
    void getTrainingSessions();
  }, [getMyTrainer, getTrainingSessions]);

  useEffect(() => {
    if (trainer?.certification && trainer.certification.trim()) {
      try {
        const parsed = JSON.parse(trainer.certification) as unknown;
        setCertifications(Array.isArray(parsed) ? (parsed as Certification[]) : []);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        console.error('Failed to parse certifications:', msg);
        setCertifications([]);
      }
    } else {
      setCertifications([]);
    }
  }, [trainer?.certification]);

  useEffect(() => {
    const initChatPartners = async () => {
      if (!user) return;

      try {
        await getChatsListIds();
      } catch (error) {
        console.error('Failed to load chat partners:', error);
      }
    };

    initChatPartners();
  }, [user, getChatsListIds]);

  useEffect(() => {
    const loadUserOptions = async () => {
      if (!chatPartnerIds.length) {
        setUserOptions([]);
        return;
      }

      const loaded: UserOption[] = [];

      for (const partnerId of chatPartnerIds) {
        try {
          const partner = await getUserById(partnerId);
          if (partner) {
            loaded.push({ id: partner.id, name: partner.fullName, avatar: partner.avatarUrl });
          }
        } catch (error) {
          console.error('Failed to load user:', partnerId, error);
        }
      }

      setUserOptions(loaded);
    };

    loadUserOptions();
  }, [chatPartnerIds]);
  useEffect(() => {
    if (editingExperienceId && trainer?.experience && trainer.experience.length > 0) {
      const exp = trainer.experience.find(e => e.id === editingExperienceId);

      if (exp) {
        const startDate = exp.startDate?.includes('T')
          ? exp.startDate.substring(0, 7)
          : exp.startDate || '';

        const endDate = exp.endDate?.includes('T')
          ? exp.endDate.substring(0, 7)
          : exp.endDate || '';

        setEditingExperienceData({
          title: exp.title || '',
          description: exp.description || '',
          startDate: startDate,
          endDate: endDate,
        });
      } else {
        setEditingExperienceData(undefined);
      }
    } else {
      setEditingExperienceData(undefined);
    }
  }, [editingExperienceId, trainer?.experience]);

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

    return trainingSessions.filter(session => {
      const sessionDate = new Date(session.scheduledAt);
      return sessionDate >= startOfDay && sessionDate <= endOfDay;
    });
  };

  const formatDateDisplay = (dateString: string | undefined): string => {
    if (!dateString) return '–';

    if (dateString.includes('T')) {
      const date = new Date(dateString);
      return date
        .toLocaleDateString('en-US', { year: 'numeric', month: '2-digit' })
        .replace(/\//g, '-');
    }

    if (/^\d{4}-\d{2}$/.test(dateString)) {
      return dateString;
    }

    return dateString;
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

  const handleEditProfile = () => {
    setShowEditModal(false);
  };

  const handleAddCertification = () => {
    setShowCertModal(false);
  };

  const handleDeleteCertification = async (certId: string) => {
    try {
      const updatedCerts = certifications.filter(c => c.id !== certId);
      setCertifications(updatedCerts);

      const ifSuccess = await updateTrainer({
        certification: JSON.stringify(updatedCerts),
      });

      if (ifSuccess) {
        success('Certification Deleted', {
          description: 'Your certification has been deleted',
        });
      }
    } catch (error) {
      console.error('Error deleting certification:', error);
      const restoredCerts = certifications.concat(certifications.find(c => c.id === certId) || []);
      setCertifications(restoredCerts);
      toastError('Error', {
        description: 'Failed to delete certification',
      });
    }
  };

  const handleAddExperience = async (experience: CreateExperienceRequest) => {
    await addExperience(experience);
    setShowExperienceModal(false);
  };

  const handleUpdateExperience = async (experience: UpdateExperienceRequest) => {
    if (!editingExperienceId) return;
    await updateExperience(editingExperienceId, experience);
    setShowExperienceModal(false);
    setEditingExperienceId(null);
  };

  const handleDeleteExperience = async (expId: string) => {
    const wasDeleted = await deleteExperience(expId);

    if (wasDeleted) {
      success('Experience Deleted', {
        description: 'Experience item has been removed',
      });
    }
  };

  const handleEditExperience = (expId: string) => {
    const exp = trainer?.experience?.find(e => e.id === expId);
    if (exp) {
      setEditingExperienceId(expId);
      setShowExperienceModal(true);
    }
  };

  const handleAddSession = () => {
    setEditingSessionId(null);
    setShowSessionModal(true);
  };

  const handleEditSession = (sessionId: string) => {
    setEditingSessionId(sessionId);
    setShowSessionModal(true);
  };

  const handleDeleteSession = async (sessionId: string) => {
    const wasDeleted = await deleteTrainingSession(sessionId);

    if (wasDeleted) {
      success('Session Deleted', {
        description: 'Training session has been removed',
      });
    }
  };

  const handleSaveSession = () => {
    setShowSessionModal(false);
    setEditingSessionId(null);
  };

  const handleViewSessionDetails = (session: TrainingSession) => {
    setSelectedSessionForDetails(session);
    setShowSessionDetailsModal(true);
  };

  const sessionsForSelectedDate = getSessionsForSelectedDate();
  const editingSession = editingSessionId
    ? trainingSessions.find(s => s.id === editingSessionId)
    : undefined;

  if (!trainer || !user) {
    return (
      <div className='relative min-h-screen w-full overflow-hidden bg-[#1e1416]'>
        <div className='absolute inset-0 z-0'>
          <div className='absolute -top-1/4 -right-1/4 h-[150%] w-[150%] origin-bottom-left -skew-y-12 transform bg-linear-to-br from-[#E9D5FF]/5 via-[#D98A9D]/10 to-[#D98A9D]/10'></div>
        </div>
        <main className='relative z-10 flex min-h-screen w-full items-center justify-center px-4'>
          <div className='text-center'>
            <p className='text-gray-400'>Loading trainer profile...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className='relative min-h-screen w-full overflow-hidden bg-[#1e1416]'>
      <div className='absolute inset-0 z-0'>
        <div className='absolute -top-1/4 -right-1/4 h-[150%] w-[150%] origin-bottom-left -skew-y-12 transform bg-linear-to-br from-[#E9D5FF]/5 via-[#D98A9D]/10 to-[#D98A9D]/10'></div>
      </div>

      <main className='relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12'>
        <div className='mb-8 rounded-2xl border border-white/10 bg-[#181114] backdrop-blur-md p-8 shadow-2xl shadow-[#D98A9D]/5 lg:p-10'>
          <div className='flex flex-col items-center gap-6 lg:flex-row lg:justify-between lg:items-start'>
            <div className='flex flex-col items-center gap-4 lg:flex-row lg:gap-6'>
              <div className='relative'>
                <img
                  alt='Trainer Avatar'
                  className='h-24 w-24 rounded-full border-4 border-[#D98A9D]/30 object-cover shadow-lg'
                  src={user.avatarUrl || 'https://via.placeholder.com/96'}
                />
              </div>
              <div className='text-center lg:text-left'>
                <div className='flex flex-col lg:flex-row lg:items-center lg:gap-4'>
                  <h1 className='text-3xl font-black leading-tight tracking-tight text-white'>
                    {user.fullName}
                  </h1>
                  {/* Activity Status Badge */}
                  <div
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs sm:text-sm font-bold transition-all ${
                      trainer.isActive
                        ? 'bg-[#4ade80]/20 text-[#4ade80] border-[#4ade80]/30'
                        : 'bg-[#ef4444]/20 text-[#ef4444] border-[#ef4444]/30'
                    }`}
                  >
                    <span
                      className={`inline-block h-2 w-2 rounded-full ${
                        trainer.isActive ? 'bg-[#4ade80]' : 'bg-[#ef4444]'
                      }`}
                    ></span>
                    {trainer.isActive ? 'Active' : 'Inactive'}
                  </div>
                </div>
                <p className='text-gray-400 text-lg mt-2'>Trainer</p>
                {trainer.bio && (
                  <p className='text-gray-500 text-sm mt-3 max-w-md line-clamp-2'>{trainer.bio}</p>
                )}
              </div>
            </div>

            <button
              onClick={() => setShowEditModal(true)}
              disabled={isLoading}
              className='flex items-center gap-2 rounded-lg bg-[#D98A9D] px-6 py-3 text-base font-bold text-white transition-all duration-300 border border-[#D98A9D]/30 hover:bg-[#c87b8f] hover:border-[#D98A9D]/50 focus:outline-none focus:ring-2 focus:ring-[#D98A9D]/50 disabled:opacity-50'
            >
              <Edit2 size={20} />
              Edit Profile
            </button>
          </div>

          <div className='mt-8 grid grid-cols-3 gap-4 border-t border-white/10 pt-8 sm:grid-cols-3 lg:grid-cols-6'>
            <div className='rounded-lg bg-black/30 p-4 text-center'>
              <p className='text-xs font-medium text-gray-400 uppercase tracking-wide'>Age</p>
              <p className='mt-3 text-2xl font-black text-white'>{user.age}</p>
            </div>
            <div className='rounded-lg bg-black/30 p-4 text-center'>
              <p className='text-xs font-medium text-gray-400 uppercase tracking-wide'>Height</p>
              <p className='mt-3 text-2xl font-black text-white'>
                {user.height}
                <span className='text-xs font-normal text-gray-400 block'>cm</span>
              </p>
            </div>
            <div className='rounded-lg bg-black/30 p-4 text-center'>
              <p className='text-xs font-medium text-gray-400 uppercase tracking-wide'>Weight</p>
              <p className='mt-3 text-2xl font-black text-white'>
                {user.weight}
                <span className='text-xs font-normal text-gray-400 block'>kg</span>
              </p>
            </div>
            <div className='rounded-lg bg-black/30 p-4 text-center'>
              <p className='text-xs font-medium text-gray-400 uppercase tracking-wide'>
                Specialization
              </p>
              <p className='mt-3 text-sm font-bold text-white truncate'>
                {trainer.specialization || '–'}
              </p>
            </div>
            <div className='rounded-lg bg-black/30 p-4 text-center'>
              <p className='text-xs font-medium text-gray-400 uppercase tracking-wide'>Location</p>
              <p className='mt-3 text-sm font-bold text-white truncate'>
                {trainer.location || '–'}
              </p>
            </div>
            <div className='rounded-lg bg-black/30 p-4 text-center'>
              <p className='text-xs font-medium text-gray-400 uppercase tracking-wide'>Certs</p>
              <p className='mt-3 text-2xl font-black text-[#D98A9D]'>{certifications.length}</p>
            </div>
          </div>
        </div>

        <div className='grid gap-6 lg:grid-cols-2 mb-8'>
          <div className='rounded-2xl border border-white/10 bg-[#181114] backdrop-blur-md p-6'>
            <h2 className='text-xl font-bold text-white mb-6'>Schedule</h2>

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

            <div className='mt-6 text-center'>
              <a href='#' className='text-[#D98A9D] text-sm font-semibold hover:underline'>
                Add Availability
              </a>
            </div>
          </div>

          <div className='rounded-2xl border border-white/10 bg-[#181114] backdrop-blur-md p-6 flex flex-col'>
            <div className='flex items-center justify-between mb-6'>
              <div>
                <h2 className='text-xl font-bold text-white'>
                  {currentMonth.toLocaleString('default', { month: 'long' })} {selectedDate},{' '}
                  {currentMonth.getFullYear()}
                </h2>
                <p className='text-gray-500 text-sm'>Training sessions for selected date</p>
              </div>
              <button
                onClick={handleAddSession}
                disabled={isLoading}
                className='flex items-center gap-2 rounded-lg bg-[#D98A9D]/20 px-3 py-2 text-[#D98A9D] text-sm font-bold hover:bg-[#D98A9D]/30 transition-colors disabled:opacity-50'
              >
                <Plus size={16} />
                Add
              </button>
            </div>

            <div className='space-y-3 overflow-y-auto max-h-[500px] flex-1 pr-2 scrollbar-thin scrollbar-container'>
              {sessionsForSelectedDate.length === 0 ? (
                <div className='pt-4 border-t border-white/10'>
                  <div className='rounded-lg bg-[#D98A9D]/10 border border-[#D98A9D]/30 p-4 text-center'>
                    <p className='text-[#D98A9D] text-sm font-semibold'>No sessions</p>
                    <p className='text-gray-400 text-xs mt-1'>Create a session for this date</p>
                  </div>
                </div>
              ) : (
                sessionsForSelectedDate.map(session => {
                  const client = userOptions.find(u => u.id === session.userId);

                  return (
                    <button
                      key={session.id}
                      onClick={() => handleViewSessionDetails(session)}
                      className='w-full text-left flex items-start gap-3 p-4 rounded-lg bg-black/30 border border-white/10 group hover:border-[#D98A9D]/30 transition-colors'
                    >
                      {/* Аватар клиента */}
                      <div className='flex-shrink-0 mt-1'>
                        {client?.avatar ? (
                          <img
                            src={client.avatar}
                            alt={client.name}
                            className='w-10 h-10 rounded-full object-cover border-2 border-[#D98A9D]/20'
                          />
                        ) : (
                          <div className='w-10 h-10 rounded-full bg-[#D98A9D]/20 flex items-center justify-center'>
                            <span className='text-xs font-bold text-[#D98A9D]'>
                              {client?.name?.charAt(0).toUpperCase() ?? '?'}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Информация о сессии */}
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center gap-3 mb-2 flex-wrap'>
                          <h3 className='text-sm text-white font-bold break-words line-clamp-1 sm:line-clamp-2'>
                            {session.name}
                          </h3>
                          <span
                            className={`text-[10px] px-2 py-1 rounded-full border font-semibold flex-shrink-0 ${getStatusColor(
                              session.status
                            )}`}
                          >
                            {session.status}
                          </span>
                        </div>

                        <p className='text-xs text-gray-400 truncate'>
                          {formatSessionDateTime(session.scheduledAt)}
                        </p>

                        <p className='text-xs text-gray-500 mt-1 truncate'>
                          Client: {client?.name || 'Unknown'}
                        </p>
                      </div>

                      {/* Кнопки редактирования/удаления — появляются при hover */}
                      <div
                        className='flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity ml-4 flex-shrink-0'
                        onClick={e => e.stopPropagation()}
                      >
                        <button
                          onClick={() => handleEditSession(session.id)}
                          disabled={isLoading}
                          className='p-2 hover:bg-white/10 rounded transition-colors disabled:opacity-50'
                        >
                          <Edit2 size={16} className='text-gray-400' />
                        </button>
                        <button
                          onClick={() => void handleDeleteSession(session.id)}
                          disabled={isLoading}
                          className='p-2 hover:bg-red-500/10 rounded transition-colors disabled:opacity-50'
                        >
                          <Trash2 size={16} className='text-red-400' />
                        </button>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className='rounded-2xl border border-white/10 bg-[#181114] backdrop-blur-md p-6 mb-8'>
          <div className='flex items-center justify-between mb-6'>
            <h2 className='text-xl font-bold text-white'>Certifications</h2>
            <button
              onClick={() => setShowCertModal(true)}
              disabled={isLoading}
              className='flex items-center gap-2 rounded-lg bg-[#D98A9D]/20 px-3 py-2 text-[#D98A9D] text-sm font-bold hover:bg-[#D98A9D]/30 transition-colors disabled:opacity-50'
            >
              <Plus size={16} />
              Add
            </button>
          </div>

          <div className='space-y-3'>
            {certifications.length === 0 ? (
              <div className='rounded-lg bg-black/30 border border-white/10 p-4 text-center'>
                <p className='text-gray-400 text-sm'>No certifications yet</p>
              </div>
            ) : (
              certifications.map(cert => (
                <div
                  key={cert.id}
                  className='flex justify-between items-center p-4 rounded-lg bg-black/30 border border-white/10 group hover:border-[#D98A9D]/30 transition-colors'
                >
                  <div className='flex-1'>
                    <p className='text-sm text-white font-medium'>{cert.name}</p>
                    {cert.url && (
                      <a
                        href={cert.url}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-xs text-[#D98A9D] hover:underline mt-1'
                      >
                        View Certificate
                      </a>
                    )}
                  </div>
                  <div className='flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity'>
                    <button
                      onClick={() => {
                        setEditingCertId(cert.id);
                        setShowCertModal(true);
                      }}
                      disabled={isLoading}
                      className='p-2 hover:bg-white/10 rounded transition-colors disabled:opacity-50'
                    >
                      <Edit2 size={16} className='text-gray-400' />
                    </button>
                    <button
                      onClick={() => void handleDeleteCertification(cert.id)}
                      disabled={isLoading}
                      className='p-2 hover:bg-red-500/10 rounded transition-colors disabled:opacity-50'
                    >
                      <Trash2 size={16} className='text-red-400' />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className='rounded-2xl border border-white/10 bg-[#181114] backdrop-blur-md p-6'>
          <div className='flex items-center justify-between mb-6'>
            <h2 className='text-xl font-bold text-white'>Experience Overview</h2>
            <button
              onClick={() => {
                setEditingExperienceId(null);
                setShowExperienceModal(true);
              }}
              disabled={isLoading}
              className='flex items-center gap-2 rounded-lg bg-[#D98A9D]/20 px-3 py-2 text-[#D98A9D] text-sm font-bold hover:bg-[#D98A9D]/30 transition-colors disabled:opacity-50'
            >
              <Plus size={16} />
              Add
            </button>
          </div>

          <div className='relative flex flex-col gap-6 pl-4 border-l-2 border-[#D98A9D]/30'>
            {!trainer.experience || trainer.experience.length === 0 ? (
              <div className='rounded-lg bg-black/30 border border-white/10 p-4 text-center'>
                <p className='text-gray-400 text-sm'>No experience yet</p>
              </div>
            ) : (
              trainer.experience.map(exp => (
                <div key={exp.id}>
                  <div className='absolute -left-[6.5px] top-1 h-3 w-3 rounded-full bg-[#D98A9D]'></div>
                  <div className='flex justify-between items-start group'>
                    <div className='flex-1'>
                      <h3 className='text-white font-semibold'>{exp.title}</h3>
                      {exp.description && (
                        <p className='text-gray-500 text-sm mt-1'>{exp.description}</p>
                      )}
                      <p className='text-gray-500 text-sm mt-1'>
                        {formatDateDisplay(exp.startDate)} - {formatDateDisplay(exp.endDate)}
                      </p>
                    </div>
                    <div className='flex gap-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity'>
                      <button
                        onClick={() => handleEditExperience(exp.id)}
                        disabled={isLoading}
                        className='p-2 hover:bg-white/10 rounded transition-colors disabled:opacity-50'
                      >
                        <Edit2 size={16} className='text-gray-400' />
                      </button>
                      <button
                        onClick={() => void handleDeleteExperience(exp.id)}
                        disabled={isLoading}
                        className='p-2 hover:bg-red-500/10 rounded transition-colors disabled:opacity-50'
                      >
                        <Trash2 size={16} className='text-red-400' />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      <EditTrainerModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleEditProfile}
        initialData={
          trainer && user
            ? {
                fullName: user.fullName,
                avatarUrl: user.avatarUrl || '',
                age: user.age,
                height: user.height,
                weight: user.weight,
                bio: trainer.bio,
                specialization: trainer.specialization,
                location: trainer.location,
                isActive: trainer.isActive,
              }
            : undefined
        }
        isLoading={isLoading}
      />

      <AddCertificationModal
        isOpen={showCertModal}
        onClose={() => {
          setShowCertModal(false);
          setEditingCertId(null);
        }}
        onSave={handleAddCertification}
        initialData={editingCertId ? certifications.find(c => c.id === editingCertId) : undefined}
        isEditing={!!editingCertId}
        isLoading={isLoading}
      />

      <ExperienceModal
        isOpen={showExperienceModal}
        onClose={() => {
          setShowExperienceModal(false);
          setEditingExperienceId(null);
          setEditingExperienceData(undefined);
        }}
        onSave={
          editingExperienceId
            ? exp => void handleUpdateExperience(exp)
            : exp => void handleAddExperience(exp)
        }
        initialData={editingExperienceData}
        isLoading={isLoading}
        isEditing={!!editingExperienceId}
      />

      <TrainingSessionModal
        isOpen={showSessionModal}
        onClose={() => {
          setShowSessionModal(false);
          setEditingSessionId(null);
        }}
        onSave={handleSaveSession}
        initialData={editingSession}
        isEditing={!!editingSessionId}
        users={userOptions}
      />

      <SessionDetailsModal
        isOpen={showSessionDetailsModal}
        onClose={() => {
          setShowSessionDetailsModal(false);
          setSelectedSessionForDetails(null);
        }}
        session={selectedSessionForDetails}
        clientName={userOptions.find(u => u.id === selectedSessionForDetails?.userId)?.name}
        trainerName={user?.fullName}
      />
    </div>
  );
};
