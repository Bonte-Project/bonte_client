import { X } from 'lucide-react';
import type { TrainingSession } from '@/types/training-sessions.types';
import { format } from 'date-fns';

interface SessionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: TrainingSession | null;
  clientName?: string;
  trainerName?: string;
}

export const SessionDetailsModal = ({
  isOpen,
  onClose,
  session,
  clientName,
  trainerName,
}: SessionDetailsModalProps) => {
  if (!isOpen || !session) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' };
      case 'completed':
        return { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' };
      case 'cancelled':
        return { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' };
      default:
        return { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/30' };
    }
  };

  const statusColor = getStatusColor(session.status);
  const sessionDate = new Date(session.scheduledAt);
  const formattedDate = format(sessionDate, 'MMMM d, yyyy');
  const formattedTime = format(sessionDate, 'HH:mm');

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm'>
      <div className='bg-[#1a0F16] border border-[#36282F] rounded-3xl p-8 max-w-md w-full shadow-2xl'>
        <div className='flex items-center justify-between mb-6'>
          <h2 className='text-2xl font-bold text-white line-clamp-2'>{session.name}</h2>
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-white transition-colors flex-shrink-0 ml-2'
          >
            <X size={24} />
          </button>
        </div>

        <div className='space-y-5'>
          {/* Status Badge */}
          <div className='flex items-center gap-3'>
            <span
              className={`text-sm px-3 py-1 rounded-full border font-semibold whitespace-nowrap ${statusColor.bg} ${statusColor.text} ${statusColor.border}`}
            >
              {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
            </span>
          </div>

          {/* Date & Time */}
          <div>
            <p className='text-xs font-medium text-gray-400 uppercase tracking-wide mb-2'>
              Date & Time
            </p>
            <div className='bg-[#322840]/60 border border-white/10 rounded-xl p-4'>
              <p className='text-sm text-white font-semibold'>{formattedDate}</p>
              <p className='text-sm text-[#D98A9D] font-bold mt-1'>{formattedTime}</p>
            </div>
          </div>

          {/* Client Info */}
          <div>
            <p className='text-xs font-medium text-gray-400 uppercase tracking-wide mb-2'>Client</p>
            <div className='bg-[#322840]/60 border border-white/10 rounded-xl p-4'>
              <p className='text-sm text-white font-semibold'>{clientName || 'Unknown Client'}</p>
            </div>
          </div>

          {/* Trainer Info */}
          <div>
            <p className='text-xs font-medium text-gray-400 uppercase tracking-wide mb-2'>
              Trainer
            </p>
            <div className='bg-[#322840]/60 border border-white/10 rounded-xl p-4'>
              <p className='text-sm text-white font-semibold'>{trainerName || 'Unknown Trainer'}</p>
            </div>
          </div>

          {/* Session ID */}
          <div>
            <p className='text-xs font-medium text-gray-400 uppercase tracking-wide mb-2'>
              Session ID
            </p>
            <p className='text-xs text-gray-500 font-mono bg-black/30 rounded-lg p-2 break-all'>
              {session.id}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className='mt-8 w-full bg-[#D98A9D] text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-[#D98A9D]/20 hover:bg-[#c87b8f] hover:scale-[1.02]'
        >
          Close
        </button>
      </div>
    </div>
  );
};
