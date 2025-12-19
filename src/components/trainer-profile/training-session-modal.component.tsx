import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { FormValidator } from '@/utils/form-validator.utils';
import { useCustomToast } from '@/hooks/use-custom-toast.hooks';
import { useTrainerStore } from '@/store/trainer.store';
import type {
  CreateTrainingSessionRequest,
  UpdateTrainingSessionRequest,
  TrainingSession,
  SessionStatus,
} from '@/types/training-sessions.types';

interface TrainingSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (session: CreateTrainingSessionRequest | UpdateTrainingSessionRequest) => void;
  initialData?: TrainingSession;
  isEditing?: boolean;
  users: Array<{ id: string; name: string }>;
}

interface FormErrors {
  [key: string]: string | undefined;
}

const SESSION_STATUSES: SessionStatus[] = ['scheduled', 'completed', 'cancelled'];

export const TrainingSessionModal = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  isEditing = false,
  users,
}: TrainingSessionModalProps) => {
  const { success, error: toastError } = useCustomToast();
  const { createTrainingSession, updateTrainingSession } = useTrainerStore();

  const [name, setName] = useState('');
  const [userId, setUserId] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [status, setStatus] = useState<SessionStatus>('scheduled');
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen && initialData && isEditing) {
      setName(initialData.name || '');
      setUserId(initialData.userId || '');
      setStatus(initialData.status || 'scheduled');

      const date = new Date(initialData.scheduledAt);
      const formattedDate = date.toISOString().split('T')[0];
      const formattedTime = date.toTimeString().slice(0, 5);
      setScheduledDate(formattedDate);
      setScheduledTime(formattedTime);

      setErrors({});
      setTouched(new Set());
    } else if (isOpen) {
      setName('');
      setUserId(users.length > 0 ? users[0].id : '');
      setScheduledDate('');
      setScheduledTime('');
      setStatus('scheduled');
      setErrors({});
      setTouched(new Set());
    }
  }, [isOpen, initialData, isEditing, users]);

  if (!isOpen) return null;

  const isScheduledStatus = status === 'scheduled';

  const validateField = (field: string, value: string) => {
    let error: string | undefined;

    if (field === 'name') {
      error = FormValidator.validateSessionName(value);
    } else if (field === 'userId') {
      error = FormValidator.validateSessionUser(value);
    } else if (field === 'scheduledDate' && isScheduledStatus) {
      error = FormValidator.validateSessionDateTime(value);
    } else if (field === 'scheduledTime' && isScheduledStatus) {
      error = FormValidator.validateSessionDateTime(value);
    }

    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {
      name: FormValidator.validateSessionName(name),
      userId: FormValidator.validateSessionUser(userId),
      scheduledDate: isScheduledStatus
        ? FormValidator.validateSessionDateTime(scheduledDate)
        : undefined,
      scheduledTime: isScheduledStatus
        ? FormValidator.validateSessionDateTime(scheduledTime)
        : undefined,
    };

    setErrors(newErrors);
    return Object.values(newErrors).every(error => !error);
  };

  const handleBlur = (field: string) => {
    setTouched(prev => new Set([...prev, field]));
    let value: string = '';
    if (field === 'name') value = name;
    else if (field === 'userId') value = userId;
    else if (field === 'scheduledDate') value = scheduledDate;
    else if (field === 'scheduledTime') value = scheduledTime;

    validateField(field, value);
  };

  const handleSave = async () => {
    setTouched(new Set(['name', 'userId', 'scheduledDate', 'scheduledTime']));

    if (!validateForm()) {
      return;
    }

    setIsSaving(true);

    try {
      const dateTimeString = `${scheduledDate}T${scheduledTime}`;
      const date = new Date(dateTimeString);
      const isoDate = date.toISOString();

      if (isEditing && initialData) {
        const updateData: UpdateTrainingSessionRequest = {
          name,
          scheduledAt: isoDate,
          status,
        };
        await updateTrainingSession(initialData.id, updateData);
        success('Session Updated', {
          description: 'Training session has been updated successfully',
          duration: 3000,
        });
      } else {
        const createData: CreateTrainingSessionRequest = {
          name,
          userId,
          scheduledAt: isoDate,
        };
        await createTrainingSession(createData);
        success('Session Created', {
          description: 'Training session has been created successfully',
          duration: 3000,
        });
      }

      onSave({});
      onClose();
    } catch (error) {
      console.error('Error saving session:', error);
      toastError('Error', {
        description: error instanceof Error ? error.message : 'Failed to save session',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm'>
      <div className='bg-[#1a0F16] border border-[#36282F] rounded-3xl p-8 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto'>
        <div className='flex items-center justify-between mb-6'>
          <h2 className='text-2xl font-bold text-white'>
            {isEditing ? 'Edit Session' : 'Add Session'}
          </h2>
          <button
            onClick={onClose}
            disabled={isSaving}
            className='text-gray-400 hover:text-white transition-colors disabled:opacity-50'
          >
            <X size={24} />
          </button>
        </div>

        <div className='space-y-5'>
          {/* Session Name */}
          <div className='flex flex-col'>
            <label className='pb-2 text-sm font-medium text-gray-400 uppercase tracking-wide'>
              Session Name
            </label>
            <Input
              type='text'
              placeholder='e.g., Full Body Workout'
              value={name}
              onChange={e => {
                setName(e.target.value);
                if (touched.has('name')) {
                  validateField('name', e.target.value);
                }
              }}
              onBlur={() => handleBlur('name')}
              disabled={isSaving}
              className={`h-12 w-full rounded-xl px-4 py-3 bg-[#322840]/60 border text-white focus:outline-none transition-all ${
                errors.name && touched.has('name')
                  ? 'border-red-500/50 focus:border-red-500'
                  : 'border-white/10 focus:border-[#D98A9D]'
              } disabled:opacity-50`}
            />
            {errors.name && touched.has('name') && (
              <p className='mt-2 text-xs text-red-400'>{errors.name}</p>
            )}
          </div>

          {/* User Selection */}
          <div className='flex flex-col'>
            <label className='pb-2 text-sm font-medium text-gray-400 uppercase tracking-wide'>
              Client
            </label>
            {users.length === 0 ? (
              <div className='h-12 w-full rounded-xl px-4 py-3 bg-[#322840]/60 border border-white/10 text-white flex items-center'>
                <span className='text-gray-500'>No clients available</span>
              </div>
            ) : (
              <select
                value={userId}
                onChange={e => {
                  setUserId(e.target.value);
                  if (touched.has('userId')) {
                    validateField('userId', e.target.value);
                  }
                }}
                onBlur={() => handleBlur('userId')}
                disabled={isSaving || isEditing}
                className={`h-12 w-full rounded-xl px-4 py-3 bg-[#322840]/60 border text-white focus:outline-none transition-all appearance-none cursor-pointer ${
                  errors.userId && touched.has('userId')
                    ? 'border-red-500/50 focus:border-red-500'
                    : 'border-white/10 focus:border-[#D98A9D]'
                } disabled:opacity-50 disabled:cursor-not-allowed [color-scheme:dark]`}
              >
                <option value=''>Select a client</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            )}
            {errors.userId && touched.has('userId') && (
              <p className='mt-2 text-xs text-red-400'>{errors.userId}</p>
            )}
          </div>

          {/* Date */}
          <div className='flex flex-col'>
            <label className='pb-2 text-sm font-medium text-gray-400 uppercase tracking-wide'>
              Date
            </label>
            <input
              type='date'
              value={scheduledDate}
              onChange={e => {
                setScheduledDate(e.target.value);
                if (touched.has('scheduledDate') && isScheduledStatus) {
                  validateField('scheduledDate', e.target.value);
                }
              }}
              onBlur={() => handleBlur('scheduledDate')}
              disabled={isSaving || !isScheduledStatus}
              className={`h-12 w-full rounded-xl px-4 py-3 bg-[#322840]/60 border text-white focus:outline-none transition-all ${
                errors.scheduledDate && touched.has('scheduledDate')
                  ? 'border-red-500/50 focus:border-red-500'
                  : 'border-white/10 focus:border-[#D98A9D]'
              } disabled:opacity-50 [color-scheme:dark]`}
            />
            {errors.scheduledDate && touched.has('scheduledDate') && (
              <p className='mt-2 text-xs text-red-400'>{errors.scheduledDate}</p>
            )}
            {!isScheduledStatus && (
              <p className='mt-2 text-xs text-gray-500'>
                Date cannot be changed when status is not "Scheduled"
              </p>
            )}
          </div>

          {/* Time */}
          <div className='flex flex-col'>
            <label className='pb-2 text-sm font-medium text-gray-400 uppercase tracking-wide'>
              Time
            </label>
            <input
              type='time'
              value={scheduledTime}
              onChange={e => {
                setScheduledTime(e.target.value);
                if (touched.has('scheduledTime') && isScheduledStatus) {
                  validateField('scheduledTime', e.target.value);
                }
              }}
              onBlur={() => handleBlur('scheduledTime')}
              disabled={isSaving || !isScheduledStatus}
              className={`h-12 w-full rounded-xl px-4 py-3 bg-[#322840]/60 border text-white focus:outline-none transition-all ${
                errors.scheduledTime && touched.has('scheduledTime')
                  ? 'border-red-500/50 focus:border-red-500'
                  : 'border-white/10 focus:border-[#D98A9D]'
              } disabled:opacity-50 [color-scheme:dark]`}
            />
            {errors.scheduledTime && touched.has('scheduledTime') && (
              <p className='mt-2 text-xs text-red-400'>{errors.scheduledTime}</p>
            )}
            {!isScheduledStatus && (
              <p className='mt-2 text-xs text-gray-500'>
                Time cannot be changed when status is not "Scheduled"
              </p>
            )}
          </div>

          {/* Status (only when editing) */}
          {isEditing && (
            <div className='flex flex-col'>
              <label className='pb-2 text-sm font-medium text-gray-400 uppercase tracking-wide'>
                Status
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as SessionStatus)}
                disabled={isSaving}
                className='h-12 w-full rounded-xl px-4 py-3 bg-[#322840]/60 border border-white/10 text-white focus:outline-none transition-all appearance-none cursor-pointer focus:border-[#D98A9D] disabled:opacity-50 [color-scheme:dark]'
              >
                {SESSION_STATUSES.map(s => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className='flex gap-3 mt-8'>
          <button
            onClick={onClose}
            disabled={isSaving}
            className='flex-1 bg-white/10 text-white font-semibold py-3 rounded-xl transition-all hover:bg-white/20 disabled:opacity-50'
          >
            Cancel
          </button>
          <button
            onClick={() => void handleSave()}
            disabled={isSaving}
            className='flex-1 bg-[#D98A9D] text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-[#D98A9D]/20 hover:bg-[#c87b8f] hover:scale-[1.02] disabled:opacity-70 disabled:scale-100'
          >
            {isSaving
              ? isEditing
                ? 'Updating...'
                : 'Creating...'
              : isEditing
                ? 'Update Session'
                : 'Create Session'}
          </button>
        </div>
      </div>
    </div>
  );
};
